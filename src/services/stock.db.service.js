// src/services/stock.db.service.js
const mongodb = require("../config/mongodb");
const StockRepository = require("./repositories/stock.repository");

class StockDBService {
  constructor() {
    this.repository = null;
  }

  _ensureRepository() {
    if (!this.repository) {
      const db = mongodb.getDb();
      this.repository = new StockRepository(db);
    }
    return this.repository;
  }

  async saveStocks(stocks, niftyData) {
    return this._ensureRepository().bulkSave(stocks, niftyData);
  }

  async getStocksByDate(date) {
    return this._ensureRepository().findByDate(date);
  }

  async getAllScanDates(limit = 30) {
    return this._ensureRepository().getScanDates(limit);
  }

  async getStockHistory(symbol, limit = 10) {
    return this._ensureRepository().getStockHistory(symbol, limit);
  }

  async deleteOldScans(daysToKeep = 90) {
    return this._ensureRepository().deleteOlderThan(daysToKeep);
  }

  async updateStockOutcome(symbol, date, outcome) {
    return this._ensureRepository().updateOutcomeBySymbolAndDate(
      symbol,
      date,
      outcome
    );
  }

  async getDateOutcomeReport(date) {
    return this._ensureRepository().getDateOutcomeReport(date);
  }

  async getAggregateOutcomeReport(limit = 30) {
    return this._ensureRepository().getAggregateOutcomeReport(limit);
  }
}

module.exports = StockDBService;
