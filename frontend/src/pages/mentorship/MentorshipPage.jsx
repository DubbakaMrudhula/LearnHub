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
  Plus, 
  ArrowRight, 
  ExternalLink,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export const MentorshipPage = () => {
  const { user } = useAuth();

  const [mentors, setMentors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Booking Form State
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionTopic, setSessionTopic] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mentorsRes, sessionsRes] = await Promise.all([
        mentorshipService.getMentors(),
        mentorshipService.getStudentSessions()
      ]);
      setMentors(mentorsRes.data.mentors || []);
      setSessions(sessionsRes.data.sessions || []);
    } catch (err) {
      setError(err.message || 'Failed to load mentorship directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenBooking = (mentor) => {
    setSelectedMentor(mentor);
    setSessionTitle(`1-on-1 Architecture Sync with ${mentor.name.split(' ')[0]}`);
    setSessionTopic('Review of concurrent systems, API design, and capstone progress');
    // Default scheduled time 2 days from now
    const d = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    setScheduledDate(d.toISOString().slice(0, 16));
    setBookingOpen(true);
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setError('');
    setMessage('');

    try {
      await mentorshipService.bookSession({
        mentorId: selectedMentor._id,
        title: sessionTitle,
        topic: sessionTopic,
        scheduledDate,
        durationMinutes
      });
      setMessage('Mentorship session scheduled successfully! Your mentor will join via the virtual room.');
      setBookingOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to book session');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-sm text-slate-400">Connecting to Mentorship Network...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900/60 border border-slate-800 p-8 sm:p-10">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
            <Users className="w-3.5 h-3.5" />
            Direct Industry Guidance
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            1-on-1 Mentorship & Code Reviews
          </h1>
          <p className="text-sm text-slate-300">
            Book private engineering syncs with senior tech mentors. Review architectural decisions, resolve weak concepts identified in quizzes, and prepare for capstone evaluations.
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

      {/* My Booked Sessions */}
      {sessions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight">Your Mentorship Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map((sess) => {
              const isCompleted = sess.status === 'COMPLETED';
              return (
                <div
                  key={sess._id}
                  className={`glass-panel p-6 rounded-3xl border space-y-4 transition-all ${
                    isCompleted
                      ? 'border-emerald-500/30 bg-slate-900/80'
                      : 'border-indigo-500/30 bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge
                          status={isCompleted ? 'healthy' : 'pending'}
                          label={sess.status}
                        />
                        <span className="text-xs text-slate-400">
                          with <strong>{sess.mentor?.name}</strong>
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white">{sess.title}</h3>
                    </div>

                    {!isCompleted && sess.meetingLink && (
                      <a
                        href={sess.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/25 shrink-0"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Join Call
                      </a>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{sess.topic}</p>

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

                  {/* If completed, show mentor notes & focus recommendations */}
                  {isCompleted && (
                    <div className="pt-3 border-t border-slate-800 space-y-2">
                      {sess.sessionNotes && (
                        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-1">
                          <strong className="text-emerald-400 flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            Mentor Feedback & Notes:
                          </strong>
                          <p>{sess.sessionNotes}</p>
                        </div>
                      )}

                      {sess.recommendedFocusAreas?.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Recommended Focus Topics:
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {sess.recommendedFocusAreas.map((area, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium"
                              >
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Mentors Directory */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Available Industry Mentors</h2>
          <p className="text-xs text-slate-400">Select a mentor to book your next 1-on-1 architecture review.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((m) => (
            <div
              key={m._id}
              className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/60 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{m.name}</h3>
                    <span className="text-xs text-indigo-400 font-semibold">Senior Technical Mentor</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {m.bio || 'Staff engineer specializing in distributed systems, high-concurrency microservices, and modern web application scaling.'}
                </p>

                {/* Skill Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {(m.skills?.length > 0 ? m.skills : ['Distributed Systems', 'Node.js', 'System Design', 'React Architecture']).map((s, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-950 text-slate-400 border border-slate-800"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Available for 1-on-1
                </span>
                <button
                  onClick={() => handleOpenBooking(m)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Book Sync
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {bookingOpen && selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl space-y-5">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Schedule Mentorship Sync
              </span>
              <h3 className="text-xl font-extrabold text-white">
                Book Session with {selectedMentor.name}
              </h3>
            </div>

            <form onSubmit={handleBookSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Session Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Discussion Goals & Questions
                </label>
                <textarea
                  rows={3}
                  value={sessionTopic}
                  onChange={(e) => setSessionTopic(e.target.value)}
                  placeholder="Outline the architecture hurdles or weak concepts you would like to tackle..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Date & Time <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Duration
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes (Recommended)</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setBookingOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {bookingLoading ? 'Scheduling...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorshipPage;
