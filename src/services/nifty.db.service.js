// src/services/nifty.db.service.js
const mongodb = require("../config/mongodb");
const NiftyRepository = require("./repositories/nifty.repository");

class NiftyDBService {
  constructor() {
    this.repository = null;
  }

  _ensureRepository() {
    if (!this.repository) {
      const db = mongodb.getDb();
      this.repository = new NiftyRepository(db);
    }
    return this.repository;
  }

  async saveNiftyData(price, date = null) {
    return this._ensureRepository().savePrice(price, date);
  }

  async getHistoricalPrices(days = 20) {
    return this._ensureRepository().getHistoricalPrices(days);
  }

  async calculateEMA20() {
    return this._ensureRepository().calculateEMA20();
  }

  async seedInitialData(data) {
    return this._ensureRepository().bulkSeed(data);
  }

  async deleteOldData(daysToKeep = 365) {
    return this._ensureRepository().deleteOlderThan(daysToKeep);
  }
}

module.exports = NiftyDBService;
