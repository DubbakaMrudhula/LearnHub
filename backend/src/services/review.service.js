import Course from '../models/Course.js';
import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

export class ReviewService {
  /**
   * Get all courses pending review or actively under review
   */
  async getPendingReviews() {
    const courses = await Course.find({
      status: { $in: ['SUBMITTED', 'UNDER_REVIEW'] }
    })
      .populate('instructor', 'name email profileImage')
      .populate('category', 'name slug icon')
      .sort({ updatedAt: -1 });

    return courses;
  }

  /**
   * Start review on a course (transitions SUBMITTED -> UNDER_REVIEW)
   * @param {string} courseId
   * @param {string} reviewerId
   */
  async startReview(courseId, reviewerId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found', 404, 'NOT_FOUND');
    }

    if (course.status !== 'SUBMITTED' && course.status !== 'UNDER_REVIEW') {
      throw new AppError(`Cannot review a course with status '${course.status}'`, 400, 'INVALID_STATUS');
    }

    course.status = 'UNDER_REVIEW';
    course.reviewHistory.push({
      reviewer: reviewerId,
      action: 'START_REVIEW',
      comments: 'Review initiated by reviewer',
      timestamp: new Date()
    });

    await course.save();
    logger.info(`Review started for course "${course.title}" by reviewer ${reviewerId}`);
    return course;
  }

  /**
   * Submit reviewer decision (APPROVE, REJECT, REQUEST_CHANGES)
   * @param {string} courseId
   * @param {string} reviewerId
   * @param {string} action
   * @param {string} comments
   */
  async submitDecision(courseId, reviewerId, action, comments) {
    const validActions = ['APPROVE', 'REJECT', 'REQUEST_CHANGES'];
    if (!validActions.includes(action)) {
      throw new AppError(`Invalid review action. Must be one of: ${validActions.join(', ')}`, 400, 'INVALID_ACTION');
    }

    if (!comments || comments.trim().length < 5) {
      throw new AppError('Review comments must be at least 5 characters long', 400, 'INVALID_COMMENTS');
    }

    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found', 404, 'NOT_FOUND');
    }

    if (course.status !== 'SUBMITTED' && course.status !== 'UNDER_REVIEW') {
      throw new AppError(`Course must be in SUBMITTED or UNDER_REVIEW status. Current: '${course.status}'`, 400, 'INVALID_STATUS');
    }

    // Determine new course status
    let newStatus = 'UNDER_REVIEW';
    if (action === 'APPROVE') {
      newStatus = 'APPROVED';
    } else if (action === 'REQUEST_CHANGES') {
      newStatus = 'DRAFT'; // Instructor can modify and re-submit
    } else if (action === 'REJECT') {
      newStatus = 'ARCHIVED';
    }

    course.status = newStatus;
    course.reviewNotes = comments;
    course.reviewHistory.push({
      reviewer: reviewerId,
      action,
      comments,
      timestamp: new Date()
    });

    await course.save();
    logger.info(`Review decision '${action}' submitted for course "${course.title}" by reviewer ${reviewerId}`);

    return course;
  }

  /**
   * Inspect course curriculum for reviewing
   * @param {string} courseId
   */
  async inspectCourse(courseId) {
    const course = await Course.findById(courseId)
      .populate('instructor', 'name email profileImage bio')
      .populate('category', 'name slug')
      .populate('reviewHistory.reviewer', 'name email role');

    if (!course) {
      throw new AppError('Course not found', 404, 'NOT_FOUND');
    }

    const modules = await Module.find({ course: course._id })
      .sort({ orderIndex: 1 })
      .lean();

    for (const mod of modules) {
      mod.lessons = await Lesson.find({ module: mod._id })
        .sort({ orderIndex: 1 })
        .lean();
    }

    return {
      course,
      curriculum: modules
    };
  }
}

export const reviewService = new ReviewService();
export default reviewService;
