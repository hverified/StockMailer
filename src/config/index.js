module.exports = {
  chartink: {
    url: process.env.CHARTINK_URL || 'https://chartink.com/screener/your-screener',
    scanClause: process.env.CHARTINK_SCAN_CLAUSE || 'your-scan-clause-here',
    processUrl: 'https://chartink.com/screener/process'
  },
  email: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    recipient: process.env.RECIPIENT_EMAIL,
    service: process.env.EMAIL_SERVICE || 'gmail'
  },
  scheduler: {
    cronTime: process.env.CRON_TIME || '0 17 * * *',
    timezone: process.env.TIMEZONE || 'Asia/Kolkata'
  },
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  }
};