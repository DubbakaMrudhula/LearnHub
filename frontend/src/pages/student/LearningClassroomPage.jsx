import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import courseService from '../../services/courseService';
import enrollmentService from '../../services/enrollmentService';
import { 
  CheckCircle2, 
  Circle, 
  Play, 
  FileText, 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  RefreshCw, 
  Award, 
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';

export const LearningClassroomPage = () => {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState('');

  const fetchClassroomData = async () => {
    setLoading(true);
    try {
      // 1. Fetch course details and curriculum
      const courseRes = await courseService.getCourse(courseId);
      const courseData = courseRes.data.course;
      const curriculumData = courseRes.data.curriculum || [];
      setCourse(courseData);
      setCurriculum(curriculumData);

      // 2. Fetch student enrollment state
      const enrollRes = await enrollmentService.getMyEnrollments();
      const myEnrollment = enrollRes.data.enrollments?.find(
        (e) => e.course?._id === courseId || e.course === courseId
      );

      if (myEnrollment) {
        setCompletedLessons(myEnrollment.completedLessons || []);
        setProgressPercent(myEnrollment.progressPercent || 0);
      }

      // Select first lesson or last accessed
      if (curriculumData.length > 0 && curriculumData[0].lessons?.length > 0) {
        const firstLessonId = curriculumData[0].lessons[0]._id;
        loadLessonContent(firstLessonId);
      }
    } catch (err) {
      setError(err.message || 'Failed to load classroom');
    } finally {
      setLoading(false);
    }
  };

  const loadLessonContent = async (lessonId) => {
    try {
      const res = await courseService.getLesson(lessonId);
      setActiveLesson(res.data.lesson);
    } catch (err) {
      setError(err.message || 'Failed to load lesson content');
    }
  };

  useEffect(() => {
    fetchClassroomData();
  }, [courseId]);

  const handleMarkComplete = async () => {
    if (!activeLesson) return;
    setCompleting(true);
    try {
      const res = await enrollmentService.markLessonComplete(courseId, activeLesson._id);
      setProgressPercent(res.data.progressPercent);

      if (!completedLessons.includes(activeLesson._id)) {
        setCompletedLessons([...completedLessons, activeLesson._id]);
      }

      // Auto-advance to next lesson if available
      findAndLoadNextLesson();
    } catch (err) {
      setError(err.message || 'Failed to update progress');
    } finally {
      setCompleting(false);
    }
  };

  const findAndLoadNextLesson = () => {
    let foundCurrent = false;
    for (const mod of curriculum) {
      for (const les of mod.lessons || []) {
        if (foundCurrent) {
          loadLessonContent(les._id);
          return;
        }
        if (les._id === activeLesson?._id) {
          foundCurrent = true;
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-sm text-slate-400">Loading interactive classroom...</p>
      </div>
    );
  }

  const isCompleted = completedLessons.includes(activeLesson?._id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Classroom Top Bar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to={`/courses/${course?.slug || courseId}`}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Course Overview"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
              Interactive Classroom
            </span>
            <h1 className="text-sm font-bold text-white truncate max-w-md">{course?.title}</h1>
          </div>
        </div>

        {/* Progress Bar Header */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-semibold text-slate-300">Overall Progress</span>
            <span className="text-[11px] text-indigo-400 font-bold">{progressPercent}% Completed</span>
          </div>
          <div className="w-32 h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Classroom Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar: Curriculum Tree */}
        <aside className="w-full lg:w-80 border-r border-slate-800/80 bg-slate-900/40 p-4 overflow-y-auto space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2">
            Course Curriculum
          </div>

          <div className="space-y-3">
            {curriculum.map((mod, modIdx) => (
              <div key={mod._id} className="space-y-1.5">
                <div className="px-2 text-xs font-bold text-slate-300">
                  Module {modIdx + 1}: {mod.title}
                </div>
                <div className="space-y-1">
                  {mod.lessons?.map((les) => {
                    const active = activeLesson?._id === les._id;
                    const done = completedLessons.includes(les._id);
                    return (
                      <button
                        key={les._id}
                        onClick={() => loadLessonContent(les._id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                          active
                            ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          {les.type === 'video' ? (
                            <Play className="w-3.5 h-3.5 shrink-0" />
                          ) : (
                            <FileText className="w-3.5 h-3.5 shrink-0" />
                          )}
                          <span className="truncate">{les.title}</span>
                        </div>
                        {done ? (
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-white' : 'text-emerald-400'}`} />
                        ) : (
                          <Circle className="w-3 h-3 text-slate-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Right Content Area: Lesson Viewer */}
        <main className="flex-1 p-6 sm:p-10 overflow-y-auto space-y-6">
          {activeLesson ? (
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Lesson Header */}
              <div className="space-y-3 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {activeLesson.type}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {activeLesson.durationMinutes} min read
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {activeLesson.title}
                </h2>
              </div>

              {/* Video Player or Reading Material */}
              {activeLesson.type === 'video' && activeLesson.videoUrl && (
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                  <iframe
                    src={activeLesson.videoUrl}
                    title={activeLesson.title}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Reading Content */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/60 leading-relaxed text-slate-300 text-sm sm:text-base whitespace-pre-wrap space-y-4">
                {activeLesson.content || 'No text content provided for this lesson.'}
              </div>

              {/* Action Bottom Bar */}
              <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-400">
                  {isCompleted ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Completed
                    </span>
                  ) : (
                    'Complete this lesson to unlock subsequent concepts.'
                  )}
                </div>

                <button
                  onClick={handleMarkComplete}
                  disabled={completing}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {completing ? (
                    'Saving Progress...'
                  ) : isCompleted ? (
                    <>
                      Next Lesson
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Mark Complete & Continue
                    </>
                  )}
                </button>
              </div>

              {/* Course Complete Celebration Card */}
              {progressPercent === 100 && (
                <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-500/30 flex items-center gap-4">
                  <Award className="w-10 h-10 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="text-base font-bold text-white">Course Curriculum 100% Completed!</h4>
                    <p className="text-xs text-slate-300">
                      You have finished all modules. Prepare for the Skill Assessment to earn your verified Certificate.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">
              Select a lesson from the left curriculum tree to begin learning.
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default LearningClassroomPage;
