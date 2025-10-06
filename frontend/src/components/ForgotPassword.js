// src/components/ForgotPassword.jsx
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

  useEffect(() => {
    if (step === 'verify') {
      const t = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
      return () => clearInterval(t);
    }
  }, [step]);

  const onReq = async (e) => {
    e.preventDefault();
    setMsg('');
    const res = await requestReset({ email });
    if (res.requestId) {
      setRequestId(res.requestId);
      setMasked({ email: res.maskedEmail, phone: res.maskedPhone });
      setStep('verify');
      setCountdown(600);
    } else {
      setMsg(res.msg || 'If the account exists, OTPs were sent');
    }
  };

  const onVerify = async (e) => {
    e.preventDefault();
    setMsg('');
    const res = await verifyReset({ requestId, emailOtp, smsOtp });
    if (res.ok) setStep('reset');
    else setMsg(res.msg || 'Invalid or expired codes');
  };

  const onReset = async (e) => {
    e.preventDefault();
    setMsg('');
    if (newPass.length < 10) return setMsg('Password must be at least 10 characters.');
    if (newPass !== confirmPass) return setMsg('Passwords do not match.');
    const res = await finalizeReset({ requestId, newPassword: newPass });
    if (res.ok) setStep('done');
    else setMsg(res.msg || 'Reset failed');
  };

  return (
    <div className="forgot-modal">
      {step === 'request' && (
        <form onSubmit={onReq}>
          <h2>Reset password</h2>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Account email" required />
          <button type="submit">Send OTPs</button>
          {msg && <p className="error">{msg}</p>}
        </form>
      )}
      {step === 'verify' && (
        <form onSubmit={onVerify}>
          <h2>Enter OTPs</h2>
          <p>Sent to {masked.email} and {masked.phone}. Expires in {Math.floor(countdown/60)}:{String(countdown%60).padStart(2,'0')}</p>
          <input type="text" value={emailOtp} onChange={e=>setEmailOtp(e.target.value)} placeholder="Email OTP" inputMode="numeric" pattern="[0-9]*" required />
          <input type="text" value={smsOtp} onChange={e=>setSmsOtp(e.target.value)} placeholder="SMS OTP" inputMode="numeric" pattern="[0-9]*" required />
          <button type="submit">Verify</button>
          {msg && <p className="error">{msg}</p>}
        </form>
      )}
      {step === 'reset' && (
        <form onSubmit={onReset}>
          <h2>Set new password</h2>
          <input type="password" value={newPass} onChange={e=>setNewPass(e.target.value)} placeholder="New password (min 10 chars)" required />
          <input type="password" value={confirmPass} onChange={e=>setConfirmPass(e.target.value)} placeholder="Confirm password" required />
          <button type="submit">Update password</button>
          {msg && <p className="error">{msg}</p>}
        </form>
      )}
      {step === 'done' && (
        <div>
          <h2>Password updated</h2>
          <button onClick={onClose}>Back to Sign In</button>
        </div>
      )}
    </div>
  );
}
