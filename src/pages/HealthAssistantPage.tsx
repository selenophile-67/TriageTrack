import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PhoneCall, SearchCheck, ShieldCheck } from 'lucide-react';
import { HealthChatbot } from '../components/HealthChatbot';

export function HealthAssistantPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
            GOOGLE-GROUNDED HEALTH INFORMATION ASSISTANT
          </p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mt-1">
            Ask a Health Question
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Ask questions about symptoms, first aid, or general health concerns. Every answer is
            cross-checked against verified medical sources via Google Search. Whenever information
            cannot be verified or needs clinical judgement, the assistant advises:{' '}
            <strong className="text-slate-900 dark:text-slate-200">
              &ldquo;Ask from a medical specialist.&rdquo;
            </strong>
          </p>
        </div>

        <Link
          to="/symptom-checker"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors"
        >
          <span>Guided Symptom Checker</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <HealthChatbot mode="page" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-start gap-3 text-slate-700 dark:text-slate-300">
          <SearchCheck className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              Verified Source Grounding
            </p>
            <p className="mt-1 leading-relaxed">
              Responses include direct links to authoritative sources retrieved via Google Search
              so you can verify guidance from trusted medical organizations.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-start gap-3 text-slate-700 dark:text-slate-300">
          <ShieldCheck className="w-4 h-4 text-sky-700 dark:text-sky-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              Strict Safety Fallback
            </p>
            <p className="mt-1 leading-relaxed">
              This assistant does not diagnose diseases or prescribe dosages. If experiencing severe
              pain, breathing trouble, or chest pain,{' '}
              <Link to="/emergency" className="text-red-700 dark:text-red-400 font-semibold underline inline-flex items-center gap-1">
                <PhoneCall className="w-3 h-3" /> call 112 immediately
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
