const express = require('express');
const { body, param } = require('express-validator');
const appointmentsController = require('./appointments.controller');
const itemsController = require('./items.controller');
const checklistController = require('./checklist.controller');
const validate = require('../../middleware/validate');
const { requireAuth } = require('../../middleware/auth');

const router = express.Router();

// All appointment routes require authentication
router.use(requireAuth);

const mongoIdParam = (name) =>
  param(name).isMongoId().withMessage(`Invalid ${name} format`);

/* ---------------- Appointments ---------------- */

router.get('/', appointmentsController.listAppointments);

router.post(
  '/',
  validate([
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Appointment title is required')
      .isLength({ max: 200 })
      .withMessage('Title cannot exceed 200 characters'),
    body('providerName')
      .optional()
      .trim()
      .isLength({ max: 150 })
      .withMessage('Provider name cannot exceed 150 characters'),
    body('scheduledAt')
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601()
      .withMessage('Scheduled date must be a valid ISO 8601 date'),
    body('location')
      .optional()
      .trim()
      .isLength({ max: 250 })
      .withMessage('Location cannot exceed 250 characters'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Notes cannot exceed 2000 characters'),
    body('status')
      .optional()
      .isIn(['upcoming', 'completed', 'cancelled'])
      .withMessage('Status must be upcoming, completed, or cancelled'),
  ]),
  appointmentsController.createAppointment
);

router.get(
  '/:appointmentId',
  validate([mongoIdParam('appointmentId')]),
  appointmentsController.getAppointment
);

router.patch(
  '/:appointmentId',
  validate([
    mongoIdParam('appointmentId'),
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Title cannot be empty')
      .isLength({ max: 200 })
      .withMessage('Title cannot exceed 200 characters'),
    body('providerName')
      .optional()
      .trim()
      .isLength({ max: 150 })
      .withMessage('Provider name cannot exceed 150 characters'),
    body('scheduledAt')
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601()
      .withMessage('Scheduled date must be a valid ISO 8601 date'),
    body('location')
      .optional()
      .trim()
      .isLength({ max: 250 })
      .withMessage('Location cannot exceed 250 characters'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Notes cannot exceed 2000 characters'),
    body('status')
      .optional()
      .isIn(['upcoming', 'completed', 'cancelled'])
      .withMessage('Status must be upcoming, completed, or cancelled'),
  ]),
  appointmentsController.updateAppointment
);

router.delete(
  '/:appointmentId',
  validate([mongoIdParam('appointmentId')]),
  appointmentsController.deleteAppointment
);

/* ---------------- Checklist ---------------- */

router.get(
  '/:appointmentId/checklist',
  validate([mongoIdParam('appointmentId')]),
  checklistController.getChecklist
);

/* ---------------- Questions ---------------- */

router.post(
  '/:appointmentId/questions',
  validate([
    mongoIdParam('appointmentId'),
    body('text')
      .trim()
      .notEmpty()
      .withMessage('Question text is required')
      .isLength({ max: 1000 })
      .withMessage('Question text cannot exceed 1000 characters'),
    body('order')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Order must be a non-negative integer'),
  ]),
  itemsController.addQuestion
);

router.patch(
  '/:appointmentId/questions/:questionId',
  validate([
    mongoIdParam('appointmentId'),
    mongoIdParam('questionId'),
    body('text')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Question text cannot be empty')
      .isLength({ max: 1000 })
      .withMessage('Question text cannot exceed 1000 characters'),
    body('status')
      .optional()
      .isIn(['not_asked', 'asked'])
      .withMessage('Status must be either not_asked or asked'),
    body('order')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Order must be a non-negative integer'),
  ]),
  itemsController.updateQuestion
);

router.delete(
  '/:appointmentId/questions/:questionId',
  validate([mongoIdParam('appointmentId'), mongoIdParam('questionId')]),
  itemsController.deleteQuestion
);

/* ---------------- Medications ---------------- */

router.post(
  '/:appointmentId/medications',
  validate([
    mongoIdParam('appointmentId'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Medication name is required')
      .isLength({ max: 200 })
      .withMessage('Medication name cannot exceed 200 characters'),
    body('dose')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Dose cannot exceed 100 characters'),
    body('frequency')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Frequency cannot exceed 100 characters'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Medication notes cannot exceed 500 characters'),
    body('order')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Order must be a non-negative integer'),
  ]),
  itemsController.addMedication
);

router.patch(
  '/:appointmentId/medications/:medicationId',
  validate([
    mongoIdParam('appointmentId'),
    mongoIdParam('medicationId'),
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Medication name cannot be empty')
      .isLength({ max: 200 })
      .withMessage('Medication name cannot exceed 200 characters'),
    body('dose')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Dose cannot exceed 100 characters'),
    body('frequency')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Frequency cannot exceed 100 characters'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Medication notes cannot exceed 500 characters'),
    body('order')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Order must be a non-negative integer'),
  ]),
  itemsController.updateMedication
);

router.delete(
  '/:appointmentId/medications/:medicationId',
  validate([mongoIdParam('appointmentId'), mongoIdParam('medicationId')]),
  itemsController.deleteMedication
);

/* ---------------- Follow-ups ---------------- */

router.post(
  '/:appointmentId/follow-ups',
  validate([
    mongoIdParam('appointmentId'),
    body('text')
      .trim()
      .notEmpty()
      .withMessage('Follow-up text is required')
      .isLength({ max: 500 })
      .withMessage('Follow-up text cannot exceed 500 characters'),
    body('dueAt')
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601()
      .withMessage('Due date must be a valid ISO 8601 date'),
  ]),
  itemsController.addFollowUp
);

router.patch(
  '/:appointmentId/follow-ups/:followUpId',
  validate([
    mongoIdParam('appointmentId'),
    mongoIdParam('followUpId'),
    body('text')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Follow-up text cannot be empty')
      .isLength({ max: 500 })
      .withMessage('Follow-up text cannot exceed 500 characters'),
    body('dueAt')
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601()
      .withMessage('Due date must be a valid ISO 8601 date'),
    body('status')
      .optional()
      .isIn(['pending', 'completed'])
      .withMessage('Status must be either pending or completed'),
  ]),
  itemsController.updateFollowUp
);

router.delete(
  '/:appointmentId/follow-ups/:followUpId',
  validate([mongoIdParam('appointmentId'), mongoIdParam('followUpId')]),
  itemsController.deleteFollowUp
);

module.exports = router;
