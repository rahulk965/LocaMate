const express = require('express');
const { body, param, query } = require('express-validator');
const itineraryController = require('../controllers/itineraryController');
const { auth, optionalAuth } = require('../middleware/auth');
const { validateRequest } = require('../utils/validation');

const router = express.Router();

// Validation rules
const generateItineraryValidation = [
  body('prompt')
    .notEmpty()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Prompt must be between 10 and 500 characters'),
  body('location')
    .optional()
    .matches(/^-?\d+\.?\d*,-?\d+\.?\d*$/)
    .withMessage('Location must be in format "longitude,latitude"'),
  body('preferences')
    .optional()
    .isObject()
    .withMessage('Preferences must be an object'),
  validateRequest
];

const itineraryIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid itinerary ID'),
  validateRequest
];

const updateItineraryValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters'),
  body('places')
    .optional()
    .isArray()
    .withMessage('Places must be an array'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  validateRequest
];

const addPlaceValidation = [
  body('placeId')
    .notEmpty()
    .withMessage('Place ID is required'),
  body('name')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Place name must be between 1 and 200 characters'),
  body('category')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category must be between 1 and 100 characters'),
  body('estimatedDuration')
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage('Estimated duration must be between 15 and 480 minutes'),
  body('notes')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Notes must be between 1 and 500 characters'),
  validateRequest
];

const markPlaceVisitedValidation = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  validateRequest
];

const getUserItinerariesValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('type')
    .optional()
    .isIn(['morning', 'afternoon', 'evening', 'night', 'full-day', 'custom'])
    .withMessage('Invalid type value'),
  query('status')
    .optional()
    .isIn(['completed', 'active'])
    .withMessage('Status must be completed or active'),
  validateRequest
];

const locationValidation = [
  query('ll')
    .notEmpty()
    .withMessage('Location coordinates are required')
    .matches(/^-?\d+\.?\d*,-?\d+\.?\d*$/)
    .withMessage('Location must be in format "longitude,latitude"'),
  query('radius')
    .optional()
    .isInt({ min: 1000, max: 100000 })
    .withMessage('Radius must be between 1000 and 100000 meters'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  validateRequest
];

// Protected routes
router.post('/generate', auth, generateItineraryValidation, itineraryController.generateItinerary);
router.get('/', auth, getUserItinerariesValidation, itineraryController.getUserItineraries);
router.get('/:id', auth, itineraryIdValidation, itineraryController.getItinerary);
router.put('/:id', auth, itineraryIdValidation, updateItineraryValidation, itineraryController.updateItinerary);
router.delete('/:id', auth, itineraryIdValidation, itineraryController.deleteItinerary);

// Place management within itineraries
router.post('/:id/places', auth, itineraryIdValidation, addPlaceValidation, itineraryController.addPlaceToItinerary);
router.delete('/:id/places/:placeId', auth, itineraryIdValidation, itineraryController.removePlaceFromItinerary);
router.put('/:id/places/:placeId/visited', auth, itineraryIdValidation, markPlaceVisitedValidation, itineraryController.markPlaceVisited);

// Social features
router.post('/:id/like', auth, itineraryIdValidation, itineraryController.toggleLike);
router.post('/:id/share', auth, itineraryIdValidation, itineraryController.shareItinerary);

// Public routes
router.get('/popular', query('limit').optional().isInt({ min: 1, max: 50 }), validateRequest, itineraryController.getPopularItineraries);
router.get('/location', locationValidation, itineraryController.getItinerariesByLocation);

module.exports = router; 