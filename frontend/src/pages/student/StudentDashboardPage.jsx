import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import progressService from '../../services/progressService';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Award, 
  Play, 
  ArrowRight, 
  RefreshCw, 
  GraduationCap,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export const StudentDashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await progressService.getStudentDashboard();
      setDashboardData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load learning progress');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 bg-white">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
        <p className="text-sm text-slate-500 font-medium">Computing dynamic learning progress...</p>
      </div>
    );
  }

  const summary = dashboardData?.summary || {
    totalEnrolled: 0,
    completedCoursesCount: 0,
    inProgressCount: 0,
    averageCompletionRate: 0
  };

  const courses = dashboardData?.courses || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-white min-h-screen">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white shadow-xl shadow-purple-900/10 p-8 sm:p-10">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/30 text-purple-200 text-xs font-bold border border-purple-400/40">
            <GraduationCap className="w-3.5 h-3.5 text-purple-300" />
            Learner Workspace
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-sm text-purple-100 leading-relaxed">
            Track your mathematical learning progress across lessons, quizzes, and practical assignments.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl border border-purple-100 bg-white shadow-sm hover:shadow-md transition-shadow space-y-2">
          <div className="flex items-center justify-between text-purple-900 text-xs font-bold uppercase tracking-wider">
            <span>Enrolled Courses</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-purple-700" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{summary.totalEnrolled}</div>
          <div className="text-xs text-slate-500">Active learning tracks</div>
        </div>

        <div className="p-5 rounded-2xl border border-purple-100 bg-white shadow-sm hover:shadow-md transition-shadow space-y-2">
          <div className="flex items-center justify-between text-purple-900 text-xs font-bold uppercase tracking-wider">
            <span>Completed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">{summary.completedCoursesCount}</div>
          <div className="text-xs text-slate-500">100% finished courses</div>
        </div>

        <div className="p-5 rounded-2xl border border-purple-100 bg-white shadow-sm hover:shadow-md transition-shadow space-y-2">
          <div className="flex items-center justify-between text-purple-900 text-xs font-bold uppercase tracking-wider">
            <span>In Progress</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-600">{summary.inProgressCount}</div>
          <div className="text-xs text-slate-500">Curriculums underway</div>
        </div>

        <div className="p-5 rounded-2xl border border-purple-100 bg-white shadow-sm hover:shadow-md transition-shadow space-y-2">
          <div className="flex items-center justify-between text-purple-900 text-xs font-bold uppercase tracking-wider">
            <span>Platform Average</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-purple-700" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-purple-700">{summary.averageCompletionRate}%</div>
          <div className="text-xs text-slate-500">Weighted progress rate</div>
        </div>
      </div>

      {/* Enrolled Courses Progress Breakdown */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Your Course Progress</h2>
            <p className="text-xs text-slate-500">Real-time weighted status across active curriculum modules</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 transition-colors flex items-center gap-1.5"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              View Full Graphs
            </Link>
            <Link
              to="/courses"
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              Explore Courses
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="p-12 rounded-3xl border border-purple-100 bg-white shadow-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Enrolled Courses Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Browse our catalog of expert-crafted courses to enroll and begin tracking your verified skills.
            </p>
            <Link
              to="/courses"
              className="inline-flex px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all"
            >
              Browse Course Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {courses.map((item) => (
              <div
                key={item.enrollmentId}
                className="p-6 sm:p-8 rounded-3xl border border-purple-100 bg-white shadow-sm hover:shadow-md hover:border-purple-200 transition-all space-y-6"
              >
                {/* Course Header & Status */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge
                        status={item.isCompleted ? 'healthy' : 'pending'}
                        label={item.isCompleted ? 'Completed' : 'In Progress'}
                      />
                      <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200">
                        {item.course?.category?.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        Instructor: <strong className="text-slate-800">{item.course?.instructor?.name}</strong>
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                      {item.course?.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      to={`/student/classroom/${item.course?._id}`}
                      className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/25 transition-all flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Resume Learning
                    </Link>
                  </div>
                </div>

                {/* Overall Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-950">Overall Weighted Completion</span>
                    <span className="font-extrabold text-purple-700 text-sm">{item.overallProgress}%</span>
                  </div>
                  <div className="h-3 bg-purple-50 rounded-full overflow-hidden border border-purple-100 p-0.5">
                    <div
                      className={`h-full transition-all duration-700 rounded-full ${
                        item.isCompleted
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                          : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500'
                      }`}
                      style={{ width: `${item.overallProgress}%` }}
                    />
                  </div>
                </div>

                {/* Multi-Factor Progress Metric Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {/* Lessons */}
                  <div className="p-3.5 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-1">
                    <div className="flex items-center justify-between text-xs text-purple-950 font-semibold">
                      <span>Lessons ({item.breakdown?.lessons?.weight})</span>
                      <span className="text-purple-700 font-bold">{item.breakdown?.lessons?.percentage}%</span>
                    </div>
                    <div className="text-xs text-slate-600">
                      <strong className="text-slate-900">{item.breakdown?.lessons?.completed}</strong> of {item.breakdown?.lessons?.total} finished
                    </div>
                  </div>

                  {/* Quizzes */}
                  <div className="p-3.5 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-1">
                    <div className="flex items-center justify-between text-xs text-purple-950 font-semibold">
                      <span>Quizzes ({item.breakdown?.quizzes?.weight})</span>
                      <span className="text-indigo-700 font-bold">{item.breakdown?.quizzes?.percentage}%</span>
                    </div>
                    <div className="text-xs text-slate-600">
                      <strong className="text-slate-900">{item.breakdown?.quizzes?.passed}</strong> of {item.breakdown?.quizzes?.total} passed
                    </div>
                  </div>

                  {/* Assignments */}
                  <div className="p-3.5 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-1">
                    <div className="flex items-center justify-between text-xs text-purple-950 font-semibold">
                      <span>Assignments ({item.breakdown?.assignments?.weight})</span>
                      <span className="text-purple-700 font-bold">{item.breakdown?.assignments?.percentage}%</span>
                    </div>
                    <div className="text-xs text-slate-600">
                      <strong className="text-slate-900">{item.breakdown?.assignments?.submitted}</strong> of {item.breakdown?.assignments?.total} submitted
                    </div>
                  </div>
                </div>

                {/* Certificate Eligibility Banner */}
                {item.isEligibleForCertificate && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <Award className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <strong className="font-bold text-emerald-900">Certificate Unlocked!</strong> You have completed all required lessons, quizzes, and assignments.
                      </div>
                    </div>
                    <Link
                      to="/certificates"
                      className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-300 hover:bg-emerald-200 transition-colors shrink-0"
                    >
                      Claim PDF Certificate
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboardPage;
