// src/config/mongodb.js
const { MongoClient } = require('mongodb');
const logger = require('../utils/logger');

class MongoDB {
  constructor() {
    this.client = null;
    this.db = null;
    this.connectPromise = null;
  }

  async connect() {
    try {
      if (this.db) {
        return this.db;
      }
      if (this.connectPromise) {
        return await this.connectPromise;
      }

      const uri = process.env.MONGODB_URI;
      if (!uri) {
        throw new Error('MONGODB_URI environment variable is not set');
      }

      this.connectPromise = (async () => {
        if (!this.client) {
          this.client = new MongoClient(uri, {
            maxPoolSize: 10,
            minPoolSize: 2,
            maxIdleTimeMS: 30000
          });
        }

        await this.client.connect();
        this.db = this.client.db(process.env.MONGODB_DB_NAME || 'stockmailer');

        // Create indexes
        await this.createIndexes();

        logger.info('✅ MongoDB connected successfully');
        return this.db;
      })();

      const db = await this.connectPromise;
      this.connectPromise = null;
      return db;
    } catch (error) {
      this.connectPromise = null;
      if (!this.db && this.client) {
        try {
          await this.client.close();
        } catch {
          // ignore close errors after failed connect
        }
        this.client = null;
      }
      logger.error(`MongoDB connection error: ${error.message}`);
      throw error;
    }
  }

  async createIndexes() {
    try {
      const db = this.db;
      
      // Stocks collection indexes
      await db.collection('stocks').createIndex(
        { symbol: 1, scannedDate: 1 }, 
        { unique: true }
      );
      await db.collection('stocks').createIndex({ scannedDate: -1 });
      
      // Nifty50 collection indexes
      await db.collection('nifty50').createIndex({ date: 1 }, { unique: true });
      await db.collection('nifty50').createIndex({ date: -1 });

      // Users collection indexes
      await db.collection('users').createIndex({ username: 1 }, { unique: true });
      await db.collection('users').createIndex({ 'sessions.tokenHash': 1 });
      
      logger.info('✅ MongoDB indexes created');
    } catch (error) {
      logger.error(`Error creating indexes: ${error.message}`);
    }
  }

  async disconnect() {
    this.connectPromise = null;
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      logger.info('MongoDB disconnected');
    }
  }

  getDb() {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }
}

// Singleton instance
const mongodb = new MongoDB();

module.exports = mongodb;
