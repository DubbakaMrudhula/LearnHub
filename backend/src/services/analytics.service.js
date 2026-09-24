import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Certificate from '../models/Certificate.js';
import MentorshipSession from '../models/MentorshipSession.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Assignment from '../models/Assignment.js';
import AssignmentSubmission from '../models/AssignmentSubmission.js';

export class AnalyticsService {
  /**
   * System-wide platform metrics for Admin
   */
  async getAdminAnalytics() {
    // 1. Users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    const roleMap = { student: 0, instructor: 0, reviewer: 0, mentor: 0, admin: 0 };
    usersByRole.forEach((r) => {
      roleMap[r._id] = r.count;
    });

    const totalUsers = Object.values(roleMap).reduce((a, b) => a + b, 0);

    // 2. Courses by status
    const coursesByStatus = await Course.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const statusMap = { DRAFT: 0, SUBMITTED: 0, UNDER_REVIEW: 0, APPROVED: 0, PUBLISHED: 0, ARCHIVED: 0 };
    coursesByStatus.forEach((s) => {
      statusMap[s._id] = s.count;
    });

    // 3. Platform Enrollments & Completions
    const [totalEnrollments, completedEnrollments, totalCertificates, totalMentorshipSessions] = await Promise.all([
      Enrollment.countDocuments(),
      Enrollment.countDocuments({ status: 'COMPLETED' }),
      Certificate.countDocuments(),
      MentorshipSession.countDocuments()
    ]);

    const platformCompletionRate = totalEnrollments > 0
      ? Math.round((completedEnrollments / totalEnrollments) * 100)
      : 0;

    // 4. Recent Platform Users
    const recentUsers = await User.find()
      .select('name email role createdAt isEmailVerified')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    return {
      kpi: {
        totalUsers,
        totalEnrollments,
        completedEnrollments,
        platformCompletionRate,
        totalCertificates,
        totalMentorshipSessions,
        publishedCourses: statusMap.PUBLISHED || 0,
        pendingReviewCourses: (statusMap.SUBMITTED || 0) + (statusMap.UNDER_REVIEW || 0)
      },
      usersByRole: roleMap,
      coursesByStatus: statusMap,
      recentUsers
    };
  }

  /**
   * Instructor authoring analytics
   */
  async getInstructorAnalytics(instructorId) {
    const instructorCourses = await Course.find({ instructor: instructorId }).select('_id title status');
    const courseIds = instructorCourses.map((c) => c._id);

    const [enrollmentsCount, quizzesCount, assignmentsCount] = await Promise.all([
      Enrollment.countDocuments({ course: { $in: courseIds } }),
      Quiz.countDocuments({ course: { $in: courseIds } }),
      Assignment.countDocuments({ course: { $in: courseIds } })
    ]);

    // Average quiz score across instructor courses
    const quizAttempts = await QuizAttempt.find({ course: { $in: courseIds } }).select('percentage isPassed');
    const totalAttempts = quizAttempts.length;
    const passedAttempts = quizAttempts.filter((a) => a.isPassed).length;
    const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

    return {
      coursesCount: instructorCourses.length,
      enrollmentsCount,
      quizzesCount,
      assignmentsCount,
      totalQuizAttempts: totalAttempts,
      quizPassRate: passRate,
      courses: instructorCourses
    };
  }

  /**
   * Reviewer inspection queue analytics
   */
  async getReviewerAnalytics() {
    const [underReview, approved, totalCourses] = await Promise.all([
      Course.countDocuments({ status: { $in: ['SUBMITTED', 'UNDER_REVIEW'] } }),
      Course.countDocuments({ status: { $in: ['APPROVED', 'PUBLISHED'] } }),
      Course.countDocuments()
    ]);

    return {
      pendingReviewCount: underReview,
      approvedCount: approved,
      totalCoursesCount: totalCourses
    };
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
