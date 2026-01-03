// src/utils/format.util.js
/**
 * Formatting Utility Functions
 * Number and text formatting helpers
 */

class FormatUtil {
  /**
   * Format number with Indian numbering system
   * @param {number} num
   * @returns {string}
   */
  static formatNumber(num) {
    if (num === null || num === undefined) return "—";
    return Number(num).toLocaleString("en-IN");
  }

  /**
   * Format currency in INR
   * @param {number} amount
   * @param {number} decimals
   * @returns {string}
   */
  static formatCurrency(amount, decimals = 2) {
    if (amount === null || amount === undefined) return "₹—";
    return `₹${Number(amount).toFixed(decimals)}`;
  }

  /**
   * Format large numbers with K, L, Cr suffixes
   * @param {number} num
   * @returns {string}
   */
  static formatCompact(num) {
    if (num === null || num === undefined) return "—";

    const absNum = Math.abs(num);

    if (absNum >= 10000000) {
      // 1 Crore
      return `${(num / 10000000).toFixed(2)} Cr`;
    } else if (absNum >= 100000) {
      // 1 Lakh
      return `${(num / 100000).toFixed(2)} L`;
    } else if (absNum >= 1000) {
      // 1 Thousand
      return `${(num / 1000).toFixed(2)} K`;
    }

    return num.toString();
  }

  /**
   * Format percentage change with sign
   * @param {number} change
   * @returns {string}
   */
  static formatPercentage(change) {
    if (change === null || change === undefined) return "—";

    const sign = change >= 0 ? "+" : "";
    return `${sign}${Number(change).toFixed(2)}%`;
  }

  /**
   * Format percentage change with emoji
   * @param {number} change
   * @returns {string}
   */
  static formatPercentageWithEmoji(change) {
    if (change === null || change === undefined) return "—";

    const emoji = change >= 0 ? "⬆" : "⬇";
    const sign = change >= 0 ? "+" : "";
    return `${emoji} ${sign}${Number(change).toFixed(2)}%`;
  }

  /**
   * Truncate text with ellipsis
   * @param {string} text
   * @param {number} maxLength
   * @returns {string}
   */
  static truncate(text, maxLength = 50) {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + "...";
  }

  /**
   * Capitalize first letter of each word
   * @param {string} text
   * @returns {string}
   */
  static capitalize(text) {
    if (!text) return "";
    return text
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /**
   * Format volume in readable format
   * @param {number} volume
   * @returns {string}
   */
  static formatVolume(volume) {
    if (volume === null || volume === undefined) return "—";
    return this.formatCompact(volume);
  }

  /**
   * Format stock symbol (uppercase)
   * @param {string} symbol
   * @returns {string}
   */
  static formatSymbol(symbol) {
    if (!symbol) return "";
    return symbol.toUpperCase().trim();
  }

  /**
   * Get color for percentage change
   * @param {number} change
   * @returns {string}
   */
  static getChangeColor(change) {
    if (change > 0) return "#16a34a"; // Green
    if (change < 0) return "#dc2626"; // Red
    return "#6b7280"; // Gray
  }

  /**
   * Format uptime in human-readable format
   * @param {number} seconds
   * @returns {string}
   */
  static formatUptime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Format memory size
   * @param {number} bytes
   * @returns {string}
   */
  static formatMemory(bytes) {
    if (bytes === null || bytes === undefined) return "—";

    const mb = bytes / (1024 * 1024);
    if (mb < 1024) {
      return `${mb.toFixed(1)} MB`;
    }

    const gb = mb / 1024;
    return `${gb.toFixed(2)} GB`;
  }

  /**
   * Sanitize text for display (remove special chars)
   * @param {string} text
   * @returns {string}
   */
  static sanitize(text) {
    if (!text) return "";
    return text.replace(/[<>]/g, "");
  }

  /**
   * Format array as comma-separated list
   * @param {Array} items
   * @param {string} conjunction
   * @returns {string}
   */
  static formatList(items, conjunction = "and") {
    if (!items || items.length === 0) return "";
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;

    const lastItem = items[items.length - 1];
    const otherItems = items.slice(0, -1).join(", ");
    return `${otherItems}, ${conjunction} ${lastItem}`;
  }
}

module.exports = FormatUtil;
