const incomeValidator = {
  validateCreate(req) {
    const errors = [];
    const { source, amount, income_date } = req.body || {};

    if (!source || typeof source !== 'string' || source.trim().length === 0) {
      errors.push({ field: 'source', message: 'Income source is required (e.g. Allowance, Gift, Tutoring)' });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      errors.push({ field: 'amount', message: 'Income amount must be greater than zero' });
    }

    if (income_date && isNaN(Date.parse(income_date))) {
      errors.push({ field: 'income_date', message: 'Income date must be a valid date' });
    }

    return errors;
  }
};

module.exports = incomeValidator;
