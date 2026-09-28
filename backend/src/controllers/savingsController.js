const savingsService = require('../services/savingsService');
const { successResponse } = require('../utils/responseHandler');

const savingsController = {
  async getGoals(req, res, next) {
    try {
      const result = await savingsService.getSavingsGoals(req.user.userId);
      return successResponse(res, 200, 'Savings goals retrieved successfully', result);
    } catch (err) {
      next(err);
    }
  },

  async createGoal(req, res, next) {
    try {
      const goal = await savingsService.createGoal(req.user.userId, req.body);
      return successResponse(res, 201, 'Savings goal created successfully', { goal });
    } catch (err) {
      next(err);
    }
  },

  async updateGoal(req, res, next) {
    try {
      const updated = await savingsService.updateGoal(req.params.id, req.user.userId, req.body);
      return successResponse(res, 200, 'Savings goal updated successfully', { goal: updated });
    } catch (err) {
      next(err);
    }
  },

  async contribute(req, res, next) {
    try {
      const { amount } = req.body;
      const updated = await savingsService.contributeToGoal(req.params.id, req.user.userId, amount);
      return successResponse(res, 200, 'Contribution recorded successfully', { goal: updated });
    } catch (err) {
      next(err);
    }
  },

  async deleteGoal(req, res, next) {
    try {
      await savingsService.deleteGoal(req.params.id, req.user.userId);
      return successResponse(res, 200, 'Savings goal deleted successfully');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = savingsController;
