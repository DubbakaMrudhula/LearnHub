import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import courseService from '../../services/courseService';
import categoryService from '../../services/categoryService';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Users, 
  Star, 
  Sparkles, 
  Clock, 
  ArrowRight,
  RefreshCw,
  Layers,
  GraduationCap
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export const CourseCatalogPage = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [totalCourses, setTotalCourses] = useState(0);

  const fetchCoursesAndCategories = async () => {
    setLoading(true);
    try {
      const [coursesRes, catsRes] = await Promise.all([
        courseService.getCourses({
          search: search || undefined,
          category: selectedCategory || undefined,
          difficulty: selectedDifficulty || undefined
        }),
        categoryService.getCategories()
      ]);

      setCourses(coursesRes.data.courses || []);
      setTotalCourses(coursesRes.data.total || 0);
      setCategories(catsRes.data.categories || []);
    } catch (err) {
      console.error('Error fetching course catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoursesAndCategories();
  }, [selectedCategory, selectedDifficulty]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCoursesAndCategories();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-white min-h-screen">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white shadow-xl shadow-purple-900/10 p-8 sm:p-10">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/30 text-purple-200 text-xs font-bold border border-purple-400/40">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            Curated Skill Learning
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Explore Course Curriculum
          </h1>
          <p className="text-sm sm:text-base text-purple-100 leading-relaxed">
            Engineered courses with modular lesson structures, interactive assessments, and AI-enabled concept evaluation.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, topic, or keyword..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-purple-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all font-medium"
            />
          </form>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-white border border-purple-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 cursor-pointer"
            >
              <option value="">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === ''
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                : 'bg-purple-50 text-slate-700 hover:bg-purple-100 border border-purple-200/80'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                  : 'bg-purple-50 text-slate-700 hover:bg-purple-100 border border-purple-200/80'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
          <span className="text-sm font-medium">Loading course curriculum...</span>
        </div>
      ) : courses.length === 0 ? (
        <div className="p-12 rounded-3xl border border-purple-100 bg-white shadow-sm text-center space-y-3">
          <BookOpen className="w-10 h-10 text-purple-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Courses Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or category filters to explore other learning domains.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              key={course._id}
              to={`/courses/${course.slug}`}
              className="group rounded-3xl border border-purple-100 bg-white hover:border-purple-300 hover:shadow-xl hover:shadow-purple-900/5 transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1"
            >
              {/* Thumbnail */}
              <div className="relative h-44 w-full bg-purple-50 overflow-hidden">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-purple-100 to-indigo-100">
                    <GraduationCap className="w-12 h-12 text-purple-500/50" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-purple-700 border border-purple-200 shadow-sm">
                    {course.difficulty}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
                    {course.category?.name || 'Curriculum'}
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {course.subtitle || course.description}
                  </p>
                </div>

                {/* Footer Info */}
                <div className="pt-3 border-t border-purple-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                      {course.instructor?.name?.charAt(0) || 'I'}
                    </div>
                    <span className="truncate max-w-[120px] font-medium text-slate-700">{course.instructor?.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 font-bold text-xs group-hover:translate-x-0.5 transition-transform text-purple-700">
                    Explore
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseCatalogPage;
