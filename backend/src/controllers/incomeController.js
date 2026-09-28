const incomeService = require('../services/incomeService');
const { successResponse } = require('../utils/responseHandler');

const incomeController = {
  async getIncome(req, res, next) {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };
      const result = await incomeService.getIncome(req.user.userId, filters);
      return successResponse(res, 200, 'Income records retrieved successfully', result);
    } catch (err) {
      next(err);
    }
  },

  async createIncome(req, res, next) {
    try {
      const income = await incomeService.createIncome(req.user.userId, req.body);
      return successResponse(res, 201, 'Income record created successfully', { income });
    } catch (err) {
      next(err);
    }
  },

  async updateIncome(req, res, next) {
    try {
      const updated = await incomeService.updateIncome(req.params.id, req.user.userId, req.body);
      return successResponse(res, 200, 'Income record updated successfully', { income: updated });
    } catch (err) {
      next(err);
    }
  },

  async deleteIncome(req, res, next) {
    try {
      await incomeService.deleteIncome(req.params.id, req.user.userId);
      return successResponse(res, 200, 'Income record deleted successfully');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = incomeController;
