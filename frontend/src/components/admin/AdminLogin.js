// src/pages/AdminLogin.js
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  FiUser,
  FiLock,
  FiEye,
  FiEyeOff,
  FiShield,
  FiArrowRight,
  FiAlertCircle,
  FiCheck,
  FiAlertTriangle,
  FiX
} from 'react-icons/fi';
import './AdminLogin.css';
import logo from '../../assets/LURNITY.jpg';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const [pendingCredentials, setPendingCredentials] = useState(null);
  const history = useHistory();

  const handleLoginAttempt = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setMsg('Please enter both username and password');
      return;
    }

    // Store credentials and show warning
    setPendingCredentials({ username, password });
    setShowAuthWarning(true);
    setMsg(''); // Clear any previous error messages
  };

  const handleProceedWithLogin = async () => {
    if (!pendingCredentials) return;

    try {
      setIsLoading(true);
      setShowAuthWarning(false);
      
      const res = await fetch('http://localhost:7700/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pendingCredentials),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.message || 'Login failed');
        setPendingCredentials(null);
        return;
      }

      localStorage.setItem('adminToken', data.token);
      history.push('/admin');
    } catch (err) {
      setMsg('Network error. Please try again.');
      setPendingCredentials(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelLogin = () => {
    setShowAuthWarning(false);
    setPendingCredentials(null);
    setMsg('');
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-page">
        {/* Background Elements */}
        <div className="background-elements">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
          <div className="floating-shape shape-4"></div>
        </div>

        {/* Authorization Warning Modal */}
        {showAuthWarning && (
          <div className="auth-warning-overlay">
            <div className="auth-warning-modal">
              <div className="warning-header">
                <div className="warning-icon-container">
                  <FiAlertTriangle className="warning-icon" />
                </div>
                <button 
                  className="modal-close-btn"
                  onClick={handleCancelLogin}
                  title="Cancel login"
                >
                  <FiX />
                </button>
              </div>

              <div className="warning-content">
                <h2 className="warning-title">
                  AUTHORIZED ACCESS ONLY
                </h2>
                
                <div className="warning-message">
                  <div className="warning-section">
                    <h3 className="section-title">⚠️ LEGAL NOTICE</h3>
                    <p className="section-text">
                      This system is restricted to authorized personnel only. Unauthorized access 
                      or use of this system is <strong>strictly prohibited</strong> and may result in:
                    </p>
                  </div>

                  <div className="consequences-list">
                    <div className="consequence-item">
                      <FiAlertCircle className="consequence-icon" />
                      <span>Criminal prosecution under applicable laws</span>
                    </div>
                    <div className="consequence-item">
                      <FiAlertCircle className="consequence-icon" />
                      <span>Civil liability and monetary damages</span>
                    </div>
                    <div className="consequence-item">
                      <FiAlertCircle className="consequence-icon" />
                      <span>Immediate termination of access privileges</span>
                    </div>
                    <div className="consequence-item">
                      <FiAlertCircle className="consequence-icon" />
                      <span>Disciplinary action up to and including dismissal</span>
                    </div>
                  </div>

                  <div className="warning-section">
                    <h3 className="section-title">🔒 MONITORING NOTICE</h3>
                    <p className="section-text">
                      All activities on this system are <strong>monitored and logged</strong>. 
                      By proceeding, you acknowledge that:
                    </p>
                    <ul className="monitoring-list">
                      <li>You are an authorized user with legitimate business need</li>
                      <li>Your access and activities will be recorded and audited</li>
                      <li>Misuse will be investigated and reported to authorities</li>
                      <li>You consent to monitoring of your system usage</li>
                    </ul>
                  </div>

                  <div className="final-warning">
                    <p>
                      <strong>IF YOU ARE NOT AUTHORIZED TO ACCESS THIS SYSTEM, 
                      DISCONNECT IMMEDIATELY.</strong>
                    </p>
                  </div>
                </div>

                <div className="warning-actions">
                  <button 
                    className="cancel-access-btn"
                    onClick={handleCancelLogin}
                  >
                    <FiX className="btn-icon" />
                    I Am Not Authorized
                  </button>
                  <button 
                    className="proceed-access-btn"
                    onClick={handleProceedWithLogin}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="proceed-spinner"></div>
                        Authenticating...
                      </>
                    ) : (
                      <>
                        <FiShield className="btn-icon" />
                        I Accept & Proceed
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Login Container */}
        <div className="login-container">
          <div className="login-card">
            {/* Header Section */}
            <div className="login-header">
              <div className="logo-section">
                <div className="logo-container">
                  <img src={logo} alt="Lurnity Logo" className="company-logo" />
                </div>
                <div className="brand-info">
                  <h1 className="brand-title">Admin Portal</h1>
                  <p className="brand-subtitle">Welcome back! Please sign in to continue</p>
                </div>
              </div>
              
              <div className="security-indicator">
                <div className="security-icon">
                  <FiShield />
                </div>
                <span className="security-text">Secure Login</span>
              </div>
            </div>

            {/* Error Alert */}
            {msg && (
              <div className="alert-container error-alert">
                <FiAlertCircle className="alert-icon" />
                <div className="alert-content">
                  <span className="alert-title">Authentication Error</span>
                  <span className="alert-message">{msg}</span>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form className="login-form" onSubmit={handleLoginAttempt}>
              <div className="form-field">
                <label className="field-label">
                  <FiUser className="label-icon" />
                  Username
                </label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <FiUser />
                  </div>
                  <input
                    className="field-input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                    autoComplete="username"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">
                  <FiLock className="label-icon" />
                  Password
                </label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <FiLock />
                  </div>
                  <input
                    className="field-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    disabled={isLoading}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="submit-button"
                disabled={isLoading}
              >
                <span>Sign In</span>
                <FiArrowRight className="button-arrow" />
              </button>
            </form>

            {/* Footer */}
            <div className="login-footer">
              <div className="security-badge">
                <FiCheck className="badge-icon" />
                <span className="badge-text">Protected by enterprise security</span>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="info-panel">
            <div className="panel-content">
              <div className="panel-icon">
                <FiShield />
              </div>
              <h2 className="panel-title">Secure Access</h2>
              <p className="panel-description">
                Your admin portal is protected with advanced security measures to ensure 
                safe and reliable access to your dashboard and management tools.
              </p>
              <div className="features-list">
                <div className="feature-item">
                  <FiCheck className="feature-icon" />
                  <span>Multi-layer authentication</span>
                </div>
                <div className="feature-item">
                  <FiCheck className="feature-icon" />
                  <span>Encrypted data transmission</span>
                </div>
                <div className="feature-item">
                  <FiCheck className="feature-icon" />
                  <span>Session management</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
