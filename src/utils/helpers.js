const logger = require('./logger');
const config = require('../config');

const helpers = {
  generateId: () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  currentDate: () => {
    return new Date().toISOString().split('T')[0];
  },

  currentDateTime: () => {
    return new Date().toLocaleString('en-IN', { timeZone: config.scheduler.timezone });
  },

  validateConfig: () => {
    const required = ['EMAIL_USER', 'EMAIL_PASSWORD', 'RECIPIENT_EMAIL'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      logger.error(`Missing required environment variables: ${missing.join(', ')}`);
      return false;
    }
    return true;
  }
};

module.exports = helpers;