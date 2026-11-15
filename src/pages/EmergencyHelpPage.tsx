import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertOctagon,
  HeartPulse,
  MapPin,
  Navigation,
  PhoneCall,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { enrichFacilityMetrics } from '../data/triageKnowledge';

export function EmergencyHelpPage() {
  const { facilities, location, t } = useApp();

  // Zero-delay nearest emergency departments (does NOT block on map rendering or auth!)
  const nearestEDs = useMemo(() => {
    return facilities
      .filter((f) => f.hasEmergencyDept)
      .map((f) => enrichFacilityMetrics(f, location))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [facilities, location]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Immediate Emergency Hero */}
      <section className="bg-red-700 text-white rounded-xl p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-wide uppercase text-red-100">
              IMMEDIATE EMERGENCY ASSISTANCE · NO SIGN-IN REQUIRED
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold mt-1">{t.call112Title}</h1>
            <p className="text-sm sm:text-base text-red-50 mt-3 leading-relaxed">
              {t.call112Body}
            </p>
            <p className="text-xs text-red-100 mt-3 flex items-start gap-2">
              <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{t.emergencyDisclaimer}</span>
            </p>
          </div>

          <div className="flex flex-col gap-3 shrink-0">
            <a
              href="tel:112"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-white text-red-700 font-bold text-lg hover:bg-red-50 transition-colors"
            >
              <PhoneCall className="w-5 h-5" aria-hidden="true" />
              <span>Call 112 (India Emergency)</span>
            </a>
            <a
              href="tel:108"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-800 text-white font-semibold text-sm border border-red-400 hover:bg-red-900 transition-colors"
            >
              <PhoneCall className="w-4 h-4" aria-hidden="true" />
              <span>Call 108 (State Ambulance Service)</span>
            </a>
            <a
              href="tel:14416"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-900/70 text-white font-semibold text-sm border border-red-400 hover:bg-red-900 transition-colors"
            >
              <HeartPulse className="w-4 h-4" aria-hidden="true" />
              <span>Call 14416 (Tele-MANAS Crisis Line)</span>
            </a>
          </div>
        </div>
      </section>

      {/* Nearest Emergency Departments (Immediate List) */}
      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Nearest Emergency Departments ({location.label} · DEMO DATA)
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Sorted strictly by proximity so emergency care is never delayed by waiting-time
            comparisons.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nearestEDs.map((ed) => {
            const directionsUrl = `https://www.openstreetmap.org/directions?from=${location.lat}%2C${location.lng}&to=${ed.lat}%2C${ed.lng}`;
            return (
              <div
                key={ed.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-4"
              >
                <div>
                  <p className="text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
                    24/7 EMERGENCY DEPARTMENT · {ed.distanceKm} km (~{ed.travelMinutes} min drive)
                  </p>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {ed.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span>{ed.address}</span>
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-2">
                    <strong>Check-in:</strong> {ed.checkInInstructions}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Navigate Now</span>
                  </a>
                  <a
                    href={`tel:${ed.phone}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{ed.phone}</span>
                  </a>
                  <Link
                    to={`/facilities/${ed.id}`}
                    className="inline-flex items-center px-3 py-2 text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline"
                  >
                    Facility Profile
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Offline-Available First Aid & Warning Signs */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
          Immediate First-Aid Reference (Available Offline)
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Essential emergency steps while waiting for ambulance response or travelling to an ER.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5 text-sm">
          <div className="border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-lg p-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100">Severe Bleeding</h3>
            <p className="text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed">
              Apply firm, continuous direct pressure over the wound with a clean cloth or sterile
              pad. Do not remove soaked cloths; add fresh layers on top. Call 112 immediately.
            </p>
          </div>
          <div className="border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-lg p-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100">
              Suspected Stroke (FAST Check)
            </h3>
            <p className="text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed">
              <strong>F</strong>ace drooping · <strong>A</strong>rm weakness ·{' '}
              <strong>S</strong>peech difficulty · <strong>T</strong>ime to call 112 immediately.
              Note the exact time symptoms started.
            </p>
          </div>
          <div className="border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-lg p-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100">Unresponsive Person</h3>
            <p className="text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed">
              Check responsiveness and breathing. Call 112 on speakerphone. If not breathing
              normally, start hands-only chest compressions (100–120 per minute) in the centre of
              the chest if trained or guided by dispatcher.
            </p>
          </div>
          <div className="border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-lg p-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100">Seizure Safety</h3>
            <p className="text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed">
              Clear hard objects away, cushion the head, and gently turn the person onto their side.
              Never put anything in their mouth or restrain movements. Call 112 if it lasts over 5
              minutes.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
