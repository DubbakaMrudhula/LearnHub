import Category from '../models/Category.js';
import { successResponse } from '../utils/apiResponse.js';
import { AppError } from '../middleware/errorHandler.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    return successResponse(res, 'Categories retrieved successfully', { categories }, 200);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon } = req.body;
    const existing = await Category.findOne({ name });
    if (existing) {
      throw new AppError('Category already exists', 409, 'DUPLICATE_CATEGORY');
    }

    const category = await Category.create({ name, description, icon });
    return successResponse(res, 'Category created successfully', { category }, 201);
  } catch (error) {
    next(error);
  }
};
