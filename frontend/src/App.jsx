import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import BaseLayout from './components/layout/BaseLayout';
import LandingPage from './pages/LandingPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import CourseCatalogPage from './pages/courses/CourseCatalogPage';
import CourseDetailPage from './pages/courses/CourseDetailPage';
import InstructorCoursesPage from './pages/instructor/InstructorCoursesPage';
import CourseBuilderPage from './pages/instructor/CourseBuilderPage';
import ReviewerDashboardPage from './pages/reviewer/ReviewerDashboardPage';
import LearningClassroomPage from './pages/student/LearningClassroomPage';
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import AssessmentsListPage from './pages/assessments/AssessmentsListPage';
import QuizRunnerPage from './pages/assessments/QuizRunnerPage';
import QuizResultPage from './pages/assessments/QuizResultPage';
import AssignmentSubmissionPage from './pages/assessments/AssignmentSubmissionPage';
import AssignmentGradingPage from './pages/instructor/AssignmentGradingPage';
import ActiveQuizRedirect from './pages/assessments/ActiveQuizRedirect';
import ActiveAssignmentRedirect from './pages/assessments/ActiveAssignmentRedirect';
import MentorshipPage from './pages/mentorship/MentorshipPage';
import MentorDashboardPage from './pages/mentor/MentorDashboardPage';
import AILearningPathPage from './pages/ai/AILearningPathPage';
import MyCertificatesPage from './pages/certificates/MyCertificatesPage';
import PublicVerifyPage from './pages/certificates/PublicVerifyPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import { Sparkles, ArrowRight } from 'lucide-react';

// Preview placeholder for subsequent phases
const ComingInNextPhase = ({ phase, title, description, linkTo = "/", linkText = "Back to Overview" }) => (
  <div className="max-w-4xl mx-auto px-4 py-24 text-center">
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-6 border border-indigo-500/20">
      <Sparkles className="w-3.5 h-3.5" />
      {phase}
    </div>
    <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{title}</h1>
    <p className="mt-4 text-slate-400 max-w-lg mx-auto text-base">{description}</p>
    <div className="mt-8">
      <Link
        to={linkTo}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm transition-colors"
      >
        {linkText}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  </div>
);

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<BaseLayout />}>
          <Route index element={<LandingPage />} />
          
          {/* Phase 2 Authentication Routes */}
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          
          {/* Protected Profile Route */}
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Phase 3 Course & Reviewer Routes */}
          <Route path="courses" element={<CourseCatalogPage />} />
          <Route path="courses/:idOrSlug" element={<CourseDetailPage />} />
          
          {/* Instructor Studio */}
          <Route
            path="instructor"
            element={
              <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                <InstructorCoursesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="instructor/course-builder/:courseId"
            element={
              <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                <CourseBuilderPage />
              </ProtectedRoute>
            }
          />

          {/* Reviewer Portal */}
          <Route
            path="reviewer"
            element={
              <ProtectedRoute allowedRoles={['reviewer', 'admin']}>
                <ReviewerDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Student Classroom */}
          <Route
            path="student/classroom/:courseId"
            element={
              <ProtectedRoute>
                <LearningClassroomPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="student"
            element={
              <ProtectedRoute>
                <StudentDashboardPage />
              </ProtectedRoute>
            }
          />
          {/* Phase 4 Assessment & Quiz Engine */}
          <Route path="assessments" element={<AssessmentsListPage />} />
          <Route path="assessments/quizzes/active/take" element={<ActiveQuizRedirect />} />
          <Route
            path="assessments/quizzes/:quizId/take"
            element={
              <ProtectedRoute>
                <QuizRunnerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="assessments/quizzes/:quizId/results/:attemptId"
            element={
              <ProtectedRoute>
                <QuizResultPage />
              </ProtectedRoute>
            }
          />
          <Route path="assessments/assignments/active/submit" element={<ActiveAssignmentRedirect />} />
          <Route
            path="assessments/assignments/:assignmentId/submit"
            element={
              <ProtectedRoute>
                <AssignmentSubmissionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="instructor/assignments/:assignmentId/grading"
            element={
              <ProtectedRoute allowedRoles={['instructor', 'reviewer', 'admin']}>
                <AssignmentGradingPage />
              </ProtectedRoute>
            }
          />
          {/* Phase 7 AI Personalized Learning Path */}
          <Route
            path="ai-path"
            element={
              <ProtectedRoute>
                <AILearningPathPage />
              </ProtectedRoute>
            }
          />
          {/* Phase 6 Mentorship System */}
          <Route
            path="mentorship"
            element={
              <ProtectedRoute>
                <MentorshipPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="mentor"
            element={
              <ProtectedRoute allowedRoles={['mentor', 'instructor', 'admin']}>
                <MentorDashboardPage />
              </ProtectedRoute>
            }
          />
          {/* Phase 8 Certificate System */}
          <Route
            path="certificates"
            element={
              <ProtectedRoute>
                <MyCertificatesPage />
              </ProtectedRoute>
            }
          />
          <Route path="verify" element={<PublicVerifyPage />} />
          <Route path="verify/:code" element={<PublicVerifyPage />} />

          {/* Phase 9 Admin Operations Console */}
          <Route
            path="admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* 404 Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
