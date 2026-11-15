import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, UserPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LanguageCode } from '../types/triage';

export function AuthPage() {
  const { refreshAuth, notify } = useApp();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [ageGroup, setAgeGroup] = useState<'child' | 'adult' | 'senior'>('adult');
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageCode>('en');
  const [preferredLocation, setPreferredLocation] = useState('751001');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [largeTextPref, setLargeTextPref] = useState(false);
  const [wheelchairPref, setWheelchairPref] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fillDemo = (role: 'user' | 'admin') => {
    setMode('login');
    setError(null);
    if (role === 'admin') {
      setEmail('admin@triagetrack.demo');
      setPassword('AdminDemo!2026');
    } else {
      setEmail('patient@triagetrack.demo');
      setPassword('PatientDemo!2026');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload =
        mode === 'login'
          ? { email, password }
          : {
              displayName,
              email,
              password,
              ageGroup,
              preferredLanguage,
              preferredLocation,
              emergencyContact,
              consentGiven,
              accessibilityPrefs: {
                largeText: largeTextPref,
                wheelchairNeeded: wheelchairPref,
                signLanguageNeeded: false,
              },
            };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed.');

      await refreshAuth();
      notify(mode === 'login' ? 'Signed in to TriageTrack.' : 'Account created safely.', 'success');
      navigate(data.user?.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-12">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
        <div>
          <p className="text-xs font-semibold text-sky-700 dark:text-sky-400">
            OPTIONAL PERSONALIZATION · NOT REQUIRED FOR EMERGENCY HELP
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">
            {mode === 'login' ? 'Sign In to TriageTrack' : 'Create Optional Profile'}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Save favourite hospitals, accessibility preferences, and track pre-arrival
            notifications.
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 rounded-md text-xs font-semibold transition-colors ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 rounded-md text-xs font-semibold transition-colors ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Demo Autofill Helpers */}
        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs space-y-2">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            Demo Evaluation Accounts (DEMO DATA):
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fillDemo('user')}
              className="px-3 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Fill Demo Patient
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin')}
              className="px-3 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-medium text-teal-800 dark:text-teal-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Fill Demo Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Name or Preferred Display Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g., Priya S."
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {mode === 'register' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Age Group
                  </label>
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value as 'child' | 'adult' | 'senior')}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  >
                    <option value="adult">Adult</option>
                    <option value="child">Child / Guardian</option>
                    <option value="senior">Senior Citizen</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Preferred Language
                  </label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value as LanguageCode)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी</option>
                    <option value="or">ଓଡ଼ିଆ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Preferred PIN Code
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={preferredLocation}
                    onChange={(e) => setPreferredLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Emergency Contact (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={40}
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="+91-..."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={largeTextPref}
                    onChange={(e) => setLargeTextPref(e.target.checked)}
                    className="h-4 w-4 accent-sky-700"
                  />
                  <span>Enable larger text size by default</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={wheelchairPref}
                    onChange={(e) => setWheelchairPref(e.target.checked)}
                    className="h-4 w-4 accent-sky-700"
                  />
                  <span>Prioritize wheelchair-accessible facilities</span>
                </label>
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  required
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-sky-700"
                />
                <span>
                  I give explicit consent for TriageTrack to store these optional preferences in
                  accordance with the{' '}
                  <Link to="/privacy" className="text-sky-700 dark:text-sky-400 underline">
                    DPDP Act 2023 Privacy Policy
                  </Link>
                  . I understand I can delete my account and data at any time.
                </span>
              </label>
            </>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg bg-sky-700 hover:bg-sky-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
          >
            {mode === 'login' ? <Lock className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>
              {submitting
                ? 'Please wait…'
                : mode === 'login'
                ? 'Sign In'
                : 'Create Optional Account'}
            </span>
          </button>
        </form>

        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <ShieldCheck className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />
          <span>Minimal data collection · Protected by signed HttpOnly session cookies</span>
        </p>
      </div>
    </div>
  );
}
