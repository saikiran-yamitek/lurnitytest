// src/components/admin/EmployeeForm.js
import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { getEmployee, saveEmployee } from "../../services/adminApi";
import {
  FiUser,
  FiMail,
  FiAtSign,
  FiLock,
  FiPhone,
  FiUsers,
  FiShield,
  FiTool,
  FiHeadphones,
  FiUserCheck,
  FiSettings,
  FiSave,
  FiArrowLeft,
  FiEye,
  FiEyeOff
} from "react-icons/fi";
import "./EmployeeForm.css";

export default function EmployeeForm() {
  const { id } = useParams();
  const hist = useHistory();
  const [emp, setEmp] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    phone: "",
    gender: "Male",
    role: "content"
  });
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id) (async () => {
      try {
        const employee = await getEmployee(id);
        setEmp(employee);
      } catch (error) {
        console.error("Failed to fetch employee:", error);
      }
    })();
  }, [id]);

  const handle = k => e => {
    setEmp({ ...emp, [k]: e.target.value });
    // Clear error when user starts typing
    if (errors[k]) {
      setErrors({ ...errors, [k]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!emp.name.trim()) newErrors.name = "Name is required";
    if (!emp.email.trim()) newErrors.email = "Email is required";
    if (!emp.username.trim()) newErrors.username = "Username is required";
    if (!id && !emp.password.trim()) newErrors.password = "Password is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const save = async e => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      await saveEmployee(id, emp);
      hist.push("/admin/employees");
    } catch (error) {
      console.error("Failed to save employee:", error);
      alert("Failed to save employee. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'super':
        return <FiShield />;
      case 'content':
        return <FiTool />;
      case 'support':
        return <FiHeadphones />;
      case 'instructor':
        return <FiUserCheck />;
      case 'lab administrator':
      case 'lab incharge':
        return <FiSettings />;
      case 'placement':
        return <FiUsers />;
      default:
        return <FiUser />;
    }
  };

  return (
    <div className="employee-form-page">
      {/* Page Header */}
      <div className="page-header">
        <button className="back-btn" onClick={() => hist.goBack()}>
          <FiArrowLeft />
          <span>Back</span>
        </button>
        
        <div className="title-section">
          <div className="page-title-container">
            <FiUser className="page-icon" />
            <h1 className="page-title">
              {id ? "Edit Employee" : "Add New Employee"}
            </h1>
          </div>
          <p className="page-subtitle">
            {id ? "Update employee information and role" : "Create a new team member account"}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="form-card">
        {saving && (
          <div className="saving-overlay">
            <div className="saving-content">
              <div className="saving-spinner"></div>
              <p>Saving employee...</p>
            </div>
          </div>
        )}

        <form className="employee-form" onSubmit={save}>
          {/* Personal Information Section */}
          <div className="form-section">
            <div className="section-header">
              <h3>
                <FiUser className="section-icon" />
                Personal Information
              </h3>
              <p className="section-description">
                Basic personal details of the employee
              </p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  <FiUser className="label-icon" />
                  Full Name *
                </label>
                <input
                  className={`form-control ${errors.name ? 'error' : ''}`}
                  value={emp.name}
                  onChange={handle("name")}
                  placeholder="Enter full name"
                  required
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FiMail className="label-icon" />
                  Email Address *
                </label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'error' : ''}`}
                  value={emp.email}
                  onChange={handle("email")}
                  placeholder="Enter email address"
                  required
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FiPhone className="label-icon" />
                  Phone Number
                </label>
                <input
                  className="form-control"
                  value={emp.phone}
                  onChange={handle("phone")}
                  placeholder="Enter phone number (optional)"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FiUsers className="label-icon" />
                  Gender
                </label>
                <select
                  className="form-select"
                  value={emp.gender}
                  onChange={handle("gender")}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Account Information Section */}
          <div className="form-section">
            <div className="section-header">
              <h3>
                <FiSettings className="section-icon" />
                Account Information
              </h3>
              <p className="section-description">
                Login credentials and access permissions
              </p>
            </div>

            <div className="form-grid account-grid">
              <div className="form-group">
                <label className="form-label">
                  <FiAtSign className="label-icon" />
                  Username *
                </label>
                <input
                  className={`form-control ${errors.username ? 'error' : ''}`}
                  value={emp.username}
                  onChange={handle("username")}
                  placeholder="Enter username"
                  required
                />
                {errors.username && <span className="error-message">{errors.username}</span>}
              </div>

              {!id && (
                <div className="form-group">
                  <label className="form-label">
                    <FiLock className="label-icon" />
                    Password *
                  </label>
                  <div className="password-input-container">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`form-control password-input ${errors.password ? 'error' : ''}`}
                      value={emp.password}
                      onChange={handle("password")}
                      placeholder="Enter password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>
              )}

              <div className="form-group role-group">
                <label className="form-label">
                  {getRoleIcon(emp.role)}
                  Role & Permissions *
                </label>
                <select
                  className="form-select role-select"
                  value={emp.role}
                  onChange={handle("role")}
                >
                  <option value="content">Content Manager</option>
                  <option value="support">Support Staff</option>
                  <option value="instructor">Instructor</option>
                  <option value="lab administrator">Lab Administrator</option>
                  <option value="lab incharge">Lab Incharge</option>
                  <option value="placement">Placement Officer</option>
                  <option value="super">Super Admin</option>
                </select>
                <div className="role-description">
                  {getRoleDescription(emp.role)}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Section */}
          <div className="submit-section">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => hist.goBack()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-btn"
              disabled={saving}
            >
              <FiSave />
              {saving ? "Saving..." : id ? "Update Employee" : "Create Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper function for role descriptions
function getRoleDescription(role) {
  switch (role) {
    case 'super':
      return "Full system access with all administrative privileges";
    case 'content':
      return "Manage courses, content, and educational materials";
    case 'support':
      return "Handle customer support and user assistance";
    case 'instructor':
      return "Teach courses and manage student progress";
    case 'lab administrator':
      return "Oversee laboratory operations and equipment";
    case 'lab incharge':
      return "Supervise lab activities and student sessions";
    case 'placement':
      return "Manage student placements and career services";
    default:
      return "Standard employee role";
  }
}
