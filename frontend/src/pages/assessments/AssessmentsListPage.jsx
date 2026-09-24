import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import quizService from '../../services/quizService';
import courseService from '../../services/courseService';
import { 
  Award, 
  HelpCircle, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  RefreshCw,
  Sparkles,
  BookOpen
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export const AssessmentsListPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const res = await courseService.getCourses();
        setCourses(res.data.courses || []);
      } catch (err) {
        console.error('Failed to load courses for assessments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900/60 border border-slate-800 p-8 sm:p-10">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
            <Award className="w-3.5 h-3.5" />
            Knowledge & Skill Validation
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Skill Assessments & Quizzes
          </h1>
          <p className="text-sm text-slate-300">
            Timed evaluations with automated scoring, concept-level diagnostic feedback, and practical homework assignments.
          </p>
        </div>
      </div>

      {/* Featured Quizzes List */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white tracking-tight">Featured Course Quizzes</h2>

        {loading ? (
          <div className="py-20 flex justify-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Distributed Systems Quiz Card */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-5 flex flex-col justify-between hover:border-indigo-500/40 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Multiple Choice & Code Logic
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    10 Mins
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white">
                  Distributed Systems & Database Mastery Quiz
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Evaluates 4-tier backend separation of concerns, Mongoose compound indexes, atomic update operators, and JavaScript event loop phases.
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Separation of Concerns', 'Database Indexing', 'Atomic Concurrency', 'Event Loop'].map((c, i) => (
                    <span key={i} className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-950 text-slate-400 border border-slate-800">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  Passing Threshold: <strong className="text-emerald-400">75%</strong>
                </div>
                <Link
                  to="/assessments/quizzes/active/take"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-1.5"
                >
                  Start Assessment
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Practical Assignment Card */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-5 flex flex-col justify-between hover:border-purple-500/40 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Practical Implementation
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold">
                    100 Points Total
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white">
                  Distributed Rate-Limiter Architecture
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Design and code an algorithmic sliding-window rate-limiter middleware. Submit your GitHub repository URL for rubric-based instructor evaluation.
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Sliding Window', 'Atomic Redis Multi', 'Unit Tests'].map((c, i) => (
                    <span key={i} className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-950 text-slate-400 border border-slate-800">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  Evaluation: <strong className="text-white">Rubric Graded</strong>
                </div>
                <Link
                  to="/assessments/assignments/active/submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/25 transition-all flex items-center gap-1.5"
                >
                  Submit Homework
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentsListPage;
