import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Accessibility,
  AlertTriangle,
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flag,
  GitCompareArrows,
  Info,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { enrichFacilityMetrics, isFacilityOpenNow } from '../data/triageKnowledge';
import {
  CommunityReport,
  HealthcareFacility,
  PreArrivalNotification,
} from '../types/triage';
import { TrafficLightMap } from '../components/TrafficLightMap';
import { WaitStatusIndicator } from '../components/FacilityCard';

export function FacilityDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const {
    location,
    user,
    toggleSaveFacility,
    compareIds,
    toggleCompare,
    notify,
    refreshFacilities,
    addLocalPreArrival,
    updateLocalPreArrivalStatus,
  } = useApp();

  const [facility, setFacility] = useState<HealthcareFacility | null>(null);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  // "I'm On My Way" Pre-arrival form state
  const [initials, setInitials] = useState(user?.displayName?.slice(0, 12) || '');
  const [ageGroup, setAgeGroup] = useState<'child' | 'adult' | 'senior'>(user?.ageGroup || 'adult');
  const [visitReason, setVisitReason] = useState('');
  const [etaMinutes, setEtaMinutes] = useState(20);
  const [submittingPre, setSubmittingPre] = useState(false);
  const [activePreArrival, setActivePreArrival] = useState<PreArrivalNotification | null>(null);

  // Crowd-sourced Wait-Time Updater state
  const [stillWaiting, setStillWaiting] = useState(true);
  const [crowded, setCrowded] = useState(false);
  const [waitedMinutes, setWaitedMinutes] = useState(20);
  const [queueMoving, setQueueMoving] = useState(true);
  const [submittingReport, setSubmittingReport] = useState(false);

  // Feedback form state
  const [fbCategory, setFbCategory] = useState<
    'accuracy' | 'wait_time' | 'accessibility' | 'ux' | 'listing'
  >('accuracy');
  const [fbMessage, setFbMessage] = useState('');
  const [submittingFb, setSubmittingFb] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/facilities/${id}`);
      if (!res.ok) throw new Error('Facility could not be found.');
      const data = await res.json();
      setFacility(data.facility);
      setReports(data.reports || []);
      fetch(`/api/auth/viewed/${id}`, { method: 'POST' }).catch(() => {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load facility details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const enriched = useMemo(
    () => (facility ? enrichFacilityMetrics(facility, location) : null),
    [facility, location]
  );

  const handlePreArrivalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facility) return;
    setSubmittingPre(true);
    try {
      const res = await fetch('/api/pre-arrival', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId: facility.id,
          displayInitials: initials,
          ageGroup,
          visitReason,
          arrivalWindowMinutes: etaMinutes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to submit pre-arrival notification.');
      setActivePreArrival(data.preArrival);
      addLocalPreArrival(data.preArrival);
      setVisitReason('');
      notify(`Pre-arrival notification created (${data.preArrival.referenceCode}).`, 'success');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Submission failed.', 'error');
    } finally {
      setSubmittingPre(false);
    }
  };

  const handleCancelPreArrival = async () => {
    if (!activePreArrival) return;
    try {
      const res = await fetch(`/api/pre-arrival/${activePreArrival.id}/cancel`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error('Could not cancel notification.');
      const data = await res.json();
      setActivePreArrival(data.preArrival);
      updateLocalPreArrivalStatus(activePreArrival.id, 'cancelled');
      notify('Pre-arrival notification cancelled.', 'info');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Cancellation failed.', 'error');
    }
  };

  const handleCrowdReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facility) return;
    setSubmittingReport(true);
    try {
      const res = await fetch(`/api/facilities/${facility.id}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stillWaiting,
          crowded,
          waitedMinutes: Number(waitedMinutes),
          queueMoving,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not submit wait update.');
      notify(data.message || 'Wait-time update recorded.', 'success');
      await loadDetail();
      await refreshFacilities();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Report submission failed.', 'error');
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleFlagInaccurate = async (reportId: string) => {
    try {
      const res = await fetch(`/api/reports/${reportId}/flag`, { method: 'POST' });
      if (!res.ok) throw new Error('Unable to flag report.');
      notify('Report flagged for quality review.', 'info');
      await loadDetail();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Action failed.', 'error');
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facility) return;
    setSubmittingFb(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId: facility.id,
          category: fbCategory,
          message: fbMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not submit feedback.');
      setFbMessage('');
      notify('Thank you. Your facility feedback has been logged for review.', 'success');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Feedback submission failed.', 'error');
    } finally {
      setSubmittingFb(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error || !facility || !enriched) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Facility Not Found</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{error || 'This listing is unavailable.'}</p>
        <Link
          to="/find-healthcare"
          className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-lg bg-sky-700 text-white text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Healthcare Directory
        </Link>
      </div>
    );
  }

  const openNow = isFacilityOpenNow(facility);
  const isSaved = Boolean(user?.savedFacilityIds.includes(facility.id));
  const isCompared = compareIds.includes(facility.id);
  const osmDirectionsUrl = `https://www.openstreetmap.org/directions?from=${location.lat}%2C${location.lng}&to=${facility.lat}%2C${facility.lng}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/find-healthcare"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-700 dark:text-sky-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Find Healthcare
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => toggleCompare(facility.id)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border ${
              isCompared
                ? 'bg-sky-700 text-white border-sky-700'
                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
            }`}
          >
            <GitCompareArrows className="w-4 h-4" />
            <span>{isCompared ? 'In Comparison' : 'Compare Facility'}</span>
          </button>
          <button
            type="button"
            onClick={() => toggleSaveFacility(facility.id)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border ${
              isSaved
                ? 'bg-teal-700 text-white border-teal-700'
                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>{isSaved ? 'Saved' : 'Save Facility'}</span>
          </button>
        </div>
      </div>

      {/* Main Header Card */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-4 bg-slate-100 dark:bg-slate-800 min-h-[220px]">
            {!imgError ? (
              <img
                src={facility.imageUrl}
                alt={facility.name}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm font-semibold">
                {facility.name}
              </div>
            )}
          </div>

          <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-sky-800 dark:text-sky-300">
                  {facility.category.replace(/_/g, ' ').toUpperCase()}
                  <span aria-hidden="true"> · </span>
                  <span className={openNow ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}>
                    {openNow ? 'Open Now' : 'Currently Closed'}
                  </span>
                  <span aria-hidden="true"> · </span>
                  <span className="text-slate-500 dark:text-slate-400">DEMO DATA</span>
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {facility.name}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    {facility.address} ({facility.pinCode})
                  </span>
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <a href={`tel:${facility.phone}`} className="font-medium text-sky-700 dark:text-sky-400 hover:underline">
                    {facility.phone}
                  </a>
                  <span aria-hidden="true">·</span>
                  <span>{facility.operatingHours}</span>
                </p>
              </div>

              <WaitStatusIndicator
                waitMinutes={enriched.effectiveWaitMinutes}
                tier={enriched.waitTier}
                source={facility.waitTimeSource}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Distance</span>
                <span className="font-bold tabular-nums text-slate-900 dark:text-slate-100">{enriched.distanceKm} km</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Estimated Travel</span>
                <span className="font-bold tabular-nums text-slate-900 dark:text-slate-100">
                  ~{enriched.travelMinutes} min
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Est. Travel + Wait</span>
                <span className="font-bold tabular-nums text-slate-900 dark:text-slate-100">
                  {enriched.combinedAssessmentMinutes !== null
                    ? `~${enriched.combinedAssessmentMinutes} min`
                    : 'Unavailable'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Emergency Dept</span>
                <span
                  className={`font-bold ${
                    facility.hasEmergencyDept ? 'text-red-700 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {facility.hasEmergencyDept ? 'Available 24/7' : 'No ER (Clinic/Urgent)'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={osmDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-sm font-semibold"
              >
                <Navigation className="w-4 h-4" />
                <span>Get Directions</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={`tel:${facility.phone}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm font-semibold"
              >
                <Phone className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <span>Call Facility</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities, Accessibility & Location Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Medical Services, Specialties & Diagnostics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Available Services</p>
                <p className="text-slate-800 dark:text-slate-200">{facility.services.join(' · ')}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Specialties</p>
                <p className="text-slate-800 dark:text-slate-200">{facility.specialties.join(' · ')}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Diagnostic Facilities</p>
                <p className="text-slate-800 dark:text-slate-200">
                  {facility.diagnosticFacilities.length > 0
                    ? facility.diagnosticFacilities.join(' · ')
                    : 'Not listed'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Dedicated Care Units</p>
                <p className="text-slate-800 dark:text-slate-200">
                  {[
                    facility.pediatricServices && 'Pediatric Care',
                    facility.maternityServices && 'Maternity Care',
                    facility.geriatricCare && 'Geriatric Care',
                    facility.mentalHealthServices && 'Mental Health Support',
                  ]
                    .filter(Boolean)
                    .join(' · ') || 'General Outpatient'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <Accessibility className="w-4 h-4 text-sky-700 dark:text-sky-400" />
                Disability & Accessibility Information
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                {[
                  { label: 'Wheelchair Accessible', val: facility.accessibility.wheelchairAccessible },
                  { label: 'Accessible Ramps', val: facility.accessibility.ramps },
                  { label: 'Elevators', val: facility.accessibility.elevators },
                  { label: 'Accessible Toilets', val: facility.accessibility.accessibleToilets },
                  { label: 'Sign Language Support', val: facility.accessibility.signLanguageSupport },
                  { label: 'Hearing / Visual Aid', val: facility.accessibility.hearingVisualAid },
                ].map((acc) => (
                  <div
                    key={acc.label}
                    className={`px-3 py-2 rounded-lg border ${
                      acc.val
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {acc.val ? 'Available: ' : 'No: '}
                    <span className="font-semibold">{acc.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* "I'm On My Way" Digital Pre-Check System */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              &ldquo;I&apos;m On My Way&rdquo; — Digital Pre-Arrival Notification
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Let the facility know your approximate arrival window without sharing sensitive medical
              records.
            </p>

            <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Queue Management Notice:</strong> This facility is not integrated for
                automated queue reservations. Submitting this form sends an optional pre-arrival
                notification only and <strong>does not secure a physical queue position</strong>.
              </span>
            </div>

            {activePreArrival ? (
              <div className="mt-5 p-5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/40 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-teal-900 dark:text-teal-200 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-teal-700 dark:text-teal-400" />
                    <span>
                      {activePreArrival.status === 'cancelled'
                        ? 'Pre-Arrival Cancelled'
                        : 'Pre-Arrival Notification Confirmed'}
                    </span>
                  </div>
                  <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                    Ref: {activePreArrival.referenceCode}
                  </span>
                </div>
                <p className="text-sm text-slate-800 dark:text-slate-200">
                  <strong>Display Name / Initials:</strong> {activePreArrival.displayInitials} ·{' '}
                  <strong>ETA:</strong> ~{activePreArrival.arrivalWindowMinutes} min ·{' '}
                  <strong>Reason:</strong> {activePreArrival.visitReason}
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 rounded-lg p-3">
                  <strong>Check-in Instructions:</strong> {activePreArrival.checkInInstructions}
                </p>
                {activePreArrival.status === 'active' && (
                  <button
                    type="button"
                    onClick={handleCancelPreArrival}
                    className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-800 bg-white dark:bg-slate-900 text-red-700 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
                    Cancel Pre-Arrival Submission
                  </button>
                )}
              </div>
            ) : (
              <form onSubmit={handlePreArrivalSubmit} className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Initials or Preferred Display Name
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={24}
                    value={initials}
                    onChange={(e) => setInitials(e.target.value)}
                    placeholder="e.g., A.M. or Priya"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Age Group
                  </label>
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value as 'child' | 'adult' | 'senior')}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="adult">Adult</option>
                    <option value="child">Child</option>
                    <option value="senior">Senior Citizen</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    General Reason for Visit (non-sensitive)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={visitReason}
                    onChange={(e) => setVisitReason(e.target.value)}
                    placeholder="e.g., Fever assessment, minor ankle sprain"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Approximate Arrival Time
                  </label>
                  <select
                    value={etaMinutes}
                    onChange={(e) => setEtaMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value={10}>In ~10 minutes</option>
                    <option value={20}>In ~20 minutes</option>
                    <option value={30}>In ~30 minutes</option>
                    <option value={45}>In ~45 minutes</option>
                    <option value={60}>In ~1 hour</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={submittingPre}
                    className="px-5 py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold disabled:opacity-60"
                  >
                    {submittingPre ? 'Sending Notification…' : "Submit I'm On My Way"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>

        {/* Right Column: Map, Crowd Wait Updater & Feedback */}
        <div className="lg:col-span-5 space-y-6">
          <TrafficLightMap
            facilities={[enriched]}
            userLocation={location}
            selectedId={facility.id}
            heightClass="h-[260px]"
          />

          {/* Live Crowd-Sourced Wait-Time Updater */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Live Crowd-Sourced Wait-Time Updater
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Currently at this facility? Share an anonymous update. Reports expire automatically
                after 2 hours and are never shown as official hospital data.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-300">
                Recent active community reports:{' '}
                <strong className="tabular-nums">{reports.length}</strong>
              </span>
              <span className="font-semibold text-slate-900 dark:text-white capitalize">
                Trend: {facility.waitTrend}
              </span>
            </div>

            <form onSubmit={handleCrowdReportSubmit} className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Are you still waiting?</span>
                <div className="flex gap-2">
                  {[true, false].map((val) => (
                    <button
                      key={String(val)}
                      type="button"
                      onClick={() => setStillWaiting(val)}
                      className={`px-3 py-1 rounded-md border text-xs font-semibold ${
                        stillWaiting === val
                          ? 'bg-sky-700 text-white border-sky-700'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {val ? 'Yes' : 'No'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span>Is the waiting area crowded?</span>
                <div className="flex gap-2">
                  {[true, false].map((val) => (
                    <button
                      key={String(val)}
                      type="button"
                      onClick={() => setCrowded(val)}
                      className={`px-3 py-1 rounded-md border text-xs font-semibold ${
                        crowded === val
                          ? 'bg-sky-700 text-white border-sky-700'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {val ? 'Yes' : 'No'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span>Has the queue moved recently?</span>
                <div className="flex gap-2">
                  {[true, false].map((val) => (
                    <button
                      key={String(val)}
                      type="button"
                      onClick={() => setQueueMoving(val)}
                      className={`px-3 py-1 rounded-md border text-xs font-semibold ${
                        queueMoving === val
                          ? 'bg-sky-700 text-white border-sky-700'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {val ? 'Yes' : 'No'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Approximately how long have you been waiting? (minutes)
                </label>
                <input
                  type="number"
                  min={0}
                  max={600}
                  required
                  value={waitedMinutes}
                  onChange={(e) => setWaitedMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm tabular-nums text-slate-900 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReport}
                className="w-full py-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-sm font-semibold disabled:opacity-60"
              >
                {submittingReport ? 'Submitting Update…' : 'Submit Anonymous Wait Update'}
              </button>
            </form>

            {/* Recent Reports Feed */}
            {reports.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Recent Community Updates (Anonymous)
                </p>
                {reports.slice(0, 4).map((rep) => (
                  <div
                    key={rep.id}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs flex items-start justify-between gap-2"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        Waited ~{rep.waitedMinutes} min · {rep.crowded ? 'Crowded' : 'Not crowded'} ·{' '}
                        {rep.queueMoving ? 'Queue moving' : 'Queue slow'}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                        {new Date(rep.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        · Status: {rep.status}
                      </p>
                      {rep.flagReason && (
                        <p className="text-amber-800 dark:text-amber-300 mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          {rep.flagReason}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFlagInaccurate(rep.id)}
                      title="Report inaccurate information"
                      className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Facility Feedback System */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              Report Listing or Accessibility Issue
            </h2>
            <form onSubmit={handleFeedbackSubmit} className="space-y-3">
              <select
                value={fbCategory}
                onChange={(e) =>
                  setFbCategory(
                    e.target.value as 'accuracy' | 'wait_time' | 'accessibility' | 'ux' | 'listing'
                  )
                }
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="accuracy">Facility information accuracy</option>
                <option value="wait_time">Waiting-time estimate issue</option>
                <option value="accessibility">Accessibility update</option>
                <option value="listing">Incorrect hours or phone number</option>
                <option value="ux">General app feedback</option>
              </select>
              <textarea
                rows={3}
                required
                value={fbMessage}
                onChange={(e) => setFbMessage(e.target.value)}
                placeholder="Share a correction or accessibility note (do not enter personal health info)..."
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100"
              />
              <button
                type="submit"
                disabled={submittingFb}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100"
              >
                {submittingFb ? 'Sending…' : 'Submit Feedback'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
