const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../utils/token');
const { UserRepository } = require('../models/User');

const requireAuth = async (req, res, next) => {
  try {
    let token = null;

    // Read from HTTP-only cookie first, fallback to Authorization header
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please log in to proceed.',
      });
    }

    const decoded = jwt.verify(token, getJwtSecret());
    const user = await UserRepository.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User session has expired or is invalid. Please log in again.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[EchoSense Auth Middleware Error]:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please log in again.',
    });
  }
};

module.exports = requireAuth;
