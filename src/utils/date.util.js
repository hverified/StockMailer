// src/utils/date.util.js
/**
 * Date Utility Functions
 * Centralized date operations with timezone support
 */

const config = require("../config/app.config");

class DateUtil {
  /**
   * Get current date in YYYY-MM-DD format
   * @returns {string}
   */
  static getCurrentDate() {
    return new Date().toISOString().split("T")[0];
  }

  /**
   * Format date with Indian timezone
   * @param {Date|string} date
   * @param {Object} options
   * @returns {string}
   */
  static formatDate(date, options = {}) {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-IN", {
      timeZone: config.scheduler.eveningReport.timezone,
      ...options,
    });
  }

  /**
   * Format date and time with Indian timezone
   * @param {Date|string} date
   * @returns {string}
   */
  static formatDateTime(date = new Date()) {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleString("en-IN", {
      timeZone: config.scheduler.eveningReport.timezone,
    });
  }

  /**
   * Get formatted date with day name for display
   * @returns {string} e.g., "03 Jan 2026, Saturday"
   */
  static getDisplayDate() {
    const date = new Date();
    const options = { timeZone: config.scheduler.eveningReport.timezone };

    const day = date.toLocaleString("en-IN", { ...options, day: "2-digit" });
    const month = date.toLocaleString("en-IN", { ...options, month: "short" });
    const year = date.toLocaleString("en-IN", { ...options, year: "numeric" });
    const weekday = date.toLocaleString("en-IN", {
      ...options,
      weekday: "long",
    });

    return `${day} ${month} ${year}, ${weekday}`;
  }

  /**
   * Get date components separately
   * @returns {Object}
   */
  static getDateComponents() {
    const date = new Date();
    const options = { timeZone: config.scheduler.eveningReport.timezone };

    return {
      day: date.toLocaleString("en-IN", { ...options, day: "2-digit" }),
      month: date.toLocaleString("en-IN", { ...options, month: "short" }),
      year: date.toLocaleString("en-IN", { ...options, year: "numeric" }),
      weekday: date.toLocaleString("en-IN", { ...options, weekday: "long" }),
      monthLong: date.toLocaleString("en-IN", { ...options, month: "long" }),
    };
  }

  /**
   * Check if market is currently open
   * @returns {boolean}
   */
  static isMarketOpen() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentMinutes = hours * 60 + minutes;

    const [openHour, openMin] = config.market.tradingHours.open
      .split(":")
      .map(Number);
    const [closeHour, closeMin] = config.market.tradingHours.close
      .split(":")
      .map(Number);

    const marketOpenMinutes = openHour * 60 + openMin;
    const marketCloseMinutes = closeHour * 60 + closeMin;

    return (
      currentMinutes >= marketOpenMinutes &&
      currentMinutes <= marketCloseMinutes
    );
  }

  /**
   * Get date N days ago
   * @param {number} days
   * @returns {Date}
   */
  static getDaysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }

  /**
   * Validate date string format (YYYY-MM-DD)
   * @param {string} dateString
   * @returns {boolean}
   */
  static isValidDateFormat(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  /**
   * Generate unique ID with timestamp
   * @returns {string}
   */
  static generateTimestampId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format date for NSE API (DD-MM-YYYY)
   * @param {Date} date
   * @returns {string}
   */
  static formatForNSE(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  /**
   * Get current hour in 24-hour format
   * @returns {number}
   */
  static getCurrentHour() {
    return new Date().getHours();
  }

  /**
   * Check if it's a weekday (Mon-Fri)
   * @returns {boolean}
   */
  static isWeekday() {
    const day = new Date().getDay();
    return day >= 1 && day <= 5; // 1 = Monday, 5 = Friday
  }
}

module.exports = DateUtil;
