import Module from '../models/Module.js';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import { successResponse } from '../utils/apiResponse.js';
import { AppError } from '../middleware/errorHandler.js';

export const createModule = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, description, orderIndex } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found', 404, 'NOT_FOUND');
    }

    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
      throw new AppError('Forbidden: You can only add modules to your own courses', 403, 'INSUFFICIENT_PERMISSION');
    }

    const count = await Module.countDocuments({ course: courseId });
    const module = await Module.create({
      course: courseId,
      title,
      description: description || '',
      orderIndex: orderIndex !== undefined ? orderIndex : count
    });

    return successResponse(res, 'Module created successfully', { module }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateModule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const module = await Module.findById(id).populate('course');
    if (!module) {
      throw new AppError('Module not found', 404, 'NOT_FOUND');
    }

    if (req.user.role !== 'admin' && module.course.instructor.toString() !== req.user._id.toString()) {
      throw new AppError('Forbidden: You can only update modules in your own courses', 403, 'INSUFFICIENT_PERMISSION');
    }

    const { title, description, orderIndex } = req.body;
    if (title) module.title = title;
    if (description !== undefined) module.description = description;
    if (orderIndex !== undefined) module.orderIndex = orderIndex;

    await module.save();
    return successResponse(res, 'Module updated successfully', { module }, 200);
  } catch (error) {
    next(error);
  }
};

export const deleteModule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const module = await Module.findById(id).populate('course');
    if (!module) {
      throw new AppError('Module not found', 404, 'NOT_FOUND');
    }

    if (req.user.role !== 'admin' && module.course.instructor.toString() !== req.user._id.toString()) {
      throw new AppError('Forbidden: You can only delete modules from your own courses', 403, 'INSUFFICIENT_PERMISSION');
    }

    // Cascade delete lessons in this module
    await Lesson.deleteMany({ module: module._id });
    await Module.findByIdAndDelete(id);

    return successResponse(res, 'Module and nested lessons deleted successfully', null, 200);
  } catch (error) {
    next(error);
  }
};
