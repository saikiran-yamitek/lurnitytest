// src/pages/AdminLogin.js
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import './AdminLogin.css';
import logo from '../../assets/LURNITY.jpg'; // ✅ Update this based on your actual logo path

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const history = useHistory();

  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:7700/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.message || 'Login failed');
        return;
      }

      localStorage.setItem('adminToken', data.token);
      history.push('/admin');
    } catch (err) {
      setMsg('Login failed');
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <img src={logo} alt="Lurnity Logo" className="admin-logo" />
        <h1 className="admin-title">Admin Portal</h1>

        {msg && <p className="admin-error">{msg}</p>}

        <input
          className="admin-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />

        <input
          className="admin-input"
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />

        <button className="admin-button" onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
}
