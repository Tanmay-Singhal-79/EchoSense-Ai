import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PostLoginWelcome from './pages/PostLoginWelcome';
import DashboardPreview from './pages/DashboardPreview';
import { Sparkles } from 'lucide-react';

function AppContent() {
  const { user, isAuthenticated, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('login');

  // Synchronize screen with authentication state
  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        if (currentScreen === 'login' || currentScreen === 'register') {
          setCurrentScreen('welcome');
        }
      } else {
        if (currentScreen === 'welcome' || currentScreen === 'dashboard') {
          setCurrentScreen('login');
        }
      }
    }
  }, [isAuthenticated, loading]);

  const handleNavigate = (screen) => {
    // Route guard
    if ((screen === 'welcome' || screen === 'dashboard') && !isAuthenticated) {
      setCurrentScreen('login');
      return;
    }
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="auth-page-container">
        <div className="text-center">
          <div className="brand-logo-hex mx-auto mb-4 animate-pulse">
            <Sparkles size={28} className="text-cyan" />
          </div>
          <p className="font-mono text-cyan">Connecting to EchoSense AI Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-root-layout">
      <Navbar onNavigate={handleNavigate} currentScreen={currentScreen} />

      <main className="main-content-area">
        {currentScreen === 'login' && <LoginPage onNavigate={handleNavigate} />}
        {currentScreen === 'register' && <RegisterPage onNavigate={handleNavigate} />}
        {currentScreen === 'welcome' && <PostLoginWelcome onNavigate={handleNavigate} />}
        {currentScreen === 'dashboard' && <DashboardPreview onNavigate={handleNavigate} />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
