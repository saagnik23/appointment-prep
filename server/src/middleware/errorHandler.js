function errorHandler(err, req, res, next) {
  // Delegate to default Express handler if headers already sent
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || (err.status ? err.status : 500);
  let code = err.code;
  let message = err.message || 'An unexpected error occurred.';
  let details = err.details || null;

  // Map Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = `Invalid value provided for ${err.path || 'identifier'}.`;
    details = [{ field: err.path || 'id', message: 'Malformed identifier format' }];
  }

  // Map Mongoose Schema ValidationError
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Please review the highlighted fields.';
    details = Object.keys(err.errors).map((key) => ({
      field: key,
      message: err.errors[key].message,
    }));
  }

  // Map MongoDB Duplicate Key (E11000)
  if (err.code === 11000 || (err.name === 'MongoServerError' && err.code === 11000)) {
    statusCode = 409;
    code = 'CONFLICT';
    message = 'A record with that unique value already exists.';
    const duplicatedField = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
    details = [{ field: duplicatedField, message: `${duplicatedField} already exists` }];
  }

  // Set default error code if not explicitly assigned
  if (!code || typeof code === 'number') {
    code =
      statusCode === 400
        ? 'VALIDATION_ERROR'
        : statusCode === 401
        ? 'UNAUTHORIZED'
        : statusCode === 403
        ? 'FORBIDDEN'
        : statusCode === 404
        ? 'NOT_FOUND'
        : statusCode === 409
        ? 'CONFLICT'
        : statusCode === 429
        ? 'TOO_MANY_REQUESTS'
        : 'INTERNAL_ERROR';
  }

  // Mask internal error messages in production for 5xx errors
  if (process.env.NODE_ENV === 'production' && statusCode >= 500) {
    message = 'An unexpected internal error occurred. Please try again later.';
    details = null;
  }

  const response = {
    error: {
      code,
      message,
    },
  };

  if (details && Array.isArray(details)) {
    response.error.details = details;
  }

  // Only expose stack trace in development
  if (process.env.NODE_ENV === 'development' && statusCode >= 500 && err.stack) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
