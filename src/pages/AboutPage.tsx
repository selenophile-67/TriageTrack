import React from 'react';
import { Link } from 'react-router-dom';
import { Database, Layers, MapPin, ShieldCheck } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div>
        <p className="text-xs font-semibold text-sky-700 dark:text-sky-400">ABOUT TRIAGETRACK</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-50 mt-1">
          The Right Care. At the Right Place. At the Right Time.
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
          TriageTrack is a public-facing healthcare navigation platform built to ease hospital
          emergency room overcrowding while helping patients reach medically appropriate facilities
          safely and quickly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-2">
          <ShieldCheck className="w-6 h-6 text-sky-700 dark:text-sky-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Safety Over Queue Shopping
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            A low waiting time at an outpatient clinic must never divert someone experiencing chest
            pain, stroke signs, or breathing distress away from an emergency department. Our
            recommendation engine enforces red-flag clinical safety before sorting by travel or wait
            duration.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-2">
          <Database className="w-6 h-6 text-teal-700 dark:text-teal-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Honest Data Reliability Labels
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Every waiting time displayed in TriageTrack is labelled as Facility-confirmed,
            Community-reported, Estimated, or Unavailable. Community crowd updates expire
            automatically and are never presented as official hospital figures.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-2">
          <MapPin className="w-6 h-6 text-sky-700 dark:text-sky-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Built for Accessibility & Inclusion
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Designed with English, Hindi, and Odia support, large-text mode, shape-and-color map
            markers, family assistance profiles (children, seniors, maternity), and verified
            disability accessibility filters.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-2">
          <Layers className="w-6 h-6 text-teal-700 dark:text-teal-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Real-World Integration Roadmap
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            TriageTrack&apos;s modular REST API is structured to connect with hospital HL7/FHIR queue
            feeds, verified public health directories, OpenStreetMap/Google Places discovery, and
            state 112/108 ambulance systems once formally partnered.
          </p>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/35 border border-amber-200 dark:border-amber-800/70 rounded-xl p-6 text-sm text-amber-950 dark:text-amber-100">
        <p className="font-bold">Demonstration Data Notice</p>
        <p className="mt-1 leading-relaxed text-amber-900 dark:text-amber-200">
          All healthcare facilities, coordinates, and waiting times currently loaded in this MVP are{' '}
          <strong>DEMO DATA</strong> for demonstration and hackathon evaluation purposes. Do not rely
          on demonstration waiting times for real-world medical decisions.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/symptom-checker"
            className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white text-xs font-semibold transition-colors"
          >
            Try Symptom Checker
          </Link>
          <Link
            to="/privacy"
            className="px-4 py-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-amber-950 dark:text-amber-100 hover:bg-amber-100/40 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            Read Privacy & DPDP Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
