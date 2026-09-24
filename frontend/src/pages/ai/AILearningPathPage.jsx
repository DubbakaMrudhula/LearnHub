import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import aiService from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';
import { 
  Sparkles, 
  BrainCircuit, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  BookOpen, 
  Code2, 
  ArrowRight, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp,
  Cpu,
  Layers,
  HelpCircle
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export const AILearningPathPage = () => {
  const { user } = useAuth();

  const [pathData, setPathData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState('');
  const [revealedHints, setRevealedHints] = useState({});

  const fetchPath = async () => {
    setLoading(true);
    try {
      const res = await aiService.getLearningPath();
      setPathData(res.data.path);
    } catch (err) {
      setError(err.message || 'Failed to generate AI learning path');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPath();
  }, []);

  const handleRegenerate = async () => {
    setRegenerating(true);
    setError('');
    try {
      const res = await aiService.regenerateLearningPath();
      setPathData(res.data.path);
    } catch (err) {
      setError(err.message || 'Failed to regenerate path');
    } finally {
      setRegenerating(false);
    }
  };

  const toggleHint = (index) => {
    setRevealedHints((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <BrainCircuit className="w-10 h-10 animate-pulse text-indigo-400" />
        <p className="text-sm text-slate-400">Synthesizing personalized AI adaptive learning path...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/60 via-indigo-950/60 to-slate-900/60 border border-slate-800 p-8 sm:p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-semibold border border-purple-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              AI Adaptive Recommendation Engine
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Personalized Engineering Pathway
            </h1>
            <p className="text-sm text-slate-300">
              Dynamically synthesized using your actual quiz results, detected weak spots, and mentor recommendations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
              {regenerating ? 'Re-analyzing...' : 'Regenerate Path'}
            </button>
          </div>
        </div>
      </div>

      {/* Model & Diagnosis Metadata Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-400" />
          <span>Synthesis Model: <strong className="text-white">{pathData?.modelUsed}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>Generated: <strong className="text-slate-200">{new Date(pathData?.generatedAt).toLocaleString()}</strong></span>
        </div>
        <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Diagnostics Synchronized
        </span>
      </div>

      {/* Executive Summary */}
      <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl border border-purple-500/30 bg-slate-900/80 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
          <BrainCircuit className="w-4 h-4" />
          Diagnostic Executive Summary
        </div>
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
          {pathData?.summary}
        </p>
      </div>

      {/* Strengths vs Priority Weak Spots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 bg-slate-900/60 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            Demonstrated Conceptual Strengths
          </div>
          <p className="text-xs text-slate-400">
            Topics where your quiz scores or completed curriculum indicate high comprehension:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {pathData?.diagnosticStrengths?.map((item, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-semibold"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Weak Spots */}
        <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 bg-slate-900/60 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            Priority Focus & Revision Areas
          </div>
          <p className="text-xs text-slate-400">
            Concepts flagged for targeted review by our diagnostic engine and mentor recommendations:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {pathData?.priorityWeakSpots?.map((item, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-semibold"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Structured Adaptive Study Plan */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Tailored Remediation Roadmap</h2>
        <div className="space-y-4">
          {pathData?.customStudyPlan?.map((step) => (
            <div
              key={step.step}
              className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{step.title}</h3>
                    <span className="text-xs text-indigo-400 font-semibold">{step.conceptTag}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{step.estimatedMinutes} Mins</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {step.description}
              </p>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                <strong className="text-indigo-400 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5" />
                  Action Item:
                </strong>
                <p className="text-slate-300">{step.recommendedAction}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Practice Coding Exercises */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Interactive Practice Challenges</h2>
        <div className="space-y-4">
          {pathData?.recommendedPracticeExercises?.map((ex, idx) => (
            <div
              key={idx}
              className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-purple-400" />
                  <h3 className="text-base font-bold text-white">{ex.title}</h3>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {ex.difficulty}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-mono bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
                {ex.prompt}
              </p>

              {ex.solutionHint && (
                <div>
                  <button
                    onClick={() => toggleHint(idx)}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    {revealedHints[idx] ? 'Hide Architecture Hint' : 'Reveal Architecture Hint'}
                  </button>
                  {revealedHints[idx] && (
                    <div className="mt-2 p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-xs text-indigo-200">
                      💡 {ex.solutionHint}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Next Courses */}
      {pathData?.recommendedCourses?.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight">Recommended Curriculum Continuation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {pathData.recommendedCourses.map((c) => (
              <Link
                key={c._id}
                to={`/courses/${c.slug}`}
                className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold uppercase text-indigo-400">{c.difficulty}</span>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {c.title}
                  </h4>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                  View Course
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AILearningPathPage;
