const { errorResponse } = require('../utils/responseHandler');

const validate = (validatorFn) => {
  return (req, res, next) => {
    const errors = validatorFn(req);
    if (errors && errors.length > 0) {
      return errorResponse(res, 400, 'Validation failed for request data', 'VALIDATION_ERROR', errors);
    }
    next();
  };
};

module.exports = {
  validate
};
