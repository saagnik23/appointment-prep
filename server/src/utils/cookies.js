const crypto = require('crypto');
const env = require('../config/env');

const AUTH_COOKIE_NAME = 'appointment_prep_session';
const CSRF_COOKIE_NAME = 'XSRF-TOKEN';

function setAuthCookies(res, token) {
  const isProduction = env.NODE_ENV === 'production';

  // Cookie lifetime aligned with 7-day token expiry
  const maxAge = 7 * 24 * 60 * 60 * 1000;

  // 1. HttpOnly secure session cookie
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'lax' : 'lax',
    path: '/',
    maxAge,
  });

  // 2. Client-accessible CSRF cookie (Double-submit pattern)
  const csrfToken = crypto.randomBytes(32).toString('hex');
  res.cookie(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: false,
    secure: isProduction,
    sameSite: isProduction ? 'lax' : 'lax',
    path: '/',
    maxAge,
  });

  return csrfToken;
}

function clearAuthCookies(res) {
  const isProduction = env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'lax' : 'lax',
    path: '/',
  };

  res.clearCookie(AUTH_COOKIE_NAME, cookieOptions);
  res.clearCookie(CSRF_COOKIE_NAME, {
    ...cookieOptions,
    httpOnly: false,
  });
}

module.exports = {
  AUTH_COOKIE_NAME,
  CSRF_COOKIE_NAME,
  setAuthCookies,
  clearAuthCookies,
};

