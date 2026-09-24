import React from 'react';

/**
 * Reusable StatusBadge component
 */
export const StatusBadge = ({ status = 'healthy', label = null }) => {
  const styles = {
    healthy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    connected: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    error: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    disconnected: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    info: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
  };

  const currentStyle = styles[status.toLowerCase()] || styles.info;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {label || status.toUpperCase()}
    </span>
  );
};

export default StatusBadge;
