// src/components/ForgotPassword.js
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { requestReset, verifyReset, finalizeReset } from '../services/api';
import './ForgotPassword.css'; // optional styling file

export default function ForgotPassword() {
  const history = useHistory();
  const [step, setStep] = useState('request');
  const [email, setEmail] = useState('');
  const [requestId, setRequestId] = useState(null);
  const [masked, setMasked] = useState({ email: '', phone: '' });
  const [emailOtp, setEmailOtp] = useState('');
  const [smsOtp, setSmsOtp] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [msg, setMsg] = useState('');
  const [countdown, setCountdown] = useState(600);
  const [loading, setLoading] = useState(false);

  // Countdown for OTP expiry
  useEffect(() => {
    if (step === 'verify') {
      const timer = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
      return () => clearInterval(timer);
    }
  }, [step]);

  // Request OTPs
  const onReq = async e => {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try {
      const res = await requestReset({ email });
      console.log('Forgot/request res:', res);
      if (res.requestId) {
        setRequestId(res.requestId);
        setMasked({ email: res.maskedEmail, phone: res.maskedPhone });
        setStep('verify');
        setCountdown(600);
      } else {
        setMsg(res.msg || 'If the account exists, OTPs were sent');
      }
    } catch (err) {
      console.error('Forgot/request error', err);
      setMsg('Request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTPs
  const onVerify = async e => {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try {
      const res = await verifyReset({ requestId, emailOtp, smsOtp });
      console.log('Forgot/verify res:', res);
      if (res.ok) {
        setStep('reset');
      } else {
        setMsg(res.msg || 'Invalid or expired OTPs');
      }
    } catch (err) {
      console.error('Forgot/verify error', err);
      setMsg('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const onReset = async e => {
    e.preventDefault();
    setMsg('');
    if (newPass.length < 10) return setMsg('Password must be at least 10 characters.');
    if (newPass !== confirmPass) return setMsg('Passwords do not match.');
    setLoading(true);
    try {
      const res = await finalizeReset({ requestId, newPassword: newPass });
      console.log('Forgot/reset res:', res);
      if (res.ok) setStep('done');
      else setMsg(res.msg || 'Password reset failed.');
    } catch (err) {
      console.error('Forgot/reset error', err);
      setMsg('Reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page-wrapper">
      {step === 'request' && (
        <form onSubmit={onReq} noValidate className="forgot-form">
          <h2>Reset Password</h2>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Account email"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Sending…' : 'Send OTPs'}
          </button>
          {msg && <p className="error">{msg}</p>}
          <button type="button" className="back-btn" onClick={() => history.push('/')}>
            Back to Sign In
          </button>
        </form>
      )}

      {step === 'verify' && (
        <form onSubmit={onVerify} noValidate className="forgot-form">
          <h2>Enter OTPs</h2>
          <p>
            Sent to {masked.email} and {masked.phone}. Expires in{' '}
            {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
          </p>
          <input
            type="text"
            value={emailOtp}
            onChange={e => setEmailOtp(e.target.value)}
            placeholder="Email OTP"
            inputMode="numeric"
            pattern="[0-9]*"
            required
          />
          <input
            type="text"
            value={smsOtp}
            onChange={e => setSmsOtp(e.target.value)}
            placeholder="SMS OTP"
            inputMode="numeric"
            pattern="[0-9]*"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying…' : 'Verify'}
          </button>
          {msg && <p className="error">{msg}</p>}
        </form>
      )}

      {step === 'reset' && (
        <form onSubmit={onReset} noValidate className="forgot-form">
          <h2>Set New Password</h2>
          <input
            type="password"
            value={newPass}
            onChange={e => setNewPass(e.target.value)}
            placeholder="New password (min 10 chars)"
            required
          />
          <input
            type="password"
            value={confirmPass}
            onChange={e => setConfirmPass(e.target.value)}
            placeholder="Confirm password"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Updating…' : 'Update Password'}
          </button>
          {msg && <p className="error">{msg}</p>}
        </form>
      )}

      {step === 'done' && (
        <div className="forgot-form">
          <h2>Password Updated</h2>
          <button onClick={() => history.push('/')}>Back to Sign In</button>
        </div>
      )}
    </div>
  );
}
