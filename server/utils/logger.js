const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  formatMessage(level, message, data = null) {
    const timestamp = this.getTimestamp();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(data && { data })
    };
    return JSON.stringify(logEntry);
  }

  writeToFile(level, message, data = null) {
    const logFile = path.join(this.logDir, `${level}.log`);
    const logEntry = this.formatMessage(level, message, data) + '\n';
    
    fs.appendFileSync(logFile, logEntry);
  }

  info(message, data = null) {
    const formattedMessage = this.formatMessage('INFO', message, data);
    console.log(formattedMessage);
    this.writeToFile('info', message, data);
  }

  warn(message, data = null) {
    const formattedMessage = this.formatMessage('WARN', message, data);
    console.warn(formattedMessage);
    this.writeToFile('warn', message, data);
  }

  error(message, error = null) {
    const errorData = error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : null;
    
    const formattedMessage = this.formatMessage('ERROR', message, errorData);
    console.error(formattedMessage);
    this.writeToFile('error', message, errorData);
  }

  debug(message, data = null) {
    if (process.env.NODE_ENV === 'development') {
      const formattedMessage = this.formatMessage('DEBUG', message, data);
      console.debug(formattedMessage);
      this.writeToFile('debug', message, data);
    }
  }

  // Request logging
  logRequest(req, res, next) {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logData = {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      };
      
      if (res.statusCode >= 400) {
        this.warn('HTTP Request', logData);
      } else {
        this.info('HTTP Request', logData);
      }
    });
    
    next();
  }

  // API logging
  logAPI(operation, data = null) {
    this.info(`API ${operation}`, data);
  }

  // Database logging
  logDatabase(operation, data = null) {
    this.info(`Database ${operation}`, data);
  }

  // External API logging
  logExternalAPI(service, operation, data = null) {
    this.info(`${service} API ${operation}`, data);
  }

  // Security logging
  logSecurity(event, data = null) {
    this.warn(`Security: ${event}`, data);
  }

  // Performance logging
  logPerformance(operation, duration, data = null) {
    const performanceData = {
      operation,
      duration: `${duration}ms`,
      ...data
    };
    
    if (duration > 1000) {
      this.warn('Performance Issue', performanceData);
    } else {
      this.debug('Performance', performanceData);
    }
  }

  // Error logging with context
  logErrorWithContext(message, error, context = {}) {
    const errorData = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context
    };
    
    this.error(message, errorData);
  }

  // Clean old log files
  cleanOldLogs(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    try {
      const files = fs.readdirSync(this.logDir);
      
      files.forEach(file => {
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          this.info(`Deleted old log file: ${file}`);
        }
      });
    } catch (error) {
      this.error('Error cleaning old logs', error);
    }
  }
}

// Create singleton instance
const logger = new Logger();

// Schedule log cleanup (run daily at 2 AM)
const scheduleLogCleanup = () => {
  const now = new Date();
  const nextCleanup = new Date();
  nextCleanup.setHours(2, 0, 0, 0);
  
  if (nextCleanup <= now) {
    nextCleanup.setDate(nextCleanup.getDate() + 1);
  }
  
  const timeUntilCleanup = nextCleanup.getTime() - now.getTime();
  
  setTimeout(() => {
    logger.cleanOldLogs();
    scheduleLogCleanup(); // Schedule next cleanup
  }, timeUntilCleanup);
};

// Start log cleanup schedule
scheduleLogCleanup();

module.exports = logger; 