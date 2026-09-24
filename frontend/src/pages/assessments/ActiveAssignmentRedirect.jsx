import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import assignmentService from '../../services/assignmentService';
import { RefreshCw } from 'lucide-react';

export const ActiveAssignmentRedirect = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const resolveAssignment = async () => {
      try {
        const res = await assignmentService.getFeaturedAssignment();
        navigate(`/assessments/assignments/${res.data.assignment._id}/submit`, { replace: true });
      } catch (err) {
        setError(err.message || 'No assignment found');
      }
    };

    resolveAssignment();
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
      <p className="text-sm text-slate-400">Connecting to homework workspace...</p>
    </div>
  );
};

export default ActiveAssignmentRedirect;
