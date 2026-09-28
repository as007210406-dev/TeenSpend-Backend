const savingsModel = require('../models/savingsModel');
const { roundCurrency } = require('../utils/precision');

const savingsService = {
  async getSavingsGoals(userId) {
    const goals = await savingsModel.findAllByUser(userId);

    let totalSaved = 0;
    let totalTarget = 0;

    const enrichedGoals = goals.map(g => {
      const target = Number(g.target_amount) || 0;
      const current = Number(g.current_amount) || 0;
      totalSaved += current;
      totalTarget += target;

      const progress = target > 0 ? roundCurrency(Math.min(100, (current / target) * 100)) : 0;
      const remaining = roundCurrency(Math.max(0, target - current));
      const isCompleted = current >= target;

      return {
        ...g,
        progress,
        remaining,
        isCompleted
      };
    });

    return {
      goals: enrichedGoals,
      summary: {
        totalSaved: roundCurrency(totalSaved),
        totalTarget: roundCurrency(totalTarget),
        overallProgress: totalTarget > 0 ? roundCurrency((totalSaved / totalTarget) * 100) : 0,
        completedCount: enrichedGoals.filter(g => g.isCompleted).length,
        activeCount: enrichedGoals.filter(g => !g.isCompleted).length
      }
    };
  },

  async createGoal(userId, goalData) {
    if (!goalData.name || !goalData.name.trim()) {
      const err = new Error('Goal name is required');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    if (!goalData.target_amount || Number(goalData.target_amount) <= 0) {
      const err = new Error('Target amount must be greater than zero');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    return savingsModel.create(userId, goalData);
  },

  async updateGoal(id, userId, updates) {
    const existing = await savingsModel.findById(id, userId);
    if (!existing) {
      const err = new Error('Savings goal not found or unauthorized');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    return savingsModel.update(id, userId, updates);
  },

  async contributeToGoal(id, userId, contributionAmount) {
    const amount = Number(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      const err = new Error('Contribution amount must be greater than zero');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    const existing = await savingsModel.findById(id, userId);
    if (!existing) {
      const err = new Error('Savings goal not found or unauthorized');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    return savingsModel.contribute(id, userId, amount);
  },

  async deleteGoal(id, userId) {
    const existing = await savingsModel.findById(id, userId);
    if (!existing) {
      const err = new Error('Savings goal not found or unauthorized');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    return savingsModel.delete(id, userId);
  }
};

module.exports = savingsService;
