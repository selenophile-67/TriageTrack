import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, HeartHandshake, MessageSquareHeart, PhoneCall, ShieldCheck } from 'lucide-react';
import { HEALTH_EDUCATION_GUIDES } from '../data/triageKnowledge';

export function HealthResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const categories = ['All', ...Array.from(new Set(HEALTH_EDUCATION_GUIDES.map((g) => g.category)))];

  const visibleGuides =
    selectedCategory === 'All'
      ? HEALTH_EDUCATION_GUIDES
      : HEALTH_EDUCATION_GUIDES.filter((g) => g.category === selectedCategory);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
            PATIENT EDUCATION & SUPPORT DIRECTORY
          </p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mt-1">
            Health Education Centre
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Plain-language guidance on first aid, fever care, dehydration signs, chronic condition
            management, and mental health helplines.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Link
            to="/health-assistant"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-sky-700 dark:border-sky-500 bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors"
          >
            <MessageSquareHeart className="w-4 h-4" />
            <span>Ask Health AI</span>
          </Link>
          <Link
            to="/symptom-checker"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white text-xs font-semibold whitespace-nowrap shrink-0 transition-colors"
          >
            <span>Open Symptom Checker</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors ${
              selectedCategory === cat
                ? 'bg-sky-700 dark:bg-sky-600 text-white border-sky-700 dark:border-sky-500'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visibleGuides.map((guide) => (
          <article
            key={guide.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between gap-4"
          >
            <div>
              <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                {guide.category}
              </p>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                {guide.title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{guide.summary}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-800 dark:text-slate-200 list-disc pl-5">
                {guide.points.map((pt, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>

      {/* Dedicated Mental Health Support Section */}
      <section className="bg-sky-50 dark:bg-sky-950/35 border border-sky-200 dark:border-sky-800/70 rounded-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <p className="text-xs font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4" aria-hidden="true" />
            MENTAL HEALTH & CRISIS SUPPORT
          </p>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mt-1">
            You Do Not Have to Navigate Emotional Distress Alone
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
            Mental health concerns are never treated as ordinary routine queries. Free, confidential
            24/7 counselling is available via Tele-MANAS (14416), or visit a verified mental health
            centre. For immediate physical safety risks, call 112.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <a
            href="tel:14416"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-sky-700 hover:bg-sky-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white text-sm font-semibold transition-colors"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call 14416</span>
          </a>
          <Link
            to="/find-healthcare?q=Psychiatry"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <span>Find Counselling Centres</span>
          </Link>
        </div>
      </section>

      <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-sky-700 dark:text-sky-400 shrink-0 mt-0.5" />
        <span>
          Educational content is intended for general public awareness and must be reviewed by
          qualified medical professionals before clinical deployment.
        </span>
      </div>
    </div>
  );
}
