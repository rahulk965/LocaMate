const express = require('express');
const { body, param, query } = require('express-validator');
const placesController = require('../controllers/placesController');
const { auth, optionalAuth } = require('../middleware/auth');
const { validateRequest } = require('../utils/validation');

const router = express.Router();

// Validation rules
const searchValidation = [
  query('radius')
    .optional()
    .isInt({ min: 100, max: 50000 })
    .withMessage('Radius must be between 100 and 50000 meters'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('sort')
    .optional()
    .isIn(['RATING', 'POPULARITY', 'DISTANCE'])
    .withMessage('Sort must be RATING, POPULARITY, or DISTANCE'),
  validateRequest
];

const placeIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Place ID is required'),
  validateRequest
];

const addToFavoritesValidation = [
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
  validateRequest
];

const markAsVisitedValidation = [
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
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
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
    .isInt({ min: 100, max: 50000 })
    .withMessage('Radius must be between 100 and 50000 meters'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  validateRequest
];

// Public routes
router.get('/search', optionalAuth, searchValidation, placesController.searchPlaces);
router.get('/:id', optionalAuth, placeIdValidation, placesController.getPlaceDetails);
router.get('/:id/photos', optionalAuth, placeIdValidation, placesController.getPlacePhotos);
router.get('/:id/tips', optionalAuth, placeIdValidation, placesController.getPlaceTips);
router.get('/category/:category', optionalAuth, locationValidation, placesController.searchByCategory);
router.get('/trending', optionalAuth, locationValidation, placesController.getTrendingPlaces);
router.get('/nearby', optionalAuth, locationValidation, placesController.getNearbyPlaces);

// Protected routes
router.post('/favorite', auth, addToFavoritesValidation, placesController.addToFavorites);
router.delete('/favorite/:placeId', auth, placeIdValidation, placesController.removeFromFavorites);
router.post('/visited', auth, markAsVisitedValidation, placesController.markAsVisited);
router.get('/favorites', auth, placesController.getFavorites);
router.get('/visited', auth, placesController.getVisitedPlaces);

module.exports = router; 