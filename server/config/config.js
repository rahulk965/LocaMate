require('dotenv').config();

const config = {
  // Server Configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/localmate',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'fallback_jwt_secret',
  jwtExpiresIn: '7d',
  
  // API Keys
  foursquareApiKey: process.env.FOURSQUARE_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  
  // Foursquare API Configuration
  foursquare: {
    baseUrl: 'https://api.foursquare.com/v3',
    searchEndpoint: '/places/search',
    placeDetailsEndpoint: '/places/',
    defaultRadius: 5000, // 5km
    maxResults: 50
  },
  
  // OpenAI Configuration
  openai: {
    model: 'gpt-3.5-turbo',
    maxTokens: 1000,
    temperature: 0.7
  }
};

// Validate required environment variables
const requiredEnvVars = ['FOURSQUARE_API_KEY', 'OPENAI_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(`Warning: Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.warn('Please set these variables in your .env file');
}

module.exports = config; 