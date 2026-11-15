import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div>
        <p className="text-xs font-semibold text-sky-700 dark:text-sky-400">
          PRIVACY, SAFETY & TERMS
        </p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mt-1">
          Privacy Policy, Medical Limitations & DPDP Act 2023 Compliance
        </h1>
      </div>

      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-sky-700 dark:text-sky-400" />
          1. Not a Medical Diagnostic Tool
        </h2>
        <p>
          TriageTrack is a healthcare navigation and informational tool only. It does not diagnose
          illnesses, prescribe treatments, dispatch ambulances, or substitute for evaluation by a
          licensed medical professional. In any life-threatening emergency, call 112 immediately.
        </p>
      </section>

      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          2. Alignment with the Digital Personal Data Protection Act, 2023 (India)
        </h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>No Mandatory Registration:</strong> Emergency guidance, symptom triage, and
            facility search work without creating an account.
          </li>
          <li>
            <strong>Minimal Data Collection & Explicit Consent:</strong> Optional accounts collect
            only display preferences, language, accessibility needs, and optional emergency contact
            after explicit user consent.
          </li>
          <li>
            <strong>Anonymous Crowd Reporting:</strong> Waiting-room updates never store or display
            identifiable patient names, emails, or clinical histories.
          </li>
          <li>
            <strong>Pre-Arrival Notice Limitations:</strong> &ldquo;I&apos;m On My Way&rdquo; stores
            only initials/display name, age group, and a brief non-sensitive visit reason, and does
            not reserve a physical hospital queue slot unless officially integrated.
          </li>
          <li>
            <strong>Right to Erasure:</strong> Signed-in users can permanently delete their account
            and associated personal records at any time from the{' '}
            <Link to="/dashboard" className="text-sky-700 dark:text-sky-400 underline">
              User Dashboard
            </Link>
            .
          </li>
        </ul>
      </section>

      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          3. Data Retention & Security
        </h2>
        <p>
          Community wait-time reports expire automatically after 2 hours and are rate-limited to
          prevent spam or automated abuse. Authentication sessions use HMAC-signed HttpOnly cookies
          and scrypt password hashing. Location coordinates selected via browser GPS are used
          solely in-session to calculate facility distances.
        </p>
      </section>
    </div>
  );
}
