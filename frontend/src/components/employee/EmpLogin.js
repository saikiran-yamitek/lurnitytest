import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { empLogin } from "../../services/empApi";
import "./EmpLogin.css";
import logo from "../../assets/LURNITY.jpg";
import { 
  FiUser, FiLock, FiArrowRight, FiEye, FiEyeOff, 
  FiShield, FiCode, FiHeadphones, FiUsers, FiCalendar, FiBook
} from "react-icons/fi";

export default function EmpLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const hist = useHistory();

  const submit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const info = await empLogin(username, password);
      localStorage.setItem("empInfo", JSON.stringify(info));
      localStorage.setItem("empToken", info.token);
      
      // Route based on role
      if (info.role === "content" || info.role === "super")
        hist.push("/employee/content");
      else if (info.role === "support") 
        hist.push("/employee/support");
      else if (info.role === "lab administrator") 
        hist.push("/employee/labadmin");
      else if (info.role === "lab incharge") 
        hist.push("/employee/labincharge");
      else if (info.role === "placement") 
        hist.push("/employee/placement");
      else 
        hist.push("/employee/instructor");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const roleFeatures = [
    {
      icon: <FiShield />,
      title: "Super Admin",
      description: "Full system control"
    },
    {
      icon: <FiCode />,
      title: "Content Creator",
      description: "Course development"
    },
    {
      icon: <FiHeadphones />,
      title: "Support Team",
      description: "Student assistance"
    },
    {
      icon: <FiUsers />,
      title: "Lab Management",
      description: "Workshop coordination"
    },
    {
      icon: <FiCalendar />,
      title: "Placement Team",
      description: "Career services"
    },
    {
      icon: <FiBook />,
      title: "Instructors",
      description: "Teaching excellence"
    }
  ];

  return (
    <div className="emp-login-wrapper">
      {/* Background Elements */}
      <div className="emp-login-bg">
        <div className="emp-bg-shape emp-shape-1"></div>
        <div className="emp-bg-shape emp-shape-2"></div>
        <div className="emp-bg-shape emp-shape-3"></div>
      </div>

      {/* Left Panel - Branding */}
      <div className="emp-login-left">
        <div className="emp-brand-section">
          <div className="emp-brand-header">
            <img src={logo} alt="Lurnity" className="emp-brand-logo" />
            <div className="emp-brand-info">
              <h1 className="emp-brand-title">LURNITY</h1>
              <p className="emp-brand-subtitle">Employee Management Portal</p>
            </div>
          </div>
          
          <div className="emp-brand-description">
            <h2>Empowering Education Excellence</h2>
            <p>
              Access your dedicated workspace to manage courses, support students, 
              coordinate labs, and drive educational success across our platform.
            </p>
          </div>

          <div className="emp-features-grid">
            {roleFeatures.map((feature, index) => (
              <div key={index} className="emp-feature-item">
                <div className="emp-feature-icon">
                  {feature.icon}
                </div>
                <div className="emp-feature-content">
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="emp-login-right">
        <div className="emp-login-container">
          <div className="emp-login-header">
            <h2 className="emp-login-title">Welcome Back</h2>
            <p className="emp-login-subtitle">
              Sign in to access your employee dashboard
            </p>
          </div>

          <form className="emp-login-form" onSubmit={submit}>
            {error && (
              <div className="emp-error-message">
                <span>{error}</span>
              </div>
            )}

            <div className="emp-form-group">
              <label className="emp-form-label">Username</label>
              <div className="emp-input-wrapper">
                <FiUser className="emp-input-icon" />
                <input
                  type="text"
                  className="emp-form-input"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="emp-form-group">
              <label className="emp-form-label">Password</label>
              <div className="emp-input-wrapper">
                <FiLock className="emp-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="emp-form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="emp-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className={`emp-submit-btn ${isLoading ? 'emp-loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="emp-spinner"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <FiArrowRight className="emp-btn-icon" />
                </>
              )}
            </button>
          </form>

          <div className="emp-login-footer">
            <div className="emp-security-info">
              <FiShield className="emp-security-icon" />
              <span>Secure employee access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
