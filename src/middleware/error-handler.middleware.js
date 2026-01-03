// src/middleware/error-handler.middleware.js
/**
 * Centralized Error Handling Middleware
 * Provides consistent error responses and logging
 */

const logger = require("../utils/logger");

/**
 * Custom Application Error class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Specific error types
 */
class DatabaseError extends AppError {
  constructor(message) {
    super(message, 503, true);
    this.name = "DatabaseError";
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, true);
    this.name = "ValidationError";
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404, true);
    this.name = "NotFoundError";
  }
}

class ExternalServiceError extends AppError {
  constructor(message, service) {
    super(`${service}: ${message}`, 502, true);
    this.name = "ExternalServiceError";
    this.service = service;
  }
}

/**
 * Express error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500 if status code not set
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  // Log error details
  const errorLog = {
    message: err.message,
    name: err.name,
    statusCode,
    isOperational,
    method: req.method,
    url: req.url,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  };

  // Log with appropriate level
  if (statusCode >= 500) {
    logger.error("Server Error:", errorLog);
    logger.error(err.stack);
  } else if (statusCode >= 400) {
    logger.warn("Client Error:", errorLog);
  }

  // Don't expose internal errors in production
  const response = {
    success: false,
    error: isOperational ? err.message : "Internal Server Error",
    statusCode,
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
    response.details = err;
  }

  res.status(statusCode).json(response);
};

/**
 * Async error wrapper - catches async errors in route handlers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.method} ${req.url} not found`);
  next(error);
};

module.exports = {
  AppError,
  DatabaseError,
  ValidationError,
  NotFoundError,
  ExternalServiceError,
  errorHandler,
  asyncHandler,
  notFoundHandler,
};
