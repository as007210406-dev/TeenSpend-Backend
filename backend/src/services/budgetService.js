const budgetModel = require('../models/budgetModel');
const expenseModel = require('../models/expenseModel');
const categoryModel = require('../models/categoryModel');
const { calculateBudgetUsage } = require('../utils/calculations');
const { roundCurrency } = require('../utils/precision');

const budgetService = {
  async getBudgetsWithProgress(userId) {
    // Current month date boundaries
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const [budgets, expensesResult, categories] = await Promise.all([
      budgetModel.findAllByUser(userId),
      expenseModel.findAllByUser(userId, { startDate: currentMonthStart, endDate: currentMonthEnd }),
      categoryModel.findAllForUser(userId)
    ]);

    const catMap = new Map();
    categories.forEach(c => catMap.set(c.id, c));

    // Calculate total expenses for the month
    const expenses = expensesResult.expenses || [];
    const totalMonthSpent = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    // Group expenses by category for category budgets
    const spentByCategory = {};
    expenses.forEach(e => {
      spentByCategory[e.category_id] = (spentByCategory[e.category_id] || 0) + (Number(e.amount) || 0);
    });

    const enrichedBudgets = budgets.map(b => {
      let actualSpent = 0;
      let category = null;

      if (b.category_id) {
        actualSpent = spentByCategory[b.category_id] || 0;
        const cat = catMap.get(b.category_id);
        if (cat) {
          category = {
            id: cat.id,
            name: cat.name,
            icon: cat.icon,
            color: cat.color
          };
        }
      } else {
        // Overall monthly budget
        actualSpent = totalMonthSpent;
      }

      const usage = calculateBudgetUsage(b.amount, actualSpent);

      return {
        ...b,
        category,
        isOverallBudget: !b.category_id,
        spent: usage.spent,
        remaining: usage.remaining,
        percentUsed: usage.percentUsed,
        status: usage.status // 'healthy' | 'warning' | 'danger'
      };
    });

    // Overall summary
    const overallBudgetRecord = enrichedBudgets.find(b => b.isOverallBudget);
    const overallBudgetAmount = overallBudgetRecord ? overallBudgetRecord.amount : 0;
    const overallUsage = calculateBudgetUsage(overallBudgetAmount, totalMonthSpent);

    return {
      budgets: enrichedBudgets,
      summary: {
        totalBudget: overallBudgetAmount,
        totalSpent: roundCurrency(totalMonthSpent),
        remainingBudget: overallUsage.remaining,
        percentUsed: overallUsage.percentUsed,
        status: overallUsage.status
      }
    };
  },

  async createBudget(userId, budgetData) {
    if (!budgetData.amount || Number(budgetData.amount) <= 0) {
      const err = new Error('Budget amount must be a positive number');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    return budgetModel.create(userId, budgetData);
  },

  async updateBudget(id, userId, updates) {
    const existing = await budgetModel.findById(id, userId);
    if (!existing) {
      const err = new Error('Budget not found or unauthorized');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    return budgetModel.update(id, userId, updates);
  },

  async deleteBudget(id, userId) {
    const existing = await budgetModel.findById(id, userId);
    if (!existing) {
      const err = new Error('Budget not found or unauthorized');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    return budgetModel.delete(id, userId);
  }
};

module.exports = budgetService;
