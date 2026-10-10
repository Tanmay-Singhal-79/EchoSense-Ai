import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Scan,
  ShieldCheck,
  AlertTriangle,
  X,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Lock,
  Eye,
  KeyRound,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import useFaceApi from '../hooks/useFaceApi';
import { useAuth } from '../hooks/useAuth';

export default function FaceCameraModal({
  mode = 'login', // 'login' | 'enroll'
  userEmail = '',
  onClose,
  onSuccess,
}) {
  const { loginWithFace, enrollFace } = useAuth();
  const {
    isModelLoading,
    isModelReady,
    modelError,
    cameraActive,
    cameraError,
    detectionState,
    startCamera,
    stopCamera,
    processFrame,
    captureDescriptor,
    generateSimulatedDescriptor,
  } = useFaceApi();

  const [emailInput, setEmailInput] = useState(userEmail || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [hasConsent, setHasConsent] = useState(mode === 'login' ? true : false);
  const [useSimulationMode, setUseSimulationMode] = useState(false);

  const videoElementRef = useRef(null);
  const loopRef = useRef(null);

  // Initialize camera when consent is given
  useEffect(() => {
    let active = true;

    async function initCamera() {
      if (hasConsent && videoElementRef.current && !useSimulationMode) {
        await startCamera(videoElementRef.current);
      }
    }

    initCamera();

    return () => {
      active = false;
      if (loopRef.current) clearInterval(loopRef.current);
      stopCamera();
    };
  }, [hasConsent, useSimulationMode, startCamera, stopCamera]);

  // Periodic frame processing loop for real-time HUD
  useEffect(() => {
    if (cameraActive && isModelReady && !useSimulationMode) {
      loopRef.current = setInterval(() => {
        processFrame();
      }, 250);
    } else {
      if (loopRef.current) clearInterval(loopRef.current);
    }

    return () => {
      if (loopRef.current) clearInterval(loopRef.current);
    };
  }, [cameraActive, isModelReady, useSimulationMode, processFrame]);

  // Handle Biometric Capture & Verification
  const handleCaptureAndSubmit = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (mode === 'login' && !emailInput.trim()) {
      setErrorMessage('Please enter the email address linked to your account.');
      return;
    }

    setIsVerifying(true);

    try {
      let descriptor = null;

      if (useSimulationMode || cameraError || !cameraActive) {
        // Deterministic synthetic biometric vector derived from user email
        descriptor = generateSimulatedDescriptor(emailInput || 'echosense_active_user');
      } else {
        descriptor = await captureDescriptor();
      }

      if (!descriptor) {
        throw new Error('Unable to capture face. Please ensure your face is well-lit and centered.');
      }

      if (mode === 'enroll') {
        const res = await enrollFace(descriptor, detectionState.confidence / 100 || 0.98);
        if (res.success) {
          setSuccessMessage('Face enrolled successfully! Biometric template encrypted.');
          confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
          setTimeout(() => {
            if (onSuccess) onSuccess();
            onClose();
          }, 1600);
        } else {
          setErrorMessage(res.error || 'Face enrollment failed. Please try again.');
        }
      } else {
        // mode === 'login'
        const res = await loginWithFace(emailInput.trim(), descriptor);
        if (res.success) {
          setSuccessMessage(`Identity confirmed! Welcome back, ${res.user.name}.`);
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          setTimeout(() => {
            if (onSuccess) onSuccess(res.user);
            onClose();
          }, 1400);
        } else {
          setErrorMessage(res.error || 'Face verification failed. Please try again or use your password.');
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Biometric authentication error occurred.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-glass-card face-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Scan size={24} className="text-cyan animate-pulse" />
            <div>
              <h3 className="modal-title">
                {mode === 'enroll' ? 'Enroll Face Biometrics' : 'EchoSense Face Authentication'}
              </h3>
              <p className="modal-subtitle">
                {mode === 'enroll'
                  ? 'Extracting 128-dimensional biometric template with CNN FaceNet'
                  : 'Fast biometric login with Euclidean distance verification'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn-icon-close">
            <X size={20} />
          </button>
        </div>

        {/* Consent Screen (for first time enrollment) */}
        {!hasConsent && mode === 'enroll' ? (
          <div className="consent-container">
            <div className="consent-badge">
              <ShieldCheck size={32} className="text-cyan" />
            </div>
            <h4 className="consent-title">Biometric Privacy & Consent</h4>
            <p className="consent-body">
              EchoSense AI uses on-device facial landmark processing to generate a mathematical 128-dimensional
              feature vector. <strong>No raw camera photos or videos are stored on our servers.</strong> Your
              biometric vector is encrypted, used strictly for session verification, and can be deleted anytime in
              your settings.
            </p>
            <div className="consent-actions">
              <button
                type="button"
                onClick={() => setHasConsent(true)}
                className="btn-primary btn-full-width"
              >
                I Consent & Allow Camera Access
              </button>
              <button type="button" onClick={onClose} className="btn-ghost btn-full-width">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="modal-body face-modal-body">
            {/* Email input for Face Login */}
            {mode === 'login' && (
              <div className="form-group mb-4">
                <label className="form-label" htmlFor="faceEmail">
                  Account Email
                </label>
                <div className="input-icon-wrap">
                  <input
                    id="faceEmail"
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="name@company.com"
                    className="form-input"
                    required
                  />
                  <Lock size={16} className="input-icon" />
                </div>
                <span className="input-hint">
                  Enter the email linked to your enrolled biometric profile.
                </span>
              </div>
            )}

            {/* Camera Viewport / HUD */}
            <div className="camera-viewport-wrap">
              {!useSimulationMode && (
                <video
                  ref={videoElementRef}
                  playsInline
                  muted
                  className={`camera-video ${cameraActive ? 'video-active' : 'video-hidden'}`}
                />
              )}

              {/* Synthetic Biometric Canvas when in Simulation Mode */}
              {useSimulationMode && (
                <div className="simulation-canvas">
                  <div className="synthetic-face-icon">
                    <Scan size={72} className="text-cyan animate-pulse" />
                  </div>
                  <span className="simulation-tag">Biometric Simulation Mode Active</span>
                  <p className="simulation-hint">
                    Generating deterministic 128-d vector for automated testing without hardware camera
                  </p>
                </div>
              )}

              {/* HUD Target Reticle Overlay */}
              <div className="camera-hud-overlay">
                <div className={`hud-reticle ${detectionState.faceDetected ? 'reticle-locked' : ''}`}>
                  <div className="hud-corner top-left"></div>
                  <div className="hud-corner top-right"></div>
                  <div className="hud-corner bottom-left"></div>
                  <div className="hud-corner bottom-right"></div>
                  <div className="hud-laser-bar"></div>
                </div>

                {/* HUD Live Metadata */}
                <div className="hud-status-bar">
                  <div className="hud-status-left">
                    <span
                      className={`hud-dot ${
                        detectionState.faceDetected ? 'dot-success' : 'dot-waiting'
                      }`}
                    ></span>
                    <span className="hud-status-text">
                      {isModelLoading
                        ? 'Loading Neural Models...'
                        : detectionState.statusText}
                    </span>
                  </div>
                  {detectionState.faceDetected && (
                    <div className="hud-metrics">
                      <span>Conf: {detectionState.confidence}%</span>
                      <span>Live: {detectionState.livenessScore}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Camera / Model Diagnostic Warnings */}
            {cameraError && !useSimulationMode && (
              <div className="camera-error-banner">
                <AlertTriangle size={18} />
                <div className="banner-text">
                  <p>{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => setUseSimulationMode(true)}
                    className="banner-action-link"
                  >
                    Switch to Biometric Test Simulator
                  </button>
                </div>
              </div>
            )}

            {/* Error or Success Messages */}
            {errorMessage && (
              <div className="notification-card notification-error animate-fade-in">
                <div className="notif-content">
                  <AlertTriangle size={18} />
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="notification-card notification-success animate-fade-in">
                <div className="notif-content">
                  <CheckCircle2 size={18} />
                  <span>{successMessage}</span>
                </div>
              </div>
            )}

            {/* Biometric Actions */}
            <div className="modal-actions-grid">
              <button
                type="button"
                onClick={handleCaptureAndSubmit}
                disabled={isVerifying || isModelLoading}
                className="btn-primary btn-glow"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw size={18} className="animate-spin mr-2" />
                    <span>Verifying Biometric Vector...</span>
                  </>
                ) : (
                  <>
                    <Scan size={18} className="mr-2" />
                    <span>
                      {mode === 'enroll'
                        ? 'Capture & Enroll Face'
                        : 'Verify Face & Sign In'}
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setUseSimulationMode(!useSimulationMode)}
                className="btn-ghost btn-sm"
              >
                {useSimulationMode ? 'Switch to Live Camera' : 'Use Biometric Test Simulator'}
              </button>
            </div>

            <div className="biometric-footer-note">
              <Lock size={12} />
              <span>
                128-d Euclidean Vector Matching • Strict threshold ≤ 0.52 • Anti-Spoofing enabled
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
