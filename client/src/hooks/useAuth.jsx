import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check existing session on application mount
  const checkSession = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      // 401 or no active session is expected when not logged in
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Standard Email/Password Login
  const login = async (email, password, rememberMe = false) => {
    setAuthError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.user) {
        setUser(res.user);
        if (res.token) {
          if (rememberMe) {
            localStorage.setItem('echosense_token', res.token);
          } else {
            sessionStorage.setItem('echosense_token', res.token);
            localStorage.setItem('echosense_token', res.token);
          }
        }
        return { success: true, user: res.user, message: res.message };
      }
      throw new Error(res.message || 'Login failed');
    } catch (err) {
      const msg = err.data?.message || err.message || 'Invalid credentials';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // Registration
  const register = async (name, email, password) => {
    setAuthError(null);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      if (res.success && res.user) {
        setUser(res.user);
        if (res.token) {
          localStorage.setItem('echosense_token', res.token);
        }
        return { success: true, user: res.user, message: res.message };
      }
      throw new Error(res.message || 'Registration failed');
    } catch (err) {
      const msg = err.data?.message || err.message || 'Registration failed';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // Google OAuth Login
  const loginWithGoogle = async (credential, userInfo) => {
    setAuthError(null);
    try {
      const res = await api.post('/auth/google', { credential, userInfo });
      if (res.success && res.user) {
        setUser(res.user);
        if (res.token) {
          localStorage.setItem('echosense_token', res.token);
        }
        return { success: true, user: res.user, message: res.message };
      }
      throw new Error(res.message || 'Google authentication failed');
    } catch (err) {
      const msg = err.data?.message || err.message || 'Google sign-in failed';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // Face Biometric Login
  const loginWithFace = async (email, faceDescriptor) => {
    setAuthError(null);
    try {
      const res = await api.post('/auth/face/login', { email, faceDescriptor });
      if (res.success && res.user) {
        setUser(res.user);
        if (res.token) {
          localStorage.setItem('echosense_token', res.token);
        }
        return { success: true, user: res.user, message: res.message };
      }
      throw new Error(res.message || 'Biometric verification failed');
    } catch (err) {
      const msg = err.data?.message || err.message || 'Face verification failed';
      setAuthError(msg);
      return {
        success: false,
        error: msg,
        canFallbackToPassword: err.data?.canFallbackToPassword || false,
      };
    }
  };

  // Face Biometric Enrollment
  const enrollFace = async (descriptor, confidence = 0.98, device = 'Webcam') => {
    try {
      const res = await api.post('/auth/face/enroll', { descriptor, confidence, device });
      if (res.success) {
        // Update user state with face enrolled status
        setUser((prev) => (prev ? { ...prev, faceEnrolled: true, faceEnrolledAt: new Date() } : null));
        return { success: true, message: res.message };
      }
      throw new Error(res.message || 'Enrollment failed');
    } catch (err) {
      const msg = err.data?.message || err.message || 'Failed to enroll face';
      return { success: false, error: msg };
    }
  };

  // Remove Biometric Face Template
  const removeFace = async () => {
    try {
      const res = await api.delete('/auth/face');
      if (res.success) {
        setUser((prev) => (prev ? { ...prev, faceEnrolled: false, faceEnrolledAt: null } : null));
        return { success: true, message: res.message };
      }
      throw new Error(res.message || 'Failed to remove biometric data');
    } catch (err) {
      const msg = err.data?.message || err.message || 'Failed to delete face template';
      return { success: false, error: msg };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout API warning:', err);
    } finally {
      localStorage.removeItem('echosense_token');
      sessionStorage.removeItem('echosense_token');
      setUser(null);
    }
  };

  const clearError = () => setAuthError(null);

  const value = {
    user,
    loading,
    authError,
    isAuthenticated: Boolean(user),
    login,
    register,
    loginWithGoogle,
    loginWithFace,
    enrollFace,
    removeFace,
    logout,
    checkSession,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
