// // 1: with nodemailer:
// 1) Load env first
const dotenv = require('dotenv');
dotenv.config();


// 2) Core deps
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const nodemailer = require('nodemailer');


// 3) Local deps (must NOT import ./server to avoid circular requires)
const connectDB = require('./config/db');
const adminRoutes = require('./routes/admin');
const usersRoutes = require('./routes/users');
const orderRoutes = require('./routes/order');
const reviewRoutes = require('./routes/review');
const videoRoutes = require('./routes/video');
// const support = require('./routes/support');
// const cities = require('./routes/city');
const { logger, logFilePath } = require('./utils/logger');


// In-memory OTP store (for demo; switch to DB or cache in production)
const otpStore = {};


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
  'https://chauhansonsjewellers.com',  // Allow your main domain
  'https://www.chauhansjewellers.com', // Allow the www subdomain
  'http://localhost:5173',            // Allow local development
  'https://fvvcbrpm-4000.inc1.devtunnels.ms', // Allow dev tunnel if needed
   'http://31.97.237.55',
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // Allow requests with no origin (like Postman)
    if (allowedOrigins.includes(origin)) {
      return cb(null, true); // Allow CORS for allowed origins
    } else {
      return cb(new Error('CORS policy: Origin not allowed'), false); // Block other origins
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,  // Allow credentials (cookies, authorization headers)
}));

// Apply CORS middleware

// 7) Global middleware
app.use(express.json());
app.use(cors());
app.set('trust proxy', true);


// Static files
app.use('/uploads', express.static('uploads'));
app.use('/api/review', reviewRoutes);


// 8) Routes (Routers only; no app.listen in any route file)
app.use('/admin', adminRoutes);
app.use('/user', usersRoutes);
app.use('/api', orderRoutes);
app.use('/videos', videoRoutes);
// app.use('/', support);
// app.use('/', cities);

// --- New OTP Email Verification Routes ---

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  }
});

// option: Contact form route to send mail (improved)
app.post('/send-contact-form', async (req, res) => {
  const { name, email, mobile, location, message } = req.body;
  if (!name || !email || !mobile || !location || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      // to: 'ciisankita@gmail.com',
      to: 'chauhansons69@yahoo.com',
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h3>Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${mobile}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Message:</strong><br/>${String(message).replace(/\n/g, '<br/>')}</p>
      `
    });
    res.status(200).json({ message: 'Contact form submitted successfully' });
  } catch (error) {
    logger.error('Failed to send contact form email', { error: error.message });
    res.status(500).json({ message: 'Failed to send contact email' });
  }
});

// Endpoint to send OTP to email
app.post('/api/send-otp', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP with 5-minute expiry
  otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      logger.error('Failed to send OTP email', { error: error.message });
      return res.status(500).json({ message: 'Failed to send OTP' });
    }
    logger.info('OTP email sent', { to: email });
    res.json({ message: 'OTP sent successfully' });
  });
});

// Endpoint to verify OTP
app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  const record = otpStore[email];
  if (!record) {
    return res.status(400).json({ message: 'OTP not found or expired, please request again' });
  }

  if (Date.now() > record.expires) {
    delete otpStore[email];
    return res.status(400).json({ message: 'OTP expired, please request again' });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  // Successful verification
  delete otpStore[email];
  res.json({ message: 'OTP verified successfully' });
});


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

