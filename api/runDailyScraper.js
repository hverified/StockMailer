const ChartinkScraper = require('../src/services/scraper.service');
const EmailService = require('../src/services/email.service');
const logger = require('../src/utils/logger');

const scraper = new ChartinkScraper();
const emailService = new EmailService();

module.exports = async (req, res) => {
  try {
    logger.info('🚀 Running Vercel-scheduled daily task...');
    
    const stocks = await scraper.scrapeStocks();
    await emailService.sendStockReport(stocks);
    
    logger.info('✅ Daily task completed successfully');
    res.status(200).json({ success: true });
  } catch (error) {
    logger.error(`❌ Daily task failed: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};
