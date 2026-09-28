const logger = require('../utils/logger');
const { errorResponse } = require('../utils/responseHandler');

const notFoundHandler = (req, res) => {
  return errorResponse(res, 404, `Endpoint ${req.method} ${req.originalUrl} not found`, 'NOT_FOUND');
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const code = err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR');

  logger.error(`API Error: ${message}`, err, {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    code,
    userId: req.user ? req.user.userId : undefined
  });

  return errorResponse(
    res,
    statusCode,
    message,
    code,
    err.details || (process.env.NODE_ENV === 'development' && statusCode === 500 ? [err.stack] : [])
  );
};

module.exports = {
  notFoundHandler,
  errorHandler
};
