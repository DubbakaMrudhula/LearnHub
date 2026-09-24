import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import quizService from '../../services/quizService';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  ArrowLeft, 
  RotateCcw, 
  Sparkles,
  BookOpen,
  HelpCircle,
  Clock
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export const QuizResultPage = () => {
  const { quizId, attemptId } = useParams();
  const location = useLocation();

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReview = async () => {
      setLoading(true);
      try {
        const res = await quizService.getAttemptReview(attemptId);
        setAttempt(res.data.attempt);
      } catch (err) {
        setError(err.message || 'Failed to load assessment results');
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-sm text-slate-400">Loading assessment evaluation report...</p>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Results Unavailable</h3>
        <p className="text-sm text-slate-400">{error || 'Could not load quiz attempt.'}</p>
        <Link to="/courses" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold">
          Return to Courses
        </Link>
      </div>
    );
  }

  const isPassed = attempt.isPassed;
  const attemptsRemaining = Math.max(0, (attempt.quiz?.maxAttempts || 3) - attempt.attemptNumber);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link
          to={`/student/classroom/${attempt.course}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Classroom
        </Link>
        <div className="text-xs text-slate-500">
          Attempt #{attempt.attemptNumber}
        </div>
      </div>

      {/* Main Score Banner */}
      <div className={`p-8 sm:p-10 rounded-3xl border transition-all text-center space-y-4 ${
        isPassed
          ? 'bg-gradient-to-b from-emerald-950/40 via-slate-900/80 to-slate-950 border-emerald-500/30'
          : 'bg-gradient-to-b from-rose-950/40 via-slate-900/80 to-slate-950 border-rose-500/30'
      }`}>
        <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-2xl font-black shadow-2xl border-4 ${
          isPassed 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-emerald-500/20' 
            : 'bg-rose-500/10 text-rose-400 border-rose-500/40 shadow-rose-500/20'
        }">
          {attempt.percentage}%
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {isPassed ? 'Assessment Passed!' : 'Needs Revision'}
          </h1>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            You scored <strong>{attempt.score} out of {attempt.totalPoints} points</strong>. Passing threshold was {attempt.quiz?.passingScore}%.
          </p>
        </div>

        {/* Action Options */}
        <div className="pt-2 flex items-center justify-center gap-3">
          {attemptsRemaining > 0 && !isPassed && (
            <Link
              to={`/assessments/quizzes/${attempt.quiz?._id}/take`}
              className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Quiz ({attemptsRemaining} remaining)
            </Link>
          )}

          <Link
            to={`/student/classroom/${attempt.course}`}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Continue Learning
          </Link>
        </div>
      </div>

      {/* Weak Concepts Detected Box */}
      {attempt.weakConcepts?.length > 0 && (
        <div className="glass-panel-glow p-6 rounded-3xl border border-indigo-500/30 bg-slate-900/80 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            AI Diagnostic: Concepts Recommended for Review
          </div>
          <p className="text-xs text-slate-300">
            Based on your answers, our concept diagnostic identified the following topics where comprehension was under 60%:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {attempt.weakConcepts.map((concept, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold"
              >
                {concept}
              </span>
            ))}
          </div>
          <div className="text-[11px] text-slate-500 pt-1">
            * These concept tags will be used by the Gemini AI Adaptive Learning engine to generate personalized practice modules.
          </div>
        </div>
      )}

      {/* Question-by-Question Detailed Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">Question Breakdown & Explanations</h2>

        <div className="space-y-4">
          {attempt.answers?.map((ans, idx) => {
            const q = ans.question;
            if (!q) return null;

            return (
              <div
                key={idx}
                className={`glass-panel p-6 rounded-2xl border transition-all space-y-4 ${
                  ans.isCorrect
                    ? 'border-emerald-500/20 bg-emerald-950/10'
                    : 'border-rose-500/20 bg-rose-950/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">
                        Question {idx + 1}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                        {q.conceptTag}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white">{q.questionText}</h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {ans.isCorrect ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        +{ans.pointsAwarded} pts
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        0 pts
                      </span>
                    )}
                  </div>
                </div>

                {/* Optional code snippet */}
                {q.codeSnippet && (
                  <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 text-xs font-mono text-indigo-300 overflow-x-auto">
                    <code>{q.codeSnippet}</code>
                  </div>
                )}

                {/* Options with correctness highlight */}
                <div className="space-y-2 pt-1">
                  {q.options?.map((opt, optIdx) => {
                    const wasSelected = ans.selectedOptionIndices?.includes(optIdx);
                    const isRight = opt.isCorrect;

                    let badgeStyle = 'bg-slate-950/60 border-slate-800/80 text-slate-400';
                    if (isRight) {
                      badgeStyle = 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200 font-semibold';
                    } else if (wasSelected && !isRight) {
                      badgeStyle = 'bg-rose-500/15 border-rose-500/50 text-rose-200 line-through';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between ${badgeStyle}`}
                      >
                        <div className="flex items-center gap-2.5">
                          {isRight ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : wasSelected ? (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                          )}
                          <span>{opt.text}</span>
                        </div>

                        {wasSelected && (
                          <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Pedagogical Explanation */}
                {q.options?.find((o) => o.isCorrect)?.explanation && (
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                    <strong className="text-indigo-400 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Explanation:
                    </strong>
                    <p>{q.options.find((o) => o.isCorrect).explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuizResultPage;
