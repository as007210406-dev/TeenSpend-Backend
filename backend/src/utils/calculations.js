/**
 * Centralized Financial Calculations Utility
 * Pure functions with zero side-effects for robust analytics and testing.
 */
const { roundCurrency } = require('./precision');

/**
 * Calculates sum of income entries
 * @param {Array<{ amount: number }>} incomeList 
 * @returns {number}
 */
const calculateTotalIncome = (incomeList = []) => {
  if (!Array.isArray(incomeList)) return 0;
  const total = incomeList.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  return roundCurrency(total);
};

/**
 * Calculates sum of expense entries
 * @param {Array<{ amount: number }>} expenseList 
 * @returns {number}
 */
const calculateTotalExpenses = (expenseList = []) => {
  if (!Array.isArray(expenseList)) return 0;
  const total = expenseList.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  return roundCurrency(total);
};

/**
 * Calculates net savings (Total Income - Total Expenses)
 * @param {number} totalIncome 
 * @param {number} totalExpenses 
 * @returns {number}
 */
const calculateSavings = (totalIncome = 0, totalExpenses = 0) => {
  return roundCurrency((Number(totalIncome) || 0) - (Number(totalExpenses) || 0));
};

/**
 * Calculates savings rate percentage: (Savings / Total Income) * 100
 * @param {number} totalIncome 
 * @param {number} totalExpenses 
 * @returns {number} Percentage between 0 and 100
 */
const calculateSavingsRate = (totalIncome = 0, totalExpenses = 0) => {
  const income = Number(totalIncome) || 0;
  const expenses = Number(totalExpenses) || 0;
  if (income <= 0) return 0;
  const saved = income - expenses;
  if (saved <= 0) return 0;
  const rate = (saved / income) * 100;
  return roundCurrency(rate);
};

/**
 * Calculates average daily spending across a given number of days
 * @param {number} totalExpenses 
 * @param {number} daysCount 
 * @returns {number}
 */
const calculateAverageDailySpending = (totalExpenses = 0, daysCount = 30) => {
  const days = Math.max(1, Number(daysCount) || 1);
  return roundCurrency((Number(totalExpenses) || 0) / days);
};

/**
 * Calculates average weekly spending across a given number of weeks
 * @param {number} totalExpenses 
 * @param {number} weeksCount 
 * @returns {number}
 */
const calculateAverageWeeklySpending = (totalExpenses = 0, weeksCount = 4) => {
  const weeks = Math.max(1, Number(weeksCount) || 1);
  return roundCurrency((Number(totalExpenses) || 0) / weeks);
};

/**
 * Calculates average monthly spending
 * @param {number} totalExpenses 
 * @param {number} monthsCount 
 * @returns {number}
 */
const calculateAverageMonthlySpending = (totalExpenses = 0, monthsCount = 1) => {
  const months = Math.max(1, Number(monthsCount) || 1);
  return roundCurrency((Number(totalExpenses) || 0) / months);
};

/**
 * Aggregates expenses by category, calculating category totals and percentage of total expenses
 * @param {Array<{ amount: number, category_id: string, category_name?: string }>} expenses 
 * @param {Array<{ id: string, name: string, color?: string, icon?: string }>} categories 
 * @returns {Array<{ categoryId: string, categoryName: string, color: string, icon: string, total: number, percentage: number }>}
 */
const calculateCategoryBreakdown = (expenses = [], categories = []) => {
  if (!Array.isArray(expenses)) return [];
  const catMap = new Map();

  categories.forEach(c => {
    catMap.set(c.id, {
      name: c.name,
      color: c.color || '#6366F1',
      icon: c.icon || 'Tag'
    });
  });

  const totalsByCat = {};
  let overallSum = 0;

  expenses.forEach(exp => {
    const amt = Number(exp.amount) || 0;
    overallSum += amt;
    const catId = exp.category_id || 'other';
    totalsByCat[catId] = (totalsByCat[catId] || 0) + amt;
  });

  const result = Object.keys(totalsByCat).map(catId => {
    const meta = catMap.get(catId) || { name: 'Other', color: '#64748B', icon: 'MoreHorizontal' };
    const total = roundCurrency(totalsByCat[catId]);
    const percentage = overallSum > 0 ? roundCurrency((total / overallSum) * 100) : 0;
    return {
      categoryId: catId,
      categoryName: meta.name,
      color: meta.color,
      icon: meta.icon,
      total,
      percentage
    };
  });

  // Sort descending by highest total spending
  return result.sort((a, b) => b.total - a.total);
};

/**
 * Calculates budget usage comparison
 * @param {number} budgetAmount 
 * @param {number} actualSpent 
 * @returns {{ budget: number, spent: number, remaining: number, percentUsed: number, status: 'healthy' | 'warning' | 'danger' }}
 */
const calculateBudgetUsage = (budgetAmount = 0, actualSpent = 0) => {
  const budget = Number(budgetAmount) || 0;
  const spent = Number(actualSpent) || 0;
  const remaining = roundCurrency(budget - spent);
  const percentUsed = budget > 0 ? roundCurrency((spent / budget) * 100) : 0;

  let status = 'healthy';
  if (percentUsed >= 100) {
    status = 'danger'; // Exceeded
  } else if (percentUsed >= 80) {
    status = 'warning'; // Approaching limit (80% - 99%)
  }

  return {
    budget: roundCurrency(budget),
    spent: roundCurrency(spent),
    remaining,
    percentUsed,
    status
  };
};

/**
 * Calculates daily or monthly spending trend
 * @param {Array<{ expense_date: string, amount: number }>} expenses 
 * @param {string} groupBy 'daily' | 'monthly'
 * @returns {Array<{ label: string, total: number }>}
 */
const calculateSpendingTrend = (expenses = [], groupBy = 'daily') => {
  if (!Array.isArray(expenses)) return [];

  const grouped = {};
  expenses.forEach(exp => {
    const amt = Number(exp.amount) || 0;
    if (!exp.expense_date) return;
    
    let key;
    if (groupBy === 'monthly') {
      key = exp.expense_date.substring(0, 7); // YYYY-MM
    } else {
      key = exp.expense_date.substring(0, 10); // YYYY-MM-DD
    }
    grouped[key] = (grouped[key] || 0) + amt;
  });

  const sortedKeys = Object.keys(grouped).sort();
  return sortedKeys.map(k => ({
    label: k,
    total: roundCurrency(grouped[k])
  }));
};

module.exports = {
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
};
