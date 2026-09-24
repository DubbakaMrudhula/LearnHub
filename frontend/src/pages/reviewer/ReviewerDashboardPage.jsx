import React, { useState, useEffect } from 'react';
import reviewService from '../../services/reviewService';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Eye, 
  Layers, 
  Clock, 
  FileText, 
  Play, 
  History,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export const ReviewerDashboardPage = () => {
  const [pendingCourses, setPendingCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [inspectedCourse, setInspectedCourse] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [inspectLoading, setInspectLoading] = useState(false);

  // Decision state
  const [decisionAction, setDecisionAction] = useState('APPROVE');
  const [decisionComments, setDecisionComments] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchPendingQueue = async () => {
    setLoading(true);
    try {
      const res = await reviewService.getPendingReviews();
      setPendingCourses(res.data.courses || []);
    } catch (err) {
      setError(err.message || 'Failed to load review queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingQueue();
  }, []);

  const handleInspect = async (courseId) => {
    setSelectedCourseId(courseId);
    setInspectLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await reviewService.inspectCourse(courseId);
      setInspectedCourse(res.data.course);
      setCurriculum(res.data.curriculum || []);
    } catch (err) {
      setError(err.message || 'Failed to inspect course');
    } finally {
      setInspectLoading(false);
    }
  };

  const handleSubmitDecision = async (e) => {
    e.preventDefault();
    if (!decisionComments || decisionComments.trim().length < 5) {
      setError('Please provide at least 5 characters of feedback.');
      return;
    }

    setSubmittingDecision(true);
    setError('');
    setMessage('');

    try {
      await reviewService.submitDecision(selectedCourseId, decisionAction, decisionComments);
      setMessage(`Course review decision "${decisionAction}" submitted successfully!`);
      setDecisionComments('');
      setInspectedCourse(null);
      setSelectedCourseId(null);
      fetchPendingQueue();
    } catch (err) {
      setError(err.message || 'Failed to submit review decision');
    } finally {
      setSubmittingDecision(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20 mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          Content Review Portal
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Curriculum Quality & Audit Queue</h1>
        <p className="text-sm text-slate-400">
          Inspect submitted instructor courses, evaluate syllabus depth, and maintain platform quality standards.
        </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Pending Courses Queue */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Pending Evaluation ({pendingCourses.length})
            </h2>
            <button
              onClick={fetchPendingQueue}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
            </div>
          ) : pendingCourses.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="text-sm font-bold text-white">Queue Clear</div>
              <p className="text-xs text-slate-400">All submitted courses have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingCourses.map((c) => (
                <button
                  key={c._id}
                  onClick={() => handleInspect(c._id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    selectedCourseId === c._id
                      ? 'bg-indigo-950/40 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <StatusBadge status="pending" label={c.status} />
                      <span className="text-[11px] text-slate-500 font-medium">
                        {c.category?.name}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white line-clamp-2">{c.title}</h3>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                      <span>By: {c.instructor?.name}</span>
                      <span className="text-indigo-400 font-semibold flex items-center gap-1">
                        Inspect
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Course Inspection & Review Decision Panel */}
        <div className="lg:col-span-2">
          {inspectLoading ? (
            <div className="glass-panel min-h-[400px] rounded-3xl border border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
              <span className="text-sm">Inspecting curriculum structure...</span>
            </div>
          ) : inspectedCourse ? (
            <div className="space-y-6">
              {/* Course Overview Card */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/80 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge status="pending" label={inspectedCourse.status} />
                    <span className="text-xs text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      {inspectedCourse.category?.name}
                    </span>
                    <span className="text-xs text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      {inspectedCourse.difficulty}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Instructor: <strong className="text-white">{inspectedCourse.instructor?.name}</strong> ({inspectedCourse.instructor?.email})
                  </span>
                </div>

                <h2 className="text-2xl font-extrabold text-white">{inspectedCourse.title}</h2>
                <p className="text-sm text-slate-300 leading-relaxed">{inspectedCourse.description}</p>
              </div>

              {/* Curriculum Breakdown */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Curriculum Breakdown ({curriculum.length} Modules)
                </h3>

                <div className="space-y-3">
                  {curriculum.map((mod, modIdx) => (
                    <div key={mod._id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-400">
                          Module {modIdx + 1}: {mod.title}
                        </span>
                        <span className="text-[11px] text-slate-500">{mod.lessons?.length || 0} Lessons</span>
                      </div>
                      <div className="space-y-1.5 pl-3 border-l-2 border-indigo-500/20">
                        {mod.lessons?.map((les, lesIdx) => (
                          <div key={les._id} className="text-xs text-slate-300 flex items-center justify-between py-1">
                            <span className="flex items-center gap-2">
                              {les.type === 'video' ? <Play className="w-3 h-3 text-indigo-400" /> : <FileText className="w-3 h-3 text-slate-400" />}
                              {lesIdx + 1}. {les.title}
                            </span>
                            <span className="text-slate-500 text-[11px]">{les.durationMinutes}m</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviewer Decision Form */}
              <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900 space-y-4">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  Submit Official Quality Decision
                </div>

                <form onSubmit={handleSubmitDecision} className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setDecisionAction('APPROVE')}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                        decisionAction === 'APPROVE'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve Course
                    </button>

                    <button
                      type="button"
                      onClick={() => setDecisionAction('REQUEST_CHANGES')}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                        decisionAction === 'REQUEST_CHANGES'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <AlertCircle className="w-4 h-4" />
                      Request Changes
                    </button>

                    <button
                      type="button"
                      onClick={() => setDecisionAction('REJECT')}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                        decisionAction === 'REJECT'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Course
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Review Comments & Audit Log Notes <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={decisionComments}
                      onChange={(e) => setDecisionComments(e.target.value)}
                      placeholder="Explain your decision. For 'Request Changes', detail what needs revision before approval..."
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingDecision}
                      className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition-colors disabled:opacity-50"
                    >
                      {submittingDecision ? 'Recording Decision...' : 'Commit Review Decision'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Review Audit Trail */}
              {inspectedCourse.reviewHistory?.length > 0 && (
                <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/40 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <History className="w-3.5 h-3.5" />
                    Audit Trail & History
                  </div>
                  <div className="space-y-2">
                    {inspectedCourse.reviewHistory.map((log, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="font-bold text-indigo-300">{log.action}</span>
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-300">{log.comments}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel min-h-[400px] rounded-3xl border border-slate-800 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <Layers className="w-10 h-10 text-slate-600" />
              <h3 className="text-base font-bold text-white">Select a Course to Inspect</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Choose any submitted or pending course from the queue on the left to review its curriculum syllabus and record an audit decision.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewerDashboardPage;
