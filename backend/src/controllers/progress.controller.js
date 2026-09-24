import progressService from '../services/progress.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const getCourseProgress = async (req, res, next) => {
  try {
    const progress = await progressService.calculateCourseProgress(
      req.user._id,
      req.params.courseId
    );
    return successResponse(res, 'Course progress calculated', progress, 200);
  } catch (error) {
    next(error);
  }
};

export const getStudentDashboard = async (req, res, next) => {
  try {
    const dashboard = await progressService.getStudentDashboard(req.user._id);
    return successResponse(res, 'Student learning dashboard metrics retrieved', dashboard, 200);
  } catch (error) {
    next(error);
  }
};

export const checkCertificateEligibility = async (req, res, next) => {
  try {
    const eligibility = await progressService.checkCertificateEligibility(
      req.user._id,
      req.params.courseId
    );
    return successResponse(res, 'Certificate eligibility checked', eligibility, 200);
  } catch (error) {
    next(error);
  }
};
