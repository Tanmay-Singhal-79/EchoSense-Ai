import React, { useState } from 'react';
import {
  BrainCircuit,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Scan,
  Shield,
  Zap,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import AudioWaveform from '../components/AudioWaveform';
import GoogleAuthButton from '../components/GoogleAuthButton';
import FaceCameraModal from '../components/FaceCameraModal';
import Notification from '../components/Notification';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage({ onNavigate }) {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email/username and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email.trim(), password, rememberMe);
      if (res.success) {
        setSuccessMsg(res.message || 'Login successful! Redirecting...');
        setTimeout(() => {
          onNavigate('welcome');
        }, 800);
      } else {
        setErrorMsg(res.error || 'Invalid credentials. Please verify and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFaceLoginSuccess = (user) => {
    setSuccessMsg(`Welcome back, ${user.name}! Biometric verification passed.`);
    setTimeout(() => {
      onNavigate('welcome');
    }, 900);
  };

  return (
    <div className="auth-page-container">
      {/* Background glow orbs */}
      <div className="glow-orb glow-orb-purple"></div>
      <div className="glow-orb glow-orb-cyan"></div>
      <div className="glow-orb glow-orb-blue"></div>

      <div className="auth-grid-two-column">
        {/* ================= LEFT SECTION: BRANDING & STORY ================= */}
        <section className="auth-left-branding">
          <div className="brand-header-group">
            <div className="brand-badge-pill">
              <Sparkles size={14} className="text-cyan animate-pulse" />
              <span>Next-Gen Multi-Modal Perception</span>
            </div>

            <div className="brand-title-wrap">
              <div className="brand-logo-hex">
                <BrainCircuit size={36} className="logo-hex-icon" />
              </div>
              <h1 className="brand-display-title">
                EchoSense <span className="gradient-text-cyan">AI</span>
              </h1>
            </div>

            <h2 className="brand-hero-heading">
              Understand the human signal.
            </h2>

            <p className="brand-hero-description">
              EchoSense AI unifies deep speech acoustic features (pitch, tone, speech velocity) with
              high-frequency visual facial emotion indicators through attention-based multi-modal fusion.
              Real-time sentiment intelligence engineered for high-consequence interactions.
            </p>
          </div>

          {/* Decorative Live Waveform Component */}
          <div className="brand-waveform-card">
            <AudioWaveform />
          </div>

          {/* Feature Badges */}
          <div className="brand-features-row">
            <div className="feature-item-pill">
              <Shield size={16} className="text-emerald" />
              <div className="feature-text">
                <strong>Responsible AI</strong>
                <span>Bias-audited multi-modal weights</span>
              </div>
            </div>

            <div className="feature-item-pill">
              <Zap size={16} className="text-cyan" />
              <div className="feature-text">
                <strong>Real-time insights</strong>
                <span>Sub-50ms inference latency</span>
              </div>
            </div>

            <div className="feature-item-pill">
              <CheckCircle size={16} className="text-purple" />
              <div className="feature-text">
                <strong>Privacy-first</strong>
                <span>Zero raw media storage</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= RIGHT SECTION: LOGIN CARD ================= */}
        <section className="auth-right-panel">
          <div className="glass-card login-card-box">
            <div className="card-top-header">
              <h2 className="card-heading">Welcome Back</h2>
              <p className="card-subheading">
                Enter your credentials or authenticate instantly with Face ID
              </p>
            </div>

            {/* Notifications */}
            {errorMsg && (
              <Notification type="error" message={errorMsg} onClose={() => setErrorMsg('')} />
            )}
            {successMsg && (
              <Notification type="success" message={successMsg} onClose={() => setSuccessMsg('')} />
            )}

            {/* Standard Login Form */}
            <form onSubmit={handlePasswordSubmit} className="auth-form" noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="loginEmail">
                  Email or Username
                </label>
                <div className="input-icon-wrap">
                  <input
                    id="loginEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@echosense.ai"
                    required
                    className="form-input"
                    autoComplete="email"
                  />
                  <Mail size={18} className="input-icon" />
                </div>
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label className="form-label" htmlFor="loginPassword">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotModal(true)}
                    className="link-forgot-password"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="input-icon-wrap">
                  <input
                    id="loginPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="form-input"
                    autoComplete="current-password"
                  />
                  <Lock size={18} className="input-icon" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="btn-password-toggle"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-controls-row">
                <label className="custom-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="custom-checkbox"
                  />
                  <span className="checkbox-text">Remember me on this workstation</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary btn-full-width btn-glow mt-2"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                {!loading && <ArrowRight size={18} className="ml-2" />}
              </button>
            </form>

            {/* Divider */}
            <div className="or-divider">
              <span className="divider-line"></span>
              <span className="divider-text">OR</span>
              <span className="divider-line"></span>
            </div>

            {/* Alternate Login Actions */}
            <div className="auth-alt-buttons-stack">
              {/* Google OAuth Button */}
              <GoogleAuthButton
                disabled={loading}
                onSuccess={() => onNavigate('welcome')}
                onError={(err) => setErrorMsg(err)}
              />

              {/* Login with Face Button */}
              <button
                type="button"
                onClick={() => setShowFaceModal(true)}
                disabled={loading}
                className="btn-face-login"
                title="Authenticate using facial biometric verification"
              >
                <div className="btn-face-inner">
                  <Scan size={20} className="text-cyan animate-pulse" />
                  <span>Login with Face</span>
                </div>
                <span className="face-badge-pill">128-d Biometric</span>
              </button>
            </div>

            {/* Register Link */}
            <div className="card-footer-signup">
              <span>New to EchoSense AI?</span>{' '}
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="link-create-account"
              >
                Create Account
              </button>
            </div>

            {/* Security and Privacy Footer */}
            <div className="card-privacy-footer">
              <Shield size={14} className="text-muted" />
              <span>256-bit TLS Encrypted • HTTP-Only Cookie Session Security</span>
            </div>
          </div>
        </section>
      </div>

      {/* Face Login Modal */}
      {showFaceModal && (
        <FaceCameraModal
          mode="login"
          userEmail={email}
          onClose={() => setShowFaceModal(false)}
          onSuccess={handleFaceLoginSuccess}
        />
      )}

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="modal-overlay" onClick={() => setForgotModal(false)}>
          <div className="modal-glass-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Password Recovery</h3>
            <p className="modal-desc">
              For security compliance in EchoSense AI, please contact your research lab supervisor or
              administrator to dispatch a verified token reset link to <strong>{email || 'your email'}</strong>.
            </p>
            <button
              type="button"
              onClick={() => setForgotModal(false)}
              className="btn-primary btn-full-width mt-4"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
