const { UserRepository } = require('../models/User');
const { isValidDescriptor, verifyFaceMatch } = require('../utils/faceMatcher');
const { sendTokenResponse } = require('../utils/token');

/**
 * @desc    Enroll biometric face template for the authenticated user
 * @route   POST /api/auth/face/enroll
 * @access  Private (Requires JWT)
 */
const enrollFace = async (req, res) => {
  try {
    const { descriptor, confidence = 0.98, device = 'Webcam' } = req.body;

    if (!descriptor) {
      return res.status(400).json({
        success: false,
        message: 'No facial descriptor provided in enrollment request.',
      });
    }

    if (!isValidDescriptor(descriptor)) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid facial descriptor format. Must be a 128-dimensional floating point array extracted by the biometric engine.',
      });
    }

    const updatedUser = await UserRepository.updateFaceEnrollment(req.user._id, {
      descriptor,
      confidence: typeof confidence === 'number' ? confidence : 0.98,
      device: typeof device === 'string' ? device.slice(0, 50) : 'Webcam',
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Face biometric template registered and encrypted successfully!',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        faceEnrolled: true,
        faceEnrolledAt: updatedUser.faceEnrolledAt,
        faceMetadata: updatedUser.faceMetadata,
      },
    });
  } catch (error) {
    console.error('[EchoSense Face Enroll Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll face biometric template: ' + error.message,
    });
  }
};

/**
 * @desc    Authenticate and log in using face verification
 * @route   POST /api/auth/face/login
 * @access  Public
 */
const loginWithFace = async (req, res) => {
  try {
    const { email, faceDescriptor } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the email associated with your enrolled account.',
      });
    }

    if (!faceDescriptor) {
      return res.status(400).json({
        success: false,
        message: 'No facial descriptor received from camera scanner.',
      });
    }

    if (!isValidDescriptor(faceDescriptor)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid biometric descriptor format received.',
      });
    }

    // Retrieve user including enrolled 128-d biometric descriptor
    const user = await UserRepository.findByEmail(email.trim(), {
      includeFaceDescriptor: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account registered with this email address.',
        canFallbackToPassword: true,
      });
    }

    if (!user.faceEnrolled || !user.faceDescriptor || user.faceDescriptor.length !== 128) {
      return res.status(400).json({
        success: false,
        message:
          'Face biometric login is not yet enrolled for this account. Please log in with your password or Google and enable Face ID in your settings.',
        canFallbackToPassword: true,
      });
    }

    // Biometric distance verification
    const match = verifyFaceMatch(faceDescriptor, user.faceDescriptor);

    if (!match.isMatch) {
      return res.status(401).json({
        success: false,
        message: `Biometric verification failed. Euclidean distance (${match.distance}) exceeded threshold (${match.threshold}).`,
        distance: match.distance,
        threshold: match.threshold,
        canFallbackToPassword: true,
      });
    }

    // Match confirmed! Issue session token
    sendTokenResponse(
      user,
      200,
      res,
      `Biometric face match verified with ${match.confidence}% confidence! Welcome back, ${user.name}.`
    );
  } catch (error) {
    console.error('[EchoSense Face Login Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Internal error during biometric verification. Please use password login.',
      canFallbackToPassword: true,
    });
  }
};

/**
 * @desc    Delete and revoke face biometric enrollment
 * @route   DELETE /api/auth/face
 * @access  Private (Requires JWT)
 */
const deleteFace = async (req, res) => {
  try {
    const updatedUser = await UserRepository.removeFaceEnrollment(req.user._id);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Face biometric template and verification metadata permanently deleted.',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        faceEnrolled: false,
        faceEnrolledAt: null,
      },
    });
  } catch (error) {
    console.error('[EchoSense Delete Face Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove biometric data: ' + error.message,
    });
  }
};

module.exports = {
  enrollFace,
  loginWithFace,
  deleteFace,
};
