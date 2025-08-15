const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { validateRequest } = require('../utils/validation');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  validateRequest
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validateRequest
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  validateRequest
];

const updateLocationValidation = [
  body('coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array with 2 elements [longitude, latitude]'),
  body('coordinates.*')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid coordinate values'),
  body('city')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('City must be between 1 and 100 characters'),
  body('country')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Country must be between 1 and 100 characters'),
  validateRequest
];

const updatePreferencesValidation = [
  body('cuisine')
    .optional()
    .isArray()
    .withMessage('Cuisine must be an array'),
  body('cuisine.*')
    .optional()
    .isIn(['italian', 'chinese', 'japanese', 'indian', 'mexican', 'american', 'french', 'thai', 'mediterranean', 'other'])
    .withMessage('Invalid cuisine type'),
  body('priceRange')
    .optional()
    .isIn(['budget', 'moderate', 'expensive', 'luxury'])
    .withMessage('Invalid price range'),
  body('atmosphere')
    .optional()
    .isArray()
    .withMessage('Atmosphere must be an array'),
  body('atmosphere.*')
    .optional()
    .isIn(['quiet', 'vibrant', 'romantic', 'family-friendly', 'casual', 'formal', 'outdoor', 'cozy'])
    .withMessage('Invalid atmosphere type'),
  body('activities')
    .optional()
    .isArray()
    .withMessage('Activities must be an array'),
  body('activities.*')
    .optional()
    .isIn(['work', 'relax', 'explore', 'dine', 'nightlife', 'culture', 'shopping', 'outdoor'])
    .withMessage('Invalid activity type'),
  validateRequest
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  validateRequest
];

// Routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, updateProfileValidation, authController.updateProfile);
router.put('/location', auth, updateLocationValidation, authController.updateLocation);
router.put('/preferences', auth, updatePreferencesValidation, authController.updatePreferences);
router.put('/password', auth, changePasswordValidation, authController.changePassword);
router.delete('/account', auth, authController.deleteAccount);
router.get('/stats', auth, authController.getUserStats);

module.exports = router; 