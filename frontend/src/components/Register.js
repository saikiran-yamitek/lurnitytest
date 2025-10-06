// src/components/Register.js
import React, { Component } from 'react';
import { register } from '../services/api';
import './Register.css';
import logo from '../assets/LURNITY.jpg';

const countryCodes = [
  { name: 'India', code: '+91' },
  { name: 'USA', code: '+1' },
  { name: 'UK', code: '+44' },
  { name: 'Australia', code: '+61' },
  // add more as needed
];

export default class Register extends Component {
  state = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    countryCode: '+91', // default
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

    /* basic validations */
    if (password.length < 10) {
      return this.setState({
        msg: 'Password must be at least 10 characters.'
      });
    }

    if (password !== confirmPassword) {
      return this.setState({ msg: 'Passwords do not match.' });
    }

    const fullPhone = `${countryCode}${phone.replace(/^0+/, '')}`; // remove leading 0 if exists

    /* 🔄  register */
    const res = await register({ name, email, password, phone: fullPhone });

    /* success */
    if (res.msg === 'User registered successfully') {
      this.setState({
        msg: res.msg,
        isSuccess: true
      });

      setTimeout(() => this.props.history.replace('/login'), 1500);
      return;
    }

    /* failure */
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

          <input
            type="text"
            name="name"
            value={name}
            onChange={this.handleChange}
            placeholder="Full Name"
            required
          />
          <input
            type="email"
            name="email"
            value={email}
            onChange={this.handleChange}
            placeholder="Email"
            required
          />
          <input
            type="password"
            name="password"
            value={password}
            onChange={this.handleChange}
            placeholder="Password (min 10 chars)"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={this.handleChange}
            placeholder="Confirm Password"
            required
          />

          {/* Country code + phone */}
          <div className="phone-input-wrapper">
            <select
              name="countryCode"
              value={countryCode}
              onChange={this.handleChange}
              className="country-code-select"
            >
              {countryCodes.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
            <input
              type="tel"
              name="phone"
              value={phone}
              onChange={this.handleChange}
              placeholder="Phone Number"
              required
              className="phone-input"
            />
          </div>

          <button type="submit">Sign Up</button>

          {msg && (
            <p className={`form-msg ${isSuccess ? 'success' : 'error'}`}>{msg}</p>
          )}

          <p className="switch-text">
            Already have an account? <a href="/login">Log in</a>
          </p>
        </form>
      </div>
    );
  }
}
