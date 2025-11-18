# Stock Mailer API Documentation

## 📚 Swagger UI Access

Once your server is running, access the interactive API documentation at:

**Local Development:**
```
http://localhost:3000/api-docs
```

**Production (Vercel):**
```
https://your-app.vercel.app/api-docs
```

## 🚀 Installation

Install the required Swagger dependencies:

```bash
npm install swagger-jsdoc swagger-ui-express --save
```

## 📖 API Endpoints Overview

### Health Check
- **GET** `/health` - Check API health status

### Reports
- **POST** `/trigger-report` - Manually trigger stock report generation
- **GET** `/api/cron` - Scheduled cron endpoint (called by Vercel)

### Testing
- **GET** `/test-scrape` - Test Chartink scraping
- **GET** `/test-nifty` - Test Nifty 50 EMA calculation
- **POST** `/test-email` - Send test email

### Stock Data
- **GET** `/quote/{symbol}` - Get real-time stock quote

## 🔧 Features

- **Interactive API Testing**: Try out endpoints directly from the browser
- **Request/Response Examples**: See sample data for each endpoint
- **Schema Definitions**: Detailed models for all data structures
- **Authentication Support**: Bearer token authentication for cron endpoint
- **Filtering & Search**: Quick search through endpoints
- **Request Duration**: See how long each request takes

## 📝 Swagger Annotations

All endpoints are documented using JSDoc annotations in the route files:

```javascript
/**
 * @swagger
 * /endpoint:
 *   get:
 *     summary: Brief description
 *     description: Detailed description
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: Success response
 */
```

## 🎨 Customization

The Swagger UI is configured with:
- Hidden top bar for cleaner look
- Persistent authorization
- Request duration display
- Filter/search enabled
- Try it out enabled by default

## 🔐 Security

For the cron endpoint, you can add authentication:

1. Set `CRON_SECRET` environment variable in Vercel
2. Add `Bearer {your-secret}` to Authorization header in Swagger UI
3. Click "Authorize" button in Swagger UI to set the token

## 📦 File Structure

```
project/
├── src/
│   ├── config/
│   │   └── swagger.js          # Swagger configuration
│   ├── routes/
│   │   └── index.js            # Routes with @swagger annotations
│   └── app.js                  # Express app with Swagger UI setup
└── api/
    └── cron.js                 # Vercel cron endpoint
```

## 🌐 Deployment

The Swagger documentation automatically deploys with your app to Vercel. No additional configuration needed!

## 💡 Usage Tips

1. **Try It Out**: Click "Try it out" on any endpoint to test it
2. **View Schema**: Click on schema names to see detailed structure
3. **Copy Requests**: Use the "Copy" button to get cURL commands
4. **Expand All**: Click "Expand Operations" to see all endpoints at once
5. **Filter**: Use the search box to quickly find endpoints

## 🎯 Next Steps

- Add more detailed examples
- Include authentication flows
- Add rate limiting documentation
- Document error codes
- Add API versioning

---
