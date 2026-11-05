const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { AUTH_COOKIE_NAME } = require('../utils/cookies');

function requireAuth(req, res, next) {
  let token = null;

  // 1. Prefer HttpOnly session cookie
  if (req.cookies && req.cookies[AUTH_COOKIE_NAME]) {
    token = req.cookies[AUTH_COOKIE_NAME];
  }
  // 2. Fallback to Authorization: Bearer <token> for non-browser/test clients
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. Please sign in.',
      },
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired session. Please sign in again.',
      },
    });
  }
}

module.exports = {
  requireAuth,
};
