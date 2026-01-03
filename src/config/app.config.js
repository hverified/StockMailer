// src/config/app.config.js
/**
 * Application Configuration
 * Centralized configuration management with validation
 */

const validateRequiredEnvVars = () => {
  const required = [
    "EMAIL_USER",
    "EMAIL_PASSWORD",
    "RECIPIENT_EMAIL",
    "MONGODB_URI",
    "CHARTINK_URL",
    "CHARTINK_SCAN_CLAUSE",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
};

// Validate on load
validateRequiredEnvVars();

const config = {
  app: {
    name: "Stock Mailer",
    port: parseInt(process.env.PORT, 10) || 3000,
    env: process.env.NODE_ENV || "development",
    logLevel: process.env.LOG_LEVEL || "info",
  },

  database: {
    uri: process.env.MONGODB_URI,
    name: process.env.MONGODB_DB_NAME || "stockmailer",
    options: {
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
    },
  },

  chartink: {
    url: process.env.CHARTINK_URL,
    scanClause: process.env.CHARTINK_SCAN_CLAUSE,
    processUrl: "https://chartink.com/screener/process",
    timeout: 30000,
    maxRetries: 3,
  },

  email: {
    service: process.env.EMAIL_SERVICE || "gmail",
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    recipient: process.env.RECIPIENT_EMAIL,
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
  },

  scheduler: {
    eveningReport: {
      cronTime: process.env.CRON_TIME || "0 17 * * 1-5",
      timezone: process.env.TIMEZONE || "Asia/Kolkata",
      description: "Daily evening market report",
    },
    morningReport: {
      cronTime: process.env.MORNING_CRON_TIME || "29 9 * * 1-5",
      timezone: process.env.TIMEZONE || "Asia/Kolkata",
      description: "Pre-market morning report",
    },
  },

  security: {
    cronSecret: process.env.CRON_SECRET,
  },

  nse: {
    baseUrl: "https://www.nseindia.com/api",
    homeUrl: "https://www.nseindia.com",
    timeout: 10000,
    rateLimit: {
      minDelayMs: 1000,
      maxDelayMs: 1500,
    },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  },

  market: {
    emaSettings: {
      period: 20,
      multiplier: 2 / 21, // 2 / (period + 1)
    },
    retention: {
      scanHistoryDays: 90,
      niftyHistoryDays: 365,
    },
    tradingHours: {
      open: "09:15",
      close: "15:30",
      morningReportTime: "09:29",
      eveningReportTime: "17:00",
    },
  },
};

// Freeze config to prevent modifications
Object.freeze(config);
Object.freeze(config.app);
Object.freeze(config.database);
Object.freeze(config.chartink);
Object.freeze(config.email);
Object.freeze(config.scheduler);
Object.freeze(config.security);
Object.freeze(config.nse);
Object.freeze(config.market);

module.exports = config;
