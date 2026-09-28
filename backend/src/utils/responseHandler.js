/**
 * Standardized API Response Builders
 */

const successResponse = (res, statusCode = 200, message = 'Success', data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const errorResponse = (res, statusCode = 400, message = 'An error occurred', code = 'BAD_REQUEST', details = []) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      code,
      details: Array.isArray(details) ? details : [details]
    }
  });
};

module.exports = {
  successResponse,
  errorResponse
};
