const express = require('express');
const router = express.Router();
const assistantController = require('./assistant.controller');
const { requireAuth } = require('../../middleware/auth');

router.post('/chat', requireAuth, assistantController.chat);

module.exports = router;
