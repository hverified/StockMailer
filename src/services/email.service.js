const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../utils/logger');
const { generateEmailHTML } = require('../templates/email.template');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: config.email.service,
      auth: {
        user: config.email.user,
        pass: config.email.password
      }
    });
  }

  async sendStockReport(stocks) {
    try {
      const mailOptions = {
        from: config.email.user,
        to: config.email.recipient,
        subject: `Daily Stock Report - ${new Date().toLocaleDateString('en-IN')}`,
        html: generateEmailHTML(stocks)
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully - Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error(`Error sending email: ${error.message}`);
      throw error;
    }
  }

  async sendTestEmail() {
    try {
      const testStocks = [
        {
          stock_name: 'Reliance Industries Ltd',
          symbol: 'RELIANCE',
          close: 2450.50,
          per_chg: 2.5,
          volume: 5000000
        },
        {
          stock_name: 'Tata Consultancy Services Ltd',
          symbol: 'TCS',
          close: 3650.75,
          per_chg: -1.2,
          volume: 2000000
        }
      ];

      return await this.sendStockReport(testStocks);
    } catch (error) {
      logger.error(`Error sending test email: ${error.message}`);
      throw error;
    }
  }
}

module.exports = EmailService;