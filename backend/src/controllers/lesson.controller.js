import Lesson from '../models/Lesson.js';
import Module from '../models/Module.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { successResponse } from '../utils/apiResponse.js';
import { AppError } from '../middleware/errorHandler.js';

export const createLesson = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const { title, type, content, videoUrl, resourceUrls, durationMinutes, isFreePreview, orderIndex } = req.body;

    const module = await Module.findById(moduleId).populate('course');
    if (!module) {
      throw new AppError('Module not found', 404, 'NOT_FOUND');
    }

    if (req.user.role !== 'admin' && module.course.instructor.toString() !== req.user._id.toString()) {
      throw new AppError('Forbidden: You can only add lessons to your own courses', 403, 'INSUFFICIENT_PERMISSION');
    }

    const count = await Lesson.countDocuments({ module: moduleId });
    const lesson = await Lesson.create({
      module: moduleId,
      course: module.course._id,
      title,
      type: type || 'reading',
      content: content || '',
      videoUrl: videoUrl || '',
      resourceUrls: Array.isArray(resourceUrls) ? resourceUrls : [],
      durationMinutes: durationMinutes || 10,
      isFreePreview: !!isFreePreview,
      orderIndex: orderIndex !== undefined ? orderIndex : count
    });

    return successResponse(res, 'Lesson created successfully', { lesson }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lesson = await Lesson.findById(id).populate('course');
    if (!lesson) {
      throw new AppError('Lesson not found', 404, 'NOT_FOUND');
    }

    if (req.user.role !== 'admin' && lesson.course.instructor.toString() !== req.user._id.toString()) {
      throw new AppError('Forbidden: You can only update lessons in your own courses', 403, 'INSUFFICIENT_PERMISSION');
    }

    Object.assign(lesson, req.body);
    await lesson.save();

    return successResponse(res, 'Lesson updated successfully', { lesson }, 200);
  } catch (error) {
    next(error);
  }
};

export const deleteLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lesson = await Lesson.findById(id).populate('course');
    if (!lesson) {
      throw new AppError('Lesson not found', 404, 'NOT_FOUND');
    }

    if (req.user.role !== 'admin' && lesson.course.instructor.toString() !== req.user._id.toString()) {
      throw new AppError('Forbidden: You can only delete lessons from your own courses', 403, 'INSUFFICIENT_PERMISSION');
    }

    await Lesson.findByIdAndDelete(id);
    return successResponse(res, 'Lesson deleted successfully', null, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Access individual lesson content with authorization check
 */
export const getLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lesson = await Lesson.findById(id).populate('course');
    if (!lesson) {
      throw new AppError('Lesson not found', 404, 'NOT_FOUND');
    }

    // Free preview is accessible to anyone
    if (lesson.isFreePreview) {
      return successResponse(res, 'Lesson content retrieved', { lesson }, 200);
    }

    // Authenticated check
    if (!req.user) {
      throw new AppError('Please sign in to view this lesson', 401, 'NOT_AUTHENTICATED');
    }

    // Admin or Reviewer can inspect all lessons
    if (req.user.role === 'admin' || req.user.role === 'reviewer') {
      return successResponse(res, 'Lesson content retrieved', { lesson }, 200);
    }

    // Course instructor can inspect their own lessons
    if (lesson.course.instructor.toString() === req.user._id.toString()) {
      return successResponse(res, 'Lesson content retrieved', { lesson }, 200);
    }

    // Student must be enrolled
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: lesson.course._id
    });

    if (!enrollment) {
      throw new AppError('Forbidden: You must enroll in this course to access full lesson contents', 403, 'ENROLLMENT_REQUIRED');
    }

    return successResponse(res, 'Lesson content retrieved', { lesson }, 200);
  } catch (error) {
    next(error);
  }
};
