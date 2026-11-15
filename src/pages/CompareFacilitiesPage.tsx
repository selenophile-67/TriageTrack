import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, GitCompareArrows, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { enrichFacilityMetrics } from '../data/triageKnowledge';

export function CompareFacilitiesPage() {
  const { facilities, compareIds, toggleCompare, clearCompare, location } = useApp();

  const selected = facilities
    .filter((f) => compareIds.includes(f.id))
    .map((f) => enrichFacilityMetrics(f, location));

  const availableToAdd = facilities.filter((f) => !compareIds.includes(f.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-sky-700 dark:text-sky-400">
            SIDE-BY-SIDE COMPARISON · DEMO DATA
          </p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mt-1">
            Compare Healthcare Facilities
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Compare up to 3 healthcare facilities across services, emergency capability,
            accessibility, distance, and estimated waiting time.
          </p>
        </div>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={clearCompare}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Comparison</span>
          </button>
        )}
      </div>

      {/* Quick Facility Selector */}
      {selected.length < 3 && availableToAdd.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 inline-flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-sky-700 dark:text-sky-400" />
            Add a facility to compare ({selected.length}/3):
          </span>
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                toggleCompare(e.target.value);
                e.target.value = '';
              }
            }}
            aria-label="Add facility to comparison"
            className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 max-w-md flex-1"
          >
            <option value="" disabled>
              Select a healthcare facility…
            </option>
            {availableToAdd.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.category.replace(/_/g, ' ')})
              </option>
            ))}
          </select>
        </div>
      )}

      {selected.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center space-y-4">
          <GitCompareArrows className="w-10 h-10 text-sky-700 dark:text-sky-400 mx-auto" aria-hidden="true" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
            No Facilities Selected Yet
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Choose facilities from the dropdown above or click &ldquo;Compare&rdquo; on any
            facility card in Find Healthcare.
          </p>
          <Link
            to="/find-healthcare"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white text-sm font-semibold transition-colors"
          >
            <span>Browse Facilities</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70">
                <th className="p-4 text-xs font-semibold text-slate-600 dark:text-slate-400 w-48">
                  Attribute
                </th>
                {selected.map((fac) => (
                  <th key={fac.id} className="p-4 align-top">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold text-sky-700 dark:text-sky-400 uppercase">
                          {fac.category.replace(/_/g, ' ')}
                        </p>
                        <Link
                          to={`/facilities/${fac.id}`}
                          className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-sky-700 dark:hover:text-sky-400"
                        >
                          {fac.name}
                        </Link>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleCompare(fac.id)}
                        className="text-xs text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              <tr>
                <td className="p-4 font-medium text-slate-600 dark:text-slate-400">Distance</td>
                {selected.map((f) => (
                  <td key={f.id} className="p-4 font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                    {f.distanceKm} km (~{f.travelMinutes} min travel)
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-slate-600 dark:text-slate-400">
                  Estimated Wait Time
                </td>
                {selected.map((f) => (
                  <td key={f.id} className="p-4 font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {f.effectiveWaitMinutes !== null
                      ? `${f.effectiveWaitMinutes} min (${f.waitTier})`
                      : 'Live wait data unavailable'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-slate-600 dark:text-slate-400">
                  Est. Travel + Wait
                </td>
                {selected.map((f) => (
                  <td key={f.id} className="p-4 font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                    {f.combinedAssessmentMinutes !== null
                      ? `~${f.combinedAssessmentMinutes} min`
                      : 'Unavailable'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-slate-600 dark:text-slate-400">
                  Wait Data Reliability
                </td>
                {selected.map((f) => (
                  <td key={f.id} className="p-4 text-slate-700 dark:text-slate-300 capitalize">
                    {f.waitTimeSource.replace(/_/g, ' ')} (Demo)
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-slate-600 dark:text-slate-400">
                  Emergency Capability
                </td>
                {selected.map((f) => (
                  <td
                    key={f.id}
                    className={`p-4 font-semibold ${
                      f.hasEmergencyDept
                        ? 'text-red-700 dark:text-red-400'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {f.hasEmergencyDept ? '24/7 Emergency Department' : 'Non-ER / Outpatient'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-slate-600 dark:text-slate-400">
                  Opening Hours
                </td>
                {selected.map((f) => (
                  <td key={f.id} className="p-4 text-slate-700 dark:text-slate-300">
                    {f.operatingHours}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-slate-600 dark:text-slate-400">Services</td>
                {selected.map((f) => (
                  <td key={f.id} className="p-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {f.services.join(' · ')}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-slate-600 dark:text-slate-400">
                  Accessibility
                </td>
                {selected.map((f) => (
                  <td key={f.id} className="p-4 text-xs text-slate-700 dark:text-slate-300">
                    {[
                      f.accessibility.wheelchairAccessible && 'Wheelchair',
                      f.accessibility.ramps && 'Ramps',
                      f.accessibility.elevators && 'Elevators',
                      f.accessibility.accessibleToilets && 'Accessible Toilets',
                      f.accessibility.signLanguageSupport && 'Sign Language',
                    ]
                      .filter(Boolean)
                      .join(' · ') || 'Standard'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-slate-600 dark:text-slate-400">Action</td>
                {selected.map((f) => (
                  <td key={f.id} className="p-4">
                    <Link
                      to={`/facilities/${f.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline"
                    >
                      <span>View Facility Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
