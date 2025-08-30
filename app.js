
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

/// 6) CORS configuration
const allowedOrigins = [
  'https://chauhansonsjewellers.com',    // Production domain
  'https://www.chauhansjewellers.com',   // Production domain
  'http://localhost:5173',               // Local development (frontend running on localhost)
];

app.set('trust proxy', true);

// Apply CORS middleware
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (like curl or Postman requests)
    if (!origin) return cb(null, true); 

    // Check if the origin is allowed
    if (allowedOrigins.includes(origin)) {
      return cb(null, true);
    } else {
      return cb(new Error('CORS policy: Origin not allowed'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true, // Allow cookies/credentials
}));


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
