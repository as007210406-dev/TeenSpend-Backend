const analyticsService = require('../services/analyticsService');
const { successResponse } = require('../utils/responseHandler');

const analyticsController = {
  async getSummary(req, res, next) {
    try {
      const summary = await analyticsService.getSummary(req.user.userId);
      return successResponse(res, 200, 'Financial summary retrieved', { summary });
    } catch (err) {
      next(err);
    }
  },

  async getCategoryBreakdown(req, res, next) {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };
      const breakdown = await analyticsService.getCategoryAnalytics(req.user.userId, filters);
      return successResponse(res, 200, 'Category spending breakdown retrieved', { breakdown });
    } catch (err) {
      next(err);
    }
  },

  async getMonthlySpending(req, res, next) {
    try {
      const months = req.query.months ? parseInt(req.query.months, 10) : 6;
      const data = await analyticsService.getMonthlySpending(req.user.userId, months);
      return successResponse(res, 200, 'Monthly spending history retrieved', { history: data });
    } catch (err) {
      next(err);
    }
  },

  async getSpendingTrends(req, res, next) {
    try {
      const timeframe = req.query.timeframe || '30d';
      const trends = await analyticsService.getTrends(req.user.userId, timeframe);
      return successResponse(res, 200, 'Spending trends retrieved', { trends });
    } catch (err) {
      next(err);
    }
  },

  async getBudgetComparison(req, res, next) {
    try {
      const comparison = await analyticsService.getBudgetComparison(req.user.userId);
      return successResponse(res, 200, 'Budget vs actual comparison retrieved', { comparison });
    } catch (err) {
      next(err);
    }
  },

  async getDeepMetrics(req, res, next) {
    try {
      const metrics = await analyticsService.getDeepMetrics(req.user.userId);
      return successResponse(res, 200, 'Deep analytics metrics retrieved', { metrics });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = analyticsController;
