import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  CheckCircle2,
  Plus,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AdminOverviewStats, FacilityCategory, FeedbackItem } from '../types/triage';

interface SafeAdminUserRow {
  id: string;
  displayName: string;
  role: string;
  ageGroup: string;
  preferredLanguage: string;
  createdAt: string;
}

export function AdminDashboardPage() {
  const { user, facilities, refreshFacilities, notify, theme } = useApp();

  const isDark = theme === 'dark';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const axisColor = isDark ? '#94a3b8' : '#475569';
  const tooltipStyle = {
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    borderColor: isDark ? '#334155' : '#e2e8f0',
    color: isDark ? '#f1f5f9' : '#0f172a',
    borderRadius: '8px',
    fontSize: '12px',
  };

  const [overview, setOverview] = useState<AdminOverviewStats | null>(null);
  const [usersList, setUsersList] = useState<SafeAdminUserRow[]>([]);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'analytics' | 'facilities' | 'reports' | 'feedback' | 'users'>('analytics');

  // Official wait time editor state
  const [waitEdits, setWaitEdits] = useState<Record<string, string>>({});

  // Add Facility state
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<FacilityCategory>('clinic');
  const [newAddress, setNewAddress] = useState('');
  const [newPin, setNewPin] = useState('751001');
  const [newPhone, setNewPhone] = useState('+91-674-2500000');
  const [newHours, setNewHours] = useState('08:00 – 20:00');
  const [newWait, setNewWait] = useState('');
  const [newHasEd, setNewHasEd] = useState(false);

  const fetchAdminData = useCallback(async () => {
    if (user?.role !== 'admin') {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [ovRes, usrRes, fbRes] = await Promise.all([
        fetch('/api/admin/overview'),
        fetch('/api/admin/users'),
        fetch('/api/admin/feedback'),
      ]);
      if (ovRes.ok) setOverview(await ovRes.json());
      if (usrRes.ok) {
        const uData = await usrRes.json();
        setUsersList(uData.users || []);
      }
      if (fbRes.ok) {
        const fData = await fbRes.json();
        setFeedbackList(fData.feedback || []);
      }
    } catch {
      notify('Unable to load administrator metrics.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, notify]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleUpdateOfficialWait = async (facilityId: string, unavailable: boolean) => {
    const raw = waitEdits[facilityId];
    try {
      const res = await fetch(`/api/facilities/${facilityId}/official-wait`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          unavailable ? { unavailable: true } : { waitMinutes: Number(raw) }
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed.');
      notify('Official waiting time updated.', 'success');
      await refreshFacilities();
      await fetchAdminData();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Update failed.', 'error');
    }
  };

  const handleAddFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/facilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          category: newCategory,
          address: newAddress,
          pinCode: newPin,
          phone: newPhone,
          operatingHours: newHours,
          hasEmergencyDept: newHasEd,
          officialWaitMinutes: newWait === '' ? null : Number(newWait),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not add facility.');
      setNewName('');
      setNewAddress('');
      setNewWait('');
      notify(`Added facility "${data.facility.name}".`, 'success');
      await refreshFacilities();
      await fetchAdminData();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to create facility.', 'error');
    }
  };

  const handleDeleteFacility = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/facilities/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed.');
      notify(`Removed "${name}".`, 'info');
      await refreshFacilities();
      await fetchAdminData();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to delete.', 'error');
    }
  };

  const handleModerateReport = async (reportId: string, status: 'verified' | 'flagged' | 'expired') => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Moderation failed.');
      notify(`Community report marked as ${status}.`, 'success');
      await refreshFacilities();
      await fetchAdminData();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Moderation failed.', 'error');
    }
  };

  const handleUpdateFeedback = async (id: string, status: 'reviewed' | 'resolved') => {
    try {
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Update failed.');
      notify(`Feedback marked ${status}.`, 'success');
      await fetchAdminData();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to update feedback.', 'error');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 text-center space-y-4">
        <ShieldCheck className="w-10 h-10 text-teal-700 dark:text-teal-400 mx-auto" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Administrator Access Required
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          This dashboard is protected by role-based access control. Sign in with an administrator
          account (or use the Demo Admin autofill on the Sign In page) to manage facilities and
          moderate community reports.
        </p>
        <Link
          to="/auth"
          className="inline-flex px-5 py-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white text-sm font-semibold transition-colors"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
            ROLE-BASED ACCESS CONTROL · ANONYMIZED DEMO ANALYTICS
          </p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mt-1">
            Administrator Dashboard
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage facilities, publish official wait times, moderate crowd reports, and inspect
            usage trends.
          </p>
        </div>
      </div>

      {/* KPI Strip */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Registered Users', val: overview.totalUsers },
            { label: 'Listed Facilities', val: overview.totalFacilities },
            { label: 'Active Crowd Reports', val: overview.totalActiveReports },
            { label: 'Flagged Reports', val: overview.flaggedReportsCount },
            { label: 'Pre-Arrival Notices', val: overview.totalPreArrivals },
            { label: 'Open Feedback', val: overview.openFeedbackCount },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4"
            >
              <p className="text-xs text-slate-500 dark:text-slate-400">{kpi.label}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1 tabular-nums">
                {kpi.val}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1 p-1 bg-slate-200 dark:bg-slate-800 rounded-lg w-fit">
        {(
          [
            { id: 'analytics', label: 'Analytics' },
            { id: 'facilities', label: 'Facilities & Wait Times' },
            { id: 'reports', label: 'Community Reports' },
            { id: 'feedback', label: 'Feedback Inbox' },
            { id: 'users', label: 'Users' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl animate-pulse" />
      ) : (
        <>
          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && overview && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
                  Most Searched Symptoms (Aggregated)
                </h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={overview.mostSearchedSymptoms}
                      layout="vertical"
                      margin={{ left: 20, right: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis type="number" tick={{ fontSize: 12, fill: axisColor }} stroke={gridColor} />
                      <YAxis
                        dataKey="symptom"
                        type="category"
                        width={150}
                        tick={{ fontSize: 11, fill: axisColor }}
                        stroke={gridColor}
                      />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="count" fill="#0284c7" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
                  Average Wait Time by Facility Category (Minutes)
                </h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={overview.waitTrendsByCategory}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis dataKey="category" tick={{ fontSize: 11, fill: axisColor }} stroke={gridColor} />
                      <YAxis tick={{ fontSize: 12, fill: axisColor }} stroke={gridColor} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="avgWait" fill="#0d9488" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
                  Most Visited Facilities & Current Estimated Waits
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={overview.mostVisitedFacilities}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: axisColor }} stroke={gridColor} />
                      <YAxis tick={{ fontSize: 12, fill: axisColor }} stroke={gridColor} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="views" name="Profile Views" fill="#0284c7" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="avgWait" name="Wait (min)" fill="#d97706" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>
          )}

          {/* FACILITIES TAB */}
          {activeTab === 'facilities' && (
            <div className="space-y-8">
              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
                  <Plus className="w-4 h-4 text-sky-700 dark:text-sky-400" />
                  Add Healthcare Facility
                </h2>
                <form
                  onSubmit={handleAddFacility}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm"
                >
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Facility Name"
                    className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as FacilityCategory)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  >
                    <option value="hospital">Hospital</option>
                    <option value="emergency_department">Emergency Department</option>
                    <option value="urgent_care">Urgent Care Centre</option>
                    <option value="clinic">Clinic</option>
                    <option value="primary_health_centre">Primary Health Centre</option>
                    <option value="diagnostic_centre">Diagnostic Centre</option>
                    <option value="pharmacy">Pharmacy</option>
                  </select>
                  <input
                    type="text"
                    required
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Street Address"
                    className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                  <input
                    type="text"
                    required
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="PIN Code"
                    className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="Phone"
                    className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                  <input
                    type="text"
                    value={newHours}
                    onChange={(e) => setNewHours(e.target.value)}
                    placeholder="Operating Hours"
                    className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                  <input
                    type="number"
                    min={0}
                    max={600}
                    value={newWait}
                    onChange={(e) => setNewWait(e.target.value)}
                    placeholder="Official Wait (min, optional)"
                    className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={newHasEd}
                        onChange={(e) => setNewHasEd(e.target.checked)}
                        className="h-4 w-4 accent-red-600"
                      />
                      Has 24/7 ED
                    </label>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white text-xs font-semibold transition-colors"
                    >
                      Add Facility
                    </button>
                  </div>
                </form>
              </section>

              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[760px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 text-xs text-slate-600 dark:text-slate-400">
                      <th className="p-4">Facility</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Current Source</th>
                      <th className="p-4">Update Official Wait (min)</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {facilities.map((fac) => (
                      <tr key={fac.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">
                          {fac.name}
                          <span className="block text-xs font-normal text-slate-500 dark:text-slate-400">
                            {fac.address} ({fac.pinCode})
                          </span>
                        </td>
                        <td className="p-4 text-xs text-slate-700 dark:text-slate-300 capitalize">
                          {fac.category.replace(/_/g, ' ')}
                        </td>
                        <td className="p-4 text-xs">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                            {fac.officialWaitMinutes ?? fac.communityWaitMinutes ?? 'N/A'} min
                          </span>
                          <span className="block text-slate-500 dark:text-slate-400 capitalize">
                            {fac.waitTimeSource.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              max={600}
                              value={waitEdits[fac.id] ?? (fac.officialWaitMinutes ?? '')}
                              onChange={(e) =>
                                setWaitEdits((prev) => ({ ...prev, [fac.id]: e.target.value }))
                              }
                              placeholder="min"
                              className="w-20 px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-slate-100 tabular-nums"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateOfficialWait(fac.id, false)}
                              className="px-2.5 py-1.5 rounded bg-sky-700 hover:bg-sky-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white text-xs font-semibold transition-colors"
                            >
                              Set
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateOfficialWait(fac.id, true)}
                              className="px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
                            >
                              Mark Unavailable
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteFacility(fac.id, fac.name)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 dark:text-red-400 hover:underline"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </div>
          )}

          {/* COMMUNITY REPORTS MODERATION TAB */}
          {activeTab === 'reports' && overview && (
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 text-xs text-slate-600 dark:text-slate-400">
                    <th className="p-4">Facility</th>
                    <th className="p-4">Reported Wait</th>
                    <th className="p-4">Status & Anomaly Alert</th>
                    <th className="p-4 text-right">Moderate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {overview.recentCommunityReports.map((rep) => (
                    <tr key={rep.id}>
                      <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">
                        {rep.facilityName}
                        <span className="block text-xs font-normal text-slate-500 dark:text-slate-400">
                          {new Date(rep.createdAt).toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4 tabular-nums text-xs text-slate-700 dark:text-slate-300">
                        <strong className="text-slate-900 dark:text-slate-100">
                          {rep.waitedMinutes} min
                        </strong>{' '}
                        · {rep.crowded ? 'Crowded' : 'Calm'} · Flags: {rep.inaccurateFlags}
                      </td>
                      <td className="p-4 text-xs">
                        <span
                          className={`font-bold uppercase ${
                            rep.status === 'flagged'
                              ? 'text-red-700 dark:text-red-400'
                              : rep.status === 'verified'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {rep.status}
                        </span>
                        {rep.flagReason && (
                          <p className="text-amber-800 dark:text-amber-300 mt-1 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            {rep.flagReason}
                          </p>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleModerateReport(rep.id, 'verified')}
                          className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
                        >
                          Verify
                        </button>
                        <button
                          type="button"
                          onClick={() => handleModerateReport(rep.id, 'flagged')}
                          className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
                        >
                          Flag
                        </button>
                        <button
                          type="button"
                          onClick={() => handleModerateReport(rep.id, 'expired')}
                          className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium"
                        >
                          Expire
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* FEEDBACK TAB */}
          {activeTab === 'feedback' && (
            <div className="space-y-3">
              {feedbackList.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-sm text-slate-600 dark:text-slate-400">
                  No user feedback submitted yet.
                </div>
              ) : (
                feedbackList.map((fb) => (
                  <div
                    key={fb.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-xs font-semibold text-sky-700 dark:text-sky-400 uppercase">
                        {fb.category} · {fb.facilityName || 'General Platform'} ·{' '}
                        <span className="text-slate-600 dark:text-slate-400">{fb.status}</span>
                      </p>
                      <p className="text-sm text-slate-900 dark:text-slate-100 mt-1">{fb.message}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleUpdateFeedback(fb.id, 'reviewed')}
                        className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        Mark Reviewed
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateFeedback(fb.id, 'resolved')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Resolve
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[540px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 text-xs text-slate-600 dark:text-slate-400">
                    <th className="p-4">Display Name</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Age Group</th>
                    <th className="p-4">Language</th>
                    <th className="p-4">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {usersList.map((u) => (
                    <tr key={u.id}>
                      <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">
                        {u.displayName}
                      </td>
                      <td className="p-4 uppercase text-xs font-bold text-sky-700 dark:text-sky-400">
                        {u.role}
                      </td>
                      <td className="p-4 capitalize text-xs text-slate-700 dark:text-slate-300">
                        {u.ageGroup}
                      </td>
                      <td className="p-4 uppercase text-xs text-slate-700 dark:text-slate-300">
                        {u.preferredLanguage}
                      </td>
                      <td className="p-4 text-xs text-slate-500 dark:text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </>
      )}
    </div>
  );
}
