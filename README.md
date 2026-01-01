# Stock Mailer API Documentation

## 📚 Overview

Automated stock screening and email reporting system that integrates with Chartink and NSE India. Features include:

- Daily automated stock scanning
- Email reports with Nifty 50 analysis
- Historical scan data tracking
- Real-time Nifty 50 EMA calculation
- Web dashboard for monitoring

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Gmail account for sending emails

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your credentials
# - MongoDB URI
# - Email credentials
# - Chartink scan details
```

### Initial Setup

1. **Seed Nifty 50 Historical Data**

```bash
npm run seed:nifty
```

This will populate the last 20 days of Nifty 50 data needed for EMA calculation.

2. **Start the Server**

```bash
# Development
npm run dev

# Production
npm start
```

3. **Access Dashboard**

Open http://localhost:3000

## 📖 Features

### 1. Market Scan
- Real-time stock screening from Chartink
- Nifty 50 condition checking
- Day high enrichment from NSE

### 2. History Tracking
- View all historical scans
- Date-wise stock listings
- Nifty 50 data for each scan
- Click any date to see details

### 3. Manual Scanning
- Run scans on-demand from dashboard
- Automatic database storage
- Duplicate prevention (by date + symbol)

### 4. Automated Reports
- Daily email reports at 5:00 PM IST
- Morning pre-market reports at 9:29 AM IST
- Nifty 50 analysis included

## 🗄️ Database Structure

### Collections

#### `stocks`
```javascript
{
  _id: ObjectId,
  id: String,
  stock_name: String,
  symbol: String,
  bsecode: String,
  per_chg: Number,
  close: Number,
  volume: Number,
  dayHigh: Number,
  status: String,
  scannedDate: String, // YYYY-MM-DD
  timestamp: Date,
  niftyData: {
    currentPrice: Number,
    ema20: Number,
    isAboveEMA: Boolean
  }
}
```

**Indexes:**
- `{ symbol: 1, scannedDate: 1 }` - Unique
- `{ scannedDate: -1 }` - For date queries

#### `nifty50`
```javascript
{
  _id: ObjectId,
  date: String, // YYYY-MM-DD
  price: Number,
  timestamp: Date
}
```

**Indexes:**
- `{ date: 1 }` - Unique
- `{ date: -1 }` - For latest price

## 📡 API Endpoints

### Health & Status
- `GET /health` - System health check
- `GET /nifty-status` - Current Nifty 50 status

### Scanning
- `GET /test-scrape` - Test Chartink scraper
- `POST /api/manual-scan` - Manual scan trigger
- `POST /trigger-report` - Generate and email report

### History
- `GET /api/scan-history` - Get all scan dates
- `GET /api/scan-history/:date` - Get stocks for date

### Reports
- `GET /api/cron` - Automated evening report (Vercel)
- `GET /api/morning-cron` - Morning pre-market report

### Testing
- `POST /test-email` - Send test email
- `GET /test-nifty` - Test Nifty 50 fetch

Full API documentation: http://localhost:3000/api-docs

## 🔧 Configuration

### Environment Variables

```bash
# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
RECIPIENT_EMAIL=recipient@example.com

# Chartink
CHARTINK_URL=https://chartink.com/screener/your-screener
CHARTINK_SCAN_CLAUSE=your-scan-clause

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/
MONGODB_DB_NAME=stockmailer

# Scheduler
CRON_TIME=0 17 * * *
TIMEZONE=Asia/Kolkata

# Security
CRON_SECRET=your-secret
```

## 📊 Nifty 50 EMA Calculation

The system calculates 20-day EMA using historical data stored in MongoDB:

1. **Data Collection:** Saves Nifty 50 price daily
2. **EMA Formula:** `EMA = (Price - PrevEMA) × Multiplier + PrevEMA`
3. **Multiplier:** `2 / (Period + 1) = 2 / 21 = 0.0952`

### Seeding Initial Data

Update `scripts/seed-nifty.js` with actual Nifty 50 closing prices, then:

```bash
npm run seed:nifty
```

## 🌐 Deployment

### Vercel

1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

The cron jobs are configured in `vercel.json`:
- Evening report: 5:00 PM IST (11:30 UTC)
- Morning report: 9:29 AM IST (3:59 UTC)

### MongoDB Atlas

1. Create cluster at mongodb.com
2. Add IP whitelist (0.0.0.0/0 for serverless)
3. Create database user
4. Copy connection string to `MONGODB_URI`

## 🔐 Security

- Email passwords use app-specific passwords
- Cron endpoints protected with `CRON_SECRET`
- MongoDB uses connection string authentication
- No sensitive data in logs

## 🧹 Maintenance

### Clean Old Data

```javascript
// Delete scans older than 90 days
await stockDBService.deleteOldScans(90);

// Delete Nifty data older than 1 year
await niftyDBService.deleteOldData(365);
```

### Database Indexes

Indexes are created automatically on first connection. To recreate:

```javascript
await mongodb.createIndexes();
```

## 📝 Notes

- **Duplicate Prevention:** Stocks are unique by `symbol + scannedDate`
- **EMA Requirement:** Minimum 20 days of Nifty data needed
- **Rate Limiting:** NSE requests have 1-1.5s delays
- **Vercel Limits:** 10s timeout for serverless functions

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check connection string format
# Ensure IP whitelist includes your IP
# Verify database user has read/write permissions
```

### EMA Calculation Returns Null
```bash
# Run seed script to populate initial data
npm run seed:nifty

# Verify data exists
# Check MongoDB logs
```

### Cron Not Running
```bash
# Verify CRON_SECRET matches in Vercel
# Check Vercel function logs
# Ensure vercel.json has correct schedule
```

## 📧 Support

For issues or questions:
- Email: hverified@gmail.com
- Check logs: `logs/` directory
- MongoDB logs: Atlas dashboard

---

© 2025 Khalid Siddiqui • Built with Node.js, MongoDB, Express