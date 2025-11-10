require('dotenv').config();
const app = require('./src/app');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info('='.repeat(60));
  logger.info('🚀 PRODUCTION STOCK SCRAPER STARTED');
  logger.info('='.repeat(60));
  logger.info(`📡 Server: http://localhost:${PORT}`);
  logger.info(`⏰ Schedule: ${process.env.CRON_TIME || '0 17 * * *'}`);
  logger.info(`🕐 Timezone: ${process.env.TIMEZONE || 'Asia/Kolkata'}`);
  logger.info('='.repeat(60));
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('\n⏹️  Shutting down gracefully...');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});