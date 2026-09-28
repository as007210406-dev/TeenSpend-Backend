const expenseService = require('../services/expenseService');
const { successResponse } = require('../utils/responseHandler');

const expenseController = {
  async getExpenses(req, res, next) {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        categoryId: req.query.categoryId,
        paymentMethod: req.query.paymentMethod,
        search: req.query.search,
        sortBy: req.query.sortBy,
        page: req.query.page,
        limit: req.query.limit
      };
      const result = await expenseService.getExpenses(req.user.userId, filters);
      return successResponse(res, 200, 'Expenses retrieved successfully', result);
    } catch (err) {
      next(err);
    }
  },

  async getExpenseById(req, res, next) {
    try {
      const expense = await expenseService.getExpenseById(req.params.id, req.user.userId);
      return successResponse(res, 200, 'Expense details retrieved', { expense });
    } catch (err) {
      next(err);
    }
  },

  async createExpense(req, res, next) {
    try {
      const expense = await expenseService.createExpense(req.user.userId, req.body);
      return successResponse(res, 201, 'Expense created successfully', { expense });
    } catch (err) {
      next(err);
    }
  },

  async updateExpense(req, res, next) {
    try {
      const updated = await expenseService.updateExpense(req.params.id, req.user.userId, req.body);
      return successResponse(res, 200, 'Expense updated successfully', { expense: updated });
    } catch (err) {
      next(err);
    }
  },

  async deleteExpense(req, res, next) {
    try {
      await expenseService.deleteExpense(req.params.id, req.user.userId);
      return successResponse(res, 200, 'Expense deleted successfully');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = expenseController;
