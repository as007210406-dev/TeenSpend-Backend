const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { errorResponse } = require('../utils/responseHandler');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 401, 'Authentication token required', 'UNAUTHORIZED');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Authentication token has expired. Please log in again.', 'TOKEN_EXPIRED');
    }
    return errorResponse(res, 401, 'Invalid authentication token', 'INVALID_TOKEN');
  }
};

module.exports = authMiddleware;
