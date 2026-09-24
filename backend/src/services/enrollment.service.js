import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

export class EnrollmentService {
  /**
   * Enroll a student into a course
   * @param {string} studentId
   * @param {string} courseId
   */
  async enroll(studentId, courseId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found', 404, 'NOT_FOUND');
    }

    if (course.status !== 'PUBLISHED') {
      throw new AppError('Cannot enroll in a course that is not published', 400, 'COURSE_NOT_PUBLISHED');
    }

    // Check for existing enrollment (duplicate prevention)
    const existing = await Enrollment.findOne({ student: studentId, course: courseId });
    if (existing) {
      throw new AppError('You are already enrolled in this course', 400, 'DUPLICATE_ENROLLMENT');
    }

    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId,
      status: 'ACTIVE',
      completedLessons: []
    });

    // Increment enrolled count
    await Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: 1 } });
    logger.info(`Student ${studentId} enrolled in course "${course.title}"`);

    return enrollment;
  }

  /**
   * Get all courses a student is enrolled in, with calculated progress
   * @param {string} studentId
   */
  async getMyEnrollments(studentId) {
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
      .sort({ updatedAt: -1 })
      .lean();

    // Calculate real completion percentage for each course
    const results = await Promise.all(
      enrollments.map(async (enr) => {
        if (!enr.course) return null;

        const totalLessons = await Lesson.countDocuments({ course: enr.course._id });
        const completedCount = enr.completedLessons?.length || 0;
        const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

        return {
          ...enr,
          totalLessons,
          completedLessonsCount: completedCount,
          progressPercent
        };
      })
    );

    return results.filter(Boolean);
  }

  /**
   * Mark a lesson complete and update learner progress
   * @param {string} studentId
   * @param {string} courseId
   * @param {string} lessonId
   */
  async markLessonComplete(studentId, courseId, lessonId) {
    const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    if (!enrollment) {
      throw new AppError('You must be enrolled in this course to track lesson completion', 403, 'NOT_ENROLLED');
    }

    const lesson = await Lesson.findOne({ _id: lessonId, course: courseId });
    if (!lesson) {
      throw new AppError('Lesson not found in this course', 404, 'NOT_FOUND');
    }

    // Add to completed lessons if not already present
    const alreadyCompleted = enrollment.completedLessons.some(
      (id) => id.toString() === lessonId.toString()
    );

    if (!alreadyCompleted) {
      enrollment.completedLessons.push(lessonId);
    }

    enrollment.lastAccessedLesson = lessonId;

    // Check if entire course is completed
    const totalLessons = await Lesson.countDocuments({ course: courseId });
    if (enrollment.completedLessons.length >= totalLessons && totalLessons > 0) {
      enrollment.status = 'COMPLETED';
      enrollment.completedAt = new Date();
      logger.info(`Student ${studentId} COMPLETED course ${courseId}!`);
    }

    await enrollment.save();

    const progressPercent = totalLessons > 0
      ? Math.round((enrollment.completedLessons.length / totalLessons) * 100)
      : 0;

    return {
      enrollment,
      completedCount: enrollment.completedLessons.length,
      totalLessons,
      progressPercent,
      isCourseCompleted: enrollment.status === 'COMPLETED'
    };
  }

  /**
   * Check if a user is enrolled in a course
   * @param {string} studentId
   * @param {string} courseId
   */
  async checkEnrollment(studentId, courseId) {
    const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    return !!enrollment;
  }
}

export const enrollmentService = new EnrollmentService();
export default enrollmentService;
