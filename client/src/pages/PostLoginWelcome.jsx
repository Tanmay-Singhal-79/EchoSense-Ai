import React, { useState } from 'react';
import {
  BrainCircuit,
  ShieldCheck,
  Scan,
  Trash2,
  LogOut,
  LayoutDashboard,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Lock,
  Sparkles,
  User,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import FaceCameraModal from '../components/FaceCameraModal';
import Notification from '../components/Notification';
import { useAuth } from '../hooks/useAuth';

export default function PostLoginWelcome({ onNavigate }) {
  const { user, removeFace, logout } = useAuth();

  const [showFaceModal, setShowFaceModal] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleRemoveFace = async () => {
    setActionLoading(true);
    try {
      const res = await removeFace();
      if (res.success) {
        setMessage({ type: 'success', text: 'Biometric template successfully revoked.' });
        setDeleteConfirmModal(false);
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to remove biometric data.' });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnrollSuccess = () => {
    setMessage({ type: 'success', text: 'Face enrolled successfully! Biometric ID is now active.' });
    setShowFaceModal(false);
  };

  return (
    <div className="welcome-screen-container">
      {/* Background glow orbs */}
      <div className="glow-orb glow-orb-purple"></div>
      <div className="glow-orb glow-orb-cyan"></div>

      <div className="welcome-content-card">
        {/* Header Banner */}
        <div className="welcome-hero-banner">
          <div className="welcome-avatar-hex">
            <span className="avatar-initials">
              {user?.name
                ? user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                : 'ES'}
            </span>
            <div className="avatar-online-dot"></div>
          </div>

          <div className="welcome-title-block">
            <div className="auth-status-badge">
              <CheckCircle2 size={14} className="text-emerald" />
              <span>Session Authenticated • 256-bit Encrypted</span>
            </div>
            <h1 className="welcome-user-name">Welcome back, {user?.name || 'Researcher'}!</h1>
            <p className="welcome-user-email">
              Connected as <span className="text-cyan font-mono">{user?.email}</span> • Role:{' '}
              <span className="text-purple uppercase font-semibold">{user?.role || 'Researcher'}</span>
            </p>
          </div>
        </div>

        {/* Action Notifications */}
        {message.text && (
          <div className="mt-4">
            <Notification
              type={message.type}
              message={message.text}
              onClose={() => setMessage({ type: '', text: '' })}
            />
          </div>
        )}

        {/* Dashboard & Biometric Status Grid */}
        <div className="welcome-grid-cards">
          {/* Biometrics Card */}
          <div className="glass-card welcome-card">
            <div className="welcome-card-header">
              <div className="icon-badge icon-badge-cyan">
                <Scan size={22} />
              </div>
              <div>
                <h3 className="card-section-title">Face Authentication Status</h3>
                <p className="card-section-desc">Multi-modal biometric facial verification</p>
              </div>
            </div>

            <div className="biometric-status-display">
              {user?.faceEnrolled ? (
                <div className="status-enrolled-box">
                  <div className="status-pill status-pill-active">
                    <ShieldCheck size={16} />
                    <span>Face ID Active & Enrolled</span>
                  </div>
                  <p className="status-meta-text">
                    Enrolled:{' '}
                    <strong>
                      {user.faceEnrolledAt
                        ? new Date(user.faceEnrolledAt).toLocaleDateString()
                        : 'Active'}
                    </strong>{' '}
                    • 128-d Euclidean Vector Encrypted
                  </p>
                  <div className="biometric-actions-row">
                    <button
                      type="button"
                      onClick={() => setShowFaceModal(true)}
                      className="btn-ghost btn-sm"
                    >
                      <Scan size={14} className="mr-1" /> Re-scan / Update Template
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmModal(true)}
                      className="btn-danger-ghost btn-sm"
                    >
                      <Trash2 size={14} className="mr-1" /> Remove Face Biometrics
                    </button>
                  </div>
                </div>
              ) : (
                <div className="status-not-enrolled-box">
                  <div className="status-pill status-pill-inactive">
                    <AlertCircle size={16} />
                    <span>Not Enrolled</span>
                  </div>
                  <p className="status-meta-text">
                    Enable face biometric verification to log in seamlessly without entering your password every time.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowFaceModal(true)}
                    className="btn-primary btn-sm btn-glow"
                  >
                    <Scan size={16} className="mr-2" />
                    <span>Enroll Face ID Now</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Account & Engine Information */}
          <div className="glass-card welcome-card">
            <div className="welcome-card-header">
              <div className="icon-badge icon-badge-purple">
                <BrainCircuit size={22} />
              </div>
              <div>
                <h3 className="card-section-title">EchoSense AI Engine Access</h3>
                <p className="card-section-desc">Speech & facial emotion analytics pipeline</p>
              </div>
            </div>

            <div className="engine-stats-list">
              <div className="engine-stat-row">
                <span className="stat-label">Audio Feature Model</span>
                <span className="stat-value font-mono">CNN-LSTM (Pitch/Energy/Velocity)</span>
              </div>
              <div className="engine-stat-row">
                <span className="stat-label">Visual Feature Model</span>
                <span className="stat-value font-mono">Vision Transformer (ViT-16)</span>
              </div>
              <div className="engine-stat-row">
                <span className="stat-label">Fusion Layer</span>
                <span className="stat-value font-mono text-cyan">Attention-Based Multi-Modal</span>
              </div>
              <div className="engine-stat-row">
                <span className="stat-label">Target Latency</span>
                <span className="stat-value font-mono text-emerald">&lt; 45ms per frame</span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Bottom Actions */}
        <div className="welcome-bottom-nav">
          <button
            type="button"
            onClick={logout}
            className="btn-ghost btn-danger-hover"
          >
            <LogOut size={18} className="mr-2" />
            <span>Sign Out</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="btn-primary btn-large btn-glow"
          >
            <span>Continue to Emotion Analytics Dashboard</span>
            <ArrowRight size={20} className="ml-2" />
          </button>
        </div>
      </div>

      {/* Enroll Face Modal */}
      {showFaceModal && (
        <FaceCameraModal
          mode="enroll"
          userEmail={user?.email}
          onClose={() => setShowFaceModal(false)}
          onSuccess={handleEnrollSuccess}
        />
      )}

      {/* Delete Biometrics Confirmation Modal */}
      {deleteConfirmModal && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmModal(false)}>
          <div className="modal-glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <ShieldAlert size={24} className="text-danger" />
                <h3 className="modal-title">Delete Face Biometric Data</h3>
              </div>
            </div>
            <p className="modal-desc">
              Are you sure you want to delete your 128-dimensional facial template? This will permanently
              revoke your biometric login capability until re-enrolled.
            </p>
            <div className="modal-actions-row mt-4">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal(false)}
                className="btn-ghost"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemoveFace}
                disabled={actionLoading}
                className="btn-danger"
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete Biometrics'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
