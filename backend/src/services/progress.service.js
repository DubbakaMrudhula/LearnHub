import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Assignment from '../models/Assignment.js';
import AssignmentSubmission from '../models/AssignmentSubmission.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

export class ProgressService {
  /**
   * Calculate real mathematical multi-factor progress for a student in a course
   * @param {string} studentId
   * @param {string} courseId
   */
  async calculateCourseProgress(studentId, courseId) {
    const enrollment = await Enrollment.findOne({ student: studentId, course: courseId })
      .populate('lastAccessedLesson', 'title orderIndex');

    if (!enrollment) {
      throw new AppError('Student is not enrolled in this course', 404, 'NOT_ENROLLED');
    }

    // 1. Lessons Component
    const totalLessons = await Lesson.countDocuments({ course: courseId });
    const completedLessonsCount = enrollment.completedLessons ? enrollment.completedLessons.length : 0;
    const lessonPercentage = totalLessons > 0
      ? Math.min(100, Math.round((completedLessonsCount / totalLessons) * 100))
      : 100;

    // 2. Quizzes Component
    const courseQuizzes = await Quiz.find({ course: courseId, isPublished: true }).select('_id passingScore');
    const totalQuizzes = courseQuizzes.length;
    let passedQuizzesCount = 0;
    let quizScoresSum = 0;

    for (const q of courseQuizzes) {
      const bestPassedAttempt = await QuizAttempt.findOne({
        quiz: q._id,
        student: studentId,
        isPassed: true
      }).sort({ percentage: -1 });

      if (bestPassedAttempt) {
        passedQuizzesCount++;
        quizScoresSum += bestPassedAttempt.percentage;
      }
    }

    const quizPercentage = totalQuizzes > 0
      ? Math.min(100, Math.round((passedQuizzesCount / totalQuizzes) * 100))
      : 100;
    const averageQuizScore = passedQuizzesCount > 0
      ? Math.round(quizScoresSum / passedQuizzesCount)
      : 0;

    // 3. Assignments Component
    const courseAssignments = await Assignment.find({ course: courseId }).select('_id totalPoints');
    const totalAssignments = courseAssignments.length;
    let submittedAssignmentsCount = 0;
    let gradedAssignmentsCount = 0;
    let assignmentScoresSum = 0;

    for (const a of courseAssignments) {
      const sub = await AssignmentSubmission.findOne({ assignment: a._id, student: studentId });
      if (sub) {
        submittedAssignmentsCount++;
        if (sub.status === 'GRADED' && sub.grade !== undefined) {
          gradedAssignmentsCount++;
          assignmentScoresSum += sub.grade;
        }
      }
    }

    const assignmentPercentage = totalAssignments > 0
      ? Math.min(100, Math.round((submittedAssignmentsCount / totalAssignments) * 100))
      : 100;

    // 4. Multi-Factor Weighted Progress Calculation
    // Dynamic weight allocation based on whether quizzes and assignments exist in this course
    let overallProgress = 0;
    const hasQuizzes = totalQuizzes > 0;
    const hasAssignments = totalAssignments > 0;

    if (!hasQuizzes && !hasAssignments) {
      // 100% Lessons
      overallProgress = lessonPercentage;
    } else if (hasQuizzes && !hasAssignments) {
      // 60% Lessons, 40% Quizzes
      overallProgress = Math.round(lessonPercentage * 0.6 + quizPercentage * 0.4);
    } else if (!hasQuizzes && hasAssignments) {
      // 70% Lessons, 30% Assignments
      overallProgress = Math.round(lessonPercentage * 0.7 + assignmentPercentage * 0.3);
    } else {
      // 50% Lessons, 30% Quizzes, 20% Assignments
      overallProgress = Math.round(
        lessonPercentage * 0.5 + quizPercentage * 0.3 + assignmentPercentage * 0.2
      );
    }

    overallProgress = Math.min(100, Math.max(0, overallProgress));

    // 5. Completion State Validation
    const isLessonsCompleted = completedLessonsCount >= totalLessons && totalLessons > 0;
    const isQuizzesPassed = !hasQuizzes || passedQuizzesCount >= totalQuizzes;
    const isAssignmentsSubmitted = !hasAssignments || submittedAssignmentsCount >= totalAssignments;

    const isEligibleForCertificate = isLessonsCompleted && isQuizzesPassed && isAssignmentsSubmitted;

    // Transition enrollment to COMPLETED if all criteria are satisfied
    if (isEligibleForCertificate && enrollment.status !== 'COMPLETED') {
      enrollment.status = 'COMPLETED';
      enrollment.completedAt = new Date();
      await enrollment.save();
      logger.info(`Student ${studentId} reached 100% completion in course ${courseId}! Certificate unlocked.`);
    }

    return {
      courseId,
      overallProgress,
      isCompleted: enrollment.status === 'COMPLETED',
      isEligibleForCertificate,
      completedAt: enrollment.completedAt,
      lastAccessedLesson: enrollment.lastAccessedLesson,
      breakdown: {
        lessons: {
          completed: completedLessonsCount,
          total: totalLessons,
          percentage: lessonPercentage,
          weight: hasQuizzes && hasAssignments ? '50%' : hasQuizzes ? '60%' : hasAssignments ? '70%' : '100%'
        },
        quizzes: {
          passed: passedQuizzesCount,
          total: totalQuizzes,
          percentage: quizPercentage,
          averageScore: averageQuizScore,
          weight: hasQuizzes && hasAssignments ? '30%' : hasQuizzes ? '40%' : '0%'
        },
        assignments: {
          submitted: submittedAssignmentsCount,
          graded: gradedAssignmentsCount,
          total: totalAssignments,
          percentage: assignmentPercentage,
          weight: hasQuizzes && hasAssignments ? '20%' : hasAssignments ? '30%' : '0%'
        }
      }
    };
  }

  /**
   * Get student's aggregated dashboard progress across all enrolled courses
   * @param {string} studentId
   */
  async getStudentDashboard(studentId) {
    const enrollments = await Enrollment.find({ student: studentId })
      .populate({
        path: 'course',
        select: 'title slug subtitle thumbnail difficulty instructor category',
        populate: [
          { path: 'instructor', select: 'name profileImage' },
          { path: 'category', select: 'name slug icon' }
        ]
      })
      .populate('lastAccessedLesson', 'title orderIndex')
      .sort({ updatedAt: -1 });

    const courseProgressList = [];
    let totalProgressSum = 0;
    let completedCoursesCount = 0;

    for (const enr of enrollments) {
      if (!enr.course) continue;

      const progressData = await this.calculateCourseProgress(studentId, enr.course._id);

      if (progressData.isCompleted) {
        completedCoursesCount++;
      }
      totalProgressSum += progressData.overallProgress;

      courseProgressList.push({
        enrollmentId: enr._id,
        course: enr.course,
        status: enr.status,
        enrolledAt: enr.enrolledAt,
        completedAt: enr.completedAt,
        overallProgress: progressData.overallProgress,
        isCompleted: progressData.isCompleted,
        isEligibleForCertificate: progressData.isEligibleForCertificate,
        lastAccessedLesson: progressData.lastAccessedLesson,
        breakdown: progressData.breakdown
      });
    }

    const totalEnrolled = courseProgressList.length;
    const averageCompletionRate = totalEnrolled > 0
      ? Math.round(totalProgressSum / totalEnrolled)
      : 0;

    return {
      summary: {
        totalEnrolled,
        completedCoursesCount,
        inProgressCount: totalEnrolled - completedCoursesCount,
        averageCompletionRate
      },
      courses: courseProgressList
    };
  }

  /**
   * Check certificate eligibility
   * @param {string} studentId
   * @param {string} courseId
   */
  async checkCertificateEligibility(studentId, courseId) {
    const progress = await this.calculateCourseProgress(studentId, courseId);
    return {
      courseId,
      isEligible: progress.isEligibleForCertificate,
      overallProgress: progress.overallProgress,
      breakdown: progress.breakdown
    };
  }
}

export const progressService = new ProgressService();
export default progressService;
