import aiService from '../services/ai.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const getLearningPath = async (req, res, next) => {
  try {
    const path = await aiService.getOrGeneratePath(req.user._id);
    return successResponse(res, 'AI learning path retrieved', { path }, 200);
  } catch (error) {
    next(error);
  }
};

export const regenerateLearningPath = async (req, res, next) => {
  try {
    const path = await aiService.generatePersonalizedPath(req.user._id);
    return successResponse(res, 'AI learning path regenerated', { path }, 200);
  } catch (error) {
    next(error);
  }
};
