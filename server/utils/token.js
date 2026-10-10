const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  return process.env.JWT_SECRET || 'echosense_ai_jwt_super_secret_key_2026_dev_mode_token';
};

/**
 * Generate signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Send token via HTTP-only cookie and JSON response
 */
const sendTokenResponse = (user, statusCode, res, message = 'Authentication successful') => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true, // Prevents XSS script access
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  // Strip sensitive fields before responding
  const safeUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role || 'researcher',
    faceEnrolled: Boolean(user.faceEnrolled),
    faceEnrolledAt: user.faceEnrolledAt || null,
    faceMetadata: user.faceMetadata || {},
    authProvider: user.authProvider || 'local',
    createdAt: user.createdAt,
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message,
      token,
      user: safeUser,
    });
};

module.exports = {
  generateToken,
  sendTokenResponse,
  getJwtSecret,
};
