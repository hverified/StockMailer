// scripts/seed-nifty.js
require('dotenv').config();
const mongodb = require('../src/config/mongodb');
const NiftyDBService = require('../src/services/nifty.db.service');
const logger = require('../src/utils/logger');

const seedData = [
  { "date": "2025-12-01", "price": 26175.75 },
  { "date": "2025-12-02", "price": 26032.20 },
  { "date": "2025-12-03", "price": 25986.00 },
  { "date": "2025-12-04", "price": 26033.75 },
  { "date": "2025-12-05", "price": 26186.45 },
  { "date": "2025-12-08", "price": 25960.55 },
  { "date": "2025-12-09", "price": 25839.65 },
  { "date": "2025-12-10", "price": 25758.00 },
  { "date": "2025-12-11", "price": 25898.55 },
  { "date": "2025-12-12", "price": 26046.95 },
  { "date": "2025-12-15", "price": 26027.30 },
  { "date": "2025-12-16", "price": 25860.10 },
  { "date": "2025-12-17", "price": 25818.55 },
  { "date": "2025-12-18", "price": 25815.55 },
  { "date": "2025-12-19", "price": 25966.40 },
  { "date": "2025-12-22", "price": 26172.40 },
  { "date": "2025-12-23", "price": 26177.15 },
  { "date": "2025-12-24", "price": 26142.10 },
  { "date": "2025-12-26", "price": 26042.30 },
  { "date": "2025-12-29", "price": 25942.10 },
  { "date": "2025-12-30", "price": 25938.85 },
  { "date": "2025-12-31", "price": 26129.60 },
  { "date": "2026-01-01", "price": 26140.55 },
];

async function seedNiftyData() {
  try {
    logger.info('🌱 Starting Nifty 50 data seeding...');
    
    await mongodb.connect();
    const niftyDBService = new NiftyDBService();
    
    await niftyDBService.seedInitialData(seedData);
    
    logger.info('✅ Nifty 50 data seeded successfully');
    logger.info(`📊 Seeded ${seedData.length} records`);
    
    // Test EMA calculation
    const ema20 = await niftyDBService.calculateEMA20();
    logger.info(`📈 Calculated 20 EMA: ₹${ema20}`);
    
    await mongodb.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error(`❌ Seeding failed: ${error.message}`);
    logger.error(error.stack);
    process.exit(1);
  }
}

seedNiftyData();