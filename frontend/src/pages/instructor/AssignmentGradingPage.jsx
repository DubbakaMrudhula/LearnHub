import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import assignmentService from '../../services/assignmentService';
import { 
  Award, 
  Github, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  ArrowLeft, 
  Send,
  MessageSquare
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export const AssignmentGradingPage = () => {
  const { assignmentId } = useParams();

  const [submissions, setSubmissions] = useState([]);
  const [selectedSubId, setSelectedSubId] = useState(null);
  const [gradeInput, setGradeInput] = useState(90);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await assignmentService.getAssignmentSubmissions(assignmentId);
      setSubmissions(res.data.submissions || []);
      if (res.data.submissions?.length > 0) {
        setSelectedSubId(res.data.submissions[0]._id);
        setGradeInput(res.data.submissions[0].grade || 90);
        setFeedbackInput(res.data.submissions[0].feedback || '');
      }
    } catch (err) {
      setError(err.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [assignmentId]);

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    setGrading(true);
    setError('');
    setMessage('');

    try {
      await assignmentService.gradeSubmission(selectedSubId, gradeInput, feedbackInput);
      setMessage('Grade and evaluation feedback committed successfully!');
      fetchSubmissions();
    } catch (err) {
      setError(err.message || 'Failed to submit grade');
    } finally {
      setGrading(false);
    }
  };

  const currentSub = submissions.find((s) => s._id === selectedSubId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/instructor"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Instructor Studio
        </Link>
        <span className="text-xs text-slate-500 font-medium">Assignment Evaluation Console</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Assignment Submissions & Grading</h1>
        <p className="text-sm text-slate-400">Inspect student code repositories, review architecture write-ups, and assign rubric scores.</p>
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

      {loading ? (
        <div className="py-20 flex justify-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
          <Award className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Student Submissions Yet</h3>
          <p className="text-xs text-slate-400">Submissions from enrolled learners will populate this queue for grading.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Submissions List */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Student Submissions ({submissions.length})
            </h2>

            {submissions.map((sub) => (
              <button
                key={sub._id}
                onClick={() => {
                  setSelectedSubId(sub._id);
                  setGradeInput(sub.grade || 90);
                  setFeedbackInput(sub.feedback || '');
                }}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedSubId === sub._id
                    ? 'bg-indigo-950/40 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{sub.student?.name}</span>
                    <StatusBadge
                      status={sub.status === 'GRADED' ? 'healthy' : 'pending'}
                      label={sub.status}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{sub.student?.email}</div>
                  <div className="text-[10px] text-slate-500">
                    Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Right: Inspection & Grading Panel */}
          <div className="lg:col-span-2">
            {currentSub && (
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/70 space-y-6">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    Evaluating Student Work
                  </span>
                  <h3 className="text-xl font-extrabold text-white">{currentSub.student?.name}</h3>
                  <span className="text-xs text-slate-400">{currentSub.student?.email}</span>
                </div>

                {/* Submitted Links & Text */}
                <div className="space-y-4">
                  {currentSub.githubUrl && (
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        GitHub Repository
                      </div>
                      <a
                        href={currentSub.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        <Github className="w-4 h-4" />
                        <span>{currentSub.githubUrl}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Architecture & Implementation Notes
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {currentSub.submissionText || 'No implementation notes provided.'}
                    </div>
                  </div>
                </div>

                {/* Grading Form */}
                <form onSubmit={handleGradeSubmit} className="pt-4 border-t border-slate-800/80 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                    <Award className="w-4 h-4" />
                    Enter Rubric Score & Qualitative Feedback
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Grade Score (0 - 100)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={gradeInput}
                        onChange={(e) => setGradeInput(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Instructor Feedback & Suggestions
                    </label>
                    <textarea
                      rows={3}
                      value={feedbackInput}
                      onChange={(e) => setFeedbackInput(e.target.value)}
                      placeholder="Detailed feedback highlighting code strengths and areas for optimization..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={grading}
                      className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {grading ? 'Recording Grade...' : 'Commit Grade & Feedback'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentGradingPage;
