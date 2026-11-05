const { AUTH_COOKIE_NAME, CSRF_COOKIE_NAME } = require('../utils/cookies');

function verifyCsrf(req, res, next) {
  const method = req.method.toUpperCase();

  // Safe HTTP methods do not mutate state
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return next();
  }

  // Exempt unauthenticated onboarding and logout endpoints
  const path = req.path || req.originalUrl || '';
  if (
    path.endsWith('/auth/login') ||
    path.endsWith('/auth/register') ||
    path.endsWith('/auth/logout')
  ) {
    return next();
  }

  // Only enforce CSRF for requests using cookie-based authentication
  const hasAuthCookie = req.cookies && req.cookies[AUTH_COOKIE_NAME];
  if (!hasAuthCookie) {
    // If client is using Bearer header instead of browser cookies, CSRF check is not applicable
    return next();
  }

  const expectedCsrfToken = req.cookies && req.cookies[CSRF_COOKIE_NAME];
  const submittedCsrfToken = req.headers['x-xsrf-token'];

  if (!expectedCsrfToken || !submittedCsrfToken || submittedCsrfToken !== expectedCsrfToken) {
    return res.status(403).json({
      error: {
        code: 'CSRF_ERROR',
        message: 'Invalid or missing CSRF token. State-changing requests require a valid X-XSRF-TOKEN header.',
      },
    });
  }

  next();
}

module.exports = verifyCsrf;
