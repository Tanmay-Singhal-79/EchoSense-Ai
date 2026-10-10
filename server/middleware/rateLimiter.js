const rateLimit = require('express-rate-limit');

// Protect authentication and biometric endpoints against brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

const faceLoginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 15, // Limit biometric match trials to 15 per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many face verification attempts. Please use password or Google login.',
  },
});

module.exports = {
  authLimiter,
  faceLoginLimiter,
};
