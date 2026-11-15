import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Compass, Filter, List, Map as MapIcon, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  enrichFacilityMetrics,
  isFacilityOpenNow,
  PRESET_LOCATIONS,
} from '../data/triageKnowledge';
import { FacilityCategory } from '../types/triage';
import { TrafficLightMap } from '../components/TrafficLightMap';
import { FacilityCard } from '../components/FacilityCard';

const CATEGORY_OPTIONS: { value: 'all' | FacilityCategory; label: string }[] = [
  { value: 'all', label: 'All Facilities' },
  { value: 'hospital', label: 'Hospitals' },
  { value: 'emergency_department', label: 'Emergency Depts' },
  { value: 'urgent_care', label: 'Urgent Care' },
  { value: 'clinic', label: 'Clinics' },
  { value: 'primary_health_centre', label: 'Primary Health Centres' },
  { value: 'diagnostic_centre', label: 'Diagnostic Centres' },
  { value: 'pharmacy', label: 'Pharmacies' },
];

export function FindHealthcarePage() {
  const { facilities, facilitiesLoading, facilitiesError, location, setLocation, requestGpsLocation, gpsLoading } =
    useApp();
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState<'all' | FacilityCategory>('all');
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [edOnly, setEdOnly] = useState(false);
  const [pediatricOnly, setPediatricOnly] = useState(false);
  const [maternityOnly, setMaternityOnly] = useState(false);
  const [geriatricOnly, setGeriatricOnly] = useState(false);
  const [wheelchairOnly, setWheelchairOnly] = useState(false);
  const [signLanguageOnly, setSignLanguageOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'distance' | 'wait' | 'combined'>('combined');
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'both' | 'map' | 'list'>('both');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = facilities
      .map((f) => enrichFacilityMetrics(f, location))
      .filter((f) => {
        if (category !== 'all' && f.category !== category) return false;
        if (openNowOnly && !isFacilityOpenNow(f)) return false;
        if (edOnly && !f.hasEmergencyDept) return false;
        if (pediatricOnly && !f.pediatricServices) return false;
        if (maternityOnly && !f.maternityServices) return false;
        if (geriatricOnly && !f.geriatricCare) return false;
        if (wheelchairOnly && !f.accessibility.wheelchairAccessible) return false;
        if (signLanguageOnly && !f.accessibility.signLanguageSupport) return false;
        if (q) {
          const hay = [
            f.name,
            f.address,
            f.pinCode,
            f.city,
            ...f.services,
            ...f.specialties,
            ...f.chronicCareSupport,
          ]
            .join(' ')
            .toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });

    return list.sort((a, b) => {
      if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
      if (sortBy === 'wait') {
        const wa = a.effectiveWaitMinutes ?? 9999;
        const wb = b.effectiveWaitMinutes ?? 9999;
        return wa - wb;
      }
      const ca = a.combinedAssessmentMinutes ?? 9999;
      const cb = b.combinedAssessmentMinutes ?? 9999;
      return ca - cb;
    });
  }, [
    facilities,
    location,
    query,
    category,
    openNowOnly,
    edOnly,
    pediatricOnly,
    maternityOnly,
    geriatricOnly,
    wheelchairOnly,
    signLanguageOnly,
    sortBy,
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold text-sky-700 dark:text-sky-400">
            INTERACTIVE TRAFFIC LIGHT WAIT-TIME MAP · DEMO DATA
          </p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">Find Healthcare Nearby</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Filter by medical capability, accessibility, opening hours, distance, and estimated
            wait time.
          </p>
        </div>

        {/* Location Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={location.pinCode}
            onChange={(e) => {
              const found = PRESET_LOCATIONS.find((p) => p.pinCode === e.target.value);
              if (found) setLocation(found);
            }}
            aria-label="Select location zone"
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 min-h-[40px]"
          >
            {location.source === 'gps' && <option value="GPS">Current GPS Location</option>}
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
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 min-h-[40px]"
          >
            <Compass className="w-4 h-4 text-sky-700 dark:text-sky-400" aria-hidden="true" />
            <span>{gpsLoading ? 'Locating…' : 'Use My Location'}</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search facility name, medical service (X-Ray, Cardiology), or PIN..."
              aria-label="Search facilities or medical services"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <div className="md:col-span-4">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as 'all' | FacilityCategory)}
              aria-label="Filter by facility type"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'distance' | 'wait' | 'combined')}
              aria-label="Sort healthcare facilities"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
            >
              <option value="combined">Sort: Travel + Wait Time</option>
              <option value="wait">Sort: Shortest Wait Time</option>
              <option value="distance">Sort: Closest Distance</option>
            </select>
          </div>
        </div>

        {/* Toggle Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 mr-1">
            <Filter className="w-3.5 h-3.5" aria-hidden="true" />
            Filters:
          </span>
          {[
            { label: 'Open Now', active: openNowOnly, toggle: () => setOpenNowOnly((v) => !v) },
            { label: 'Emergency Dept', active: edOnly, toggle: () => setEdOnly((v) => !v) },
            { label: 'Pediatric', active: pediatricOnly, toggle: () => setPediatricOnly((v) => !v) },
            { label: 'Maternity', active: maternityOnly, toggle: () => setMaternityOnly((v) => !v) },
            { label: 'Geriatric Care', active: geriatricOnly, toggle: () => setGeriatricOnly((v) => !v) },
            {
              label: 'Wheelchair Accessible',
              active: wheelchairOnly,
              toggle: () => setWheelchairOnly((v) => !v),
            },
            {
              label: 'Sign Language',
              active: signLanguageOnly,
              toggle: () => setSignLanguageOnly((v) => !v),
            },
          ].map((btn) => (
            <button
              key={btn.label}
              type="button"
              onClick={btn.toggle}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                btn.active
                  ? 'bg-sky-700 text-white border-sky-700'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {facilitiesError && (
        <div className="mb-6 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 rounded-lg p-3.5 text-xs text-amber-900 dark:text-amber-200">
          {facilitiesError}
        </div>
      )}

      {/* Mobile Map/List View Switch */}
      <div className="lg:hidden flex items-center gap-1 p-1 bg-slate-200 dark:bg-slate-800 rounded-lg mb-4 w-fit">
        <button
          type="button"
          onClick={() => setMobileView('both')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
            mobileView === 'both'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
              : 'text-slate-700 dark:text-slate-300'
          }`}
        >
          Split
        </button>
        <button
          type="button"
          onClick={() => setMobileView('map')}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold ${
            mobileView === 'map'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
              : 'text-slate-700 dark:text-slate-300'
          }`}
        >
          <MapIcon className="w-3.5 h-3.5" /> Map
        </button>
        <button
          type="button"
          onClick={() => setMobileView('list')}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold ${
            mobileView === 'list'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
              : 'text-slate-700 dark:text-slate-300'
          }`}
        >
          <List className="w-3.5 h-3.5" /> List
        </button>
      </div>

      {/* Synchronized Map + Facility List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div
          className={`lg:col-span-5 lg:sticky lg:top-20 ${
            mobileView === 'list' ? 'hidden lg:block' : 'block'
          }`}
        >
          <TrafficLightMap
            facilities={filtered}
            userLocation={location}
            selectedId={selectedMapId}
            onSelectFacility={(id) => setSelectedMapId(id)}
            heightClass="h-[460px] lg:h-[580px]"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Showing <span className="font-semibold tabular-nums">{filtered.length}</span>{' '}
            healthcare facilities · Travel + Wait times are estimates only and do not guarantee
            consultation time.
          </p>
        </div>

        <div
          className={`lg:col-span-7 space-y-4 ${
            mobileView === 'map' ? 'hidden lg:block' : 'block'
          }`}
        >
          {facilitiesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center">
              <p className="text-base font-semibold text-slate-900 dark:text-white">
                No facilities match your current filters
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Try clearing some accessibility or category filters to view more nearby options.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setCategory('all');
                  setOpenNowOnly(false);
                  setEdOnly(false);
                  setPediatricOnly(false);
                  setMaternityOnly(false);
                  setGeriatricOnly(false);
                  setWheelchairOnly(false);
                  setSignLanguageOnly(false);
                }}
                className="mt-4 px-4 py-2 rounded-lg bg-sky-700 text-white text-xs font-semibold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filtered.map((fac) => (
              <FacilityCard
                key={fac.id}
                facility={fac}
                onSelectOnMap={(id) => {
                  setSelectedMapId(id);
                  if (mobileView === 'list') setMobileView('both');
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
