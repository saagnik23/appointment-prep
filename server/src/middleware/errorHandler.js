function errorHandler(err, req, res, next) {
  // Never expose sensitive fields or stack traces in production
  const statusCode = err.statusCode || (err.status ? err.status : 500);
  const code = err.code || (statusCode === 404 ? 'NOT_FOUND' : statusCode === 401 ? 'UNAUTHORIZED' : statusCode === 403 ? 'FORBIDDEN' : statusCode === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR');

  const response = {
    error: {
      code,
      message: err.message || 'An unexpected error occurred.',
    },
  };

  if (err.details && Array.isArray(err.details)) {
    response.error.details = err.details;
  }

  if (process.env.NODE_ENV === 'development' && statusCode === 500 && err.stack) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
