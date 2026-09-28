const budgetService = require('../services/budgetService');
const { successResponse } = require('../utils/responseHandler');

const budgetController = {
  async getBudgets(req, res, next) {
    try {
      const result = await budgetService.getBudgetsWithProgress(req.user.userId);
      return successResponse(res, 200, 'Budgets retrieved successfully', result);
    } catch (err) {
      next(err);
    }
  },

  async createBudget(req, res, next) {
    try {
      const budget = await budgetService.createBudget(req.user.userId, req.body);
      return successResponse(res, 201, 'Budget created successfully', { budget });
    } catch (err) {
      next(err);
    }
  },

  async updateBudget(req, res, next) {
    try {
      const updated = await budgetService.updateBudget(req.params.id, req.user.userId, req.body);
      return successResponse(res, 200, 'Budget updated successfully', { budget: updated });
    } catch (err) {
      next(err);
    }
  },

  async deleteBudget(req, res, next) {
    try {
      await budgetService.deleteBudget(req.params.id, req.user.userId);
      return successResponse(res, 200, 'Budget deleted successfully');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = budgetController;
