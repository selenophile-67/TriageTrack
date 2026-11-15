import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  GitCompareArrows,
  Globe,
  Info,
  Menu,
  MessageSquareHeart,
  Moon,
  PhoneCall,
  ShieldCheck,
  Sun,
  Type,
  UserCheck,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LANGUAGE_NAMES } from '../data/i18n';
import { LanguageCode, PatientProfileMode } from '../types/triage';
import { HealthChatbot } from './HealthChatbot';

const PATIENT_MODES: { value: PatientProfileMode; label: string }[] = [
  { value: 'adult', label: 'Adult' },
  { value: 'child', label: 'Child' },
  { value: 'senior', label: 'Senior Citizen' },
  { value: 'maternity', label: 'Pregnancy / Maternal' },
  { value: 'disability', label: 'Accessible Care' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const {
    t,
    language,
    setLanguage,
    largeText,
    setLargeText,
    theme,
    toggleTheme,
    patientMode,
    setPatientMode,
    compareIds,
    user,
    toasts,
    dismissToast,
  } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const routeLoc = useLocation();
  const isAssistantPage = routeLoc.pathname === '/health-assistant';

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap shrink-0 text-sm font-medium transition-colors py-1 border-b-2 ${
      isActive
        ? 'text-sky-700 dark:text-sky-400 border-sky-700 dark:border-sky-400'
        : 'text-slate-600 dark:text-slate-300 border-transparent hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600'
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand logo and wordmark */}
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 text-xl font-bold tracking-tight text-sky-800 dark:text-sky-300 whitespace-nowrap shrink-0"
          >
            <img
              src="/assets/aistudio/image_4e4e04a7.png"
              alt="TriageTrack logo"
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
            <span>{t.brandName}</span>
          </Link>

          {/* Zone 2: 5 concise single-line navigation links */}
          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-6"
          >
            <NavLink to="/" end className={navLinkClass}>
              {t.navHome}
            </NavLink>
            <NavLink to="/find-healthcare" className={navLinkClass}>
              {t.navFindCare}
            </NavLink>
            <NavLink to="/symptom-checker" className={navLinkClass}>
              {t.navSymptomChecker}
            </NavLink>
            <NavLink to="/resources" className={navLinkClass}>
              {t.navResources}
            </NavLink>
            <NavLink to={user ? '/dashboard' : '/auth'} className={navLinkClass}>
              {user ? user.displayName.split(' ')[0] : t.navAccount}
            </NavLink>
          </nav>

          {/* Zone 3: 1 Primary Emergency Action (plus mobile menu toggle) */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/emergency"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
            >
              <PhoneCall className="w-4 h-4" aria-hidden="true" />
              <span>{t.emergencyCta}</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              className="lg:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-4 space-y-3">
            <div className="grid grid-cols-1 gap-2">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                {t.navHome}
              </Link>
              <Link to="/find-healthcare" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                {t.navFindCare}
              </Link>
              <Link to="/symptom-checker" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                {t.navSymptomChecker}
              </Link>
              <Link to="/compare" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                Compare Facilities ({compareIds.length}/3)
              </Link>
              <Link to="/resources" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                {t.navResources}
              </Link>
              <Link to="/health-assistant" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm font-medium text-sky-700 dark:text-sky-400">
                Health AI Assistant
              </Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                {t.navAbout}
              </Link>
              <Link to={user ? '/dashboard' : '/auth'} onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm font-medium text-sky-700 dark:text-sky-400">
                {user ? 'User Dashboard' : 'Login / Sign Up'}
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm font-semibold text-teal-700 dark:text-teal-400">
                  {t.navAdmin}
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Non-Sticky Accessibility, Theme, Family Assistance & Language Workspace Toolbar */}
      <div className="bg-slate-100 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <label className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <UserCheck className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400" aria-hidden="true" />
              <span>{t.familyModeLabel}:</span>
              <select
                value={patientMode}
                onChange={(e) => setPatientMode(e.target.value as PatientProfileMode)}
                aria-label="Select patient care profile"
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 text-xs font-medium text-slate-900 dark:text-slate-100"
              >
                {PATIENT_MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={() => setLargeText(!largeText)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                largeText
                  ? 'bg-sky-700 text-white border-sky-700'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <Type className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                {t.largeTextLabel}: {largeText ? t.largeText : t.standardText}
              </span>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium transition-colors whitespace-nowrap shrink-0"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                  <span>Light Theme</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-sky-700" aria-hidden="true" />
                  <span>Dark Theme</span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/compare"
              className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-400 whitespace-nowrap shrink-0"
            >
              <GitCompareArrows className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" aria-hidden="true" />
              <span className="tabular-nums">Compare ({compareIds.length}/3)</span>
            </Link>

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`font-semibold whitespace-nowrap shrink-0 ${
                  routeLoc.pathname === '/admin'
                    ? 'text-teal-800 dark:text-teal-300 underline'
                    : 'text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-200'
                }`}
              >
                {t.navAdmin}
              </Link>
            )}

            <label className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <Globe className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400" aria-hidden="true" />
              <span>{t.languageLabel}:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                aria-label="Select display language"
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 text-xs font-medium text-slate-900 dark:text-slate-100"
              >
                {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      {/* Global Toast Notifications */}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`flex items-start justify-between gap-3 p-3.5 rounded-lg border shadow-sm bg-white dark:bg-slate-900 ${
                toast.type === 'error'
                  ? 'border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
                  : toast.type === 'success'
                  ? 'border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'border-sky-300 dark:border-sky-800 text-slate-900 dark:text-slate-100'
              }`}
            >
              <div className="flex items-start gap-2.5 text-sm">
                {toast.type === 'error' ? (
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                ) : toast.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 mt-0.5 shrink-0" />
                )}
                <span>{toast.text}</span>
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Floating Healthcare AI Chatbot Launcher & Drawer */}
      {!isAssistantPage && (
        <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3">
          {chatOpen ? (
            <div className="w-[min(92vw,410px)]">
              <HealthChatbot mode="drawer" onClose={() => setChatOpen(false)} />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              aria-label="Open Healthcare AI Assistant"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-sky-700 hover:bg-sky-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white text-sm font-semibold shadow-lg transition-colors"
            >
              <MessageSquareHeart className="w-5 h-5" aria-hidden="true" />
              <span>Ask Health AI</span>
            </button>
          )}
        </div>
      )}

      <main className="flex-1">{children}</main>

      {/* Quiet Clinical Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-sky-700 dark:text-sky-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{t.disclaimerBanner}</p>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">{t.demoNotice}</p>
              </div>
            </div>
            <Link
              to="/emergency"
              className="text-red-700 dark:text-red-400 font-semibold hover:underline whitespace-nowrap shrink-0"
            >
              Emergency Guidance (112)
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-base">{t.brandName}</p>
              <p className="text-slate-600 dark:text-slate-400 mt-2 text-xs leading-relaxed">{t.tagline}</p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-slate-900 dark:text-slate-100">Care Navigation</p>
              <div className="flex flex-col gap-1.5 text-slate-600 dark:text-slate-400">
                <Link to="/symptom-checker" className="hover:text-sky-700 dark:hover:text-sky-400">
                  Symptom Checker
                </Link>
                <Link to="/find-healthcare" className="hover:text-sky-700 dark:hover:text-sky-400">
                  Wait-Time Map & Directory
                </Link>
                <Link to="/compare" className="hover:text-sky-700 dark:hover:text-sky-400">
                  Compare Facilities
                </Link>
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-slate-900 dark:text-slate-100">Support & Education</p>
              <div className="flex flex-col gap-1.5 text-slate-600 dark:text-slate-400">
                <Link to="/emergency" className="hover:text-sky-700 dark:hover:text-sky-400">
                  Emergency Help (112)
                </Link>
                <Link to="/resources" className="hover:text-sky-700 dark:hover:text-sky-400">
                  Health Education Centre
                </Link>
                <Link to="/health-assistant" className="hover:text-sky-700 dark:hover:text-sky-400">
                  Healthcare AI Assistant
                </Link>
                <Link to="/about" className="hover:text-sky-700 dark:hover:text-sky-400">
                  About TriageTrack
                </Link>
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-slate-900 dark:text-slate-100">Governance & Accounts</p>
              <div className="flex flex-col gap-1.5 text-slate-600 dark:text-slate-400">
                <Link to="/privacy" className="hover:text-sky-700 dark:hover:text-sky-400">
                  Privacy Policy & DPDP 2023
                </Link>
                <Link to={user ? '/dashboard' : '/auth'} className="hover:text-sky-700 dark:hover:text-sky-400">
                  {user ? 'User Dashboard' : 'Optional Sign In / Sign Up'}
                </Link>
                <Link to="/admin" className="hover:text-sky-700 dark:hover:text-sky-400">
                  Administrator Console
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <p>TriageTrack – The Smart ER Visualizer · Built for patient safety and equitable access</p>
            <p>India National Emergency: 112 · Tele-MANAS Mental Health: 14416</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
