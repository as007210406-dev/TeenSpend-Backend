const expenseModel = require('../models/expenseModel');
const incomeModel = require('../models/incomeModel');
const budgetModel = require('../models/budgetModel');
const savingsModel = require('../models/savingsModel');
const categoryModel = require('../models/categoryModel');
const { calculateCategoryBreakdown, calculateSavingsRate } = require('../utils/calculations');
const { roundCurrency } = require('../utils/precision');

const recommendationService = {
  /**
   * Evaluates deterministic financial rules and generates personalized recommendations & smart insights
   */
  async getRecommendationsAndInsights(userId) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Dates for current month
    const currentMonthStart = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
    const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];

    // Dates for previous month
    const prevMonthStart = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0];
    const prevMonthEnd = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];

    const [
      currentExpensesRes,
      prevExpensesRes,
      currentIncome,
      budgets,
      savingsGoals,
      categories
    ] = await Promise.all([
      expenseModel.findAllByUser(userId, { startDate: currentMonthStart, endDate: currentMonthEnd }),
      expenseModel.findAllByUser(userId, { startDate: prevMonthStart, endDate: prevMonthEnd }),
      incomeModel.findAllByUser(userId, { startDate: currentMonthStart, endDate: currentMonthEnd }),
      budgetModel.findAllByUser(userId),
      savingsModel.findAllByUser(userId),
      categoryModel.findAllForUser(userId)
    ]);

    const currentExpenses = currentExpensesRes.expenses || [];
    const prevExpenses = prevExpensesRes.expenses || [];

    const totalCurrentSpent = currentExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const totalPrevSpent = prevExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const totalIncome = currentIncome.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    const recommendations = [];
    const insights = [];

    const catBreakdown = calculateCategoryBreakdown(currentExpenses, categories);

    // --------------------------------------------------------------------------
    // RULE 1: Entertainment spending > 20% of total spending
    // --------------------------------------------------------------------------
    const entertainmentCats = catBreakdown.filter(c => 
      c.categoryName.toLowerCase().includes('entertainment') || 
      c.categoryName.toLowerCase().includes('gaming') || 
      c.categoryName.toLowerCase().includes('movies')
    );
    const entertainmentTotal = entertainmentCats.reduce((sum, c) => sum + c.total, 0);
    const entertainmentPercent = totalCurrentSpent > 0 ? (entertainmentTotal / totalCurrentSpent) * 100 : 0;

    if (totalCurrentSpent > 0 && entertainmentPercent > 20) {
      recommendations.push({
        id: 'rec-entertainment-high',
        type: 'warning',
        priority: 'medium',
        title: 'High Entertainment Spending',
        message: 'You are spending a large share of your money on entertainment. Consider setting a weekly entertainment limit.',
        category: 'Entertainment'
      });
    }

    // --------------------------------------------------------------------------
    // RULE 2: Food & Snack spending > 30% of total spending
    // --------------------------------------------------------------------------
    const foodSnackCats = catBreakdown.filter(c => 
      c.categoryName.toLowerCase().includes('food') || 
      c.categoryName.toLowerCase().includes('snack') || 
      c.categoryName.toLowerCase().includes('cafe')
    );
    const foodSnackTotal = foodSnackCats.reduce((sum, c) => sum + c.total, 0);
    const foodSnackPercent = totalCurrentSpent > 0 ? (foodSnackTotal / totalCurrentSpent) * 100 : 0;

    if (totalCurrentSpent > 0 && foodSnackPercent > 30) {
      recommendations.push({
        id: 'rec-food-snack-high',
        type: 'warning',
        priority: 'medium',
        title: 'Snack & Food Spending Alert',
        message: 'Your food and snack expenses are increasing. Try setting a weekly snack budget.',
        category: 'Food & Snacks'
      });
    }

    // --------------------------------------------------------------------------
    // RULE 3: Category Budget Exceeded
    // --------------------------------------------------------------------------
    const catMap = new Map();
    categories.forEach(c => catMap.set(c.id, c.name));

    const spentByCatId = {};
    currentExpenses.forEach(e => {
      spentByCatId[e.category_id] = (spentByCatId[e.category_id] || 0) + (Number(e.amount) || 0);
    });

    budgets.forEach(b => {
      if (b.category_id) {
        const spent = spentByCatId[b.category_id] || 0;
        const catName = catMap.get(b.category_id) || 'Category';
        if (spent > b.amount) {
          const over = roundCurrency(spent - b.amount);
          recommendations.push({
            id: `rec-budget-exceeded-${b.id}`,
            type: 'danger',
            priority: 'high',
            title: `${catName} Budget Exceeded`,
            message: `You've exceeded your ${catName} budget this month by ${over}. Consider putting holds on non-essential purchases.`,
            category: catName
          });
        }
      }
    });

    // --------------------------------------------------------------------------
    // RULE 4: Low Savings Rate (< 15% when income exists)
    // --------------------------------------------------------------------------
    const savingsRate = calculateSavingsRate(totalIncome, totalCurrentSpent);
    if (totalIncome > 0 && savingsRate < 15) {
      recommendations.push({
        id: 'rec-low-savings',
        type: 'info',
        priority: 'low',
        title: 'Boost Your Savings Habit',
        message: 'Try saving a small fixed amount whenever you receive money or allowance.',
        category: 'Savings'
      });
    }

    // --------------------------------------------------------------------------
    // RULE 5: Spending Decreased compared with previous period
    // --------------------------------------------------------------------------
    if (totalPrevSpent > 0 && totalCurrentSpent < totalPrevSpent) {
      const savedDiff = roundCurrency(totalPrevSpent - totalCurrentSpent);
      recommendations.push({
        id: 'rec-spending-decreased',
        type: 'success',
        priority: 'medium',
        title: 'Great Progress on Spending!',
        message: `Nice! Your spending has decreased compared with the previous period by ${savedDiff}.`,
        category: 'General'
      });
    }

    // --------------------------------------------------------------------------
    // RULE 6: Recurring Subscriptions taking significant budget (> 10% of monthly income or overall budget)
    // --------------------------------------------------------------------------
    const subscriptionExpenses = currentExpenses.filter(e => {
      const cat = catMap.get(e.category_id);
      return e.is_recurring || (cat && cat.toLowerCase().includes('subscription'));
    });
    const subTotal = subscriptionExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const benchmark = totalIncome > 0 ? totalIncome : 5000;
    if (subTotal > 0 && (subTotal / benchmark) > 0.08) {
      recommendations.push({
        id: 'rec-subscriptions-high',
        type: 'warning',
        priority: 'medium',
        title: 'Subscription Review',
        message: 'Your subscriptions are taking up a noticeable part of your monthly budget. Review whether you still use each service.',
        category: 'Subscriptions'
      });
    }

    // --------------------------------------------------------------------------
    // DYNAMIC SMART SPENDING INSIGHTS (Section 29)
    // --------------------------------------------------------------------------
    // 1. Highest spending category
    if (catBreakdown.length > 0) {
      insights.push({
        id: 'ins-highest-cat',
        icon: 'TrendingUp',
        text: `Your highest spending category this month is ${catBreakdown[0].categoryName} (${catBreakdown[0].percentage}% of total spending).`
      });
    }

    // 2. Spending comparison with previous month
    if (totalPrevSpent > 0) {
      const diff = totalCurrentSpent - totalPrevSpent;
      const pct = Math.abs(roundCurrency((diff / totalPrevSpent) * 100));
      if (diff < 0) {
        insights.push({
          id: 'ins-month-comp',
          icon: 'ArrowDownRight',
          text: `You spent ${pct}% less than last month.`
        });
      } else if (diff > 0) {
        insights.push({
          id: 'ins-month-comp',
          icon: 'ArrowUpRight',
          text: `You spent ${pct}% more than last month.`
        });
      }
    }

    // 3. Average daily spending
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysRemaining = daysInMonth - dayOfMonth;
    const avgDaily = dayOfMonth > 0 ? roundCurrency(totalCurrentSpent / dayOfMonth) : 0;
    if (avgDaily > 0) {
      insights.push({
        id: 'ins-avg-daily',
        icon: 'Calendar',
        text: `Your average daily spending is ${avgDaily}.`
      });
    }

    // 4. Savings rate insight
    if (totalIncome > 0) {
      insights.push({
        id: 'ins-savings-rate',
        icon: 'PiggyBank',
        text: `You have saved ${savingsRate}% of your income.`
      });
    }

    // 5. Days remaining in month
    insights.push({
      id: 'ins-days-left',
      icon: 'Clock',
      text: `You have ${daysRemaining} days remaining in the month.`
    });

    // 6. Savings goal proximity
    const activeGoals = savingsGoals.filter(g => Number(g.current_amount) < Number(g.target_amount));
    if (activeGoals.length > 0) {
      // Find goal closest to completion
      const sortedByCloseness = [...activeGoals].sort((a, b) => {
        const remainingA = Number(a.target_amount) - Number(a.current_amount);
        const remainingB = Number(b.target_amount) - Number(b.current_amount);
        return remainingA - remainingB;
      });
      const closest = sortedByCloseness[0];
      const dist = roundCurrency(Number(closest.target_amount) - Number(closest.current_amount));
      insights.push({
        id: 'ins-goal-distance',
        icon: 'Target',
        text: `You are only ${dist} away from your "${closest.name}" savings goal!`
      });
    }

    // 7. Monthly budget burn-rate projection
    const overallBudget = budgets.find(b => !b.category_id);
    if (overallBudget && overallBudget.amount > 0 && dayOfMonth > 0) {
      const projectedTotal = roundCurrency((totalCurrentSpent / dayOfMonth) * daysInMonth);
      if (projectedTotal > overallBudget.amount) {
        insights.push({
          id: 'ins-projection-warning',
          icon: 'AlertTriangle',
          text: `Based on your current spending rate, you may exceed your monthly budget (projected total: ${projectedTotal} vs budget: ${overallBudget.amount}).`
        });
      } else {
        insights.push({
          id: 'ins-projection-healthy',
          icon: 'CheckCircle',
          text: `You're on track! At your current spending pace, you will stay well within your monthly budget.`
        });
      }
    }

    return {
      recommendations,
      insights
    };
  }
};

module.exports = recommendationService;
