const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../config');
const logger = require('../utils/logger');
const helpers = require('../utils/helpers');

class ChartinkScraper {
  constructor() {
    this.csrfToken = null;
    this.cookies = null;
  }

  async fetchCSRFToken() {
    try {
      logger.debug('Fetching CSRF token from Chartink...');
      
      const response = await axios.get(config.chartink.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 30000
      });
      
      // Extract cookies from response
      const setCookieHeader = response.headers['set-cookie'];
      if (setCookieHeader) {
        this.cookies = setCookieHeader.map(cookie => cookie.split(';')[0]).join('; ');
        logger.debug(`Cookies stored: ${this.cookies}`);
      }
      
      // Extract CSRF token from HTML
      const $ = cheerio.load(response.data);
      const csrfToken = $('meta[name="csrf-token"]').attr('content');
      
      if (!csrfToken) {
        throw new Error('CSRF token not found on page');
      }
      
      this.csrfToken = csrfToken;
      logger.debug('CSRF token fetched successfully');
      return csrfToken;
    } catch (error) {
      logger.error(`Error fetching CSRF token: ${error.message}`);
      throw error;
    }
  }

  async scrapeStocks() {
    try {
      // Always fetch fresh CSRF token and cookies
      await this.fetchCSRFToken();
      
      logger.info('Scraping stocks from Chartink...');
      
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-CSRF-Token': this.csrfToken,
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://chartink.com',
        'Referer': config.chartink.url,
        'Connection': 'keep-alive'
      };

      // Add cookies if available
      if (this.cookies) {
        headers['Cookie'] = this.cookies;
      }

      const response = await axios.post(
        config.chartink.processUrl,
        `scan_clause=${encodeURIComponent(config.chartink.scanClause)}`,
        {
          headers,
          timeout: 30000,
          maxRedirects: 5
        }
      );

      // Check for error in response
      if (response.data.message) {
        throw new Error(`Chartink API Error: ${response.data.message}`);
      }

      const stocks = (response.data.data || []).map(row => ({
        id: helpers.generateId(),
        stock_name: row.name,
        symbol: row.nsecode,
        bsecode: row.bsecode,
        per_chg: row.per_chg,
        close: row.close,
        volume: row.volume,
        status: 'shortlisted',
        shortlisted_date: helpers.currentDate()
      }));

      logger.info(`Successfully scraped ${stocks.length} stocks from Chartink`);
      return stocks;
    } catch (error) {
      if (error.response) {
        logger.error(`Error scraping stocks: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else {
        logger.error(`Error scraping stocks: ${error.message}`);
      }
      throw error;
    }
  }
}

module.exports = ChartinkScraper;