import React from 'react';
import { Waves, Sparkles, Shield, User, LogOut, LayoutDashboard, BrainCircuit } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Navbar({ onNavigate, currentScreen }) {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        {/* Logo and Brand */}
        <div className="navbar-brand" onClick={() => onNavigate(isAuthenticated ? 'welcome' : 'login')}>
          <div className="logo-icon-wrapper">
            <BrainCircuit size={24} className="brand-logo-icon" />
            <span className="logo-glow-ring"></span>
          </div>
          <div className="brand-text-block">
            <span className="brand-title">EchoSense <span className="text-cyan">AI</span></span>
            <span className="brand-tagline">Multi-Modal Emotion Engine</span>
          </div>
        </div>

        {/* Status Pill */}
        <div className="engine-status-pill">
          <span className="status-dot-pulse"></span>
          <span className="status-pill-text">v1.0 • Engine Online</span>
        </div>

        {/* Navigation Links */}
        <nav className="navbar-actions">
          {isAuthenticated ? (
            <div className="user-nav-group">
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className={`nav-btn ${currentScreen === 'dashboard' ? 'nav-btn-active' : ''}`}
              >
                <LayoutDashboard size={16} />
                <span>Analytics Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('welcome')}
                className={`nav-btn ${currentScreen === 'welcome' ? 'nav-btn-active' : ''}`}
              >
                <User size={16} />
                <span>{user?.name?.split(' ')[0] || 'Profile'}</span>
              </button>

              <button
                type="button"
                onClick={logout}
                className="btn-ghost btn-sm btn-logout"
                title="Log out from EchoSense AI"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="guest-nav-group">
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className={`nav-link-simple ${currentScreen === 'login' ? 'nav-link-active' : ''}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="btn-primary btn-sm"
              >
                Create Account
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
