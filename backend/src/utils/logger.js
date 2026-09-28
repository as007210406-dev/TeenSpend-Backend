/**
 * Structured logger utility with data sanitization (stripping passwords & tokens)
 */

const sanitize = (data) => {
  if (!data || typeof data !== 'object') return data;
  const sanitized = Array.isArray(data) ? [...data] : { ...data };
  
  const sensitiveKeys = ['password', 'password_hash', 'token', 'authorization', 'secret', 'jwt'];
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitize(sanitized[key]);
    }
  }
  return sanitized;
};

const logger = {
  info: (message, meta) => {
    console.log(JSON.stringify({ level: 'INFO', timestamp: new Date().toISOString(), message, meta: sanitize(meta) }));
  },
  warn: (message, meta) => {
    console.warn(JSON.stringify({ level: 'WARN', timestamp: new Date().toISOString(), message, meta: sanitize(meta) }));
  },
  error: (message, error, meta) => {
    const errorDetails = error instanceof Error 
      ? { message: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined }
      : error;
    console.error(JSON.stringify({ level: 'ERROR', timestamp: new Date().toISOString(), message, error: errorDetails, meta: sanitize(meta) }));
  }
};

module.exports = logger;
