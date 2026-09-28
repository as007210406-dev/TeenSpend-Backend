const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/responseHandler');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 auth requests per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, 429, 'Too many login or registration attempts. Please try again in 15 minutes.', 'RATE_LIMIT_EXCEEDED');
  }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Limit each IP to 1000 general API requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, 429, 'Too many requests. Please slow down.', 'RATE_LIMIT_EXCEEDED');
  }
});

module.exports = {
  authLimiter,
  apiLimiter
};
