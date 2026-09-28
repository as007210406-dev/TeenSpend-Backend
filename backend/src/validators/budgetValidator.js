const { BUDGET_PERIODS } = require('../config/constants');

const budgetValidator = {
  validateCreate(req) {
    const errors = [];
    const { amount, period, start_date } = req.body || {};

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      errors.push({ field: 'amount', message: 'Budget amount must be a numeric value greater than zero' });
    }

    if (period && !BUDGET_PERIODS.includes(period)) {
      errors.push({ field: 'period', message: `Period must be one of: ${BUDGET_PERIODS.join(', ')}` });
    }

    if (start_date && isNaN(Date.parse(start_date))) {
      errors.push({ field: 'start_date', message: 'Start date must be a valid date' });
    }

    return errors;
  },

  validateUpdate(req) {
    const errors = [];
    const { amount, period } = req.body || {};

    if (amount !== undefined) {
      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        errors.push({ field: 'amount', message: 'Amount must be greater than zero' });
      }
    }

    if (period && !BUDGET_PERIODS.includes(period)) {
      errors.push({ field: 'period', message: `Period must be one of: ${BUDGET_PERIODS.join(', ')}` });
    }

    return errors;
  }
};

module.exports = budgetValidator;
