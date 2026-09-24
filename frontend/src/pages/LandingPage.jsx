import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  BookOpen, 
  BrainCircuit, 
  Award, 
  Users, 
  CheckCircle2, 
  Activity, 
  RefreshCw, 
  Database, 
  Server, 
  Layers, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import healthService from '../services/healthService';
import StatusBadge from '../components/common/StatusBadge';

export const LandingPage = () => {
  const [health, setHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthError, setHealthError] = useState(null);

  const fetchHealthStatus = async () => {
    setHealthLoading(true);
    setHealthError(null);
    try {
      const response = await healthService.getHealth();
      setHealth(response.data);
    } catch (err) {
      setHealthError(err.message || 'Failed to connect to backend server');
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthStatus();
  }, []);

  const roles = [
    {
      title: 'Students & Learners',
      desc: 'Adaptive learning paths, concept-level quizzes, instant AI feedback, and verifiable certificates.',
      icon: BookOpen,
      color: 'from-blue-500/20 to-indigo-500/20 border-indigo-500/30'
    },
    {
      title: 'Course Instructors',
      desc: 'Modular curriculum builder, question banks, assignments, and deep learner analytics.',
      icon: Layers,
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30'
    },
    {
      title: 'Content Reviewers',
      desc: 'Quality assurance workflows: approve, reject, or request changes before publication.',
      icon: ShieldCheck,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30'
    },
    {
      title: 'Industry Mentors',
      desc: 'Direct learner tracking, personalized feedback, assignment evaluations, and 1-on-1 sessions.',
      icon: Users,
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30'
    },
    {
      title: 'Platform Admins',
      desc: 'Unified user management, platform governance, category taxonomy, and system health.',
      icon: Activity,
      color: 'from-rose-500/20 to-red-500/20 border-rose-500/30'
    }
  ];

  return (
    <div className="space-y-24 pb-20 bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Soft Purple Glow background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-purple-200/40 blur-[130px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-1/3 w-[350px] h-[220px] bg-indigo-200/30 blur-[110px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            AI-Enabled Skill Learning & Adaptive Assessment
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight sm:leading-tight">
            Master Skills with{' '}
            <span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 bg-clip-text text-transparent">
              Adaptive Intelligence
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            LearnHub bridges curriculum delivery with AI weak-concept detection, real-time assessment engines, mentor guidance, and cryptographic certificate verification.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-xl shadow-purple-500/25 hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 group"
            >
              Start Learning Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#system-status"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-purple-900 bg-white border border-purple-200 hover:bg-purple-50 hover:border-purple-300 shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Activity className="w-4 h-4 text-purple-600" />
              Check System Health
            </a>
          </div>
        </div>
      </section>

      {/* Live System Health Widget */}
      <section id="system-status" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl p-6 sm:p-8 bg-white border border-purple-100 shadow-xl shadow-purple-500/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-100">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Server className="w-4 h-4 text-purple-700" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Full-Stack Connectivity Monitor
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Real-time connection verification between React frontend, Express API, and MongoDB.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {health && <StatusBadge status={health.database?.status === 'connected' ? 'healthy' : 'error'} label={health.status} />}
              <button
                onClick={fetchHealthStatus}
                disabled={healthLoading}
                className="p-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors disabled:opacity-50"
                title="Refresh Health Check"
              >
                <RefreshCw className={`w-4 h-4 ${healthLoading ? 'animate-spin text-purple-600' : ''}`} />
              </button>
            </div>
          </div>

          {healthLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500 text-sm">
              <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
              <span>Pinging backend API at /api/health...</span>
            </div>
          ) : healthError ? (
            <div className="py-8 text-center space-y-2">
              <div className="inline-flex p-3 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                <Activity className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-rose-600">Backend Unreachable</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">{healthError}</p>
              <p className="text-xs text-slate-400">Ensure the backend server is running on port 5000.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-900 mb-1">
                  <Server className="w-3.5 h-3.5 text-purple-600" />
                  API Service
                </div>
                <div className="text-base font-bold text-slate-900">{health?.service}</div>
                <div className="text-xs text-slate-500 mt-1">Uptime: {health?.uptime}</div>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-900 mb-1">
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  Database
                </div>
                <div className="flex items-center gap-2 text-base font-bold text-slate-900 capitalize">
                  {health?.database?.client}
                </div>
                <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Status: {health?.database?.status}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-900 mb-1">
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                  Environment
                </div>
                <div className="text-base font-bold text-slate-900 capitalize">{health?.environment}</div>
                <div className="text-xs text-slate-500 mt-1">Node {health?.system?.nodeVersion}</div>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-900 mb-1">
                  <Activity className="w-3.5 h-3.5 text-indigo-600" />
                  Server Memory
                </div>
                <div className="text-base font-bold text-slate-900">{health?.system?.memory?.heapUsed}</div>
                <div className="text-xs text-slate-500 mt-1">RSS: {health?.system?.memory?.rss}</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* User Roles Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Architected for Every Educational Role
          </h2>
          <p className="mt-4 text-base text-slate-600">
            Dedicated dashboards, independent permission validation, and tailored workflows for all 5 platform roles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.title}
                className="p-6 rounded-2xl bg-white border border-purple-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200 group"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-50 group-hover:bg-purple-600 group-hover:text-white transition-colors flex items-center justify-center mb-4 text-purple-700">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{r.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{r.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* AI Adaptive Engine Preview - Rich Purple Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 border border-purple-700/50 p-8 sm:p-12 relative overflow-hidden shadow-2xl text-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-semibold border border-purple-400/30">
                <BrainCircuit className="w-4 h-4 text-purple-300" />
                Gemini-Powered Learning Engine
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Beyond Basic Chatbots: True Concept-Level Analysis
              </h2>
              <p className="text-purple-100 text-sm sm:text-base leading-relaxed">
                LearnHub analyzes every quiz question attempt and assignment submission down to individual concepts. When a student struggles with recursion or inheritance, the AI engine dynamically generates remediation paths and targeted revision quizzes.
              </p>
              <ul className="space-y-3 text-sm text-purple-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Structured JSON recommendations with strict validation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Deterministic fallback system for offline & rate-limit resilience
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Privacy-first: zero credential or private identity transmission
                </li>
              </ul>
            </div>

            <div className="bg-slate-950/90 rounded-2xl border border-purple-500/30 p-6 font-mono text-xs text-slate-200 shadow-2xl space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
                <span>AI Recommendation Pipeline</span>
                <span className="text-purple-400 font-bold">json</span>
              </div>
              <div className="text-slate-500">// Real-time evaluation output</div>
              <pre className="text-purple-200 overflow-x-auto">
{`{
  "studentGoal": "Full Stack Engineer",
  "weakConcepts": ["Method Overriding", "Polymorphism"],
  "recommendedAction": [
    "1. Review Polymorphism Lesson (Module 3)",
    "2. Practice 5 targeted scenario questions",
    "3. Schedule 15m Mentor Sync with Dr. Watson"
  ],
  "confidenceScore": 0.94
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
