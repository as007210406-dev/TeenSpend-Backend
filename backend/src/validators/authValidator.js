const { SUPPORTED_CURRENCIES } = require('../config/constants');

const authValidator = {
  validateRegister(req) {
    const errors = [];
    const { email, password, confirmPassword, full_name, username, currency, monthly_allowance } = req.body || {};

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.push({ field: 'email', message: 'A valid email address is required' });
    }

    if (!full_name || typeof full_name !== 'string' || full_name.trim().length < 2) {
      errors.push({ field: 'full_name', message: 'Full name must be at least 2 characters long' });
    }

    if (!username || typeof username !== 'string' || !/^[a-zA-Z0-9_]{3,30}$/.test(username.trim())) {
      errors.push({ field: 'username', message: 'Username must be 3-30 characters (letters, numbers, underscores only)' });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      errors.push({ field: 'password', message: 'Password must be at least 8 characters long' });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
    }

    if (currency && !SUPPORTED_CURRENCIES.includes(currency.toUpperCase())) {
      errors.push({ field: 'currency', message: `Currency must be one of: ${SUPPORTED_CURRENCIES.join(', ')}` });
    }

    if (monthly_allowance !== undefined && (isNaN(Number(monthly_allowance)) || Number(monthly_allowance) < 0)) {
      errors.push({ field: 'monthly_allowance', message: 'Monthly allowance must be a non-negative number' });
    }

    return errors;
  },

  validateLogin(req) {
    const errors = [];
    const { email, password } = req.body || {};

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.push({ field: 'email', message: 'A valid email is required' });
    }

    if (!password || typeof password !== 'string') {
      errors.push({ field: 'password', message: 'Password is required' });
    }

    return errors;
  }
};

module.exports = authValidator;
