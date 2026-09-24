import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import courseService from '../../services/courseService';
import enrollmentService from '../../services/enrollmentService';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  FileText, 
  Lock, 
  Unlock, 
  ArrowRight, 
  RefreshCw, 
  ShieldCheck, 
  Star,
  Users,
  AlertCircle
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export const CourseDetailPage = () => {
  const { idOrSlug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [openModules, setOpenModules] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await courseService.getCourse(idOrSlug);
        setCourse(res.data.course);
        setCurriculum(res.data.curriculum || []);

        // Open first module by default
        if (res.data.curriculum?.length > 0) {
          setOpenModules({ [res.data.curriculum[0]._id]: true });
        }

        // Check if student is enrolled
        if (isAuthenticated && res.data.course?._id) {
          try {
            const enrollCheck = await enrollmentService.checkEnrollment(res.data.course._id);
            setIsEnrolled(enrollCheck.data?.isEnrolled || false);
          } catch {
            // Ignore check failure
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [idOrSlug, isAuthenticated]);

  const toggleModule = (modId) => {
    setOpenModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/courses/${idOrSlug}` } } });
      return;
    }

    setEnrolling(true);
    setError('');
    try {
      await enrollmentService.enroll(course._id);
      setIsEnrolled(true);
      navigate(`/student/classroom/${course._id}`);
    } catch (err) {
      setError(err.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-sm text-slate-400">Loading course curriculum...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Course Not Found</h3>
        <p className="text-sm text-slate-400">{error || 'This course may not exist or has not been published yet.'}</p>
        <Link to="/courses" className="inline-flex px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const isInstructorOwner = isAuthenticated && user?._id === course.instructor?._id;

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950/40 via-slate-900/60 to-slate-950 border-b border-slate-800/80 pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Course Meta Info */}
            <div className="lg:col-span-2 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {course.category?.name}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  {course.difficulty}
                </span>
                <StatusBadge status={course.status === 'PUBLISHED' ? 'healthy' : 'pending'} label={course.status} />
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                {course.subtitle || course.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-slate-400 pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-600/40 flex items-center justify-center font-bold text-white">
                    {course.instructor?.name?.charAt(0)}
                  </div>
                  <span>Instructor: <strong className="text-slate-200">{course.instructor?.name}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>{course.enrolledCount || 0} Students Enrolled</span>
                </div>
              </div>
            </div>

            {/* Sticky Action Card */}
            <div className="lg:col-span-1">
              <div className="glass-panel-glow rounded-3xl p-6 bg-slate-900/80 border border-slate-800 space-y-6 shadow-2xl">
                {course.thumbnail && (
                  <div className="h-44 w-full rounded-2xl overflow-hidden bg-slate-950">
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="space-y-3">
                  {isEnrolled ? (
                    <Link
                      to={`/student/classroom/${course._id}`}
                      className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 text-sm transition-all"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Continue Learning
                    </Link>
                  ) : isInstructorOwner ? (
                    <Link
                      to={`/instructor/course-builder/${course._id}`}
                      className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 text-sm transition-all"
                    >
                      <Layers className="w-4 h-4" />
                      Manage & Edit Curriculum
                    </Link>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50"
                    >
                      {enrolling ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Enrolling...
                        </>
                      ) : (
                        <>
                          Enroll in Course — Free
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}

                  <div className="text-center text-[11px] text-slate-400">
                    Full lifetime curriculum access & automated certificate
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-4 space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Curriculum Structure:</span>
                    <span className="font-semibold text-white">{curriculum.length} Modules</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Skill Assessment:</span>
                    <span className="text-indigo-400 font-semibold">AI Concept Feedback</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Certificate:</span>
                    <span className="text-emerald-400 font-semibold">Verified PDF Certificate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content & Curriculum Accordion */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* Learning Outcomes */}
            {course.learningOutcomes?.length > 0 && (
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="text-lg font-bold text-white tracking-tight">What You Will Learn</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {course.learningOutcomes.map((outcome, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Curriculum Accordion */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white tracking-tight">Course Curriculum</h3>
                <span className="text-xs text-slate-400 font-medium">
                  {curriculum.length} Modules
                </span>
              </div>

              <div className="space-y-3">
                {curriculum.map((mod, modIdx) => {
                  const isOpen = openModules[mod._id];
                  return (
                    <div
                      key={mod._id}
                      className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => toggleModule(mod._id)}
                        className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                            Module {modIdx + 1}
                          </span>
                          <h4 className="text-sm sm:text-base font-bold text-white">{mod.title}</h4>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400">
                            {mod.lessons?.length || 0} Lessons
                          </span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="border-t border-slate-800/80 divide-y divide-slate-800/60 bg-slate-950/40">
                          {mod.lessons?.map((lesson, lesIdx) => (
                            <div
                              key={lesson._id}
                              className="p-3.5 sm:p-4 flex items-center justify-between text-xs sm:text-sm"
                            >
                              <div className="flex items-center gap-3">
                                {lesson.type === 'video' ? (
                                  <Play className="w-4 h-4 text-indigo-400 shrink-0" />
                                ) : (
                                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                                )}
                                <span className="text-slate-300 font-medium">
                                  {lesIdx + 1}. {lesson.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {lesson.durationMinutes}m
                                </span>
                                {lesson.isFreePreview ? (
                                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                                    Preview
                                  </span>
                                ) : (
                                  <Lock className="w-3.5 h-3.5 text-slate-600" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseDetailPage;
