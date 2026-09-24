import mentorshipService from '../services/mentorship.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const getMentors = async (req, res, next) => {
  try {
    const mentors = await mentorshipService.getMentors();
    return successResponse(res, 'Mentors retrieved successfully', { mentors }, 200);
  } catch (error) {
    next(error);
  }
};

export const bookSession = async (req, res, next) => {
  try {
    const session = await mentorshipService.bookSession(req.user._id, req.body);
    return successResponse(res, 'Mentorship session scheduled successfully', { session }, 201);
  } catch (error) {
    next(error);
  }
};

export const getMentorSessions = async (req, res, next) => {
  try {
    const sessions = await mentorshipService.getMentorSessions(req.user._id);
    return successResponse(res, 'Mentor sessions retrieved', { sessions }, 200);
  } catch (error) {
    next(error);
  }
};

export const getStudentSessions = async (req, res, next) => {
  try {
    const sessions = await mentorshipService.getStudentSessions(req.user._id);
    return successResponse(res, 'Student mentorship sessions retrieved', { sessions }, 200);
  } catch (error) {
    next(error);
  }
};

export const completeSession = async (req, res, next) => {
  try {
    const session = await mentorshipService.completeSession(
      req.params.sessionId,
      req.user._id,
      req.user.role,
      req.body
    );
    return successResponse(res, 'Session notes recorded and completed', { session }, 200);
  } catch (error) {
    next(error);
  }
};

export const inspectLearnerProgress = async (req, res, next) => {
  try {
    const result = await mentorshipService.inspectLearnerProgress(
      req.user._id,
      req.params.studentId
    );
    return successResponse(res, 'Learner diagnostic progress retrieved', result, 200);
  } catch (error) {
    next(error);
  }
};
