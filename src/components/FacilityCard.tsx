import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Accessibility,
  AlertCircle,
  ArrowRight,
  Bookmark,
  Clock,
  GitCompareArrows,
  MapPin,
  Phone,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isFacilityOpenNow } from '../data/triageKnowledge';
import { FacilityWithMetrics, WaitTimeSource } from '../types/triage';

const CATEGORY_LABELS: Record<string, string> = {
  hospital: 'Hospital',
  emergency_department: 'Emergency Department',
  urgent_care: 'Urgent Care Centre',
  clinic: 'Medical Clinic',
  primary_health_centre: 'Primary Health Centre',
  diagnostic_centre: 'Diagnostic Centre',
  pharmacy: 'Pharmacy',
};

const SOURCE_LABELS: Record<WaitTimeSource, string> = {
  facility_confirmed: 'Facility-confirmed (Demo)',
  community_reported: 'Community-reported (Demo)',
  estimated: 'Estimated (Demo)',
  unavailable: 'Unavailable',
};

export function WaitStatusIndicator({
  waitMinutes,
  tier,
  source,
}: {
  waitMinutes: number | null;
  tier: FacilityWithMetrics['waitTier'];
  source: WaitTimeSource;
}) {
  if (tier === 'UNAVAILABLE' || waitMinutes === null) {
    return (
      <div className="text-right">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Wait Unavailable</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">Live data unavailable</p>
      </div>
    );
  }

  const tierText =
    tier === 'GREEN'
      ? 'Shorter wait'
      : tier === 'YELLOW'
      ? 'Moderate wait'
      : 'Longer wait';

  const textColor =
    tier === 'GREEN'
      ? 'text-emerald-700 dark:text-emerald-400'
      : tier === 'YELLOW'
      ? 'text-amber-700 dark:text-amber-400'
      : 'text-red-700 dark:text-red-400';

  return (
    <div className="text-right">
      <p className={`text-lg font-bold tabular-nums ${textColor}`}>
        {waitMinutes} min
      </p>
      <p className={`text-xs font-medium ${textColor}`}>{tierText}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{SOURCE_LABELS[source]}</p>
    </div>
  );
}

export function FacilityCard({
  facility,
  onSelectOnMap,
  showSuitability,
}: {
  facility: FacilityWithMetrics;
  onSelectOnMap?: (id: string) => void;
  showSuitability?: boolean;
}) {
  const { compareIds, toggleCompare, user, toggleSaveFacility } = useApp();
  const [imgError, setImgError] = useState(false);

  const isSaved = Boolean(user?.savedFacilityIds.includes(facility.id));
  const isCompared = compareIds.includes(facility.id);
  const openNow = isFacilityOpenNow(facility);
  const updatedTime = new Date(facility.lastUpdatedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-sky-300 dark:hover:border-sky-700 transition-colors">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
              {!imgError ? (
                <img
                  src={facility.imageUrl}
                  alt={facility.name}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-xs font-semibold">
                  CARE
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-sky-800 dark:text-sky-300">
                {CATEGORY_LABELS[facility.category] || facility.category}
                <span aria-hidden="true"> · </span>
                <span className={openNow ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}>
                  {openNow ? 'Open now' : 'Closed'}
                </span>
                <span aria-hidden="true"> · </span>
                <span className="text-slate-500 dark:text-slate-400">DEMO DATA</span>
              </p>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5 leading-snug">
                <Link to={`/facilities/${facility.id}`} className="hover:text-sky-700 dark:hover:text-sky-400">
                  {facility.name}
                </Link>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                <span className="truncate">{facility.address}</span>
              </p>
            </div>
          </div>

          <WaitStatusIndicator
            waitMinutes={facility.effectiveWaitMinutes}
            tier={facility.waitTier}
            source={facility.waitTimeSource}
          />
        </div>

        {showSuitability && facility.suitabilityReason && (
          <p className="mt-3 text-xs font-medium text-teal-800 dark:text-teal-200 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-lg px-3 py-2">
            Recommended match: {facility.suitabilityReason}
          </p>
        )}

        {/* Unboxed tabular metadata strip */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">Distance</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
              {facility.distanceKm} km
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">Travel Time</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
              ~{facility.travelMinutes} min
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">Est. Travel + Wait</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
              {facility.combinedAssessmentMinutes !== null
                ? `~${facility.combinedAssessmentMinutes} min`
                : 'Unavailable'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">Updated</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">{updatedTime}</span>
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <p>
            <span className="font-medium text-slate-800 dark:text-slate-200">Services:</span>{' '}
            {facility.services.slice(0, 4).join(' · ')}
            {facility.services.length > 4 ? ` +${facility.services.length - 4} more` : ''}
          </p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600 dark:text-slate-400">
            <span>Hours: {facility.operatingHours}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" aria-hidden="true" />
              {facility.phone}
            </span>
            {facility.hasEmergencyDept && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 font-semibold text-red-700 dark:text-red-400">
                  <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
                  24/7 Emergency Dept
                </span>
              </>
            )}
            {facility.accessibility.wheelchairAccessible && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-sky-800 dark:text-sky-300">
                  <Accessibility className="w-3.5 h-3.5" aria-hidden="true" />
                  Wheelchair Accessible
                </span>
              </>
            )}
          </p>
          {facility.waitTimeSource === 'unavailable' && (
            <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1 pt-0.5">
              <AlertCircle className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              Live waiting-time data is currently unavailable. Call facility before travelling.
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => toggleCompare(facility.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
              isCompared
                ? 'bg-sky-700 text-white border-sky-700'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <GitCompareArrows className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isCompared ? 'In Compare' : 'Compare'}</span>
          </button>

          <button
            type="button"
            onClick={() => toggleSaveFacility(facility.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
              isSaved
                ? 'bg-teal-700 text-white border-teal-700'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          {onSelectOnMap && (
            <button
              type="button"
              onClick={() => onSelectOnMap(facility.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 whitespace-nowrap shrink-0 min-h-[36px]"
            >
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Locate on Map</span>
            </button>
          )}
        </div>

        <Link
          to={`/facilities/${facility.id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 transition-colors whitespace-nowrap shrink-0 min-h-[36px]"
        >
          <span>View Facility Details</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
