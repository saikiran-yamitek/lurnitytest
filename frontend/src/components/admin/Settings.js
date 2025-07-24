// src/components/admin/Settings.js
import React, { useState, useEffect } from 'react';
import './Settings.css';

export default function Settings() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="settings-container">
      <h1 className="settings-title">Settings</h1>

      <div className="settings-card">
        <h2 className="card-title">Appearance</h2>
        <div className="setting-item">
          <span className="setting-label">Theme Mode</span>
          <div className="theme-switch">
            <label className="switch">
              <input
                type="checkbox"
                checked={theme === 'dark'}
                onChange={toggleTheme}
              />
              <span className="slider round"></span>
            </label>
            <span className="theme-label">{theme === 'light' ? 'Light' : 'Dark'} Mode</span>
          </div>
        </div>
      </div>

      {/* Future settings cards can go here */}
    </div>
  );
}
