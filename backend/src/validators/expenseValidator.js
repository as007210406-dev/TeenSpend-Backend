const { PAYMENT_METHODS } = require('../config/constants');

const expenseValidator = {
  validateCreate(req) {
    const errors = [];
    const { amount, category_id, description, expense_date, payment_method } = req.body || {};

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      errors.push({ field: 'amount', message: 'Amount must be a numeric value greater than zero' });
    }

    if (!category_id || typeof category_id !== 'string') {
      errors.push({ field: 'category_id', message: 'Category is required' });
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      errors.push({ field: 'description', message: 'Description is required' });
    } else if (description.trim().length > 255) {
      errors.push({ field: 'description', message: 'Description cannot exceed 255 characters' });
    }

    if (expense_date && isNaN(Date.parse(expense_date))) {
      errors.push({ field: 'expense_date', message: 'Expense date must be a valid date' });
    }

    if (payment_method && !PAYMENT_METHODS.includes(payment_method)) {
      errors.push({ field: 'payment_method', message: `Payment method must be one of: ${PAYMENT_METHODS.join(', ')}` });
    }

    return errors;
  },

  validateUpdate(req) {
    const errors = [];
    const { amount, description, expense_date, payment_method } = req.body || {};

    if (amount !== undefined) {
      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        errors.push({ field: 'amount', message: 'Amount must be greater than zero' });
      }
    }

    if (description !== undefined && (typeof description !== 'string' || description.trim().length === 0)) {
      errors.push({ field: 'description', message: 'Description cannot be empty' });
    }

    if (expense_date && isNaN(Date.parse(expense_date))) {
      errors.push({ field: 'expense_date', message: 'Expense date must be a valid date' });
    }

    if (payment_method && !PAYMENT_METHODS.includes(payment_method)) {
      errors.push({ field: 'payment_method', message: `Payment method must be one of: ${PAYMENT_METHODS.join(', ')}` });
    }

    return errors;
  }
};

module.exports = expenseValidator;
