import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import quizService from '../../services/quizService';
import { RefreshCw } from 'lucide-react';

export const ActiveQuizRedirect = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const resolveQuiz = async () => {
      try {
        const res = await quizService.getFeaturedQuiz();
        navigate(`/assessments/quizzes/${res.data.quiz._id}/take`, { replace: true });
      } catch (err) {
        setError(err.message || 'No quiz found');
      }
    };

    resolveQuiz();
  }, [navigate]);

  if (error) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
      <p className="text-sm text-slate-400">Connecting to assessment runner...</p>
    </div>
  );
};

export default ActiveQuizRedirect;
