// src/components/Login.js
import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { login } from '../services/api';
import './Login.css';
import logo from '../assets/LURNITY.jpg';

export default function Login() {
  const hist = useHistory();
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');

  const handle = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');

    try {
      const res = await login(form); // { token, user }

      // ✅ Save token in localStorage
      localStorage.setItem('token', res.token);
      localStorage.setItem("userId", res.user.id);

      // ✅ Redirect to home page
      hist.replace('/intro');
    } catch (err) {
      setMsg(err.message || 'Login failed');
    }
  };

  return (
    <div className="form-container">
      {/* Logo → Landing page */}
      <img
        src={logo}
        alt="Lurnity logo"
        className="form-logo"
        onClick={() => hist.push('/')}
        style={{ cursor: 'pointer' }}
      />

      <form className="form-card" onSubmit={submit}>
        <h2>Login</h2>

        <input
          name="email"
          value={form.email}
          onChange={handle}
          type="email"
          placeholder="Email address"
          required
        />

        <input
          name="password"
          value={form.password}
          onChange={handle}
          type="password"
          placeholder="Password"
          required
        />

        <button type="submit">Log&nbsp;In</button>
        {msg && <p className="form-msg">{msg}</p>}

        <p className="forgot-password">
          <Link to="#">Forgot&nbsp;password?</Link>
        </p>

        <p className="switch-text">
          New&nbsp;to&nbsp;Lurnity?&nbsp;
          <Link to="/register">Sign&nbsp;up</Link>
        </p>
      </form>
    </div>
  );
}
