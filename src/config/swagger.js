// src/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Stock Mailer API',
      version: '1.0.0',
      description: 'Automated stock screening and email reporting system that integrates with Chartink and Yahoo Finance',
      contact: {
        name: 'API Support',
        email: 'hverified@gmail.com'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://stock-mailer.vercel.app',
        description: 'Production server'
      }
    ],
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoints'
      },
      {
        name: 'Reports',
        description: 'Stock report generation and triggering'
      },
      {
        name: 'Testing',
        description: 'Testing and debugging endpoints'
      },
      {
        name: 'Stock Data',
        description: 'Stock quotes and market data'
      }
    ],
    components: {
      schemas: {
        NiftyData: {
          type: 'object',
          properties: {
            currentPrice: {
              type: 'number',
              description: 'Current Nifty 50 price',
              example: 19850.25
            },
            ema20: {
              type: 'number',
              description: '20-day Exponential Moving Average',
              example: 19500.00
            },
            isAboveEMA: {
              type: 'boolean',
              description: 'Whether Nifty 50 is above its 20 EMA',
              example: true
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp of data fetch'
            }
          }
        },
        Stock: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique stock identifier'
            },
            stock_name: {
              type: 'string',
              description: 'Full name of the stock',
              example: 'Reliance Industries Ltd'
            },
            symbol: {
              type: 'string',
              description: 'Stock symbol/ticker',
              example: 'RELIANCE'
            },
            bsecode: {
              type: 'string',
              description: 'BSE code'
            },
            per_chg: {
              type: 'number',
              description: 'Percentage change',
              example: 2.5
            },
            close: {
              type: 'number',
              description: 'Closing price',
              example: 2450.50
            },
            volume: {
              type: 'number',
              description: 'Trading volume',
              example: 5000000
            },
            dayHigh: {
              type: 'number',
              description: 'Day high price',
              example: 2475.80
            },
            status: {
              type: 'string',
              description: 'Stock status',
              example: 'shortlisted'
            },
            shortlisted_date: {
              type: 'string',
              format: 'date',
              description: 'Date when stock was shortlisted'
            }
          }
        },
        StockQuote: {
          type: 'object',
          properties: {
            symbol: {
              type: 'string',
              example: 'RELIANCE'
            },
            price: {
              type: 'number',
              example: 2450.50
            },
            change: {
              type: 'number',
              example: 25.30
            },
            changePercent: {
              type: 'number',
              example: 1.04
            },
            volume: {
              type: 'number',
              example: 5000000
            },
            marketCap: {
              type: 'number',
              example: 16500000000000
            },
            dayHigh: {
              type: 'number',
              example: 2475.80
            },
            dayLow: {
              type: 'number',
              example: 2435.20
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              description: 'Error message'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Success message'
            }
          }
        }
      },
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your bearer token'
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './api/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs;