// src/utils/helpers.js
const DateUtil = require("./date.util");
const logger = require("./logger");

const helpers = {
  generateId: DateUtil.generateTimestampId,
  currentDate: DateUtil.getCurrentDate,
  currentDateTime: DateUtil.formatDateTime,
  currentDateAndDay: DateUtil.getDisplayDate,

  validateConfig: () => {
    try {
      require("../config/app.config");
      return true;
    } catch (error) {
      logger.error("Configuration validation failed:", error);
      return false;
    }
  },
};

module.exports = helpers;
