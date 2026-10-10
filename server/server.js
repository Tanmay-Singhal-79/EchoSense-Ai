require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/database');

const authRoutes = require('./routes/auth');
const faceAuthRoutes = require('./routes/faceAuth');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Connect Database
connectDB();

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false, // Allows flexible local dev and camera streaming
  })
);

app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// API Routes
app.use('/api/auth/face', faceAuthRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'EchoSense AI Engine Authentication & Biometrics API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`,
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[EchoSense Server Error]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` 🔮 EchoSense AI Backend API running on port ${PORT}`);
  console.log(` 🌐 Client Origin allowed: ${CLIENT_URL}`);
  console.log(` 🛡️  Biometric Engine: 128d Euclidean Vector Verification`);
  console.log(`=======================================================`);
});

module.exports = { app, server };
