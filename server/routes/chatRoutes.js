const express = require('express');
const { body, query } = require('express-validator');
const chatController = require('../controllers/chatController');
const { auth, optionalAuth } = require('../middleware/auth');
const { validateRequest } = require('../utils/validation');

const router = express.Router();

// Validation rules
const chatMessageValidation = [
  body('message')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('location')
    .optional()
    .matches(/^-?\d+\.?\d*,-?\d+\.?\d*$/)
    .withMessage('Location must be in format "longitude,latitude"'),
  body('context')
    .optional()
    .isObject()
    .withMessage('Context must be an object'),
  validateRequest
];

const recommendationsValidation = [
  body('context')
    .optional()
    .isObject()
    .withMessage('Context must be an object'),
  body('location')
    .optional()
    .matches(/^-?\d+\.?\d*,-?\d+\.?\d*$/)
    .withMessage('Location must be in format "longitude,latitude"'),
  validateRequest
];

const suggestionsValidation = [
  query('location')
    .optional()
    .matches(/^-?\d+\.?\d*,-?\d+\.?\d*$/)
    .withMessage('Location must be in format "longitude,latitude"'),
  query('timeOfDay')
    .optional()
    .isIn(['morning', 'afternoon', 'evening', 'night'])
    .withMessage('Time of day must be morning, afternoon, evening, or night'),
  query('mood')
    .optional()
    .isIn(['relaxed', 'energetic', 'romantic', 'adventurous', 'social', 'productive', 'cultural'])
    .withMessage('Invalid mood value'),
  query('purpose')
    .optional()
    .isIn(['work', 'relax', 'explore', 'dine', 'nightlife', 'culture', 'shopping', 'outdoor'])
    .withMessage('Invalid purpose value'),
  validateRequest
];

const quickResponsesValidation = [
  query('context')
    .optional()
    .isIn(['food', 'work', 'entertainment'])
    .withMessage('Context must be food, work, or entertainment'),
  validateRequest
];

const analyzePreferencesValidation = [
  body('conversationHistory')
    .isArray({ min: 1 })
    .withMessage('Conversation history must be a non-empty array'),
  body('conversationHistory.*.content')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Each message must be between 1 and 1000 characters'),
  validateRequest
];

// Public routes
router.post('/conversation', optionalAuth, chatMessageValidation, chatController.processChatMessage);
router.get('/suggestions', suggestionsValidation, chatController.getContextualSuggestions);
router.get('/quick-responses', quickResponsesValidation, chatController.getQuickResponses);

// Protected routes
router.post('/recommendations', auth, recommendationsValidation, chatController.getPersonalizedRecommendations);
router.post('/analyze-preferences', auth, analyzePreferencesValidation, chatController.analyzePreferences);

module.exports = router; 