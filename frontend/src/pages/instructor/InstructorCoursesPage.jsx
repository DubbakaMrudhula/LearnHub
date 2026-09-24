import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import courseService from '../../services/courseService';
import categoryService from '../../services/categoryService';
import { 
  Plus, 
  Layers, 
  Send, 
  Globe, 
  Edit3, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  Sparkles,
  ArrowRight,
  Eye
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export const InstructorCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // New course form state
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');

  const fetchInstructorData = async () => {
    setLoading(true);
    try {
      const [coursesRes, catsRes] = await Promise.all([
        courseService.getInstructorCourses(),
        categoryService.getCategories()
      ]);
      setCourses(coursesRes.data.courses || []);
      setCategories(catsRes.data.categories || []);
      if (catsRes.data.categories?.length > 0) {
        setCategory(catsRes.data.categories[0]._id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructorData();
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await courseService.createCourse({
        title,
        subtitle,
        description,
        category,
        difficulty
      });
      setShowCreateModal(false);
      setMessage(`Course "${title}" created in DRAFT. You can now build modules & lessons!`);
      // Reset form
      setTitle('');
      setSubtitle('');
      setDescription('');
      fetchInstructorData();
    } catch (err) {
      setError(err.message || 'Failed to create course');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitForReview = async (courseId) => {
    setActionLoading(true);
    setError('');
    setMessage('');
    try {
      await courseService.submitForReview(courseId);
      setMessage('Course submitted for reviewer verification!');
      fetchInstructorData();
    } catch (err) {
      setError(err.message || 'Failed to submit course for review');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublishCourse = async (courseId) => {
    setActionLoading(true);
    setError('');
    setMessage('');
    try {
      await courseService.publishCourse(courseId);
      setMessage('Course published live to the global catalog!');
      fetchInstructorData();
    } catch (err) {
      setError(err.message || 'Failed to publish course');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${courseTitle}"? All associated modules and lessons will be removed.`)) {
      return;
    }

    try {
      await courseService.deleteCourse(courseId);
      setMessage(`Course "${courseTitle}" deleted.`);
      fetchInstructorData();
    } catch (err) {
      setError(err.message || 'Failed to delete course');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold border border-purple-500/20 mb-2">
            <Layers className="w-3.5 h-3.5" />
            Instructor Studio
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Course Management</h1>
          <p className="text-sm text-slate-400">Design, structure, submit, and publish your curriculum.</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Create New Course
        </button>
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

      {/* Courses List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
          <span className="text-sm">Loading your curriculum...</span>
        </div>
      ) : courses.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-4 border border-slate-800">
          <Layers className="w-12 h-12 text-indigo-400/40 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Courses Created Yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Get started by creating your first course. You can add modular lessons, quizzes, and submit for content review.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {courses.map((course) => (
            <div
              key={course._id}
              className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <StatusBadge
                    status={
                      course.status === 'PUBLISHED'
                        ? 'healthy'
                        : course.status === 'APPROVED'
                        ? 'healthy'
                        : course.status === 'DRAFT'
                        ? 'info'
                        : 'pending'
                    }
                    label={course.status}
                  />
                  <span className="text-xs font-semibold text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
                    {course.category?.name || 'Category'}
                  </span>
                  <span className="text-xs text-slate-500">
                    Difficulty: <strong className="text-slate-300">{course.difficulty}</strong>
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white">{course.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-1">{course.subtitle || course.description}</p>

                {/* Review feedback note if changes requested */}
                {course.status === 'DRAFT' && course.reviewNotes && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2 mt-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    <div>
                      <strong>Reviewer Feedback:</strong> {course.reviewNotes}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                <Link
                  to={`/instructor/course-builder/${course._id}`}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                  Curriculum Builder
                </Link>

                {course.status === 'DRAFT' && (
                  <button
                    onClick={() => handleSubmitForReview(course._id)}
                    disabled={actionLoading}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit for Review
                  </button>
                )}

                {course.status === 'APPROVED' && (
                  <button
                    onClick={() => handlePublishCourse(course._id)}
                    disabled={actionLoading}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-colors flex items-center gap-1.5"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Publish Course Live
                  </button>
                )}

                {course.status === 'PUBLISHED' && (
                  <Link
                    to={`/courses/${course.slug}`}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Public Page
                  </Link>
                )}

                <button
                  onClick={() => handleDeleteCourse(course._id, course.title)}
                  className="p-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete Course"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Create New Course</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Course Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Distributed Database Systems with Sharding"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Brief 1-sentence summary"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Comprehensive description of the curriculum goals..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Creating...' : 'Create Course in DRAFT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorCoursesPage;
