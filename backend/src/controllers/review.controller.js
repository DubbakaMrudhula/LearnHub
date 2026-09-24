import reviewService from '../services/review.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const getPendingReviews = async (req, res, next) => {
  try {
    const courses = await reviewService.getPendingReviews();
    return successResponse(res, 'Pending reviews retrieved', { courses }, 200);
  } catch (error) {
    next(error);
  }
};

export const startReview = async (req, res, next) => {
  try {
    const course = await reviewService.startReview(req.params.courseId, req.user._id);
    return successResponse(res, 'Review started', { course }, 200);
  } catch (error) {
    next(error);
  }
};

export const submitDecision = async (req, res, next) => {
  try {
    const { action, comments } = req.body;
    const course = await reviewService.submitDecision(
      req.params.courseId,
      req.user._id,
      action,
      comments
    );
    return successResponse(res, `Review decision '${action}' recorded`, { course }, 200);
  } catch (error) {
    next(error);
  }
};

export const inspectCourse = async (req, res, next) => {
  try {
    const result = await reviewService.inspectCourse(req.params.courseId);
    return successResponse(res, 'Course inspection details retrieved', result, 200);
  } catch (error) {
    next(error);
  }
};
