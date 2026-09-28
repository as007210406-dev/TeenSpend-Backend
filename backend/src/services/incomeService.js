const incomeModel = require('../models/incomeModel');
const { roundCurrency } = require('../utils/precision');

const incomeService = {
  async getIncome(userId, filters) {
    const incomeList = await incomeModel.findAllByUser(userId, filters);
    const totalIncome = incomeList.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    return {
      income: incomeList,
      totalIncome: roundCurrency(totalIncome)
    };
  },

  async createIncome(userId, incomeData) {
    if (!incomeData.source || !incomeData.source.trim()) {
      const err = new Error('Income source is required');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    if (!incomeData.amount || Number(incomeData.amount) <= 0) {
      const err = new Error('Income amount must be greater than zero');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    return incomeModel.create(userId, incomeData);
  },

  async updateIncome(id, userId, updates) {
    const existing = await incomeModel.findById(id, userId);
    if (!existing) {
      const err = new Error('Income record not found or unauthorized');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    return incomeModel.update(id, userId, updates);
  },

  async deleteIncome(id, userId) {
    const existing = await incomeModel.findById(id, userId);
    if (!existing) {
      const err = new Error('Income record not found or unauthorized');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    return incomeModel.delete(id, userId);
  }
};

module.exports = incomeService;
