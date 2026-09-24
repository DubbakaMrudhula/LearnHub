import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import notificationService from '../../services/notificationService';
import { 
  GraduationCap, 
  Menu, 
  X, 
  ArrowRight, 
  User, 
  LogOut, 
  ShieldCheck, 
  BookOpen, 
  Layers, 
  Users, 
  Activity,
  Bell,
  Award,
  CheckCheck
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const fetchNotifs = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationService.getMyNotifications({ limit: 5 });
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      // Quiet fail in background
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [isAuthenticated, location.pathname]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {}
  };

  const navLinks = [
    { name: 'Explore Courses', href: '/courses' },
    { name: 'Assessments', href: '/assessments' },
    { name: 'AI Learning Path', href: '/ai-path' },
    { name: 'Mentorship', href: '/mentorship' },
  ];

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/login');
  };

  const getRoleDashboardLink = () => {
    switch (user?.role) {
      case 'admin':
        return { label: 'Admin Console', href: '/admin' };
      case 'instructor':
        return { label: 'Instructor Portal', href: '/instructor' };
      case 'reviewer':
        return { label: 'Reviewer Portal', href: '/reviewer' };
      case 'mentor':
        return { label: 'Mentor Hub', href: '/mentor' };
      default:
        return { label: 'My Learning', href: '/student' };
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-purple-100/80 shadow-sm shadow-purple-500/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-purple-950 via-purple-800 to-slate-900 bg-clip-text text-transparent">
                LearnHub
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200">
                AI Powered
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-purple-700 bg-purple-50 font-semibold'
                      : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50/70'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Desktop Action Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* In-App Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotifMenuOpen(!notifMenuOpen);
                      setUserMenuOpen(false);
                    }}
                    className="relative p-2 rounded-xl bg-purple-50/70 border border-purple-100 text-slate-600 hover:text-purple-700 hover:bg-purple-100/60 transition-colors"
                  >
                    <Bell className="w-4 h-4 text-purple-700" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifMenuOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-purple-100 shadow-2xl p-3 space-y-2 z-50">
                      <div className="flex items-center justify-between pb-2 border-b border-purple-100">
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-950">
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[10px] text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1"
                          >
                            <CheckCheck className="w-3 h-3" />
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-64 overflow-y-auto space-y-1.5">
                        {notifications.length === 0 ? (
                          <div className="text-center py-6 text-xs text-slate-400">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <Link
                              key={n._id}
                              to={n.link || '/'}
                              onClick={() => setNotifMenuOpen(false)}
                              className={`block p-2.5 rounded-xl border transition-all ${
                                !n.isRead
                                  ? 'bg-purple-50/70 border-purple-200 text-purple-950 font-medium'
                                  : 'bg-slate-50/80 border-slate-100 text-slate-600'
                              }`}
                            >
                              <div className="text-xs font-bold truncate">{n.title}</div>
                              <div className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{n.message}</div>
                              <div className="text-[9px] text-slate-400 mt-1">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </div>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => {
                      setUserMenuOpen(!userMenuOpen);
                      setNotifMenuOpen(false);
                    }}
                    className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-purple-50/70 border border-purple-100 hover:border-purple-200 hover:bg-purple-100/50 transition-colors"
                  >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-purple-500/20">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="text-left text-xs">
                    <div className="font-semibold text-slate-800 leading-tight">{user?.name?.split(' ')[0]}</div>
                    <div className="text-[10px] text-purple-600 uppercase font-semibold">{user?.role}</div>
                  </div>
                </button>

                {/* Dropdown menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-purple-100 shadow-2xl p-2 space-y-1 z-50">
                    <div className="px-3 py-2 border-b border-purple-100">
                      <div className="text-xs font-semibold text-slate-900">{user?.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-purple-600" />
                      My Profile & Analytics
                    </Link>

                    {user?.role === 'instructor' && (
                      <Link
                        to="/instructor"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-purple-700 hover:bg-purple-50 transition-colors"
                      >
                        <Layers className="w-4 h-4 text-purple-600" />
                        Instructor Studio
                      </Link>
                    )}

                    {user?.role === 'reviewer' && (
                      <Link
                        to="/reviewer"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-amber-700 hover:bg-amber-50 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        Review Queue
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-1.5"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-purple-50 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-purple-700" /> : <Menu className="w-6 h-6 text-purple-700" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-purple-100 bg-white/98 backdrop-blur-lg px-4 pt-3 pb-5 space-y-2 shadow-xl">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:text-purple-700 hover:bg-purple-50"
            >
              {link.name}
            </Link>
          ))}

          <div className="pt-4 border-t border-purple-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 bg-purple-50/80 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{user?.name}</div>
                    <div className="text-xs text-purple-600 capitalize font-medium">{user?.role}</div>
                  </div>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 text-center"
                >
                  My Profile & Analytics
                </Link>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 text-center"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-purple-50 hover:bg-purple-100"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
