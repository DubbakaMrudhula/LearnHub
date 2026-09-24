import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import assignmentService from '../../services/assignmentService';
import { 
  FileText, 
  Github, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  ArrowLeft, 
  Send, 
  Award,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export const AssignmentSubmissionPage = () => {
  const { assignmentId } = useParams();

  const [assignment, setAssignment] = useState(null);
  const [mySubmission, setMySubmission] = useState(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [submissionText, setSubmissionText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchAssignmentData = async () => {
    setLoading(true);
    try {
      const subRes = await assignmentService.getMySubmission(assignmentId);
      if (subRes.data.submission) {
        setMySubmission(subRes.data.submission);
        setGithubUrl(subRes.data.submission.githubUrl || '');
        setSubmissionText(subRes.data.submission.submissionText || '');
      }
    } catch (err) {
      // It's normal if not submitted yet
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignmentData();
  }, [assignmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const res = await assignmentService.submitAssignment(assignmentId, {
        githubUrl,
        submissionText
      });
      setMySubmission(res.data.submission);
      setMessage('Assignment submitted successfully! An instructor or reviewer will grade your work.');
    } catch (err) {
      setError(err.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-sm text-slate-400">Loading assignment workspace...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Navigation */}
      <Link
        to="/courses"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Courses
      </Link>

      {/* Header */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Practical Assignment
            </span>
            {mySubmission && (
              <StatusBadge
                status={mySubmission.status === 'GRADED' ? 'healthy' : 'pending'}
                label={mySubmission.status}
              />
            )}
          </div>
          <span className="text-xs font-semibold text-slate-400">
            Total Points: <strong className="text-white">100 Pts</strong>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Distributed Rate-Limiter Architecture
        </h1>

        <p className="text-sm text-slate-300 leading-relaxed">
          Design and implement an algorithmic sliding-window rate-limiting middleware in Node.js. Your solution must handle concurrent requests, return HTTP 429 when limits are exceeded, include standard `Retry-After` headers, and provide automated unit tests.
        </p>

        {/* Rubric Points */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Evaluation Rubric</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300">
              <div className="font-bold text-white mb-1">Window Algorithm (40 pts)</div>
              Sliding log/counter accuracy and rate enforcement
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300">
              <div className="font-bold text-white mb-1">Concurrency Defense (30 pts)</div>
              Atomic operations and race-condition immunity
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300">
              <div className="font-bold text-white mb-1">Test Suite (30 pts)</div>
              Integration tests and resilient error handling
            </div>
          </div>
        </div>
      </div>

      {/* Grade & Instructor Feedback Card (If graded) */}
      {mySubmission && mySubmission.status === 'GRADED' && (
        <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl border border-emerald-500/30 bg-slate-900/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4" />
              Evaluation & Instructor Feedback
            </div>
            <div className="text-2xl font-black text-emerald-400">
              {mySubmission.grade} / 100
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-sm text-slate-200 space-y-2">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 font-semibold">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              Feedback from Instructor:
            </div>
            <p className="italic leading-relaxed">"{mySubmission.feedback || 'Great submission!'}"</p>
          </div>
        </div>
      )}

      {/* Submission Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/70 space-y-5">
        <h2 className="text-lg font-bold text-white">
          {mySubmission ? 'Update or Resubmit Assignment' : 'Submit Your Solution'}
        </h2>

        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              GitHub Repository URL <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Github className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/your-username/distributed-rate-limiter"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Architectural Overview & Implementation Notes
            </label>
            <textarea
              rows={5}
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Explain how you handled concurrency, chosen data structures, and how tests verify sliding window edge cases..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  {mySubmission ? 'Update Submission' : 'Submit Assignment'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentSubmissionPage;
