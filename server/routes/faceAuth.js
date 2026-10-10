const express = require('express');
const router = express.Router();
const { enrollFace, loginWithFace, deleteFace } = require('../controllers/faceAuthController');
const requireAuth = require('../middleware/requireAuth');
const { faceLoginLimiter } = require('../middleware/rateLimiter');

// Biometric Face Enrollment (Protected - user must be signed in)
router.post('/enroll', requireAuth, enrollFace);

// Biometric Face Login (Public with rate limiter)
router.post('/login', faceLoginLimiter, loginWithFace);

// Delete Biometric Face Profile (Protected)
router.delete('/', requireAuth, deleteFace);

module.exports = router;
