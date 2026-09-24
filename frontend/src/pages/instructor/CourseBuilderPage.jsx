import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import courseService from '../../services/courseService';
import { 
  Plus, 
  Layers, 
  FileText, 
  Play, 
  Trash2, 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export const CourseBuilderPage = () => {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Add Module Modal
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDesc, setModuleDesc] = useState('');

  // Add Lesson Modal
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState('reading');
  const [lessonDuration, setLessonDuration] = useState(15);
  const [lessonContent, setLessonContent] = useState('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [lessonPreview, setLessonPreview] = useState(false);

  const fetchCourseCurriculum = async () => {
    setLoading(true);
    try {
      const res = await courseService.getCourse(courseId);
      setCourse(res.data.course);
      setCurriculum(res.data.curriculum || []);
    } catch (err) {
      setError(err.message || 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseCurriculum();
  }, [courseId]);

  const handleCreateModule = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await courseService.createModule(courseId, {
        title: moduleTitle,
        description: moduleDesc
      });
      setShowModuleModal(false);
      setModuleTitle('');
      setModuleDesc('');
      setMessage('Module added to curriculum!');
      fetchCourseCurriculum();
    } catch (err) {
      setError(err.message || 'Failed to create module');
    }
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await courseService.createLesson(activeModuleId, {
        title: lessonTitle,
        type: lessonType,
        durationMinutes: Number(lessonDuration),
        content: lessonContent,
        videoUrl: lessonVideoUrl,
        isFreePreview: lessonPreview
      });
      setShowLessonModal(false);
      setLessonTitle('');
      setLessonContent('');
      setLessonVideoUrl('');
      setMessage('Lesson created successfully!');
      fetchCourseCurriculum();
    } catch (err) {
      setError(err.message || 'Failed to create lesson');
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Delete this module and all its lessons?')) return;
    try {
      await courseService.deleteModule(moduleId);
      setMessage('Module deleted.');
      fetchCourseCurriculum();
    } catch (err) {
      setError(err.message || 'Failed to delete module');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await courseService.deleteLesson(lessonId);
      setMessage('Lesson deleted.');
      fetchCourseCurriculum();
    } catch (err) {
      setError(err.message || 'Failed to delete lesson');
    }
  };

  const handleSubmitReview = async () => {
    try {
      await courseService.submitForReview(courseId);
      setMessage('Course submitted for reviewer verification!');
      fetchCourseCurriculum();
    } catch (err) {
      setError(err.message || 'Failed to submit course');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-sm text-slate-400">Loading curriculum editor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/instructor"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Instructor Courses
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {course?.title}
            </h1>
            <StatusBadge status={course?.status === 'PUBLISHED' ? 'healthy' : 'pending'} label={course?.status} />
          </div>
          <p className="text-xs text-slate-400">Curriculum Builder & Module Editor</p>
        </div>

        <div className="flex items-center gap-2">
          {course?.status === 'DRAFT' && (
            <button
              onClick={handleSubmitReview}
              className="px-4 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 text-xs flex items-center gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              Submit for Review
            </button>
          )}

          <button
            onClick={() => setShowModuleModal(true)}
            className="px-4 py-2.5 rounded-xl font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 text-xs flex items-center gap-1.5 transition-all border border-slate-700"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            Add Module
          </button>
        </div>
      </div>

      {/* Reviewer Feedback Banner */}
      {course?.status === 'DRAFT' && course?.reviewNotes && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-200 text-sm">Changes Requested by Reviewer</div>
            <p>{course.reviewNotes}</p>
            <div className="text-[11px] text-amber-400/80">Make requested adjustments and click "Submit for Review".</div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Modules & Lessons List */}
      <div className="space-y-6">
        {curriculum.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
            <Layers className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No Modules Added Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Courses must have at least one module and lesson before they can be submitted for review.
            </p>
            <button
              onClick={() => setShowModuleModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add First Module
            </button>
          </div>
        ) : (
          curriculum.map((mod, modIdx) => (
            <div
              key={mod._id}
              className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden space-y-4 p-5 sm:p-6"
            >
              {/* Module Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                    Module {modIdx + 1}
                  </span>
                  <h3 className="text-base font-bold text-white">{mod.title}</h3>
                  {mod.description && <p className="text-xs text-slate-400">{mod.description}</p>}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setActiveModuleId(mod._id); setShowLessonModal(true); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Lesson
                  </button>
                  <button
                    onClick={() => handleDeleteModule(mod._id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Module"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Lessons within this module */}
              <div className="space-y-2">
                {mod.lessons?.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                    No lessons in this module yet. Click "Add Lesson" above.
                  </div>
                ) : (
                  mod.lessons?.map((les, lesIdx) => (
                    <div
                      key={les._id}
                      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs sm:text-sm hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {les.type === 'video' ? (
                          <Play className="w-4 h-4 text-indigo-400 shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className="font-semibold text-slate-200">
                          {lesIdx + 1}. {les.title}
                        </span>
                        {les.isFreePreview && (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            Preview
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {les.durationMinutes}m
                        </span>
                        <button
                          onClick={() => handleDeleteLesson(les._id)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded"
                          title="Delete Lesson"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Module Modal */}
      {showModuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add Curriculum Module</h3>
              <button onClick={() => setShowModuleModal(false)} className="text-slate-400 hover:text-white">×</button>
            </div>
            <form onSubmit={handleCreateModule} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Module Title
                </label>
                <input
                  type="text"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  placeholder="e.g. Module 2: Concurrency & Threads"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={moduleDesc}
                  onChange={(e) => setModuleDesc(e.target.value)}
                  placeholder="Summary of topics covered in this module..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModuleModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
                >
                  Save Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add New Lesson</h3>
              <button onClick={() => setShowLessonModal(false)} className="text-slate-400 hover:text-white">×</button>
            </div>
            <form onSubmit={handleCreateLesson} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Lesson Title
                </label>
                <input
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="e.g. Asynchronous Thread Execution"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Lesson Type
                  </label>
                  <select
                    value={lessonType}
                    onChange={(e) => setLessonType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="reading">Reading / Article</option>
                    <option value="video">Video Lecture</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Estimated Duration (mins)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {lessonType === 'video' ? (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Video URL (YouTube, Vimeo, or MP4)
                  </label>
                  <input
                    type="url"
                    value={lessonVideoUrl}
                    onChange={(e) => setLessonVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              ) : null}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Lesson Markdown Content
                </label>
                <textarea
                  rows={6}
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  placeholder="### Lesson Overview&#10;&#10;Explain the concepts, code blocks, and key takeaways here..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="previewCheck"
                  checked={lessonPreview}
                  onChange={(e) => setLessonPreview(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="previewCheck" className="text-xs text-slate-300 cursor-pointer">
                  Allow free public preview for non-enrolled students
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
                >
                  Save Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseBuilderPage;
