import Course from '../models/Course.js';
import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import Category from '../models/Category.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

export class CourseService {
  /**
   * Search and filter courses with pagination
   * @param {object} queryParams
   * @param {string|null} currentUserId
   * @param {string|null} currentUserRole
   */
  async getCourses(queryParams, currentUserId = null, currentUserRole = null) {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      difficulty,
      sort = 'newest',
      status
    } = queryParams;

    const filter = {};

    // For public learners, only show PUBLISHED courses
    if (currentUserRole !== 'admin' && currentUserRole !== 'reviewer') {
      filter.status = 'PUBLISHED';
    } else if (status) {
      filter.status = status;
    }

    // Category filter by ID or slug
    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        filter.category = category;
      } else {
        const catDoc = await Category.findOne({ slug: category });
        if (catDoc) {
          filter.category = catDoc._id;
        }
      }
    }

    // Difficulty filter
    if (difficulty) {
      filter.difficulty = difficulty;
    }

    // Search query using regex for flexible partial matching
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'popular') sortOption = { enrolledCount: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate('instructor', 'name profileImage bio')
        .populate('category', 'name slug icon')
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit)),
      Course.countDocuments(filter)
    ]);

    return { courses, total, page: Number(page), limit: Number(limit) };
  }

  /**
   * Get single course details with modules and lessons
   * @param {string} idOrSlug
   */
  async getCourseByIdOrSlug(idOrSlug) {
    const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: idOrSlug }
      : { slug: idOrSlug };

    const course = await Course.findOne(query)
      .populate('instructor', 'name profileImage bio')
      .populate('category', 'name slug icon')
      .populate({
        path: 'reviewHistory.reviewer',
        select: 'name email role'
      });

    if (!course) {
      throw new AppError('Course not found', 404, 'NOT_FOUND');
    }

    // Fetch modules with ordered lessons
    const modules = await Module.find({ course: course._id })
      .sort({ orderIndex: 1 })
      .lean();

    for (const mod of modules) {
      mod.lessons = await Lesson.find({ module: mod._id })
        .sort({ orderIndex: 1 })
        .select('-content') // Exclude full reading content in outline preview
        .lean();
    }

    return {
      course: course.toJSON(),
      curriculum: modules
    };
  }

  /**
   * Create new course as an instructor
   * @param {string} instructorId
   * @param {object} courseData
   */
  async createCourse(instructorId, courseData) {
    const { title, subtitle, description, category, difficulty, thumbnail, tags, learningOutcomes, requirements, price } = courseData;

    // Verify category exists
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      throw new AppError('Selected category does not exist', 400, 'INVALID_CATEGORY');
    }

    const course = await Course.create({
      title,
      subtitle: subtitle || '',
      description,
      category,
      instructor: instructorId,
      difficulty: difficulty || 'Beginner',
      thumbnail: thumbnail || '',
      tags: Array.isArray(tags) ? tags : [],
      learningOutcomes: Array.isArray(learningOutcomes) ? learningOutcomes : [],
      requirements: Array.isArray(requirements) ? requirements : [],
      price: price || 0,
      status: 'DRAFT'
    });

    logger.info(`Course created: "${course.title}" by Instructor ID ${instructorId}`);
    return course;
  }

  /**
   * Update course with strict ownership check
   * @param {string} courseId
   * @param {string} userId
   * @param {string} userRole
   * @param {object} updateData
   */
  async updateCourse(courseId, userId, userRole, updateData) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found', 404, 'NOT_FOUND');
    }

    // Ownership check: only course instructor or admin can modify
    if (userRole !== 'admin' && course.instructor.toString() !== userId.toString()) {
      throw new AppError('Forbidden: You can only edit courses you own', 403, 'INSUFFICIENT_PERMISSION');
    }

    // Cannot modify status directly via updateCourse endpoint
    delete updateData.status;
    delete updateData.instructor;
    delete updateData.reviewHistory;

    Object.assign(course, updateData);
    await course.save();

    logger.info(`Course updated: "${course.title}" by user ${userId}`);
    return course;
  }

  /**
   * Delete course with ownership verification
   * @param {string} courseId
   * @param {string} userId
   * @param {string} userRole
   */
  async deleteCourse(courseId, userId, userRole) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found', 404, 'NOT_FOUND');
    }

    if (userRole !== 'admin' && course.instructor.toString() !== userId.toString()) {
      throw new AppError('Forbidden: You can only delete courses you own', 403, 'INSUFFICIENT_PERMISSION');
    }

    // Cascade delete lessons and modules
    await Lesson.deleteMany({ course: course._id });
    await Module.deleteMany({ course: course._id });
    await Course.findByIdAndDelete(courseId);

    logger.info(`Course deleted: "${course.title}" and cascaded curriculum`);
    return { message: 'Course and all curriculum components deleted successfully' };
  }

  /**
   * Get all courses owned by an instructor
   * @param {string} instructorId
   */
  async getInstructorCourses(instructorId) {
    const courses = await Course.find({ instructor: instructorId })
      .populate('category', 'name slug')
      .sort({ updatedAt: -1 });

    return courses;
  }

  /**
   * Submit course for content review (DRAFT -> SUBMITTED)
   * @param {string} courseId
   * @param {string} instructorId
   */
  async submitForReview(courseId, instructorId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found', 404, 'NOT_FOUND');
    }

    if (course.instructor.toString() !== instructorId.toString()) {
      throw new AppError('Forbidden: You can only submit your own courses for review', 403, 'INSUFFICIENT_PERMISSION');
    }

    if (course.status !== 'DRAFT') {
      throw new AppError(`Cannot submit course with current status '${course.status}'. Must be in DRAFT.`, 400, 'INVALID_STATUS_TRANSITION');
    }

    // Verify course has at least 1 module and 1 lesson
    const moduleCount = await Module.countDocuments({ course: courseId });
    if (moduleCount === 0) {
      throw new AppError('Cannot submit course without at least one module and lesson', 400, 'EMPTY_CURRICULUM');
    }

    course.status = 'SUBMITTED';
    await course.save();

    logger.info(`Course "${course.title}" submitted for review by instructor ${instructorId}`);
    return course;
  }

  /**
   * Publish course (APPROVED -> PUBLISHED)
   * @param {string} courseId
   * @param {string} instructorId
   * @param {string} userRole
   */
  async publishCourse(courseId, instructorId, userRole) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found', 404, 'NOT_FOUND');
    }

    if (userRole !== 'admin' && course.instructor.toString() !== instructorId.toString()) {
      throw new AppError('Forbidden: You can only publish courses you own', 403, 'INSUFFICIENT_PERMISSION');
    }

    if (course.status !== 'APPROVED') {
      throw new AppError(`Course must be in APPROVED status to publish. Current status: '${course.status}'`, 400, 'COURSE_NOT_APPROVED');
    }

    course.status = 'PUBLISHED';
    course.publishedAt = new Date();
    await course.save();

    logger.info(`Course "${course.title}" published!`);
    return course;
  }
}

export const courseService = new CourseService();
export default courseService;
