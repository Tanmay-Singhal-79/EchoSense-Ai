const express = require('express');
const router = express.Router();
const { register, login, googleAuth, getMe, logout } = require('../controllers/authController');
const requireAuth = require('../middleware/requireAuth');
const { authLimiter } = require('../middleware/rateLimiter');

// Public authentication routes
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', googleAuth);
router.post('/logout', logout);

// Protected session route
router.get('/me', requireAuth, getMe);

module.exports = router;
