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

  currentDateAndDay: () => {
        const date = new Date();
        const options = { timeZone: config.scheduler.timezone };

        const day = date.toLocaleString('en-IN', { ...options, day: '2-digit' });
        const month = date.toLocaleString('en-IN', { ...options, month: 'short' });
        const year = date.toLocaleString('en-IN', { ...options, year: 'numeric' });
        const weekday = date.toLocaleString('en-IN', { ...options, weekday: 'long' });

        return `${day} ${month} ${year}, ${weekday}`;
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