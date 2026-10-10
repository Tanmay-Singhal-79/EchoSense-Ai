const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { getDbStatus } = require('../config/database');

// Mongoose User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Do not expose password by default
    },
    googleId: {
      type: String,
      default: null,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'face'],
      default: 'local',
    },
    faceEnrolled: {
      type: Boolean,
      default: false,
    },
    faceDescriptor: {
      type: [Number], // 128-dimensional biometric floating point vector
      default: undefined,
      select: false, // Never return raw biometric descriptors in standard queries
    },
    faceEnrolledAt: {
      type: Date,
      default: null,
    },
    faceMetadata: {
      algorithm: { type: String, default: '128d-euclidean-descriptor' },
      confidence: { type: Number, default: 0 },
      device: { type: String, default: 'Webcam' },
      lastVerifiedAt: { type: Date, default: null },
    },
    role: {
      type: String,
      enum: ['analyst', 'researcher', 'engineer', 'admin'],
      default: 'researcher',
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify password
userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const MongooseUser = mongoose.models.User || mongoose.model('User', userSchema);

// In-Memory Fallback Store (for seamless local development if MongoDB service isn't active)
const inMemoryUsers = new Map();

class UserRepository {
  static async create({ name, email, password, googleId = null, authProvider = 'local' }) {
    if (getDbStatus()) {
      let hashedPassword = null;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
      }
      const user = await MongooseUser.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        googleId,
        authProvider,
      });
      return user.toObject();
    } else {
      const normalizedEmail = email.toLowerCase();
      if (inMemoryUsers.has(normalizedEmail)) {
        const err = new Error('Email already registered');
        err.code = 11000;
        throw err;
      }
      let hashedPassword = null;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
      }
      const user = {
        _id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        name,
        email: normalizedEmail,
        password: hashedPassword,
        googleId,
        authProvider,
        faceEnrolled: false,
        faceDescriptor: null,
        faceEnrolledAt: null,
        faceMetadata: {
          algorithm: '128d-euclidean-descriptor',
          confidence: 0,
          device: 'Webcam',
          lastVerifiedAt: null,
        },
        role: 'researcher',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryUsers.set(normalizedEmail, user);
      const safe = { ...user };
      delete safe.password;
      delete safe.faceDescriptor;
      return safe;
    }
  }

  static async findByEmail(email, { includePassword = false, includeFaceDescriptor = false } = {}) {
    const normalizedEmail = email.toLowerCase().trim();
    if (getDbStatus()) {
      let query = MongooseUser.findOne({ email: normalizedEmail });
      if (includePassword) query = query.select('+password');
      if (includeFaceDescriptor) query = query.select('+faceDescriptor');
      const user = await query.exec();
      return user;
    } else {
      const user = inMemoryUsers.get(normalizedEmail);
      if (!user) return null;
      const copy = { ...user };
      if (!includePassword) delete copy.password;
      if (!includeFaceDescriptor) delete copy.faceDescriptor;
      return copy;
    }
  }

  static async findById(id, { includePassword = false, includeFaceDescriptor = false } = {}) {
    if (getDbStatus()) {
      let query = MongooseUser.findById(id);
      if (includePassword) query = query.select('+password');
      if (includeFaceDescriptor) query = query.select('+faceDescriptor');
      return await query.exec();
    } else {
      for (const user of inMemoryUsers.values()) {
        if (user._id === id) {
          const copy = { ...user };
          if (!includePassword) delete copy.password;
          if (!includeFaceDescriptor) delete copy.faceDescriptor;
          return copy;
        }
      }
      return null;
    }
  }

  static async updateFaceEnrollment(userId, { descriptor, confidence = 0.98, device = 'Webcam' }) {
    if (getDbStatus()) {
      const user = await MongooseUser.findByIdAndUpdate(
        userId,
        {
          faceEnrolled: true,
          faceDescriptor: descriptor,
          faceEnrolledAt: new Date(),
          'faceMetadata.confidence': confidence,
          'faceMetadata.device': device,
          'faceMetadata.lastVerifiedAt': new Date(),
        },
        { new: true }
      );
      return user;
    } else {
      for (const [email, user] of inMemoryUsers.entries()) {
        if (user._id === userId) {
          user.faceEnrolled = true;
          user.faceDescriptor = descriptor;
          user.faceEnrolledAt = new Date();
          user.faceMetadata = {
            ...user.faceMetadata,
            confidence,
            device,
            lastVerifiedAt: new Date(),
          };
          user.updatedAt = new Date();
          inMemoryUsers.set(email, user);
          const safe = { ...user };
          delete safe.password;
          delete safe.faceDescriptor;
          return safe;
        }
      }
      return null;
    }
  }

  static async removeFaceEnrollment(userId) {
    if (getDbStatus()) {
      const user = await MongooseUser.findByIdAndUpdate(
        userId,
        {
          faceEnrolled: false,
          faceDescriptor: undefined,
          faceEnrolledAt: null,
          'faceMetadata.confidence': 0,
          'faceMetadata.lastVerifiedAt': null,
        },
        { new: true }
      );
      return user;
    } else {
      for (const [email, user] of inMemoryUsers.entries()) {
        if (user._id === userId) {
          user.faceEnrolled = false;
          user.faceDescriptor = null;
          user.faceEnrolledAt = null;
          user.faceMetadata = {
            algorithm: '128d-euclidean-descriptor',
            confidence: 0,
            device: 'Webcam',
            lastVerifiedAt: null,
          };
          user.updatedAt = new Date();
          inMemoryUsers.set(email, user);
          const safe = { ...user };
          delete safe.password;
          delete safe.faceDescriptor;
          return safe;
        }
      }
      return null;
    }
  }

  static async verifyPassword(user, plainPassword) {
    if (!user || !user.password) return false;
    return await bcrypt.compare(plainPassword, user.password);
  }
}

module.exports = {
  MongooseUser,
  UserRepository,
};
