'use strict';

/**
 * app.js – Express application setup (no app.listen here)
 * PM2 should start server.js which requires this file.
 */

// 1) Load env first
const dotenv = require('dotenv');
dotenv.config();

// 2) Core deps
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const http = require('http');

// 3) Local deps (must NOT import ./server to avoid circular requires)
const connectDB = require('./config/db');
const adminRoutes = require('./routes/admin');
const usersRoutes = require('./routes/users');
const orderRoutes = require('./routes/order');
// const support = require('./routes/support');
// const cities = require('./routes/city');
const { logger, logFilePath } = require('./utils/logger');

// 4) Create app early and export immediately (helps if something requires app)
const app = express();
module.exports = app; // <-- Important: do not move below route requires

// 5) Connect to DB (non-blocking). If connectDB returns a promise, you can .catch here.
try {
  const maybePromise = connectDB();
  if (maybePromise && typeof maybePromise.catch === 'function') {
    maybePromise.catch(err => {
      logger.error('Database connection error', { error: err?.message });
    });
  }
} catch (err) {
  logger.error('Database connection threw synchronously', { error: err?.message });
}

// 6) Global middleware
app.use(express.json());
app.use(cors());

// Force HTTPS in production (ensure that app runs on HTTPS)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
  });
}

app.set('trust proxy', true);  // To handle proxy when using reverse proxies like Nginx

// Static files
app.use('/uploads', express.static('uploads'));
// const path = require('path');
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 7) Routes (Routers only; no app.listen in any route file)
app.use('/admin', adminRoutes);
app.use('/user', usersRoutes);
app.use('/api', orderRoutes);
// app.use('/', support);
// app.use('/', cities);

// 8) Logs API endpoint (reads JSON lines written by logger)
app.get('/api/logs', (req, res) => {
  fs.readFile(logFilePath, 'utf8', (err, data = '') => {
    if (err) {
      logger.error('Failed to read log file', { error: err.message });
      return res.status(500).json({ error: 'Unable to read log file' });
    }
    try {
      const logs = data
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => JSON.parse(line));
      res.json(logs);
    } catch (parseErr) {
      logger.error('Failed to parse log file contents', { error: parseErr.message });
      res.status(500).json({ error: 'Log file is not valid JSON lines' });
    }
  });
});

// 9) Health check
app.get('/', (req, res) => {
  res.send('✅ Chauhan jewellers backend is running with HTTPS!');
});

// 10) 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// 11) Error handler
// Ensure nothing logs `app` here; keep utils pure to avoid circular imports.
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err?.message, stack: err?.stack });
  res.status(500).json({ error: 'Internal Server Error' });
});

// If running in production, make sure to use HTTPS server
if (process.env.NODE_ENV === 'production') {
  const sslOptions = {
    key: fs.readFileSync('/path/to/your/ssl.key'), // Path to your SSL key
    cert: fs.readFileSync('/path/to/your/ssl.cert') // Path to your SSL cert
  };

  // Create HTTPS server
  https.createServer(sslOptions, app).listen(443, () => {
    console.log('HTTPS Server running on port 443');
  });

  // Optionally, also redirect all HTTP traffic to HTTPS
  http.createServer(app).listen(80, () => {
    console.log('HTTP Server running on port 80 (redirecting to HTTPS)');
  });
} else {
  // In development or non-production environment, fallback to HTTP for testing
  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
}
