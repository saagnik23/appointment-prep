const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const authController = require('./auth.controller');
const validate = require('../../middleware/validate');
const { requireAuth } = require('../../middleware/auth');
const env = require('../../config/env');

const router = express.Router();

// Dedicated rate limiter for authentication endpoints (login & register)
const authLimiter =
  env.NODE_ENV !== 'test'
    ? rateLimit({
        windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
        max: env.AUTH_RATE_LIMIT_MAX,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
          error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many authentication attempts. Please try again later.',
          },
        },
      })
    : (req, res, next) => next();

router.post(
  '/register',
  authLimiter,
  validate([
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ max: 100 })
      .withMessage('Name cannot exceed 100 characters'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
  ]),
  authController.register
);

router.post(
  '/login',
  authLimiter,
  validate([
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ]),
  authController.login
);

router.post('/logout', authController.logout);

router.get('/me', requireAuth, authController.getMe);

module.exports = router;
module.exports.authLimiter = authLimiter;
