// src/components/Register.js
import React, { Component } from 'react';
import { register } from '../services/api';
import './Register.css';
import logo from '../assets/LURNITY.jpg';

// A simple country code list, you can expand this
const countryCodes = [
  { code: '+1', country: 'USA' },
  { code: '+91', country: 'India' },
  { code: '+44', country: 'UK' },
  { code: '+61', country: 'Australia' },
  { code: '+81', country: 'Japan' },
  // ...add more as needed
];

export default class Register extends Component {
  state = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    countryCode: '+91', // default code
    msg: '',
    isSuccess: false
  };

  handleChange = (e) =>
    this.setState({
      [e.target.name]: e.target.value,
      msg: '',
      isSuccess: false
    });

  handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword, phone, countryCode } = this.state;

    if (password.length < 10) {
      return this.setState({ msg: 'Password must be at least 10 characters.' });
    }

    if (password !== confirmPassword) {
      return this.setState({ msg: 'Passwords do not match.' });
    }

    // Combine country code with phone
    const fullPhone = `${countryCode}${phone}`;

    const res = await register({ name, email, password, phone: fullPhone });

    if (res.msg === 'User registered successfully') {
      this.setState({ msg: res.msg, isSuccess: true });
      setTimeout(() => this.props.history.replace('/login'), 1500);
      return;
    }

    this.setState({ msg: res.msg || 'Registration failed.' });
  };

  render() {
    const { name, email, password, confirmPassword, phone, countryCode, msg, isSuccess } = this.state;

    return (
      <div className="form-container">
        <img
          src={logo}
          alt="Lurnity Logo"
          className="form-logo"
          onClick={() => this.props.history.push('/')}
          style={{ cursor: 'pointer' }}
        />

        <form className="form-card" onSubmit={this.handleSubmit}>
          <h2>Create your Account</h2>

          <input type="text" name="name" value={name} onChange={this.handleChange} placeholder="Full Name" required />
          <input type="email" name="email" value={email} onChange={this.handleChange} placeholder="Email" required />
          <input type="password" name="password" value={password} onChange={this.handleChange} placeholder="Password (min 10 chars)" required />
          <input type="password" name="confirmPassword" value={confirmPassword} onChange={this.handleChange} placeholder="Confirm Password" required />

          <div style={{ display: 'flex', marginBottom: '15px' }}>
            <select
              name="countryCode"
              value={countryCode}
              onChange={this.handleChange}
              style={{ marginRight: '10px', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
            >
              {countryCodes.map((c) => (
                <option key={c.code} value={c.code}>{`${c.country} (${c.code})`}</option>
              ))}
            </select>
            <input
              type="tel"
              name="phone"
              value={phone}
              onChange={this.handleChange}
              placeholder="Phone Number"
              required
              style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
            />
          </div>

          <button type="submit">Sign Up</button>

          {msg && <p className={`form-msg ${isSuccess ? 'success' : 'error'}`}>{msg}</p>}

          <p className="switch-text">
            Already have an account? <a href="/login">Log in</a>
          </p>
        </form>
      </div>
    );
  }
}
