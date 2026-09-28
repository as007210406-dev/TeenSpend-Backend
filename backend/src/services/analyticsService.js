const expenseModel = require('../models/expenseModel');
const incomeModel = require('../models/incomeModel');
const budgetModel = require('../models/budgetModel');
const categoryModel = require('../models/categoryModel');
const {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateSavings,
  calculateSavingsRate,
  calculateAverageDailySpending,
  calculateAverageWeeklySpending,
  calculateAverageMonthlySpending,
  calculateCategoryBreakdown,
  calculateBudgetUsage,
  calculateSpendingTrend
} = require('../utils/calculations');
const { roundCurrency } = require('../utils/precision');

const analyticsService = {
  /**
   * Retrieves summary cards data for the current month
   */
  async getSummary(userId) {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const [expensesResult, incomeList, budgets] = await Promise.all([
      expenseModel.findAllByUser(userId, { startDate: currentMonthStart, endDate: currentMonthEnd }),
      incomeModel.findAllByUser(userId, { startDate: currentMonthStart, endDate: currentMonthEnd }),
      budgetModel.findAllByUser(userId)
    ]);

    const totalIncome = calculateTotalIncome(incomeList);
    const totalExpenses = calculateTotalExpenses(expensesResult.expenses);
    const moneySaved = calculateSavings(totalIncome, totalExpenses);
    const savingsRate = calculateSavingsRate(totalIncome, totalExpenses);

    // Find overall monthly budget (where category_id is null)
    const overallBudget = budgets.find(b => !b.category_id);
    const budgetAmount = overallBudget ? overallBudget.amount : 0;
    const remainingBudget = roundCurrency(budgetAmount - totalExpenses);

    return {
      totalIncome,
      totalExpenses,
      moneySaved,
      savingsRate,
      budgetAmount,
      remainingBudget,
      transactionCount: expensesResult.expenses.length
    };
  },

  /**
   * Category spending breakdown
   */
  async getCategoryAnalytics(userId, filters = {}) {
    const [expensesResult, categories] = await Promise.all([
      expenseModel.findAllByUser(userId, filters),
      categoryModel.findAllForUser(userId)
    ]);

    return calculateCategoryBreakdown(expensesResult.expenses, categories);
  },

  /**
   * Monthly spending comparison for the past 6 to 12 months
   */
  async getMonthlySpending(userId, monthsBack = 6) {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 1).toISOString().split('T')[0];

    const [expensesResult, incomeList] = await Promise.all([
      expenseModel.findAllByUser(userId, { startDate }),
      incomeModel.findAllByUser(userId, { startDate })
    ]);

    const months = [];
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().substring(0, 7); // YYYY-MM
      const label = d.toLocaleString('default', { month: 'short' });
      months.push({ key, label, spent: 0, income: 0 });
    }

    expensesResult.expenses.forEach(e => {
      const k = (e.expense_date || '').substring(0, 7);
      const item = months.find(m => m.key === k);
      if (item) {
        item.spent = roundCurrency(item.spent + (Number(e.amount) || 0));
      }
    });

    incomeList.forEach(inc => {
      const k = (inc.income_date || '').substring(0, 7);
      const item = months.find(m => m.key === k);
      if (item) {
        item.income = roundCurrency(item.income + (Number(inc.amount) || 0));
      }
    });

    return months;
  },

  /**
   * Spending trends across 7d, 30d, 3m, 6m, 1y
   */
  async getTrends(userId, timeframe = '30d') {
    const now = new Date();
    let startDate;
    let groupBy = 'daily';

    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0];
        groupBy = 'daily';
        break;
      case '3m':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).toISOString().split('T')[0];
        groupBy = 'daily';
        break;
      case '6m':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString().split('T')[0];
        groupBy = 'monthly';
        break;
      case '1y':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1).toISOString().split('T')[0];
        groupBy = 'monthly';
        break;
      case '30d':
      default:
        startDate = new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0];
        groupBy = 'daily';
        break;
    }

    const expensesResult = await expenseModel.findAllByUser(userId, { startDate });
    return calculateSpendingTrend(expensesResult.expenses, groupBy);
  },

  /**
   * Budget vs Actual bar chart data
   */
  async getBudgetComparison(userId) {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const [budgets, expensesResult, categories] = await Promise.all([
      budgetModel.findAllByUser(userId),
      expenseModel.findAllByUser(userId, { startDate: currentMonthStart, endDate: currentMonthEnd }),
      categoryModel.findAllForUser(userId)
    ]);

    const catMap = new Map();
    categories.forEach(c => catMap.set(c.id, c.name));

    const spentByCategory = {};
    expensesResult.expenses.forEach(e => {
      spentByCategory[e.category_id] = (spentByCategory[e.category_id] || 0) + (Number(e.amount) || 0);
    });

    return budgets
      .filter(b => b.category_id) // Category-level budgets
      .map(b => {
        const catName = catMap.get(b.category_id) || 'Category';
        const actual = roundCurrency(spentByCategory[b.category_id] || 0);
        return {
          category: catName,
          budget: roundCurrency(b.amount),
          actual,
          remaining: roundCurrency(b.amount - actual),
          percent: b.amount > 0 ? roundCurrency((actual / b.amount) * 100) : 0
        };
      });
  },

  /**
   * Deep analytics metrics for the dedicated Analytics Page
   */
  async getDeepMetrics(userId) {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const [expensesResult, incomeList, categories] = await Promise.all([
      expenseModel.findAllByUser(userId, { startDate: currentMonthStart, endDate: currentMonthEnd }),
      incomeModel.findAllByUser(userId, { startDate: currentMonthStart, endDate: currentMonthEnd }),
      categoryModel.findAllForUser(userId)
    ]);

    const expenses = expensesResult.expenses;
    const totalExpenses = calculateTotalExpenses(expenses);
    const totalIncome = calculateTotalIncome(incomeList);
    const savingsRate = calculateSavingsRate(totalIncome, totalExpenses);

    // Days elapsed so far this month
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    const avgDailySpending = calculateAverageDailySpending(totalExpenses, dayOfMonth);
    const avgWeeklySpending = calculateAverageWeeklySpending(totalExpenses, Math.max(1, Math.ceil(dayOfMonth / 7)));
    const avgMonthlySpending = calculateAverageMonthlySpending(totalExpenses, 1);

    // Most expensive transaction
    let mostExpensive = null;
    if (expenses.length > 0) {
      const sorted = [...expenses].sort((a, b) => b.amount - a.amount);
      const top = sorted[0];
      const cat = categories.find(c => c.id === top.category_id);
      mostExpensive = {
        amount: top.amount,
        description: top.description,
        date: top.expense_date,
        categoryName: cat ? cat.name : 'Unknown'
      };
    }

    // Highest spending category
    const categoryBreakdown = calculateCategoryBreakdown(expenses, categories);
    const highestCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;

    return {
      totalSpending: totalExpenses,
      totalIncome,
      savingsRate,
      averageDailySpending: avgDailySpending,
      averageWeeklySpending: avgWeeklySpending,
      averageMonthlySpending: avgMonthlySpending,
      highestSpendingCategory: highestCategory ? {
        name: highestCategory.categoryName,
        total: highestCategory.total,
        percentage: highestCategory.percentage
      } : null,
      mostExpensiveTransaction: mostExpensive,
      numberOfTransactions: expenses.length,
      daysElapsed: dayOfMonth,
      daysRemaining: daysInMonth - dayOfMonth
    };
  }
};

module.exports = analyticsService;
