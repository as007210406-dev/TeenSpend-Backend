const savingsValidator = {
  validateCreate(req) {
    const errors = [];
    const { name, target_amount, current_amount, target_date } = req.body || {};

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Goal name is required (e.g. Headphones, Trip, PC)' });
    }

    const numTarget = Number(target_amount);
    if (isNaN(numTarget) || numTarget <= 0) {
      errors.push({ field: 'target_amount', message: 'Target amount must be a positive number' });
    }

    if (current_amount !== undefined) {
      const numCurrent = Number(current_amount);
      if (isNaN(numCurrent) || numCurrent < 0) {
        errors.push({ field: 'current_amount', message: 'Current amount cannot be negative' });
      }
    }

    if (target_date && isNaN(Date.parse(target_date))) {
      errors.push({ field: 'target_date', message: 'Target date must be a valid date' });
    }

    return errors;
  },

  validateContribute(req) {
    const errors = [];
    const { amount } = req.body || {};

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      errors.push({ field: 'amount', message: 'Contribution amount must be greater than zero' });
    }

    return errors;
  }
};

module.exports = savingsValidator;
