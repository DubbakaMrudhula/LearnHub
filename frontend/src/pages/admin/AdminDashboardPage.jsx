import React, { useState, useEffect } from 'react';
import analyticsService from '../../services/analyticsService';
import { useAuth } from '../../context/AuthContext';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  Award, 
  ShieldCheck, 
  Layers, 
  RefreshCw, 
  TrendingUp, 
  Activity, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export const AdminDashboardPage = () => {
  const { user } = useAuth();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getAdminAnalytics();
      setAnalytics(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load platform analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-sm text-slate-400">Aggregating real-time platform metrics...</p>
      </div>
    );
  }

  const kpi = analytics?.kpi || {};
  const usersByRole = analytics?.usersByRole || {};
  const coursesByStatus = analytics?.coursesByStatus || {};
  const recentUsers = analytics?.recentUsers || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-purple-950/40 border border-slate-800 p-8 sm:p-10">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
            <Activity className="w-3.5 h-3.5" />
            Executive Command Center
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Platform Analytics & Operations
          </h1>
          <p className="text-sm text-slate-300">
            Aggregated metrics for user cohorts, course lifecycles, assessment completion, and platform integrity.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Registered Users</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-white">{kpi.totalUsers}</div>
          <div className="text-[11px] text-slate-500">Across 5 distinct platform roles</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Course Enrollments</span>
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-purple-300">{kpi.totalEnrollments}</div>
          <div className="text-[11px] text-slate-500">Active learning instances</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Completion Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{kpi.platformCompletionRate}%</div>
          <div className="text-[11px] text-slate-500">{kpi.completedEnrollments} verified completions</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Certificates Issued</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">{kpi.totalCertificates}</div>
          <div className="text-[11px] text-slate-500">SHA-256 verifiable credentials</div>
        </div>
      </div>

      {/* Cohorts & Distributions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Role Distribution */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-6">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            User Distribution by Role
          </h2>

          <div className="space-y-3">
            {[
              { role: 'student', label: 'Students', color: 'bg-indigo-500' },
              { role: 'instructor', label: 'Instructors', color: 'bg-purple-500' },
              { role: 'reviewer', label: 'Content Reviewers', color: 'bg-amber-500' },
              { role: 'mentor', label: 'Industry Mentors', color: 'bg-emerald-500' },
              { role: 'admin', label: 'Administrators', color: 'bg-rose-500' }
            ].map((item) => {
              const count = usersByRole[item.role] || 0;
              const percent = kpi.totalUsers > 0 ? Math.round((count / kpi.totalUsers) * 100) : 0;
              return (
                <div key={item.role} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{item.label}</span>
                    <span className="text-slate-400 font-bold">{count} ({percent}%)</span>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div className={`h-full ${item.color} transition-all`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Course Lifecycle Distribution */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-6">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            Course Governance Lifecycle
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-semibold">Published Catalog</div>
              <div className="text-2xl font-black text-emerald-400">{coursesByStatus.PUBLISHED || 0}</div>
              <div className="text-[10px] text-slate-500">Live for enrollment</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-semibold">Pending Review</div>
              <div className="text-2xl font-black text-amber-400">{(coursesByStatus.SUBMITTED || 0) + (coursesByStatus.UNDER_REVIEW || 0)}</div>
              <div className="text-[10px] text-slate-500">Review queue active</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-semibold">Approved (Pre-launch)</div>
              <div className="text-2xl font-black text-indigo-400">{coursesByStatus.APPROVED || 0}</div>
              <div className="text-[10px] text-slate-500">Ready to publish</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-semibold">Draft Workspace</div>
              <div className="text-2xl font-black text-slate-400">{coursesByStatus.DRAFT || 0}</div>
              <div className="text-[10px] text-slate-500">In authoring</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Users Registry */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">Recent User Registrations</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentUsers.map((u) => (
                <tr key={u._id} className="hover:bg-slate-950/40">
                  <td className="py-3 px-4 font-bold text-white">{u.name}</td>
                  <td className="py-3 px-4 text-slate-400">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className="uppercase font-bold text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-indigo-300">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-emerald-400 font-semibold flex items-center justify-end gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
