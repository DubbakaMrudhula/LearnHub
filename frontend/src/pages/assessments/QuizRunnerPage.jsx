import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import quizService from '../../services/quizService';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  HelpCircle, 
  RefreshCw,
  Code2,
  Send,
  Sparkles
} from 'lucide-react';

export const QuizRunnerPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: [optionIndex] }
  const [timeLeft, setTimeLeft] = useState(null); // seconds
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        const res = await quizService.getQuizForAttempt(quizId);
        setQuiz(res.data.quiz);
        setQuestions(res.data.questions || []);
        setTimeLeft((res.data.quiz.timeLimitMinutes || 15) * 60);
      } catch (err) {
        setError(err.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz(); // Auto-submit on time expiry
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSelectOption = (qId, optionIdx, isMulti) => {
    setSelectedAnswers((prev) => {
      const current = prev[qId] || [];
      if (isMulti) {
        if (current.includes(optionIdx)) {
          return { ...prev, [qId]: current.filter((i) => i !== optionIdx) };
        } else {
          return { ...prev, [qId]: [...current, optionIdx] };
        }
      } else {
        return { ...prev, [qId]: [optionIdx] };
      }
    });
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    setError('');

    // Format payload
    const formattedAnswers = Object.entries(selectedAnswers).map(([questionId, selectedOptionIndices]) => ({
      questionId,
      selectedOptionIndices
    }));

    try {
      const res = await quizService.submitQuizAttempt(quizId, formattedAnswers);
      // Navigate to results page
      navigate(`/assessments/quizzes/${quizId}/results/${res.data.attemptId}`, {
        state: { result: res.data }
      });
    } catch (err) {
      setError(err.message || 'Failed to submit quiz');
      setSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-sm text-slate-400">Loading secure assessment environment...</p>
      </div>
    );
  }

  if (error || !quiz || questions.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Quiz Unavailable</h3>
        <p className="text-sm text-slate-400">{error || 'This quiz could not be loaded.'}</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold">
          Go Back
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const isMulti = currentQ.type === 'multiple_choice';
  const minutes = Math.floor((timeLeft || 0) / 60);
  const seconds = (timeLeft || 0) % 60;
  const isTimeCritical = minutes < 2;

  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16">
      {/* Top Bar: Progress & Timer */}
      <header className="sticky top-0 z-40 h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Assessment In Progress
          </span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-sm font-semibold text-white truncate max-w-sm hidden sm:inline">
            {quiz.title}
          </span>
        </div>

        <div className="flex items-center gap-6">
          {/* Answered Progress */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Answered: <strong className="text-white">{answeredCount}/{questions.length}</strong></span>
            <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          {/* Countdown Clock */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
            isTimeCritical 
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse' 
              : 'bg-slate-800/80 border-slate-700 text-indigo-300'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>

          <button
            onClick={() => setShowConfirmSubmit(true)}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            Submit
          </button>
        </div>
      </header>

      {/* Main Question Container */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-10 flex-1 flex flex-col justify-between space-y-8">
        <div className="space-y-6">
          {/* Question Meta Pill */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-xs text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                {currentQ.conceptTag}
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Worth {currentQ.points} Points
            </span>
          </div>

          {/* Question Text */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
              {currentQ.questionText}
            </h2>

            {/* Optional Code Snippet */}
            {currentQ.codeSnippet && (
              <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800/80 overflow-x-auto">
                <pre className="text-xs font-mono text-indigo-300 leading-relaxed">
                  <code>{currentQ.codeSnippet}</code>
                </pre>
              </div>
            )}
          </div>

          {/* Options Selector */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {isMulti ? 'Select all that apply' : 'Select one option'}
            </div>

            <div className="space-y-2.5">
              {currentQ.options.map((opt) => {
                const isSelected = (selectedAnswers[currentQ._id] || []).includes(opt.index);
                return (
                  <button
                    key={opt.index}
                    onClick={() => handleSelectOption(currentQ._id, opt.index, isMulti)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-${isMulti ? 'md' : 'full'} border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-600 text-white'
                        : 'border-slate-700 bg-slate-950'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-sm font-medium leading-relaxed">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Nav Bar */}
        <div className="pt-8 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors flex items-center gap-2 disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2"
            >
              Next Question
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Finish & Submit
            </button>
          )}
        </div>
      </main>

      {/* Submit Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Submit Assessment?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              You have answered <strong>{answeredCount} of {questions.length}</strong> questions. Once submitted, your score and concept mastery will be calculated automatically.
            </p>
            {answeredCount < questions.length && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>You have unanswered questions!</span>
              </div>
            )}
            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmSubmit(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Keep Reviewing
              </button>
              <button
                type="button"
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 disabled:opacity-50"
              >
                {submitting ? 'Auto-Scoring...' : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizRunnerPage;
