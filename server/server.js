const app = require('./app');
const config = require('./config/config');
const logger = require('./utils/logger');

const PORT = config.port;

const server = app.listen(PORT, () => {
  logger.info(`LocaMate server running on port ${PORT}`, {
    environment: config.nodeEnv,
    port: PORT,
    timestamp: new Date().toISOString()
  });
  
  console.log(`
  🚀 LocaMate Server Started!
  
  📍 Environment: ${config.nodeEnv}
  🌐 Port: ${PORT}
  🕐 Time: ${new Date().toISOString()}
  
  📚 API Documentation: http://localhost:${PORT}/api
  ❤️  Health Check: http://localhost:${PORT}/health
  
  🔗 Frontend URL: ${config.corsOrigin}
  `);
});

// Handle server errors
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down server gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down server gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

module.exports = server; 