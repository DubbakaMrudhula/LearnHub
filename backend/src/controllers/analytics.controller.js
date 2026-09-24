import analyticsService from '../services/analytics.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const getAdminAnalytics = async (req, res, next) => {
  try {
    const analytics = await analyticsService.getAdminAnalytics();
    return successResponse(res, 'Admin platform analytics retrieved', analytics, 200);
  } catch (error) {
    next(error);
  }
};

export const getInstructorAnalytics = async (req, res, next) => {
  try {
    const analytics = await analyticsService.getInstructorAnalytics(req.user._id);
    return successResponse(res, 'Instructor analytics retrieved', analytics, 200);
  } catch (error) {
    next(error);
  }
};

export const getReviewerAnalytics = async (req, res, next) => {
  try {
    const analytics = await analyticsService.getReviewerAnalytics();
    return successResponse(res, 'Reviewer queue analytics retrieved', analytics, 200);
  } catch (error) {
    next(error);
  }
};
