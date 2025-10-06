// src/components/ForgotPassword.js
import React, { useState, useEffect } from 'react';
import { requestReset, verifyReset, finalizeReset } from '../services/api';

export default function ForgotPassword({ onClose }) {
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

  useEffect(() => {
    if (step === 'verify') {
      const t = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
      return () => clearInterval(t);
    }
  }, [step]);

  const stopAll = (e) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
  };

  const onReq = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
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
      setMsg('Request failed');
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    setMsg('');
    setLoading(true);
    try {
      const res = await verifyReset({ requestId, emailOtp, smsOtp });
      console.log('Forgot/verify res:', res);
      if (res.ok) setStep('reset');
      else setMsg(res.msg || 'Invalid or expired codes');
    } catch (err) {
      console.error('Forgot/verify error', err);
      setMsg('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const onReset = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    setMsg('');
    if (newPass.length < 10) return setMsg('Password must be at least 10 characters.');
    if (newPass !== confirmPass) return setMsg('Passwords do not match.');
    setLoading(true);
    try {
      const res = await finalizeReset({ requestId, newPassword: newPass });
      console.log('Forgot/reset res:', res);
      if (res.ok) setStep('done');
      else setMsg(res.msg || 'Reset failed');
    } catch (err) {
      console.error('Forgot/reset error', err);
      setMsg('Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-modal" onClick={stopAll} onMouseDown={stopAll}>
      {step === 'request' && (
        <form onSubmit={onReq} onClick={stopAll} noValidate>
          <h2>Reset password</h2>
          <input
            type="email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            placeholder="Account email"
            required
          />
          <button type="submit" onClick={stopAll} disabled={loading}>
            {loading ? 'Sending…' : 'Send OTPs'}
          </button>
          {msg && <p className="error">{msg}</p>}
        </form>
      )}

      {step === 'verify' && (
        <form onSubmit={onVerify} onClick={stopAll} noValidate>
          <h2>Enter OTPs</h2>
          <p>
            Sent to {masked.email} and {masked.phone}. Expires in {Math.floor(countdown/60)}:{String(countdown%60).padStart(2,'0')}
          </p>
          <input
            type="text"
            value={emailOtp}
            onChange={e=>setEmailOtp(e.target.value)}
            placeholder="Email OTP"
            inputMode="numeric"
            pattern="[0-9]*"
            required
          />
          <input
            type="text"
            value={smsOtp}
            onChange={e=>setSmsOtp(e.target.value)}
            placeholder="SMS OTP"
            inputMode="numeric"
            pattern="[0-9]*"
            required
          />
          <button type="submit" onClick={stopAll} disabled={loading}>
            {loading ? 'Verifying…' : 'Verify'}
          </button>
          {msg && <p className="error">{msg}</p>}
        </form>
      )}

      {step === 'reset' && (
        <form onSubmit={onReset} onClick={stopAll} noValidate>
          <h2>Set new password</h2>
          <input
            type="password"
            value={newPass}
            onChange={e=>setNewPass(e.target.value)}
            placeholder="New password (min 10 chars)"
            required
          />
          <input
            type="password"
            value={confirmPass}
            onChange={e=>setConfirmPass(e.target.value)}
            placeholder="Confirm password"
            required
          />
          <button type="submit" onClick={stopAll} disabled={loading}>
            {loading ? 'Updating…' : 'Update password'}
          </button>
          {msg && <p className="error">{msg}</p>}
        </form>
      )}

      {step === 'done' && (
        <div onClick={stopAll}>
          <h2>Password updated</h2>
          <button onClick={onClose}>Back to Sign In</button>
        </div>
      )}
    </div>
  );
}
