import React, { useState, useEffect } from 'react';
import mentorshipService from '../../services/mentorshipService';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Calendar, 
  Clock, 
  Video, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Sparkles, 
  Eye, 
  FileEdit, 
  BookOpen,
  Award,
  Send,
  X
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export const MentorDashboardPage = () => {
  const { user } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Inspect Learner State
  const [inspectingStudent, setInspectingStudent] = useState(null);
  const [learnerData, setLearnerData] = useState(null);
  const [learnerLoading, setLearnerLoading] = useState(false);

  // Complete Session Notes State
  const [completingSession, setCompletingSession] = useState(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [focusAreasText, setFocusAreasText] = useState('');
  const [completeLoading, setCompleteLoading] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await mentorshipService.getMentorSessions();
      setSessions(res.data.sessions || []);
    } catch (err) {
      setError(err.message || 'Failed to load assigned sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleInspect = async (student) => {
    setInspectingStudent(student);
    setLearnerLoading(true);
    try {
      const res = await mentorshipService.inspectLearnerProgress(student._id);
      setLearnerData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load learner diagnostics');
    } finally {
      setLearnerLoading(false);
    }
  };

  const handleOpenComplete = (session) => {
    setCompletingSession(session);
    setSessionNotes(session.sessionNotes || '');
    setFocusAreasText(session.recommendedFocusAreas?.join(', ') || '');
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    setCompleteLoading(true);
    setError('');
    setMessage('');

    const focusAreas = focusAreasText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await mentorshipService.completeSession(completingSession._id, {
        sessionNotes,
        recommendedFocusAreas: focusAreas
      });
      setMessage('Session notes recorded and status marked COMPLETED!');
      setCompletingSession(null);
      fetchSessions();
    } catch (err) {
      setError(err.message || 'Failed to record session notes');
    } finally {
      setCompleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-sm text-slate-400">Loading Mentor Operations Console...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900/60 border border-slate-800 p-8 sm:p-10">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
            <Users className="w-3.5 h-3.5" />
            Mentor Console
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Assigned Learners & Mentoring Sessions
          </h1>
          <p className="text-sm text-slate-300">
            Inspect learner curriculum progress, diagnose assessment weak spots, conduct 1-on-1 syncs, and log structured recommendations.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Sessions List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Your Session Queue ({sessions.length})</h2>

        {sessions.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Assigned Mentorship Sessions</h3>
            <p className="text-xs text-slate-400">When learners book 1-on-1 architecture reviews, they will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sessions.map((sess) => {
              const isCompleted = sess.status === 'COMPLETED';
              return (
                <div
                  key={sess._id}
                  className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge
                        status={isCompleted ? 'healthy' : 'pending'}
                        label={sess.status}
                      />
                      <span className="text-xs text-slate-400">
                        Student: <strong className="text-white">{sess.student?.name}</strong> ({sess.student?.email})
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white">{sess.title}</h3>
                    <p className="text-xs text-slate-300">{sess.topic}</p>

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        {new Date(sess.scheduledDate).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        {sess.durationMinutes} Mins
                      </span>
                    </div>

                    {isCompleted && sess.sessionNotes && (
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
                        <strong className="text-emerald-400">Your Recorded Notes:</strong> {sess.sessionNotes}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => handleInspect(sess.student)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                      Inspect Progress
                    </button>

                    {!isCompleted && (
                      <>
                        <a
                          href={sess.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-1.5"
                        >
                          <Video className="w-3.5 h-3.5" />
                          Launch Call
                        </a>

                        <button
                          onClick={() => handleOpenComplete(sess)}
                          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-1.5"
                        >
                          <FileEdit className="w-3.5 h-3.5" />
                          Log Notes
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Inspect Learner Progress Modal */}
      {inspectingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-2xl glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Learner Progress & Diagnostic Inspection
                </span>
                <h3 className="text-xl font-extrabold text-white">{inspectingStudent.name}</h3>
                <span className="text-xs text-slate-400">{inspectingStudent.email}</span>
              </div>
              <button
                onClick={() => setInspectingStudent(null)}
                className="text-slate-400 hover:text-white p-2 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {learnerLoading ? (
              <div className="py-12 flex justify-center">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
              </div>
            ) : learnerData ? (
              <div className="space-y-6">
                {/* Summary Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <div className="text-lg font-black text-white">{learnerData.progressSummary?.totalEnrolled}</div>
                    <div className="text-[10px] text-slate-400">Enrolled Courses</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <div className="text-lg font-black text-emerald-400">{learnerData.progressSummary?.completedCoursesCount}</div>
                    <div className="text-[10px] text-slate-400">Completed Courses</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <div className="text-lg font-black text-purple-400">{learnerData.progressSummary?.averageCompletionRate}%</div>
                    <div className="text-[10px] text-slate-400">Average Progress</div>
                  </div>
                </div>

                {/* AI Diagnostic Weak Areas */}
                {learnerData.diagnosticWeakAreas?.length > 0 && (
                  <div className="glass-panel-glow p-4 rounded-2xl border border-rose-500/30 bg-rose-950/20 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      Assessment Weak Spots Identified:
                    </div>
                    <p className="text-xs text-slate-300">
                      Recent quiz attempts indicated lower comprehension in these specific architectural topics:
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {learnerData.diagnosticWeakAreas.map((w, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30">
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Enrolled Courses Detail */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Course Progress Breakdown</h4>
                  <div className="space-y-2">
                    {learnerData.courses?.map((c) => (
                      <div key={c.enrollmentId} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">{c.course?.title}</span>
                          <span className="text-xs font-black text-indigo-400">{c.overallProgress}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{ width: `${c.overallProgress}%` }} />
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-4">
                          <span>Lessons: {c.breakdown?.lessons?.completed}/{c.breakdown?.lessons?.total}</span>
                          <span>Quizzes: {c.breakdown?.quizzes?.passed}/{c.breakdown?.quizzes?.total}</span>
                          <span>Assignments: {c.breakdown?.assignments?.submitted}/{c.breakdown?.assignments?.total}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Log Session Notes Modal */}
      {completingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl space-y-5">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Log Mentorship Notes & Complete
              </span>
              <h3 className="text-xl font-extrabold text-white">
                Session with {completingSession.student?.name}
              </h3>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Detailed Session Notes & Observations <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={5}
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  required
                  placeholder="Summarize discussion points, architecture advice given, and learner conceptual strengths..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Recommended Focus Topics (Comma separated)
                </label>
                <input
                  type="text"
                  value={focusAreasText}
                  onChange={(e) => setFocusAreasText(e.target.value)}
                  placeholder="Two-phase commit, Redis atomicity, Index profiling"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] text-slate-500">
                  These topics will be tagged on the student's dashboard for targeted review.
                </span>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCompletingSession(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={completeLoading}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {completeLoading ? 'Saving...' : 'Commit Notes & Complete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorDashboardPage;
