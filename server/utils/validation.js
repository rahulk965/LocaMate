const { validationResult } = require('express-validator');

// Middleware to check for validation errors
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Custom validation for MongoDB ObjectId
const isValidObjectId = (value) => {
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  return objectIdPattern.test(value);
};

// Custom validation for coordinates
const isValidCoordinates = (value) => {
  if (typeof value !== 'string') return false;
  
  const coordPattern = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
  if (!coordPattern.test(value)) return false;
  
  const [lng, lat] = value.split(',').map(Number);
  return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
};

// Custom validation for phone numbers
const isValidPhoneNumber = (value) => {
  const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
  return phonePattern.test(value.replace(/[\s\-\(\)]/g, ''));
};

// Custom validation for URLs
const isValidUrl = (value) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

// Custom validation for time format (HH:MM)
const isValidTimeFormat = (value) => {
  const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timePattern.test(value);
};

// Custom validation for price range
const isValidPriceRange = (value) => {
  const validRanges = ['budget', 'moderate', 'expensive', 'luxury'];
  return validRanges.includes(value);
};

// Custom validation for rating
const isValidRating = (value) => {
  const rating = Number(value);
  return !isNaN(rating) && rating >= 0 && rating <= 10;
};

// Custom validation for distance
const isValidDistance = (value) => {
  const distance = Number(value);
  return !isNaN(distance) && distance > 0 && distance <= 50000;
};

// Custom validation for limit
const isValidLimit = (value) => {
  const limit = Number(value);
  return !isNaN(limit) && limit > 0 && limit <= 100;
};

// Custom validation for pagination
const isValidPagination = (value) => {
  const page = Number(value);
  return !isNaN(page) && page > 0;
};

// Sanitize input
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  return input;
};

// Sanitize object
const sanitizeObject = (obj) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

// Validate and sanitize request body
const validateAndSanitizeBody = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  next();
};

// Validate and sanitize query parameters
const validateAndSanitizeQuery = (req, res, next) => {
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  next();
};

// Validate and sanitize URL parameters
const validateAndSanitizeParams = (req, res, next) => {
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
};

module.exports = {
  validateRequest,
  isValidObjectId,
  isValidCoordinates,
  isValidPhoneNumber,
  isValidUrl,
  isValidTimeFormat,
  isValidPriceRange,
  isValidRating,
  isValidDistance,
  isValidLimit,
  isValidPagination,
  sanitizeInput,
  sanitizeObject,
  validateAndSanitizeBody,
  validateAndSanitizeQuery,
  validateAndSanitizeParams
}; 