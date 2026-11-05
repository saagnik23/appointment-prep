const express = require('express');
const { body } = require('express-validator');
const authController = require('./auth.controller');
const validate = require('../../middleware/validate');
const { requireAuth } = require('../../middleware/auth');

const router = express.Router();

router.post(
  '/register',
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

router.get('/me', requireAuth, authController.getMe);

module.exports = router;
