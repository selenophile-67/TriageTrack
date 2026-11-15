import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Clock,
  LogOut,
  Search,
  ShieldAlert,
  Trash2,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { enrichFacilityMetrics } from '../data/triageKnowledge';
import { LanguageCode, PreArrivalNotification } from '../types/triage';

export function UserDashboardPage() {
  const {
    user,
    authLoading,
    refreshAuth,
    logout,
    facilities,
    location,
    notify,
    setLanguage,
    setLargeText,
    localPreArrivals,
    updateLocalPreArrivalStatus,
  } = useApp();
  const navigate = useNavigate();

  const [serverPreArrivals, setServerPreArrivals] = useState<PreArrivalNotification[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [ageGroup, setAgeGroup] = useState<'child' | 'adult' | 'senior'>('adult');
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageCode>('en');
  const [preferredLocation, setPreferredLocation] = useState('751001');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [largeTextPref, setLargeTextPref] = useState(false);
  const [wheelchairNeeded, setWheelchairNeeded] = useState(false);
  const [signLanguageNeeded, setSignLanguageNeeded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setAgeGroup(user.ageGroup);
      setPreferredLanguage(user.preferredLanguage);
      setPreferredLocation(user.preferredLocation);
      setEmergencyContact(user.emergencyContact);
      setLargeTextPref(user.accessibilityPrefs.largeText);
      setWheelchairNeeded(user.accessibilityPrefs.wheelchairNeeded);
      setSignLanguageNeeded(user.accessibilityPrefs.signLanguageNeeded);

      fetch('/api/pre-arrival/mine')
        .then((r) => (r.ok ? r.json() : { preArrivals: [] }))
        .then((d) => setServerPreArrivals(d.preArrivals || []))
        .catch(() => {});
    }
  }, [user]);

  const savedFacilities = useMemo(() => {
    if (!user) return [];
    return facilities
      .filter((f) => user.savedFacilityIds.includes(f.id))
      .map((f) => enrichFacilityMetrics(f, location));
  }, [facilities, user, location]);

  const recentFacilities = useMemo(() => {
    if (!user) return [];
    return user.recentlyViewedIds
      .map((id) => facilities.find((f) => f.id === id))
      .filter((f): f is NonNullable<typeof f> => Boolean(f))
      .map((f) => enrichFacilityMetrics(f, location));
  }, [facilities, user, location]);

  const allPreArrivals = useMemo(() => {
    const merged = [...serverPreArrivals, ...localPreArrivals];
    return merged.filter((item, idx, arr) => arr.findIndex((x) => x.id === item.id) === idx);
  }, [serverPreArrivals, localPreArrivals]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          ageGroup,
          preferredLanguage,
          preferredLocation,
          emergencyContact,
          accessibilityPrefs: {
            largeText: largeTextPref,
            wheelchairNeeded,
            signLanguageNeeded,
          },
        }),
      });
      if (!res.ok) throw new Error('Unable to update profile.');
      setLanguage(preferredLanguage);
      setLargeText(largeTextPref);
      await refreshAuth();
      notify('Profile preferences saved.', 'success');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Update failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelPreArrival = async (id: string) => {
    try {
      const res = await fetch(`/api/pre-arrival/${id}/cancel`, { method: 'PATCH' });
      if (res.ok) {
        setServerPreArrivals((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: 'cancelled' } : p))
        );
        updateLocalPreArrivalStatus(id, 'cancelled');
        notify('Pre-arrival notification cancelled.', 'info');
      }
    } catch {
      notify('Could not cancel pre-arrival notification.', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch('/api/auth/account', { method: 'DELETE' });
      if (!res.ok) throw new Error('Account deletion failed.');
      await refreshAuth();
      notify('Your account and personal data have been permanently deleted.', 'info');
      navigate('/');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Deletion failed.', 'error');
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="h-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center space-y-4">
        <User className="w-10 h-10 text-sky-700 dark:text-sky-400 mx-auto" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Sign In for Personal Dashboard
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Accounts are completely optional—you can use Symptom Checker, Find Healthcare, and
          Emergency Help without signing in.
        </p>
        <div className="pt-2">
          <Link
            to="/auth"
            className="inline-flex px-5 py-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white text-sm font-semibold transition-colors"
          >
            Sign In / Create Optional Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-sky-700 dark:text-sky-400">USER DASHBOARD</p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mt-1">
            Welcome, {user.displayName}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Role: <span className="font-semibold capitalize">{user.role}</span> · Preferred PIN:{' '}
            <span className="font-mono">{user.preferredLocation || 'Not set'}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {user.role === 'admin' && (
            <Link
              to="/admin"
              className="px-4 py-2 rounded-lg bg-teal-700 dark:bg-teal-600 text-white text-xs font-semibold hover:bg-teal-800 dark:hover:bg-teal-500 transition-colors"
            >
              Open Admin Console
            </Link>
          )}
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile & Accessibility Preferences */}
        <section className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Profile & Accessibility Preferences
          </h2>
          <form onSubmit={handleSaveProfile} className="space-y-3.5 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Age Group
                </label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value as 'child' | 'adult' | 'senior')}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  <option value="adult">Adult</option>
                  <option value="child">Child</option>
                  <option value="senior">Senior Citizen</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Language
                </label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value as LanguageCode)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी</option>
                  <option value="or">ଓଡ଼ିଆ</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred PIN Code
                </label>
                <input
                  type="text"
                  value={preferredLocation}
                  onChange={(e) => setPreferredLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Emergency Contact
                </label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pt-1">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={largeTextPref}
                  onChange={(e) => setLargeTextPref(e.target.checked)}
                  className="h-4 w-4 accent-sky-700"
                />
                <span>Use larger text size</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={wheelchairNeeded}
                  onChange={(e) => setWheelchairNeeded(e.target.checked)}
                  className="h-4 w-4 accent-sky-700"
                />
                <span>Prioritize wheelchair accessibility</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={signLanguageNeeded}
                  onChange={(e) => setSignLanguageNeeded(e.target.checked)}
                  className="h-4 w-4 accent-sky-700"
                />
                <span>Prioritize sign-language support</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white text-sm font-semibold transition-colors"
            >
              {saving ? 'Saving…' : 'Save Preferences'}
            </button>
          </form>

          {/* DPDP Act 2023 Right to Erasure */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
              Data Privacy Control (DPDP Act 2023)
            </p>
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 dark:text-red-400 hover:underline"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete My Account & Personal Data</span>
              </button>
            ) : (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 space-y-2 text-xs">
                <p className="text-red-900 dark:text-red-200 font-medium">
                  This permanently deletes your profile, saved facilities, and pre-arrival links.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white font-semibold"
                  >
                    Confirm Permanent Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Saved Facilities, Pre-Arrival & Activity */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              Saved & Favourite Healthcare Facilities
            </h2>
            {savedFacilities.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                No saved facilities yet. Click &ldquo;Save&rdquo; on any hospital or clinic card.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {savedFacilities.map((f) => (
                  <div
                    key={f.id}
                    className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 flex items-center justify-between gap-3"
                  >
                    <div>
                      <Link
                        to={`/facilities/${f.id}`}
                        className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-sky-700 dark:hover:text-sky-400"
                      >
                        {f.name}
                      </Link>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        {f.distanceKm} km ·{' '}
                        {f.effectiveWaitMinutes !== null
                          ? `Est. Wait: ${f.effectiveWaitMinutes} min`
                          : 'Wait unavailable'}
                      </p>
                    </div>
                    <Link
                      to={`/facilities/${f.id}`}
                      className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline whitespace-nowrap shrink-0"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-700 dark:text-sky-400" />
              Recent Pre-Arrival Notifications
            </h2>
            {allPreArrivals.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                No &ldquo;I&apos;m On My Way&rdquo; pre-arrival notifications submitted yet.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {allPreArrivals.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">
                        {p.facilityName} ·{' '}
                        <span className="font-mono text-sky-700 dark:text-sky-400">
                          {p.referenceCode}
                        </span>
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                        Reason: {p.visitReason} · ETA: ~{p.arrivalWindowMinutes} min · Status:{' '}
                        <strong className="capitalize">{p.status}</strong>
                      </p>
                    </div>
                    {p.status === 'active' && (
                      <button
                        type="button"
                        onClick={() => handleCancelPreArrival(p.id)}
                        className="px-3 py-1.5 rounded border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-950/40 self-start transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Recently Viewed Facilities
              </h3>
              {recentFacilities.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  No facilities viewed recently.
                </p>
              ) : (
                <ul className="mt-3 space-y-2 text-xs">
                  {recentFacilities.slice(0, 5).map((f) => (
                    <li key={f.id}>
                      <Link
                        to={`/facilities/${f.id}`}
                        className="text-sky-700 dark:text-sky-400 hover:underline font-medium"
                      >
                        {f.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                Previous Searches
              </h3>
              {user.searchHistory.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  No previous searches saved.
                </p>
              ) : (
                <ul className="mt-3 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {user.searchHistory.slice(0, 6).map((term, i) => (
                    <li key={i}>
                      <Link
                        to={`/find-healthcare?q=${encodeURIComponent(term)}`}
                        className="hover:text-sky-700 dark:hover:text-sky-400 hover:underline"
                      >
                        {term}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
