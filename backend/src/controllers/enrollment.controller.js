import enrollmentService from '../services/enrollment.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const enroll = async (req, res, next) => {
  try {
    const enrollment = await enrollmentService.enroll(req.user._id, req.params.courseId);
    return successResponse(res, 'Successfully enrolled in course', { enrollment }, 201);
  } catch (error) {
    next(error);
  }
};

export const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await enrollmentService.getMyEnrollments(req.user._id);
    return successResponse(res, 'Enrolled courses retrieved', { enrollments }, 200);
  } catch (error) {
    next(error);
  }
};

export const markLessonComplete = async (req, res, next) => {
  try {
    const result = await enrollmentService.markLessonComplete(
      req.user._id,
      req.params.courseId,
      req.params.lessonId
    );
    return successResponse(res, 'Lesson marked complete and progress updated', result, 200);
  } catch (error) {
    next(error);
  }
};

export const checkEnrollment = async (req, res, next) => {
  try {
    const isEnrolled = await enrollmentService.checkEnrollment(req.user._id, req.params.courseId);
    return successResponse(res, 'Enrollment status checked', { isEnrolled }, 200);
  } catch (error) {
    next(error);
  }
};
