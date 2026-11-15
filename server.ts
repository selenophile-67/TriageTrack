import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import crypto from 'node:crypto';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import {
  hashPassword,
  loadStore,
  saveStore,
  StoreData,
  StoredUser,
  verifyPassword,
} from './server/store';
import {
  FALLBACK_SPECIALIST_TEXT,
  isEmergencyQuery,
  isSimpleGreeting,
  requiresPersonalDiagnosisOrPrescription,
  searchVerifiedMedlinePlus,
} from './server/medicalGrounder';
import type {
  CommunityReport,
  FacilityCategory,
  FeedbackItem,
  HealthcareFacility,
  PreArrivalNotification,
  UserProfile,
} from './src/types/triage';

const PORT = 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const COOKIE_NAME = 'tt_session';

const geminiClient = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Simple in-memory rate limiter
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function rateLimit(keyPrefix: string, maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();
    const bucket = rateBuckets.get(key);
    if (!bucket || bucket.resetAt < now) {
      rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (bucket.count >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests in a short window. Please wait a moment before trying again.',
      });
    }
    bucket.count += 1;
    return next();
  };
}

function parseCookies(cookieHeader?: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    result[k] = decodeURIComponent(v);
  }
  return result;
}

function signSession(userId: string): string {
  const payload = Buffer.from(
    JSON.stringify({ uid: userId, exp: Date.now() + 7 * 24 * 3600_000 })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifySession(token?: string): string | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!parsed.uid || !parsed.exp || parsed.exp < Date.now()) return null;
    return parsed.uid;
  } catch {
    return null;
  }
}

function sanitizeUser(u: StoredUser): UserProfile {
  const { passwordHash: _removed, ...safe } = u;
  return safe;
}

function getAuthenticatedUser(req: Request, store: StoreData): StoredUser | null {
  const cookies = parseCookies(req.headers.cookie);
  const uid = verifySession(cookies[COOKIE_NAME]);
  if (!uid) return null;
  return store.users.find((u) => u.id === uid) || null;
}

function recalculateCommunityWait(store: StoreData, facility: HealthcareFacility): void {
  const nowIso = new Date().toISOString();
  const validReports = store.communityReports.filter(
    (r) =>
      r.facilityId === facility.id &&
      (r.status === 'active' || r.status === 'verified') &&
      r.expiresAt > nowIso
  );

  facility.recentReportCount = validReports.length;

  if (validReports.length === 0) {
    if (facility.waitTimeSource === 'community_reported') {
      facility.communityWaitMinutes = null;
      facility.waitTimeSource = 'unavailable';
    }
    return;
  }

  const sorted = [...validReports].sort((a, b) => a.waitedMinutes - b.waitedMinutes);
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? Math.round((sorted[mid - 1].waitedMinutes + sorted[mid].waitedMinutes) / 2)
      : sorted[mid].waitedMinutes;

  facility.communityWaitMinutes = median;
  if (facility.officialWaitMinutes === null) {
    facility.waitTimeSource = 'community_reported';
  }
  const latest = [...validReports].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
  if (latest) {
    facility.lastUpdatedAt = latest.createdAt;
    if (latest.crowded && !latest.queueMoving) facility.waitTrend = 'rising';
    else if (!latest.crowded && latest.queueMoving) facility.waitTrend = 'falling';
    else facility.waitTrend = 'steady';
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  const store = loadStore();

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', demoMode: true });
  });

  // --- AUTH ROUTES ---
  app.get('/api/auth/me', (req, res) => {
    const user = getAuthenticatedUser(req, store);
    res.json({ user: user ? sanitizeUser(user) : null });
  });

  app.post('/api/auth/register', rateLimit('auth', 15, 60_000), (req, res) => {
    const {
      displayName,
      email,
      password,
      ageGroup,
      preferredLanguage,
      emergencyContact,
      preferredLocation,
      consentGiven,
      accessibilityPrefs,
    } = req.body || {};

    if (!displayName || typeof displayName !== 'string' || displayName.trim().length < 2) {
      return res.status(400).json({ error: 'Display name must be at least 2 characters.' });
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }
    if (!consentGiven) {
      return res.status(400).json({
        error: 'Explicit consent under the DPDP Act 2023 is required to store optional profile data.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (store.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const newUser: StoredUser = {
      id: `user-${crypto.randomUUID().slice(0, 8)}`,
      displayName: displayName.trim().slice(0, 80),
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      role: 'user',
      ageGroup: ['child', 'adult', 'senior'].includes(ageGroup) ? ageGroup : 'adult',
      preferredLanguage: ['en', 'hi', 'or'].includes(preferredLanguage) ? preferredLanguage : 'en',
      accessibilityPrefs: {
        largeText: Boolean(accessibilityPrefs?.largeText),
        wheelchairNeeded: Boolean(accessibilityPrefs?.wheelchairNeeded),
        signLanguageNeeded: Boolean(accessibilityPrefs?.signLanguageNeeded),
      },
      emergencyContact: typeof emergencyContact === 'string' ? emergencyContact.trim().slice(0, 40) : '',
      preferredLocation: typeof preferredLocation === 'string' ? preferredLocation.trim().slice(0, 12) : '751001',
      consentGiven: true,
      createdAt: new Date().toISOString(),
      savedFacilityIds: [],
      recentlyViewedIds: [],
      searchHistory: [],
    };

    store.users.push(newUser);
    saveStore(store);

    const token = signSession(newUser.id);
    res.setHeader(
      'Set-Cookie',
      `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${7 * 86400}`
    );
    return res.status(201).json({ user: sanitizeUser(newUser) });
  });

  app.post('/api/auth/login', rateLimit('auth', 20, 60_000), (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const user = store.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signSession(user.id);
    res.setHeader(
      'Set-Cookie',
      `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${7 * 86400}`
    );
    return res.json({ user: sanitizeUser(user) });
  });

  app.post('/api/auth/logout', (_req, res) => {
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`);
    res.json({ success: true });
  });

  app.patch('/api/auth/profile', (req, res) => {
    const user = getAuthenticatedUser(req, store);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });

    const { displayName, ageGroup, preferredLanguage, accessibilityPrefs, emergencyContact, preferredLocation } =
      req.body || {};
    if (typeof displayName === 'string' && displayName.trim().length >= 2) {
      user.displayName = displayName.trim().slice(0, 80);
    }
    if (['child', 'adult', 'senior'].includes(ageGroup)) user.ageGroup = ageGroup;
    if (['en', 'hi', 'or'].includes(preferredLanguage)) user.preferredLanguage = preferredLanguage;
    if (accessibilityPrefs && typeof accessibilityPrefs === 'object') {
      user.accessibilityPrefs = {
        largeText: Boolean(accessibilityPrefs.largeText),
        wheelchairNeeded: Boolean(accessibilityPrefs.wheelchairNeeded),
        signLanguageNeeded: Boolean(accessibilityPrefs.signLanguageNeeded),
      };
    }
    if (typeof emergencyContact === 'string') {
      user.emergencyContact = emergencyContact.trim().slice(0, 40);
    }
    if (typeof preferredLocation === 'string') {
      user.preferredLocation = preferredLocation.trim().slice(0, 12);
    }

    saveStore(store);
    return res.json({ user: sanitizeUser(user) });
  });

  // DPDP Act 2023 Right to Erasure
  app.delete('/api/auth/account', (req, res) => {
    const user = getAuthenticatedUser(req, store);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });

    store.users = store.users.filter((u) => u.id !== user.id);
    // Anonymize or remove user's pre-arrival link
    store.preArrivals = store.preArrivals.filter((p) => p.userId !== user.id);
    saveStore(store);

    res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`);
    return res.json({ success: true, message: 'Account and associated personal data permanently deleted.' });
  });

  app.post('/api/auth/saved/:facilityId', (req, res) => {
    const user = getAuthenticatedUser(req, store);
    if (!user) return res.status(401).json({ error: 'Sign in to save facilities.' });

    const { facilityId } = req.params;
    const exists = user.savedFacilityIds.includes(facilityId);
    if (exists) {
      user.savedFacilityIds = user.savedFacilityIds.filter((id) => id !== facilityId);
    } else {
      user.savedFacilityIds.unshift(facilityId);
    }
    saveStore(store);
    return res.json({ savedFacilityIds: user.savedFacilityIds, saved: !exists });
  });

  app.post('/api/auth/viewed/:facilityId', (req, res) => {
    const { facilityId } = req.params;
    store.analytics.facilityViewCounts[facilityId] =
      (store.analytics.facilityViewCounts[facilityId] || 0) + 1;

    const user = getAuthenticatedUser(req, store);
    if (user) {
      user.recentlyViewedIds = [
        facilityId,
        ...user.recentlyViewedIds.filter((id) => id !== facilityId),
      ].slice(0, 10);
    }
    saveStore(store);
    res.json({ ok: true });
  });

  app.post('/api/analytics/symptom-search', (req, res) => {
    const { term } = req.body || {};
    if (typeof term === 'string' && term.trim().length > 0) {
      const clean = term.trim().slice(0, 60);
      store.analytics.symptomSearchCounts[clean] =
        (store.analytics.symptomSearchCounts[clean] || 0) + 1;
      const user = getAuthenticatedUser(req, store);
      if (user) {
        user.searchHistory = [clean, ...user.searchHistory.filter((s) => s !== clean)].slice(0, 12);
      }
      saveStore(store);
    }
    res.json({ ok: true });
  });

  // --- FACILITIES ROUTES ---
  app.get('/api/facilities', (_req, res) => {
    const nowIso = new Date().toISOString();
    store.communityReports = store.communityReports.map((r) =>
      r.status === 'active' && r.expiresAt < nowIso ? { ...r, status: 'expired' } : r
    );
    res.json({ facilities: store.facilities });
  });

  app.get('/api/facilities/:id', (req, res) => {
    const facility = store.facilities.find((f) => f.id === req.params.id);
    if (!facility) return res.status(404).json({ error: 'Healthcare facility not found.' });

    const nowIso = new Date().toISOString();
    const reports = store.communityReports
      .filter((r) => r.facilityId === facility.id && r.expiresAt > nowIso && r.status !== 'expired')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json({ facility, reports });
  });

  // --- CROWD-SOURCED WAIT-TIME REPORTS ---
  app.post('/api/facilities/:id/reports', rateLimit('crowd-report', 4, 5 * 60_000), (req, res) => {
    const facility = store.facilities.find((f) => f.id === req.params.id);
    if (!facility) return res.status(404).json({ error: 'Facility not found.' });

    const { stillWaiting, crowded, waitedMinutes, queueMoving } = req.body || {};
    const parsedWait = Number(waitedMinutes);
    if (!Number.isFinite(parsedWait) || parsedWait < 0 || parsedWait > 600) {
      return res.status(400).json({ error: 'Estimated wait minutes must be between 0 and 600.' });
    }

    // Anomaly / contradiction detection
    const now = Date.now();
    const activeSameFacility = store.communityReports.filter(
      (r) =>
        r.facilityId === facility.id &&
        (r.status === 'active' || r.status === 'verified') &&
        new Date(r.expiresAt).getTime() > now
    );

    let status: CommunityReport['status'] = 'active';
    let flagReason: string | null = null;

    const baseline =
      facility.officialWaitMinutes ??
      (activeSameFacility.length > 0
        ? activeSameFacility.reduce((acc, r) => acc + r.waitedMinutes, 0) / activeSameFacility.length
        : null);

    if (baseline !== null && Math.abs(parsedWait - baseline) > 60 && (parsedWait > baseline * 2.8 || baseline > parsedWait * 2.8)) {
      status = 'flagged';
      flagReason = `Automated outlier alert: reported ${parsedWait}m deviates sharply from current baseline (${Math.round(baseline)}m).`;
    } else if (parsedWait > 360) {
      status = 'flagged';
      flagReason = 'Extreme wait time (> 6 hours) queued for moderator verification.';
    }

    const report: CommunityReport = {
      id: `rep-${crypto.randomUUID().slice(0, 8)}`,
      facilityId: facility.id,
      stillWaiting: Boolean(stillWaiting),
      crowded: Boolean(crowded),
      waitedMinutes: Math.round(parsedWait),
      queueMoving: Boolean(queueMoving),
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + 2 * 3600_000).toISOString(),
      status,
      flagReason,
      inaccurateFlags: 0,
    };

    store.communityReports.unshift(report);
    recalculateCommunityWait(store, facility);
    saveStore(store);

    return res.status(201).json({
      report,
      facility,
      message:
        status === 'flagged'
          ? 'Thank you. Your report was received and queued for quality verification due to a large variance.'
          : 'Thank you for sharing an anonymous wait-time update.',
    });
  });

  app.post('/api/reports/:reportId/flag', rateLimit('flag-report', 10, 60_000), (req, res) => {
    const report = store.communityReports.find((r) => r.id === req.params.reportId);
    if (!report) return res.status(404).json({ error: 'Report not found.' });

    report.inaccurateFlags += 1;
    if (report.inaccurateFlags >= 2 && report.status === 'active') {
      report.status = 'flagged';
      report.flagReason = 'Flagged by community users as potentially inaccurate.';
    }
    const facility = store.facilities.find((f) => f.id === report.facilityId);
    if (facility) recalculateCommunityWait(store, facility);
    saveStore(store);
    return res.json({ report });
  });

  // --- "I'M ON MY WAY" PRE-ARRIVAL NOTIFICATIONS ---
  app.post('/api/pre-arrival', rateLimit('pre-arrival', 6, 5 * 60_000), (req, res) => {
    const { facilityId, displayInitials, ageGroup, visitReason, arrivalWindowMinutes } = req.body || {};
    const facility = store.facilities.find((f) => f.id === facilityId);
    if (!facility) return res.status(404).json({ error: 'Selected healthcare facility not found.' });

    if (!displayInitials || typeof displayInitials !== 'string' || displayInitials.trim().length < 1) {
      return res.status(400).json({ error: 'Please provide initials or a short display name.' });
    }
    if (!visitReason || typeof visitReason !== 'string' || visitReason.trim().length < 3) {
      return res.status(400).json({ error: 'Please provide a brief general reason for visit.' });
    }

    const user = getAuthenticatedUser(req, store);
    const refCode = `TT-${Math.floor(100000 + Math.random() * 900000)}`;
    const parsedEta = Math.min(180, Math.max(5, Number(arrivalWindowMinutes) || 20));

    const preArrival: PreArrivalNotification = {
      id: `pre-${crypto.randomUUID().slice(0, 8)}`,
      referenceCode: refCode,
      userId: user ? user.id : null,
      facilityId: facility.id,
      facilityName: facility.name,
      displayInitials: displayInitials.trim().slice(0, 24),
      ageGroup: ['child', 'adult', 'senior'].includes(ageGroup) ? ageGroup : 'adult',
      visitReason: visitReason.trim().slice(0, 120),
      arrivalWindowMinutes: parsedEta,
      status: 'active',
      checkInInstructions: facility.checkInInstructions,
      isOfficialIntegration: false,
      createdAt: new Date().toISOString(),
    };

    store.preArrivals.unshift(preArrival);
    saveStore(store);
    return res.status(201).json({ preArrival });
  });

  app.get('/api/pre-arrival/mine', (req, res) => {
    const user = getAuthenticatedUser(req, store);
    if (!user) return res.json({ preArrivals: [] });
    const list = store.preArrivals.filter((p) => p.userId === user.id);
    return res.json({ preArrivals: list });
  });

  app.patch('/api/pre-arrival/:id/cancel', (req, res) => {
    const item = store.preArrivals.find((p) => p.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Pre-arrival notification not found.' });

    const user = getAuthenticatedUser(req, store);
    if (item.userId && (!user || (user.id !== item.userId && user.role !== 'admin'))) {
      return res.status(403).json({ error: 'Not authorized to cancel this submission.' });
    }
    item.status = 'cancelled';
    saveStore(store);
    return res.json({ preArrival: item });
  });

  // --- FEEDBACK ROUTE ---
  app.post('/api/feedback', rateLimit('feedback', 5, 5 * 60_000), (req, res) => {
    const { facilityId, category, message } = req.body || {};
    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return res.status(400).json({ error: 'Feedback message must be at least 5 characters.' });
    }
    const validCat = ['accuracy', 'wait_time', 'accessibility', 'ux', 'listing'].includes(category)
      ? category
      : 'ux';
    const fac = facilityId ? store.facilities.find((f) => f.id === facilityId) : null;

    const item: FeedbackItem = {
      id: `fb-${crypto.randomUUID().slice(0, 8)}`,
      facilityId: fac ? fac.id : null,
      facilityName: fac ? fac.name : undefined,
      category: validCat,
      message: message.trim().slice(0, 600),
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    store.feedback.unshift(item);
    saveStore(store);
    return res.status(201).json({ feedback: item });
  });

  // --- ADMIN RBAC MIDDLEWARE & ROUTES ---
  function requireAdmin(req: Request, res: Response, next: NextFunction) {
    const user = getAuthenticatedUser(req, store);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    if (user.role !== 'admin') return res.status(403).json({ error: 'Administrator privileges required.' });
    (req as Request & { adminUser?: StoredUser }).adminUser = user;
    return next();
  }

  app.get('/api/admin/overview', requireAdmin, (_req, res) => {
    const nowIso = new Date().toISOString();
    const activeReports = store.communityReports.filter(
      (r) => (r.status === 'active' || r.status === 'verified') && r.expiresAt > nowIso
    );
    const flaggedReports = store.communityReports.filter((r) => r.status === 'flagged');

    const mostSearchedSymptoms = Object.entries(store.analytics.symptomSearchCounts)
      .map(([symptom, count]) => ({ symptom, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const mostVisitedFacilities = store.facilities
      .map((f) => ({
        name: f.name.length > 26 ? `${f.name.slice(0, 24)}…` : f.name,
        views: store.analytics.facilityViewCounts[f.id] || 0,
        avgWait: f.officialWaitMinutes ?? f.communityWaitMinutes ?? 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 6);

    const categoryMap = new Map<string, { sum: number; count: number; totalFacs: number }>();
    for (const f of store.facilities) {
      const entry = categoryMap.get(f.category) || { sum: 0, count: 0, totalFacs: 0 };
      entry.totalFacs += 1;
      const w = f.officialWaitMinutes ?? f.communityWaitMinutes;
      if (w !== null) {
        entry.sum += w;
        entry.count += 1;
      }
      categoryMap.set(f.category, entry);
    }

    const waitTrendsByCategory = Array.from(categoryMap.entries()).map(([category, v]) => ({
      category: category.replace(/_/g, ' '),
      avgWait: v.count > 0 ? Math.round(v.sum / v.count) : 0,
      facilities: v.totalFacs,
    }));

    const recentCommunityReports = store.communityReports.slice(0, 25).map((r) => ({
      ...r,
      facilityName: store.facilities.find((f) => f.id === r.facilityId)?.name || 'Unknown Facility',
    }));

    res.json({
      totalUsers: store.users.length,
      totalFacilities: store.facilities.length,
      totalActiveReports: activeReports.length,
      flaggedReportsCount: flaggedReports.length,
      totalPreArrivals: store.preArrivals.length,
      openFeedbackCount: store.feedback.filter((f) => f.status === 'open').length,
      mostSearchedSymptoms,
      mostVisitedFacilities,
      waitTrendsByCategory,
      recentCommunityReports,
    });
  });

  app.get('/api/admin/users', requireAdmin, (_req, res) => {
    res.json({
      users: store.users.map((u) => ({
        id: u.id,
        displayName: u.displayName,
        role: u.role,
        ageGroup: u.ageGroup,
        preferredLanguage: u.preferredLanguage,
        createdAt: u.createdAt,
      })),
    });
  });

  app.get('/api/admin/feedback', requireAdmin, (_req, res) => {
    res.json({ feedback: store.feedback });
  });

  app.patch('/api/admin/feedback/:id', requireAdmin, (req, res) => {
    const item = store.feedback.find((f) => f.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Feedback not found.' });
    const { status } = req.body || {};
    if (['open', 'reviewed', 'resolved'].includes(status)) {
      item.status = status;
    }
    saveStore(store);
    res.json({ feedback: item });
  });

  app.patch('/api/admin/reports/:id', requireAdmin, (req, res) => {
    const report = store.communityReports.find((r) => r.id === req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found.' });
    const { status } = req.body || {};
    if (['verified', 'flagged', 'expired', 'active'].includes(status)) {
      report.status = status;
      if (status === 'verified') report.flagReason = null;
    }
    const facility = store.facilities.find((f) => f.id === report.facilityId);
    if (facility) recalculateCommunityWait(store, facility);
    saveStore(store);
    res.json({ report, facility });
  });

  app.post('/api/facilities', requireAdmin, (req, res) => {
    const body = req.body || {};
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 3) {
      return res.status(400).json({ error: 'Facility name is required.' });
    }
    const validCategories: FacilityCategory[] = [
      'hospital',
      'emergency_department',
      'urgent_care',
      'clinic',
      'primary_health_centre',
      'diagnostic_centre',
      'pharmacy',
    ];
    const category: FacilityCategory = validCategories.includes(body.category)
      ? body.category
      : 'clinic';

    const newFac: HealthcareFacility = {
      id: `fac-${crypto.randomUUID().slice(0, 8)}`,
      name: body.name.trim().slice(0, 100),
      category,
      address: String(body.address || 'Bhubaneswar, Odisha').slice(0, 160),
      city: String(body.city || 'Bhubaneswar').slice(0, 60),
      pinCode: String(body.pinCode || '751001').slice(0, 10),
      lat: Number(body.lat) || 20.28,
      lng: Number(body.lng) || 85.83,
      phone: String(body.phone || '+91-674-2000000').slice(0, 24),
      operatingHours: String(body.operatingHours || '08:00 – 20:00').slice(0, 60),
      isOpen24x7: Boolean(body.isOpen24x7),
      openHour: Number(body.openHour) || 8,
      closeHour: Number(body.closeHour) || 20,
      hasEmergencyDept: Boolean(body.hasEmergencyDept),
      services: Array.isArray(body.services) ? body.services : ['General Medicine'],
      specialties: Array.isArray(body.specialties) ? body.specialties : ['Primary Care'],
      pediatricServices: Boolean(body.pediatricServices),
      maternityServices: Boolean(body.maternityServices),
      geriatricCare: Boolean(body.geriatricCare),
      mentalHealthServices: Boolean(body.mentalHealthServices),
      chronicCareSupport: Array.isArray(body.chronicCareSupport) ? body.chronicCareSupport : [],
      diagnosticFacilities: Array.isArray(body.diagnosticFacilities) ? body.diagnosticFacilities : [],
      accessibility: {
        wheelchairAccessible: body.wheelchairAccessible !== false,
        ramps: body.ramps !== false,
        elevators: Boolean(body.elevators),
        accessibleToilets: body.accessibleToilets !== false,
        signLanguageSupport: Boolean(body.signLanguageSupport),
        hearingVisualAid: Boolean(body.hearingVisualAid),
      },
      officialWaitMinutes:
        body.officialWaitMinutes !== undefined && body.officialWaitMinutes !== null && body.officialWaitMinutes !== ''
          ? Number(body.officialWaitMinutes)
          : null,
      communityWaitMinutes: null,
      waitTimeSource:
        body.officialWaitMinutes !== undefined && body.officialWaitMinutes !== null && body.officialWaitMinutes !== ''
          ? 'facility_confirmed'
          : 'unavailable',
      lastUpdatedAt: new Date().toISOString(),
      recentReportCount: 0,
      waitTrend: 'unknown',
      checkInInstructions: String(
        body.checkInInstructions || 'Register at the front reception desk upon arrival.'
      ).slice(0, 200),
      imageUrl:
        category === 'hospital' || category === 'emergency_department'
          ? '/src/assets/images/facility_hospital_general_1794655608091.jpg'
          : '/src/assets/images/facility_urgent_care_1794655608824.jpg',
      isDemoData: true,
    };

    store.facilities.push(newFac);
    saveStore(store);
    res.status(201).json({ facility: newFac });
  });

  app.post('/api/facilities/:id/official-wait', requireAdmin, (req, res) => {
    const facility = store.facilities.find((f) => f.id === req.params.id);
    if (!facility) return res.status(404).json({ error: 'Facility not found.' });

    const { waitMinutes, unavailable, statusNote } = req.body || {};
    if (unavailable) {
      facility.officialWaitMinutes = null;
      facility.waitTimeSource = 'unavailable';
    } else {
      const parsed = Number(waitMinutes);
      if (!Number.isFinite(parsed) || parsed < 0 || parsed > 600) {
        return res.status(400).json({ error: 'Wait time must be between 0 and 600 minutes.' });
      }
      facility.officialWaitMinutes = Math.round(parsed);
      facility.waitTimeSource = 'facility_confirmed';
    }

    facility.lastUpdatedAt = new Date().toISOString();
    const adminUser = (req as Request & { adminUser?: StoredUser }).adminUser;
    store.officialWaitUpdates.unshift({
      id: `off-${crypto.randomUUID().slice(0, 8)}`,
      facilityId: facility.id,
      adminId: adminUser?.id || 'admin',
      waitMinutes: facility.officialWaitMinutes,
      statusNote: typeof statusNote === 'string' ? statusNote.slice(0, 120) : 'Updated by administrator',
      updatedAt: facility.lastUpdatedAt,
    });
    saveStore(store);
    res.json({ facility });
  });

  app.patch('/api/facilities/:id', requireAdmin, (req, res) => {
    const facility = store.facilities.find((f) => f.id === req.params.id);
    if (!facility) return res.status(404).json({ error: 'Facility not found.' });

    const allowed = ['name', 'operatingHours', 'phone', 'hasEmergencyDept', 'isOpen24x7', 'checkInInstructions'];
    for (const key of allowed) {
      if (req.body && req.body[key] !== undefined) {
        (facility as unknown as Record<string, unknown>)[key] = req.body[key];
      }
    }
    facility.lastUpdatedAt = new Date().toISOString();
    saveStore(store);
    res.json({ facility });
  });

  app.delete('/api/facilities/:id', requireAdmin, (req, res) => {
    const idx = store.facilities.findIndex((f) => f.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Facility not found.' });
    store.facilities.splice(idx, 1);
    saveStore(store);
    res.json({ success: true });
  });

  // --- HEALTHCARE AI CHATBOT (GOOGLE SEARCH + NIH MEDLINEPLUS GROUNDED) ---
  app.post('/api/health-chat', rateLimit('health-chat', 20, 60_000), async (req, res) => {
    const { messages, language, patientMode } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Please enter a health question.' });
    }

    const sanitizedHistory = messages
      .filter(
        (m): m is { role: 'user' | 'assistant'; text: string } =>
          Boolean(m) &&
          (m.role === 'user' || m.role === 'assistant') &&
          typeof m.text === 'string' &&
          m.text.trim().length > 0
      )
      .slice(-10)
      .map((m) => ({
        role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
        parts: [{ text: m.text.trim().slice(0, 1200) }],
      }));

    const latestMessage = sanitizedHistory[sanitizedHistory.length - 1];
    if (!latestMessage || latestMessage.role !== 'user') {
      return res.status(400).json({ error: 'A valid user question is required.' });
    }

    const userText = latestMessage.parts[0].text;

    if (requiresPersonalDiagnosisOrPrescription(userText)) {
      return res.json({
        reply: FALLBACK_SPECIALIST_TEXT,
        sources: [],
        searchQueries: [],
        fallbackTriggered: true,
      });
    }

    if (isEmergencyQuery(userText)) {
      const emergencyResult = await searchVerifiedMedlinePlus(userText);
      return res.json(emergencyResult);
    }

    const greeting = isSimpleGreeting(userText);
    const langLabel =
      language === 'hi' ? 'Hindi' : language === 'or' ? 'Odia' : 'English';
    const profileLabel =
      typeof patientMode === 'string' && patientMode ? patientMode : 'adult';

    const systemInstruction = [
      'You are the TriageTrack Verified Healthcare Information Chatbot.',
      `Current user language preference: ${langLabel}. Current patient care profile: ${profileLabel}.`,
      'MANDATORY VERIFICATION RULE:',
      '- Before answering ANY health, symptom, disease, medication, first-aid, or wellness question, you MUST use the Google Search tool to verify facts from authoritative, trusted medical sources (such as WHO, CDC, NIH/MedlinePlus, NHS, Mayo Clinic, Cleveland Clinic, ICMR, or MoHFW).',
      '- Only state facts directly supported by the verified Google Search results.',
      'STRICT ANTI-HALLUCINATION & FALLBACK RULE:',
      `- NEVER guess, speculate, invent statistics, prescribe medication dosages, or give an individualized clinical diagnosis.`,
      `- If you do not know the answer with 100% certainty, if Google Search does not provide clear authoritative medical verification, if the question asks for a personal diagnosis/prescription, or if the query is ambiguous/unverifiable, you MUST respond ONLY with the exact sentence: "${FALLBACK_SPECIALIST_TEXT}"`,
      'EMERGENCY SAFETY RULE:',
      '- If the patient describes red-flag emergency symptoms (chest pain, difficulty breathing, stroke signs, severe bleeding, unconsciousness, severe allergic reaction, seizures, or self-harm crisis), immediately instruct them to call 112 (India National Emergency) or go to the nearest Emergency Department right away, and also advise: "Ask from a medical specialist."',
      'TONE & FORMAT:',
      '- Keep verified explanations concise, empathetic, easy to read (short paragraphs or bullet points), and clearly note that this is general health information rather than a medical diagnosis.',
      '- Only greet back briefly if the user strictly sent a greeting like "hi" or "hello".',
    ].join('\n');

    if (geminiClient) {
      const modelsToTry = ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'];
      for (const modelName of modelsToTry) {
        try {
          const response = await geminiClient.models.generateContent({
            model: modelName,
            contents: sanitizedHistory,
            config: {
              systemInstruction,
              tools: [{ googleSearch: {} }],
            },
          });

          const rawText = (response.text ?? '').trim();
          const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
          const rawChunks = groundingMetadata?.groundingChunks ?? [];

          const seenUris = new Set<string>();
          const sources: { title: string; uri: string }[] = [];
          for (const chunk of rawChunks) {
            const uri = chunk.web?.uri;
            if (uri && !seenUris.has(uri)) {
              seenUris.add(uri);
              sources.push({
                title: chunk.web?.title || uri,
                uri,
              });
            }
            if (sources.length >= 5) break;
          }

          const searchQueries = Array.isArray(groundingMetadata?.webSearchQueries)
            ? groundingMetadata.webSearchQueries.slice(0, 3)
            : [];

          const normalizedLower = rawText.toLowerCase();
          const modelSignaledUncertainty =
            !rawText ||
            normalizedLower === FALLBACK_SPECIALIST_TEXT.toLowerCase() ||
            normalizedLower.includes("i don't know") ||
            normalizedLower.includes('i do not know') ||
            normalizedLower.includes('cannot verify') ||
            normalizedLower.includes('unable to verify') ||
            normalizedLower.includes('no verified information');

          if (modelSignaledUncertainty) {
            return res.json({
              reply: FALLBACK_SPECIALIST_TEXT,
              sources: [],
              searchQueries,
              fallbackTriggered: true,
            });
          }

          if (!greeting && sources.length === 0 && !normalizedLower.includes('112')) {
            // Try verified MedlinePlus lookup before returning specialist fallback
            break;
          }

          return res.json({
            reply: rawText,
            sources,
            searchQueries,
            fallbackTriggered: normalizedLower.includes(FALLBACK_SPECIALIST_TEXT.toLowerCase()),
          });
        } catch (err) {
          const errStatus = (err as { status?: number })?.status;
          const errMsg = err instanceof Error ? err.message : String(err);
          console.error(`[health-chat] model=${modelName} status=${errStatus}: ${errMsg}`);
        }
      }
    }

    // Verified NIH MedlinePlus fallback (live lookup, returns exact specialist fallback if unverified)
    const verifiedFallback = await searchVerifiedMedlinePlus(userText);
    return res.json(verifiedFallback);
  });

  // Vite middleware in dev, static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TriageTrack server listening on http://localhost:${PORT}`);
  });
}

startServer();
