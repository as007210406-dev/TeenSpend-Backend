const categoryService = require('../services/categoryService');
const { successResponse } = require('../utils/responseHandler');

const categoryController = {
  async getCategories(req, res, next) {
    try {
      const categories = await categoryService.getAllCategories(req.user.userId);
      return successResponse(res, 200, 'Categories retrieved successfully', { categories });
    } catch (err) {
      next(err);
    }
  },

  async createCategory(req, res, next) {
    try {
      const category = await categoryService.createCategory(req.user.userId, req.body);
      return successResponse(res, 201, 'Category created successfully', { category });
    } catch (err) {
      next(err);
    }
  },

  async updateCategory(req, res, next) {
    try {
      const updated = await categoryService.updateCategory(req.params.id, req.user.userId, req.body);
      return successResponse(res, 200, 'Category updated successfully', { category: updated });
    } catch (err) {
      next(err);
    }
  },

  async deleteCategory(req, res, next) {
    try {
      await categoryService.deleteCategory(req.params.id, req.user.userId);
      return successResponse(res, 200, 'Category deleted successfully');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = categoryController;
