// src/components/Register.js
import React, { Component } from 'react';
import { register } from '../services/api';          // ⬅️  only register call
import './Register.css';
import logo from '../assets/LURNITY.jpg';

export default class Register extends Component {
  state = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
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
    const { name, email, password, confirmPassword, phone } = this.state;

    /* basic validations */
    if (password.length < 10) {
      return this.setState({
        msg: 'Password must be at least 10 characters.'
      });
    }

    if (password !== confirmPassword) {
      return this.setState({ msg: 'Passwords do not match.' });
    }

    /* 🔄  register */
    const res = await register({ name, email, password, phone });

    /* success */
    if (res.msg === 'User registered successfully') {
      this.setState({
        msg: res.msg,
        isSuccess: true
      });

      /* small delay so the user can read the message */
      setTimeout(() => this.props.history.replace('/login'), 1500);
      return;
    }

    /* failure */
    this.setState({ msg: res.msg || 'Registration failed.' });
  };

  render() {
    const {
      name,
      email,
      password,
      confirmPassword,
      phone,
      msg,
      isSuccess
    } = this.state;

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
          <input
            type="tel"
            name="phone"
            value={phone}
            onChange={this.handleChange}
            placeholder="Phone Number"
            required
          />

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
