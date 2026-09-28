const categoryModel = require('../models/categoryModel');

const categoryService = {
  async getAllCategories(userId) {
    return categoryModel.findAllForUser(userId);
  },

  async createCategory(userId, categoryData) {
    if (!categoryData.name || !categoryData.name.trim()) {
      const err = new Error('Category name is required');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    return categoryModel.create(userId, categoryData);
  },

  async updateCategory(id, userId, updates) {
    const category = await categoryModel.findById(id);
    if (!category) {
      const err = new Error('Category not found');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    if (category.is_default) {
      const err = new Error('Default categories cannot be modified');
      err.statusCode = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }
    return categoryModel.update(id, userId, updates);
  },

  async deleteCategory(id, userId) {
    const category = await categoryModel.findById(id);
    if (!category) {
      const err = new Error('Category not found');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    if (category.is_default) {
      const err = new Error('Default categories cannot be deleted');
      err.statusCode = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }
    return categoryModel.delete(id, userId);
  }
};

module.exports = categoryService;
