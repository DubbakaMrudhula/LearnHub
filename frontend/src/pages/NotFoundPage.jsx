import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
        <Compass className="w-8 h-8 animate-pulse" />
      </div>

      <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">404</h1>
      <h2 className="mt-2 text-xl sm:text-2xl font-semibold text-slate-200">Page Not Found</h2>
      <p className="mt-4 text-sm text-slate-400 max-w-md">
        The requested resource could not be found or has been moved to another learning module.
      </p>

      <div className="mt-8 flex items-center gap-4">
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-2 text-sm shadow-lg shadow-indigo-600/25"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
