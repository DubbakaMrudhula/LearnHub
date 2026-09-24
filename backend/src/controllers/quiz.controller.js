import quizService from '../services/quiz.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const createQuiz = async (req, res, next) => {
  try {
    const quiz = await quizService.createQuiz(req.user._id, req.user.role, req.body);
    return successResponse(res, 'Quiz created successfully', { quiz }, 201);
  } catch (error) {
    next(error);
  }
};

export const getFeaturedQuiz = async (req, res, next) => {
  try {
    const quiz = await quizService.getFeaturedQuiz();
    return successResponse(res, 'Featured quiz retrieved', { quiz }, 200);
  } catch (error) {
    next(error);
  }
};

export const addQuestion = async (req, res, next) => {
  try {
    const question = await quizService.addQuestion(
      req.params.quizId,
      req.user._id,
      req.user.role,
      req.body
    );
    return successResponse(res, 'Question added to quiz successfully', { question }, 201);
  } catch (error) {
    next(error);
  }
};

export const getCourseQuizzes = async (req, res, next) => {
  try {
    const quizzes = await quizService.getCourseQuizzes(req.params.courseId);
    return successResponse(res, 'Course quizzes retrieved', { quizzes }, 200);
  } catch (error) {
    next(error);
  }
};

export const getQuizForAttempt = async (req, res, next) => {
  try {
    const result = await quizService.getQuizForAttempt(
      req.params.quizId,
      req.user._id,
      req.user.role
    );
    return successResponse(res, 'Quiz ready for attempt', result, 200);
  } catch (error) {
    next(error);
  }
};

export const submitQuizAttempt = async (req, res, next) => {
  try {
    const result = await quizService.submitQuizAttempt(
      req.params.quizId,
      req.user._id,
      req.body.answers || []
    );
    return successResponse(res, 'Quiz submitted and auto-scored successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

export const getAttemptReview = async (req, res, next) => {
  try {
    const attempt = await quizService.getAttemptReview(
      req.params.attemptId,
      req.user._id,
      req.user.role
    );
    return successResponse(res, 'Quiz attempt review retrieved', { attempt }, 200);
  } catch (error) {
    next(error);
  }
};
