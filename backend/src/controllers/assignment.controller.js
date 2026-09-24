import assignmentService from '../services/assignment.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const createAssignment = async (req, res, next) => {
  try {
    const assignment = await assignmentService.createAssignment(
      req.user._id,
      req.user.role,
      req.body
    );
    return successResponse(res, 'Assignment created successfully', { assignment }, 201);
  } catch (error) {
    next(error);
  }
};

export const getFeaturedAssignment = async (req, res, next) => {
  try {
    const assignment = await assignmentService.getFeaturedAssignment();
    return successResponse(res, 'Featured assignment retrieved', { assignment }, 200);
  } catch (error) {
    next(error);
  }
};

export const getCourseAssignments = async (req, res, next) => {
  try {
    const assignments = await assignmentService.getCourseAssignments(req.params.courseId);
    return successResponse(res, 'Course assignments retrieved', { assignments }, 200);
  } catch (error) {
    next(error);
  }
};

export const submitAssignment = async (req, res, next) => {
  try {
    const submission = await assignmentService.submitAssignment(
      req.params.assignmentId,
      req.user._id,
      req.body
    );
    return successResponse(res, 'Assignment submitted successfully', { submission }, 200);
  } catch (error) {
    next(error);
  }
};

export const gradeSubmission = async (req, res, next) => {
  try {
    const { grade, feedback } = req.body;
    const submission = await assignmentService.gradeSubmission(
      req.params.submissionId,
      req.user._id,
      req.user.role,
      grade,
      feedback
    );
    return successResponse(res, 'Submission graded successfully', { submission }, 200);
  } catch (error) {
    next(error);
  }
};

export const getAssignmentSubmissions = async (req, res, next) => {
  try {
    const submissions = await assignmentService.getAssignmentSubmissions(
      req.params.assignmentId,
      req.user._id,
      req.user.role
    );
    return successResponse(res, 'Submissions retrieved', { submissions }, 200);
  } catch (error) {
    next(error);
  }
};

export const getMySubmission = async (req, res, next) => {
  try {
    const submission = await assignmentService.getMySubmission(
      req.params.assignmentId,
      req.user._id
    );
    return successResponse(res, 'My submission retrieved', { submission }, 200);
  } catch (error) {
    next(error);
  }
};
