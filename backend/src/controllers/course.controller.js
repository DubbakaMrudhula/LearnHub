import courseService from '../services/course.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const getCourses = async (req, res, next) => {
  try {
    const result = await courseService.getCourses(
      req.query,
      req.user?._id,
      req.user?.role
    );
    return successResponse(res, 'Courses retrieved successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

export const getCourse = async (req, res, next) => {
  try {
    const result = await courseService.getCourseByIdOrSlug(req.params.idOrSlug);
    return successResponse(res, 'Course retrieved successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

export const createCourse = async (req, res, next) => {
  try {
    const course = await courseService.createCourse(req.user._id, req.body);
    return successResponse(res, 'Course created successfully in DRAFT status', { course }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const course = await courseService.updateCourse(
      req.params.id,
      req.user._id,
      req.user.role,
      req.body
    );
    return successResponse(res, 'Course updated successfully', { course }, 200);
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const result = await courseService.deleteCourse(
      req.params.id,
      req.user._id,
      req.user.role
    );
    return successResponse(res, result.message, null, 200);
  } catch (error) {
    next(error);
  }
};

export const getInstructorCourses = async (req, res, next) => {
  try {
    const courses = await courseService.getInstructorCourses(req.user._id);
    return successResponse(res, 'Instructor courses retrieved', { courses }, 200);
  } catch (error) {
    next(error);
  }
};

export const submitCourseForReview = async (req, res, next) => {
  try {
    const course = await courseService.submitForReview(req.params.id, req.user._id);
    return successResponse(res, 'Course submitted for review successfully', { course }, 200);
  } catch (error) {
    next(error);
  }
};

export const publishCourse = async (req, res, next) => {
  try {
    const course = await courseService.publishCourse(req.params.id, req.user._id, req.user.role);
    return successResponse(res, 'Course published successfully', { course }, 200);
  } catch (error) {
    next(error);
  }
};
