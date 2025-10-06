// src/components/AuthForm.js
import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import ForgotPassword from './ForgotPassword';
import { login, register } from '../services/api';
import './Login.css';
import logo from '../assets/LURNITY.jpg';
import { GoogleLogin } from "@react-oauth/google";

export default function AuthForm() {
  const history = useHistory();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  
  // Login form state
  const [loginForm, setLoginForm] = useState({ 
    email: '', 
    password: '' 
  });
  
  // Register form state
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  
  const [loginMsg, setLoginMsg] = useState('');
  const [registerMsg, setRegisterMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle login form changes
  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    setLoginMsg('');
  };

  // Handle register form changes
  const handleRegisterChange = (e) => {
    setRegisterForm({ 
      ...registerForm, 
      [e.target.name]: e.target.value 
    });
    setRegisterMsg('');
    setIsSuccess(false);
  };

  // Handle login submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginMsg('');

    try {
      const res = await login(loginForm);
      
      // Save token in localStorage
      localStorage.setItem('token', res.token);
      localStorage.setItem("userId", res.user.id);
      
      // Redirect to home page
      history.replace('/home');
    } catch (err) {
      setLoginMsg(err.message || 'Login failed');
    }
  };

  // Handle register submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword, phone } = registerForm;

    // Basic validations
    if (password.length < 10) {
      return setRegisterMsg('Password must be at least 10 characters.');
    }
    if (password !== confirmPassword) {
      return setRegisterMsg('Passwords do not match.');
    }

    try {
      // Register
      const res = await register({ name, email, password, phone });

      if (res.msg === 'User registered successfully') {
        setRegisterMsg(res.msg);
        setIsSuccess(true);

        // Automatically switch to sign-in after successful registration
        setTimeout(() => {
          setIsSignUp(false);
          setRegisterMsg('');
          setIsSuccess(false);
          // Clear register form
          setRegisterForm({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            phone: ''
          });
        }, 2000);
        return;
      }

      setRegisterMsg(res.msg || 'Registration failed.');
    } catch (err) {
      setRegisterMsg(err.message || 'Registration failed.');
    }
  };

  // Toggle between sign in and sign up
  const toggleSignUp = () => {
    setIsSignUp(true);
    setLoginMsg('');
    setRegisterMsg('');
    setIsSuccess(false);
  };

  const toggleSignIn = () => {
    setIsSignUp(false);
    setLoginMsg('');
    setRegisterMsg('');
    setIsSuccess(false);
  };

  return (
    <div className="auth-page-wrapper">
      <div className={`auth-container ${isSignUp ? 'right-panel-active' : ''}`}>
        {/* Logo inside the card */}
        <div className="auth-logo-container">
          <img
            src={logo}
            alt="Lurnity Logo"
            className="auth-logo"
            onClick={() => history.push('/')}
          />
        </div>

        {/* Sign Up Form */}
        <div className="auth-form-container sign-up-container">
          <form onSubmit={handleRegisterSubmit}>
            <h1>Create Account</h1>
            
            <span>Start carrer with Lurnity </span>
            
            <input
              type="text"
              name="name"
              value={registerForm.name}
              onChange={handleRegisterChange}
              placeholder="Full Name"
              required
            />
            <input
              type="email"
              name="email"
              value={registerForm.email}
              onChange={handleRegisterChange}
              placeholder="Email"
              required
            />
            <input
              type="tel"
              name="phone"
              value={registerForm.phone}
              onChange={handleRegisterChange}
              placeholder="Phone Number"
              required
            />
            <input
              type="password"
              name="password"
              value={registerForm.password}
              onChange={handleRegisterChange}
              placeholder="Password (min 10 chars)"
              required
            />
            <input
              type="password"
              name="confirmPassword"
              value={registerForm.confirmPassword}
              onChange={handleRegisterChange}
              placeholder="Confirm Password"
              required
            />
            
            <button type="submit">Register</button>
            
            {registerMsg && (
              <p className={`auth-form-msg ${isSuccess ? 'success' : 'error'}`}>
                {registerMsg}
              </p>
            )}
          </form>
        </div>

        {/* Sign In Form */}
        <div className="auth-form-container sign-in-container">
          <form onSubmit={handleLoginSubmit}>
            <h1>Sign In</h1>
            
            <span>or use your account</span>
            <div className="auth-social-container">
  <GoogleLogin
  onSuccess={(credentialResponse) => {
    const token = credentialResponse.credential;

    fetch("/api/google-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("userId", data.user.id);
          history.replace("/home");
        } else {
          alert("This email is not registered. Please sign up first.");
        }
      });
  }}
  onError={() => {
    console.log("Login Failed");
  }}
/>

</div>
            <input
              type="email"
              name="email"
              value={loginForm.email}
              onChange={handleLoginChange}
              placeholder="Email"
              required
            />
            <input
              type="password"
              name="password"
              value={loginForm.password}
              onChange={handleLoginChange}
              placeholder="Password"
              required
            />
            
            <Link to="#" className="forgot-password" onClick={(e)=>{ e.preventDefault(); setShowForgot(true); }}>Forgot your password?</Link>
{showForgot && <ForgotPassword onClose={()=>setShowForgot(false)} />}
            <button type="submit">Sign In</button>
            
            {loginMsg && (
              <p className="auth-form-msg error">{loginMsg}</p>
            )}
          </form>
        </div>

        {/* Overlay */}
        <div className="auth-overlay-container">
          <div className="auth-overlay">
            <div className="auth-overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p>To keep connected with us please login with your personal info</p>
              <button className="auth-ghost" onClick={toggleSignIn}>
                Sign In
              </button>
            </div>
            <div className="auth-overlay-panel overlay-right">
              <h1>Hello, Friend!</h1>
              <p>Enter your personal details and start journey with us</p>
              <button className="auth-ghost" onClick={toggleSignUp}>
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}