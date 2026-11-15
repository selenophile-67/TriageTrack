import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Clock,
  Compass,
  MapPin,
  MessageSquareHeart,
  PhoneCall,
  Search,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  enrichFacilityMetrics,
  PRESET_LOCATIONS,
  SYMPTOM_CATALOG,
} from '../data/triageKnowledge';
import { FacilityCard } from '../components/FacilityCard';

export function HomePage() {
  const { t, facilities, facilitiesLoading, location, setLocation, requestGpsLocation, gpsLoading } =
    useApp();
  const navigate = useNavigate();
  const [quickQuery, setQuickQuery] = useState('');

  const enriched = useMemo(
    () => facilities.map((f) => enrichFacilityMetrics(f, location)),
    [facilities, location]
  );

  const overviewStats = useMemo(() => {
    const hospitals = enriched.filter(
      (f) => f.category === 'hospital' || f.category === 'emergency_department'
    ).length;
    const urgentCare = enriched.filter((f) => f.category === 'urgent_care' || f.category === 'clinic').length;
    const shorterWait = enriched.filter((f) => f.waitTier === 'GREEN').length;
    const emergencyReady = enriched.filter((f) => f.hasEmergencyDept).length;
    return { hospitals, urgentCare, shorterWait, emergencyReady };
  }, [enriched]);

  const highlightedFacilities = useMemo(() => {
    const shortest = [...enriched]
      .filter((f) => f.effectiveWaitMinutes !== null)
      .sort((a, b) => (a.effectiveWaitMinutes ?? 999) - (b.effectiveWaitMinutes ?? 999))
      .slice(0, 2);
    const nearestEd = [...enriched]
      .filter((f) => f.hasEmergencyDept)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 1);
    const combined = [...shortest, ...nearestEd];
    const unique = combined.filter((f, idx, arr) => arr.findIndex((x) => x.id === f.id) === idx);
    return unique;
  }, [enriched]);

  const handleQuickSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = quickQuery.trim();
    if (!q) {
      navigate('/find-healthcare');
      return;
    }

    // Check if PIN code matches a preset zone
    const matchedPreset = PRESET_LOCATIONS.find((p) => p.pinCode === q);
    if (matchedPreset) {
      setLocation(matchedPreset);
      navigate(`/find-healthcare?q=${encodeURIComponent(q)}`);
      return;
    }

    // Log search term anonymously
    fetch('/api/analytics/symptom-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ term: q }),
    }).catch(() => {});

    // Route to Symptom Checker if query matches a symptom keyword
    const lower = q.toLowerCase();
    const matchedSymptom = SYMPTOM_CATALOG.find(
      (s) =>
        s.label.toLowerCase().includes(lower) ||
        s.keywords.some((k) => lower.includes(k))
    );

    if (matchedSymptom) {
      navigate(`/symptom-checker?symptom=${encodeURIComponent(matchedSymptom.id)}`);
    } else {
      navigate(`/find-healthcare?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-wide text-sky-700 dark:text-sky-400 mb-3">
              {t.tagline}
            </p>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight"
              style={{ textWrap: 'balance' }}
            >
              {t.heroTitle}
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              {t.heroSubtitle}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/symptom-checker"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold text-sm transition-colors whitespace-nowrap shrink-0 min-h-[44px]"
              >
                <Stethoscope className="w-4 h-4" aria-hidden="true" />
                <span>{t.ctaCheckSymptoms}</span>
              </Link>
              <Link
                to="/find-healthcare"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold text-sm transition-colors whitespace-nowrap shrink-0 min-h-[44px]"
              >
                <MapPin className="w-4 h-4 text-teal-700 dark:text-teal-400" aria-hidden="true" />
                <span>{t.ctaFindCare}</span>
              </Link>
              <Link
                to="/health-assistant"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-lg bg-slate-100 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold text-sm transition-colors whitespace-nowrap shrink-0 min-h-[44px]"
              >
                <MessageSquareHeart className="w-4 h-4 text-sky-700 dark:text-sky-400" aria-hidden="true" />
                <span>Ask Health AI</span>
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-700 dark:text-teal-400" aria-hidden="true" />
                Urgency comes before queue length
              </span>
              <span className="inline-flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-red-600 dark:text-red-400" aria-hidden="true" />
                Direct 112 emergency guidance
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-sky-700 dark:text-sky-400" aria-hidden="true" />
                No mandatory sign-up
              </span>
            </div>
          </div>

          {/* Quick Healthcare Search Bar */}
          <div className="mt-10 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-5">
            <form onSubmit={handleQuickSearch} className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search
                  className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={quickQuery}
                  onChange={(e) => setQuickQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  aria-label="Search symptoms, conditions, facilities, or PIN code"
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 min-h-[44px]"
                />
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-2">
                <select
                  value={location.pinCode}
                  onChange={(e) => {
                    const found = PRESET_LOCATIONS.find((p) => p.pinCode === e.target.value);
                    if (found) setLocation(found);
                  }}
                  aria-label="Select neighbourhood or PIN code zone"
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 min-h-[44px]"
                >
                  {location.source === 'gps' && (
                    <option value="GPS">Current GPS Location</option>
                  )}
                  {PRESET_LOCATIONS.map((loc) => (
                    <option key={loc.pinCode} value={loc.pinCode}>
                      {loc.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={requestGpsLocation}
                  disabled={gpsLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap shrink-0 min-h-[44px]"
                >
                  <Compass className="w-4 h-4 text-sky-700 dark:text-sky-400" aria-hidden="true" />
                  <span>{gpsLoading ? 'Locating…' : 'Use GPS'}</span>
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold whitespace-nowrap shrink-0 min-h-[44px]"
                >
                  {t.searchButton}
                </button>
              </div>
            </form>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-medium text-slate-700 dark:text-slate-300">Quick symptom links:</span>
              {['Fever', 'Chest pain', 'Sprains', 'Pregnancy', 'Mental health'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    const match = SYMPTOM_CATALOG.find((s) =>
                      s.label.toLowerCase().includes(term.toLowerCase())
                    );
                    if (match) navigate(`/symptom-checker?symptom=${match.id}`);
                  }}
                  className="text-sky-700 dark:text-sky-400 hover:underline font-medium"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Healthcare Overview KPI Row + Featured Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
              {location.label} · DEMO DATA
            </p>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{t.overviewTitle}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t.overviewSubtitle}</p>
          </div>
          <Link
            to="/find-healthcare"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 dark:text-sky-400 hover:text-sky-900 dark:hover:text-sky-300 whitespace-nowrap shrink-0"
          >
            <span>Open Interactive Map</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        {/* 4-Column Summary Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Nearby Hospitals & EDs</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
              {overviewStats.hospitals}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Multi-specialty & trauma centres</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Urgent Care & Clinics</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
              {overviewStats.urgentCare}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Non-life-threatening care</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Shorter Wait (&le;30 min)</p>
            <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mt-1 tabular-nums">
              {overviewStats.shorterWait}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Confirmed or community-reported</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <p className="text-xs font-medium text-red-700 dark:text-red-400">24/7 Emergency Departments</p>
            <p className="text-3xl font-bold text-red-700 dark:text-red-400 mt-1 tabular-nums">
              {overviewStats.emergencyReady}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Immediate red-flag response</p>
          </div>
        </div>

        {facilitiesLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {highlightedFacilities.map((fac) => (
              <FacilityCard key={fac.id} facility={fac} />
            ))}
          </div>
        )}
      </section>

      {/* Safety-First Care Navigation Tiers */}
      <section className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Three Clear Care Pathways — Safety Before Speed
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              TriageTrack separates immediate emergencies from urgent assessments and routine care so
              a short wait time never misleads a patient with serious symptoms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-red-200 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/30 rounded-xl p-6">
              <p className="text-xs font-bold text-red-700 dark:text-red-400">RED · IMMEDIATE EMERGENCY</p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                Emergency Department / Call 112
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
                Chest pain, severe breathing trouble, stroke signs, uncontrolled bleeding, or
                unconsciousness. Never queue-shop during an emergency.
              </p>
              <Link
                to="/emergency"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-700 dark:text-red-400 hover:underline mt-4"
              >
                <span>Open Emergency Help</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/30 rounded-xl p-6">
              <p className="text-xs font-bold text-amber-800 dark:text-amber-400">YELLOW · URGENT ASSESSMENT</p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                Urgent Care or Hospital Outpatient
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
                Persistent high fever, suspected fractures needing X-ray, worsening infections, or
                pregnancy concerns needing same-day evaluation.
              </p>
              <Link
                to="/symptom-checker"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-800 dark:text-amber-400 hover:underline mt-4"
              >
                <span>Check Symptoms</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/30 rounded-xl p-6">
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">GREEN · ROUTINE & PRIMARY CARE</p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                Clinics, PHCs & Urgent Care
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
                Minor cuts, mild sprains, uncomplicated colds, or skin irritation when no warning
                signs are present—helping keep ERs clear for critical cases.
              </p>
              <Link
                to="/find-healthcare"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 dark:text-emerald-400 hover:underline mt-4"
              >
                <span>Compare Nearby Clinics</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="mt-8 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-sky-700 dark:text-sky-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-sm">
                <p className="font-semibold text-slate-900 dark:text-white">
                  Community Wait-Time Transparency & Pre-Arrival Check
                </p>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                  Every facility clearly states whether its wait time is facility-confirmed,
                  community-reported, estimated, or unavailable.
                </p>
              </div>
            </div>
            <Link
              to="/about"
              className="text-sm font-semibold text-sky-700 dark:text-sky-400 hover:underline whitespace-nowrap shrink-0"
            >
              Read How It Works
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
