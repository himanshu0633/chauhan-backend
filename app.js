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

// 6) CORS configuration
const corsOptions = {
  origin: ['https://www.chauhansonsjewellers.com'], // Allow requests from your frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// 6) CORS configuration
const allowedOrigins = [
  'https://chauhansonsjewellers.com',
  'https://www.chauhansonsjewellers.com'
];

app.set('trust proxy', true);

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true); // allow curl/postman
    return cb(null, allowedOrigins.includes(origin));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Apply CORS middleware with the above options
app.use(cors(corsOptions));

// 7) Global middleware
app.use(express.json());
app.use(cors());
app.set('trust proxy', true);

// Static files
app.use('/uploads', express.static('uploads'));

// 8) Routes (Routers only; no app.listen in any route file)
app.use('/admin', adminRoutes);
app.use('/user', usersRoutes);
app.use('/api', orderRoutes);
// app.use('/', support);
// app.use('/', cities);

// 9) Logs API endpoint (reads JSON lines written by logger)
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

// 10) Health check
app.get('/', (req, res) => {
  res.send('✅ Chauhan jewellers backend is running with HTTPS!');
});

// 11) 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// 12) Error handler
// Ensure nothing logs `app` here; keep utils pure to avoid circular imports.
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err?.message, stack: err?.stack });
  res.status(500).json({ error: 'Internal Server Error' });
});
