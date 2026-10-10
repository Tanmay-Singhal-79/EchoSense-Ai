import React, { useState } from 'react';
import {
  BrainCircuit,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Scan,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import GoogleAuthButton from '../components/GoogleAuthButton';
import FaceCameraModal from '../components/FaceCameraModal';
import Notification from '../components/Notification';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage({ onNavigate }) {
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);
  const [enableFacePrompt, setEnableFacePrompt] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Client-side validations
    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Invalid email address format.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    if (!termsConsent) {
      setErrorMsg('Please accept the Terms of Service & Biometric Privacy Policy to proceed.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(name.trim(), email.trim(), password);
      if (res.success) {
        setRegisteredEmail(email.trim());
        setSuccessMsg('Account created successfully!');

        // Check if user chose to enroll face immediately
        if (enableFacePrompt) {
          setTimeout(() => {
            setShowFaceModal(true);
          }, 600);
        } else {
          setTimeout(() => {
            onNavigate('welcome');
          }, 800);
        }
      } else {
        setErrorMsg(res.error || 'Failed to create account.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFaceEnrollDone = () => {
    onNavigate('welcome');
  };

  return (
    <div className="auth-page-container register-page-wrap">
      {/* Background glow orbs */}
      <div className="glow-orb glow-orb-purple"></div>
      <div className="glow-orb glow-orb-cyan"></div>

      <div className="register-centered-card">
        <div className="glass-card register-card-box">
          <div className="card-top-header text-center">
            <div className="brand-logo-hex mx-auto mb-3">
              <BrainCircuit size={32} className="logo-hex-icon" />
            </div>
            <h2 className="card-heading">Join EchoSense AI</h2>
            <p className="card-subheading">
              Create your researcher account for multi-modal emotion and sentiment intelligence
            </p>
          </div>

          {/* Notifications */}
          {errorMsg && (
            <Notification type="error" message={errorMsg} onClose={() => setErrorMsg('')} />
          )}
          {successMsg && (
            <Notification type="success" message={successMsg} onClose={() => setSuccessMsg('')} />
          )}

          <form onSubmit={handleRegister} className="auth-form" noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="regName">
                Full Name
              </label>
              <div className="input-icon-wrap">
                <input
                  id="regName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tanmay Singhal"
                  required
                  className="form-input"
                />
                <User size={18} className="input-icon" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="regEmail">
                Email Address
              </label>
              <div className="input-icon-wrap">
                <input
                  id="regEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@echosense.ai"
                  required
                  className="form-input"
                />
                <Mail size={18} className="input-icon" />
              </div>
            </div>

            <div className="form-grid-two">
              <div className="form-group">
                <label className="form-label" htmlFor="regPassword">
                  Password
                </label>
                <div className="input-icon-wrap">
                  <input
                    id="regPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 chars"
                    required
                    className="form-input"
                  />
                  <Lock size={18} className="input-icon" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="btn-password-toggle"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="regConfirmPassword">
                  Confirm Password
                </label>
                <div className="input-icon-wrap">
                  <input
                    id="regConfirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                    className="form-input"
                  />
                  <Lock size={18} className="input-icon" />
                </div>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="form-options-stack">
              <label className="custom-checkbox-label">
                <input
                  type="checkbox"
                  checked={enableFacePrompt}
                  onChange={(e) => setEnableFacePrompt(e.target.checked)}
                  className="custom-checkbox"
                />
                <span className="checkbox-text">
                  <strong>Enroll Face Biometrics</strong> after registration for 1-click Face ID
                </span>
              </label>

              <label className="custom-checkbox-label">
                <input
                  type="checkbox"
                  checked={termsConsent}
                  onChange={(e) => setTermsConsent(e.target.checked)}
                  className="custom-checkbox"
                  required
                />
                <span className="checkbox-text">
                  I agree to the <span className="text-cyan underline">Terms of Service</span> and{' '}
                  <span className="text-cyan underline">Biometric Data Processing Policy</span>.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary btn-full-width btn-glow mt-3"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              {!loading && <ArrowRight size={18} className="ml-2" />}
            </button>
          </form>

          {/* Divider */}
          <div className="or-divider">
            <span className="divider-line"></span>
            <span className="divider-text">OR</span>
            <span className="divider-line"></span>
          </div>

          <div className="auth-alt-buttons-stack">
            <GoogleAuthButton
              disabled={loading}
              onSuccess={() => onNavigate('welcome')}
              onError={(err) => setErrorMsg(err)}
            />

            <button
              type="button"
              onClick={() => {
                if (!email) {
                  setErrorMsg('Please enter your email above before enrolling face.');
                  return;
                }
                setShowFaceModal(true);
              }}
              className="btn-ghost btn-full-width"
            >
              <Scan size={18} className="mr-2 text-cyan" />
              <span>Enroll Face First</span>
            </button>
          </div>

          <div className="card-footer-signup">
            <span>Already have an account?</span>{' '}
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="link-create-account"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Face Enrollment Modal */}
      {showFaceModal && (
        <FaceCameraModal
          mode="enroll"
          userEmail={registeredEmail || email}
          onClose={() => {
            setShowFaceModal(false);
            if (registeredEmail) onNavigate('welcome');
          }}
          onSuccess={handleFaceEnrollDone}
        />
      )}
    </div>
  );
}
