import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  Search,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  recommendFacilities,
  SYMPTOM_CATALOG,
  SymptomOption,
} from '../data/triageKnowledge';
import { PatientProfileMode, UrgencyLevel } from '../types/triage';
import { FacilityCard } from '../components/FacilityCard';

export function SymptomCheckerPage() {
  const { facilities, location, patientMode, setPatientMode, user } = useApp();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [symptomSearch, setSymptomSearch] = useState('');
  const [selectedSymptom, setSelectedSymptom] = useState<SymptomOption | null>(null);

  // Follow-up state
  const [duration, setDuration] = useState<'hours' | '1_2_days' | '3_plus_days'>('hours');
  const [severity, setSeverity] = useState<number>(4);
  const [gettingWorse, setGettingWorse] = useState<'no' | 'yes'>('no');
  const [recentInjury, setRecentInjury] = useState<'no' | 'yes'>('no');
  const [patientGroup, setPatientGroup] = useState<PatientProfileMode>(patientMode);
  const [checkedRedFlags, setCheckedRedFlags] = useState<string[]>([]);

  useEffect(() => {
    const paramId = searchParams.get('symptom');
    if (paramId) {
      const found = SYMPTOM_CATALOG.find((s) => s.id === paramId);
      if (found) {
        setSelectedSymptom(found);
        setCheckedRedFlags([]);
        setStep(2);
      }
    }
  }, [searchParams]);

  const filteredCatalog = useMemo(() => {
    const q = symptomSearch.trim().toLowerCase();
    if (!q) return SYMPTOM_CATALOG;
    return SYMPTOM_CATALOG.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }, [symptomSearch]);

  const selectSymptom = (item: SymptomOption) => {
    setSelectedSymptom(item);
    setCheckedRedFlags([]);
    if (item.specialMode === 'maternity') setPatientGroup('maternity');
    if (item.specialMode === 'pediatric') setPatientGroup('child');
    setStep(2);

    fetch('/api/analytics/symptom-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ term: item.label }),
    }).catch(() => {});
  };

  // Compute safe clinical urgency — NEVER lets minor category or short queue mask warning signs!
  const finalUrgency: UrgencyLevel = useMemo(() => {
    if (!selectedSymptom) return 'GREEN';
    let level: UrgencyLevel = selectedSymptom.baseUrgency;

    // 1. Check explicit red flag responses
    for (const rfId of checkedRedFlags) {
      const rf = selectedSymptom.redFlagChecks.find((r) => r.id === rfId);
      if (rf?.escalatesTo === 'RED') return 'RED';
      if (rf?.escalatesTo === 'YELLOW' && level === 'GREEN') level = 'YELLOW';
    }

    // 2. Pain severity >= 8 escalates to RED/YELLOW
    if (severity >= 9) return 'RED';
    if (severity >= 7 && level === 'GREEN') level = 'YELLOW';

    // 3. Worsening or prolonged duration escalates GREEN -> YELLOW
    if ((gettingWorse === 'yes' || duration === '3_plus_days') && level === 'GREEN') {
      level = 'YELLOW';
    }

    // 4. Vulnerable groups (child / senior / maternity) get conservative escalation
    if (
      (patientGroup === 'child' || patientGroup === 'senior' || patientGroup === 'maternity') &&
      level === 'GREEN' &&
      (severity >= 5 || gettingWorse === 'yes')
    ) {
      level = 'YELLOW';
    }

    return level;
  }, [selectedSymptom, checkedRedFlags, severity, gettingWorse, duration, patientGroup]);

  const recommendedFacilities = useMemo(() => {
    if (!selectedSymptom) return [];
    setPatientMode(patientGroup);
    return recommendFacilities(facilities, location, {
      urgency: finalUrgency,
      requiredCapabilities: selectedSymptom.requiredCapabilities,
      patientMode: patientGroup,
      needWheelchair: user?.accessibilityPrefs.wheelchairNeeded || patientGroup === 'disability',
      needSignLanguage: user?.accessibilityPrefs.signLanguageNeeded,
    }).slice(0, 4);
  }, [facilities, location, selectedSymptom, finalUrgency, patientGroup, user, setPatientMode]);

  const toggleRedFlag = (id: string) => {
    setCheckedRedFlags((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold text-sky-700 dark:text-sky-400">
          GUIDED TRIAGE NAVIGATION · NOT A MEDICAL DIAGNOSIS
        </p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">Smart Symptom Checker</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
          Answer a few brief questions to understand the urgency of your situation and identify
          medically appropriate facilities nearby.
        </p>
      </div>

      {/* Stepper */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { num: 1, title: '1. Select Symptom' },
          { num: 2, title: '2. Warning Signs' },
          { num: 3, title: '3. Care Guidance' },
        ].map((item) => (
          <div
            key={item.num}
            className={`px-4 py-3 rounded-lg border text-xs sm:text-sm font-semibold ${
              step === item.num
                ? 'bg-sky-700 text-white border-sky-700'
                : step > item.num
                ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 border-teal-200 dark:border-teal-800'
                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
          >
            {item.title}
          </div>
        ))}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="space-y-8">
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertOctagon className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-red-900 dark:text-red-200">
                <strong>Life-threatening emergency right now?</strong> Do not complete a
                questionnaire. Call <strong>112</strong> or go directly to the nearest emergency
                department.
              </p>
            </div>
            <Link
              to="/emergency"
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold whitespace-nowrap shrink-0"
            >
              Emergency Help (112)
            </Link>
          </div>

          <div className="relative">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="text"
              value={symptomSearch}
              onChange={(e) => setSymptomSearch(e.target.value)}
              placeholder="Search symptoms (e.g., chest pain, fever, ankle sprain, pregnancy, asthma)..."
              aria-label="Search symptoms"
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          {(
            [
              {
                group: 'emergency',
                heading: 'Emergency-Related Symptoms',
                subtitle: 'Select immediately if experiencing any of these urgent signs',
              },
              {
                group: 'common',
                heading: 'Common Health Concerns',
                subtitle: 'We will still verify warning signs before suggesting clinics or urgent care',
              },
              {
                group: 'additional',
                heading: 'Maternal, Child, Elderly, Mental Health & Chronic Care',
                subtitle: 'Specialized care pathways',
              },
            ] as const
          ).map((section) => {
            const items = filteredCatalog.filter((s) => s.group === section.group);
            if (items.length === 0) return null;
            return (
              <div key={section.group}>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{section.heading}</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">{section.subtitle}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectSymptom(item)}
                      className={`text-left p-4 rounded-xl border transition-colors min-h-[56px] flex items-center justify-between gap-2 ${
                        section.group === 'emergency'
                          ? 'bg-white dark:bg-slate-900 border-red-200 dark:border-red-900/70 hover:bg-red-50 dark:hover:bg-red-950/40'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-600 hover:bg-sky-50/30 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.label}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {filteredCatalog.length === 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                No exact match found for &ldquo;{symptomSearch}&rdquo;. You can select &ldquo;Other
                health symptoms&rdquo; to continue safely.
              </p>
              <button
                type="button"
                onClick={() => {
                  const other = SYMPTOM_CATALOG.find((s) => s.id === 'other_symptoms');
                  if (other) selectSymptom(other);
                }}
                className="mt-3 px-4 py-2 rounded-lg bg-sky-700 text-white text-xs font-semibold"
              >
                Continue with Other Health Symptoms
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && selectedSymptom && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <p className="text-xs font-semibold text-sky-700 dark:text-sky-400">Selected Concern</p>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedSymptom.label}</h2>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Change symptom
            </button>
          </div>

          {/* Warning Sign Safety Check */}
          <div className="bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl p-5">
            <h3 className="text-sm font-bold text-red-900 dark:text-red-200 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" aria-hidden="true" />
              Check for Warning Signs (Select any that apply)
            </h3>
            <div className="mt-3 space-y-2.5">
              {selectedSymptom.redFlagChecks.map((rf) => (
                <label
                  key={rf.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/70 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checkedRedFlags.includes(rf.id)}
                    onChange={() => toggleRedFlag(rf.id)}
                    className="mt-1 h-4 w-4 accent-red-600"
                  />
                  <span className="text-sm text-slate-900 dark:text-slate-100">{rf.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Relevant Follow-up Questions */}
          {selectedSymptom.baseUrgency !== 'RED' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Who is the patient?
                </label>
                <select
                  value={patientGroup}
                  onChange={(e) => setPatientGroup(e.target.value as PatientProfileMode)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100"
                >
                  <option value="adult">Adult (18–59 years)</option>
                  <option value="child">Child / Infant (Under 18)</option>
                  <option value="senior">Senior Citizen (60+ years)</option>
                  <option value="maternity">Pregnant / Postpartum</option>
                  <option value="disability">Person needing accessibility support</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  How long has this symptom been present?
                </label>
                <select
                  value={duration}
                  onChange={(e) =>
                    setDuration(e.target.value as 'hours' | '1_2_days' | '3_plus_days')
                  }
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100"
                >
                  <option value="hours">Started within the last few hours</option>
                  <option value="1_2_days">1 to 2 days</option>
                  <option value="3_plus_days">3 days or longer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Pain or discomfort severity: <span className="tabular-nums font-bold">{severity}/10</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={severity}
                  onChange={(e) => setSeverity(Number(e.target.value))}
                  className="w-full accent-sky-700"
                />
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span>1 (Mild)</span>
                  <span>5 (Moderate)</span>
                  <span>10 (Severe)</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                    Is the condition getting worse?
                  </span>
                  <div className="flex gap-3">
                    {(['no', 'yes'] as const).map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setGettingWorse(val)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize ${
                          gettingWorse === val
                            ? 'bg-sky-700 text-white border-sky-700'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                    Did an injury happen recently?
                  </span>
                  <div className="flex gap-3">
                    {(['no', 'yes'] as const).map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setRecentInjury(val)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize ${
                          recentInjury === val
                            ? 'bg-sky-700 text-white border-sky-700'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-sm font-semibold"
            >
              <span>View Safety Recommendation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && selectedSymptom && (
        <div className="space-y-8">
          {/* Result Banner */}
          {finalUrgency === 'RED' && (
            <div className="bg-red-600 text-white rounded-xl p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <AlertOctagon className="w-8 h-8 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs font-bold tracking-wide uppercase">
                    RED — Immediate Emergency Care
                  </p>
                  <h2 className="text-2xl font-bold mt-1">
                    Seek Emergency Medical Help Immediately
                  </h2>
                  <p className="text-sm sm:text-base mt-2 text-red-50 leading-relaxed">
                    Seek emergency medical help immediately. Do not delay care to compare waiting
                    times. Call your local emergency number or proceed to the nearest appropriate
                    emergency department.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <a
                      href="tel:112"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white text-red-700 font-bold text-sm hover:bg-red-50"
                    >
                      <PhoneCall className="w-4 h-4" aria-hidden="true" />
                      <span>Call 112 (India Emergency)</span>
                    </a>
                    {selectedSymptom.specialMode === 'mental_health' && (
                      <a
                        href="tel:14416"
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-red-800 text-white font-semibold text-sm border border-red-400"
                      >
                        <PhoneCall className="w-4 h-4" aria-hidden="true" />
                        <span>Call 14416 (Tele-MANAS Crisis Line)</span>
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-red-100 mt-4">
                    Important: TriageTrack does not dispatch ambulances directly. Calling 112
                    connects you to national emergency response services.
                  </p>
                </div>
              </div>
            </div>
          )}

          {finalUrgency === 'YELLOW' && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-400">
                    YELLOW — Urgent Medical Assessment
                  </p>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                    Prompt Medical Evaluation Recommended
                  </h2>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
                    {selectedSymptom.defaultGuidance} Because of your symptom profile
                    {recentInjury === 'yes' ? ' and recent injury' : ''}, please visit an
                    appropriate urgent care centre or hospital listed below today. If warning signs
                    appear, call 112 immediately.
                  </p>
                  {selectedSymptom.specialMode === 'mental_health' && (
                    <p className="mt-3 text-sm font-semibold text-amber-900 dark:text-amber-200">
                      24/7 Confidential Helpline: Call Tele-MANAS at 14416 or 1800-891-4416.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {finalUrgency === 'GREEN' && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
                    GREEN — Routine or Non-Emergency Care
                  </p>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                    Clinic, Primary Health Centre, or Urgent Care Suitable
                  </h2>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
                    {selectedSymptom.defaultGuidance} Based on the information you entered, you may
                    not need a hospital Emergency Room—helping you avoid long ER queues. Seek urgent
                    care immediately if symptoms worsen.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Preliminary Assessment Disclaimer */}
          <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 text-xs text-slate-700 dark:text-slate-300">
            <strong>Preliminary Guidance Disclaimer:</strong> This assessment is preliminary and
            informational only. It is not a medical diagnosis and does not replace evaluation by a
            qualified healthcare professional. Clinical triage pathways should be reviewed by
            qualified medical professionals prior to live deployment.
          </div>

          {/* Recommended Facilities */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {finalUrgency === 'RED'
                    ? 'Nearest Emergency Departments (Prioritized by Emergency Capability)'
                    : 'Recommended Facilities Matched to Your Needs'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Evaluated by urgency, required capabilities ({selectedSymptom.requiredCapabilities.join(', ')}),
                  distance, and wait time (DEMO DATA).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline"
              >
                Adjust Answers
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {recommendedFacilities.map((fac) => (
                <FacilityCard key={fac.id} facility={fac} showSuitability />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
