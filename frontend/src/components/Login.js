"use client"

import { useState } from "react"
import { useHistory, Link } from "react-router-dom"
import { login, register, sendRegisterOTP, verifyRegisterOTP } from "../services/api"
import "./AuthForm.css"
import logo from "../assets/LURNITY.jpg"
import { GoogleLogin } from "@react-oauth/google"

export default function AuthForm() {
  const history = useHistory()
  const [isSignUp, setIsSignUp] = useState(false)

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  })

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  })

  // OTP states for registration
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [sessionId, setSessionId] = useState("")
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)

  const [loginMsg, setLoginMsg] = useState("")
  const [registerMsg, setRegisterMsg] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  // Handle login form changes
  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value })
    setLoginMsg("")
  }

  // Handle register form changes
  const handleRegisterChange = (e) => {
    setRegisterForm({
      ...registerForm,
      [e.target.name]: e.target.value,
    })
    setRegisterMsg("")
    setIsSuccess(false)
  }

  // Handle login submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setLoginMsg("")

    try {
      const res = await login(loginForm)

      localStorage.setItem("token", res.token)
      localStorage.setItem("userId", res.user.id)
      history.replace("/home")
    } catch (err) {
      setLoginMsg(err.message || "Login failed")
    }
  }

  // Handle "Register" button - sends OTP
  const handleSendOTP = async (e) => {
    e.preventDefault()
    const { name, email, password, confirmPassword, phone } = registerForm

    // Phone must start with +
    if (!phone.startsWith("+") || phone.length < 8) {
      return setRegisterMsg("Phone number must include country code, e.g., +91xxxxxxxxxx")
    }

    // Password validations
    if (password.length < 10) {
      return setRegisterMsg("Password must be at least 10 characters.")
    }
    if (password !== confirmPassword) {
      return setRegisterMsg("Passwords do not match.")
    }

    setOtpLoading(true)
    setRegisterMsg("")

    try {
      // Send OTP - backend will check if phone is already used
      const res = await sendRegisterOTP({ phone, email })

      if (res.sessionId) {
        setSessionId(res.sessionId)
        setOtpSent(true)
        setRegisterMsg("✅ OTP sent to your phone number. Please enter it below.")
        setIsSuccess(true)
      } else {
        setRegisterMsg(res.message || "Failed to send OTP")
      }
    } catch (err) {
      setRegisterMsg(err.message || "Failed to send OTP")
    } finally {
      setOtpLoading(false)
    }
  }

  // Handle final submit with OTP verification and registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault()

    if (!otp || otp.length !== 6) {
      return setRegisterMsg("❌ Please enter a valid 6-digit OTP.")
    }

    setOtpLoading(true)
    setRegisterMsg("")

    try {
      // Step 1: Verify OTP
      const verifyRes = await verifyRegisterOTP({
        phone: registerForm.phone,
        otp: otp,
        sessionId: sessionId,
      })

      if (!verifyRes.verified) {
        setRegisterMsg("❌ " + (verifyRes.message || "Invalid OTP"))
        setOtpLoading(false)
        return
      }

      // Step 2: Register user
      const { name, email, password, phone } = registerForm
      const registerRes = await register({
        name,
        email,
        password,
        phone,
        otpVerified: true,
        sessionId: sessionId,
      })

      if (registerRes.msg === "User registered successfully") {
        setRegisterMsg("✅ " + registerRes.msg)
        setIsSuccess(true)

        setTimeout(() => {
          setIsSignUp(false)
          setRegisterMsg("")
          setIsSuccess(false)
          setOtpSent(false)
          setOtp("")
          setSessionId("")
          setOtpVerified(false)
          setRegisterForm({
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
          })
        }, 2000)
        return
      }

      setRegisterMsg("❌ " + (registerRes.msg || "Registration failed."))
    } catch (err) {
      setRegisterMsg("❌ " + (err.message || "Registration failed."))
    } finally {
      setOtpLoading(false)
    }
  }

  const toggleSignUp = () => {
    setIsSignUp(true)
    setLoginMsg("")
    setRegisterMsg("")
    setIsSuccess(false)
    setOtpSent(false)
    setOtp("")
    setSessionId("")
  }

  const toggleSignIn = () => {
    setIsSignUp(false)
    setLoginMsg("")
    setRegisterMsg("")
    setIsSuccess(false)
    setOtpSent(false)
    setOtp("")
    setSessionId("")
  }

  return (
    <div className="auth-page-wrapper">
      <div className={`auth-container ${isSignUp ? "right-panel-active" : ""}`}>
        <div className="auth-logo-container">
          <img
            src={logo || "/placeholder.svg"}
            alt="Lurnity Logo"
            className="auth-logo"
            onClick={() => history.push("/")}
          />
        </div>

        {/* Sign Up Form */}
        <div className="auth-form-container sign-up-container">
          <form onSubmit={otpSent ? handleRegisterSubmit : handleSendOTP}>
            <h1>Create Account</h1>
            <span>Start your learning journey with Lurnity</span>

            <input
              type="text"
              name="name"
              value={registerForm.name}
              onChange={handleRegisterChange}
              placeholder="Full Name"
              required
              disabled={otpSent}
            />
            <input
              type="email"
              name="email"
              value={registerForm.email}
              onChange={handleRegisterChange}
              placeholder="Email"
              required
              disabled={otpSent}
            />
            <input
              type="tel"
              name="phone"
              value={registerForm.phone}
              onChange={handleRegisterChange}
              placeholder="Phone Number (+countrycode)"
              pattern="\+\d{7,15}"
              title="Include country code, e.g., +911234567890"
              required
              disabled={otpSent}
            />
            <input
              type="password"
              name="password"
              value={registerForm.password}
              onChange={handleRegisterChange}
              placeholder="Password (min 10 chars)"
              required
              disabled={otpSent}
            />
            <input
              type="password"
              name="confirmPassword"
              value={registerForm.confirmPassword}
              onChange={handleRegisterChange}
              placeholder="Confirm Password"
              required
              disabled={otpSent}
            />

            {/* Register Button - sends OTP */}
            {!otpSent && (
              <button type="submit" disabled={otpLoading}>
                {otpLoading ? "Sending OTP..." : "Register"}
              </button>
            )}

            {/* OTP Input Section */}
            {otpSent && (
              <>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "")
                    if (value.length <= 6) setOtp(value)
                  }}
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  required
                  className="otp-input"
                />
                <p className="otp-info">OTP sent to {registerForm.phone}. Valid for 10 minutes.</p>

                {/* Submit Button - verifies OTP and registers */}
                <button type="submit" disabled={otpLoading}>
                  {otpLoading ? "Verifying..." : "Submit"}
                </button>
              </>
            )}

            {registerMsg && <p className={`auth-form-msg ${isSuccess ? "success" : "error"}`}>{registerMsg}</p>}
          </form>
        </div>

        {/* Sign In Form */}
        <div className="auth-form-container sign-in-container">
          <form onSubmit={handleLoginSubmit}>
            <h1>Sign In</h1>
            <span>Welcome back to your learning hub</span>
            <div className="auth-social-container">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  const token = credentialResponse.credential

                  fetch("/api/auth/google-login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                  })
                    .then((res) => res.json())
                    .then((data) => {
                      if (data.success) {
                        localStorage.setItem("token", data.token)
                        localStorage.setItem("userId", data.user.id)
                        history.replace("/home")
                      } else {
                        alert("This email is not registered. Please sign up first.")
                      }
                    })
                }}
                onError={() => console.log("Login Failed")}
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

            <Link to="/forgot-password" className="forgot-password">
              Forgot your password?
            </Link>
            <button type="submit">Sign In</button>

            {loginMsg && <p className="auth-form-msg error">{loginMsg}</p>}
          </form>
        </div>

        {/* Overlay */}
        <div className="auth-overlay-container">
          <div className="auth-overlay">
            <div className="auth-overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p>Sign in to continue your learning journey and access all your courses</p>
              <button className="auth-ghost" onClick={toggleSignIn}>
                Sign In
              </button>
            </div>
            <div className="auth-overlay-panel overlay-right">
              <h1>Hello, Learner!</h1>
              <p>Join thousands of students and start learning with Lurnity today</p>
              <button className="auth-ghost" onClick={toggleSignUp}>
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
