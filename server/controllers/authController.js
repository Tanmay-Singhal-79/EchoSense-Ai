const { OAuth2Client } = require('google-auth-library');
const { UserRepository } = require('../models/User');
const { sendTokenResponse } = require('../utils/token');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Server-side validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your full name.' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check if email already registered
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in.',
      });
    }

    // Create user
    const newUser = await UserRepository.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      authProvider: 'local',
    });

    sendTokenResponse(newUser, 201, res, 'Account created successfully! You can now enroll your face.');
  } catch (error) {
    console.error('[EchoSense Register Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration. Please try again.',
    });
  }
};

/**
 * @desc    Log in with email & password
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Find user including password hash
    const user = await UserRepository.findByEmail(email, { includePassword: true });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    // Check if account was created with Google and has no password
    if (!user.password && user.googleId) {
      return res.status(400).json({
        success: false,
        message: 'This account was created with Google. Please use "Continue with Google".',
      });
    }

    const isMatch = await UserRepository.verifyPassword(user, password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    sendTokenResponse(user, 200, res, `Welcome back to EchoSense AI, ${user.name}!`);
  } catch (error) {
    console.error('[EchoSense Login Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.',
    });
  }
};

/**
 * @desc    Authenticate with Google OAuth 2.0
 * @route   POST /api/auth/google
 * @access  Public
 */
const googleAuth = async (req, res) => {
  try {
    const { credential, userInfo } = req.body;

    let email = null;
    let name = null;
    let googleId = null;

    if (process.env.GOOGLE_CLIENT_ID && credential) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        email = payload.email;
        name = payload.name;
        googleId = payload.sub;
      } catch (oauthErr) {
        console.warn('[EchoSense Google OAuth Verify Warning]:', oauthErr.message);
        // If real verification failed due to client mismatch or mock token
        if (userInfo && userInfo.email) {
          email = userInfo.email;
          name = userInfo.name || 'Google User';
          googleId = userInfo.sub || 'mock_google_' + Date.now();
        } else {
          return res.status(401).json({
            success: false,
            message: 'Google authentication verification failed. Please try again.',
          });
        }
      }
    } else if (userInfo && userInfo.email) {
      // Development simulated login mode when Google Cloud credentials aren't configured yet
      email = userInfo.email;
      name = userInfo.name || 'Google Researcher';
      googleId = userInfo.sub || 'mock_google_' + Date.now();
    } else {
      return res.status(400).json({
        success: false,
        message: 'Missing Google credentials or authorization token.',
      });
    }

    let user = await UserRepository.findByEmail(email);

    if (user) {
      // Account exists, associate googleId if not present
      if (!user.googleId) {
        user.googleId = googleId;
      }
    } else {
      // Register new user via Google
      user = await UserRepository.create({
        name: name || 'EchoSense User',
        email: email.toLowerCase(),
        googleId,
        authProvider: 'google',
      });
    }

    sendTokenResponse(user, 200, res, `Authenticated via Google as ${user.name}`);
  } catch (error) {
    console.error('[EchoSense Google Auth Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Google authentication.',
    });
  }
};

/**
 * @desc    Get current authenticated session profile
 * @route   GET /api/auth/me
 * @access  Private (Requires JWT)
 */
const getMe = async (req, res) => {
  try {
    const user = await UserRepository.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        faceEnrolled: Boolean(user.faceEnrolled),
        faceEnrolledAt: user.faceEnrolledAt,
        faceMetadata: user.faceMetadata || {},
        authProvider: user.authProvider,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[EchoSense GetMe Error]:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving profile' });
  }
};

/**
 * @desc    Log out and clear session cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logout = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully from EchoSense AI.',
  });
};

module.exports = {
  register,
  login,
  googleAuth,
  getMe,
  logout,
};
