const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const config = require('./config/config');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { validateAndSanitizeBody, validateAndSanitizeQuery, validateAndSanitizeParams } = require('./utils/validation');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/authRoutes');
const placesRoutes = require('./routes/placesRoutes');
const chatRoutes = require('./routes/chatRoutes');
const itineraryRoutes = require('./routes/itineraryRoutes');

const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.foursquare.com", "https://api.openai.com"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Custom request logging
app.use(logger.logRequest);

// Input validation and sanitization
app.use(validateAndSanitizeBody);
app.use(validateAndSanitizeQuery);
app.use(validateAndSanitizeParams);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'LocaMate API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/itineraries', itineraryRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'LocaMate API Documentation',
    version: '1.0.0',
    endpoints: {
      auth: {
        base: '/api/auth',
        routes: [
          'POST /register - Register new user',
          'POST /login - User login',
          'GET /profile - Get user profile',
          'PUT /profile - Update user profile',
          'PUT /location - Update user location',
          'PUT /preferences - Update user preferences',
          'PUT /password - Change password',
          'DELETE /account - Delete account',
          'GET /stats - Get user stats'
        ]
      },
      places: {
        base: '/api/places',
        routes: [
          'GET /search - Search places',
          'GET /:id - Get place details',
          'GET /:id/photos - Get place photos',
          'GET /:id/tips - Get place tips',
          'GET /category/:category - Search by category',
          'GET /trending - Get trending places',
          'GET /nearby - Get nearby places',
          'POST /favorite - Add to favorites',
          'DELETE /favorite/:placeId - Remove from favorites',
          'POST /visited - Mark as visited',
          'GET /favorites - Get user favorites',
          'GET /visited - Get visited places'
        ]
      },
      chat: {
        base: '/api/chat',
        routes: [
          'POST /conversation - Process chat message',
          'GET /suggestions - Get contextual suggestions',
          'GET /quick-responses - Get quick responses',
          'POST /recommendations - Get personalized recommendations',
          'POST /analyze-preferences - Analyze conversation preferences'
        ]
      },
      itineraries: {
        base: '/api/itineraries',
        routes: [
          'POST /generate - Generate AI itinerary',
          'GET / - Get user itineraries',
          'GET /:id - Get itinerary details',
          'PUT /:id - Update itinerary',
          'DELETE /:id - Delete itinerary',
          'POST /:id/places - Add place to itinerary',
          'DELETE /:id/places/:placeId - Remove place from itinerary',
          'PUT /:id/places/:placeId/visited - Mark place visited',
          'POST /:id/like - Like/unlike itinerary',
          'POST /:id/share - Share itinerary',
          'GET /popular - Get popular itineraries',
          'GET /location - Get itineraries by location'
        ]
      }
    }
  });
});

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Promise Rejection', err);
  process.exit(1);
});

// Uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', err);
  process.exit(1);
});

module.exports = app; 