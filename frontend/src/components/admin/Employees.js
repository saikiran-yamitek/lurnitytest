// src/components/admin/Employees.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listEmployees, deleteEmployee } from "../../services/adminApi";
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiUsers, 
  FiUserCheck,
  FiShield,
  FiHeadphones,
  FiTool,
  
} from "react-icons/fi";
import "./employees.css";

export default function Employees() {
  const [emps, setEmps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const employees = await listEmployees();
        setEmps(employees);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const remove = async id => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await deleteEmployee(id);
      setEmps(e => e.filter(v => v.id !== id));
    } catch (error) {
      console.error("Failed to delete employee:", error);
    }
  };

  if (loading) {
    return (
      <div className="employees-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading employees...</p>
        </div>
      </div>
    );
  }

  // Count employees by role
  const roleStats = {
    super: emps.filter(e => e.role === 'super').length,
    content: emps.filter(e => e.role === 'content').length,
    support: emps.filter(e => e.role === 'support').length,
    instructor: emps.filter(e => e.role === 'instructor').length
  };

  return (
    <div className="employees-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-container">
          <FiUsers className="page-icon" />
          <h1 className="page-titlepo">Employee Management</h1>
        </div>
        <p className="page-subtitle">Manage your team members and their roles</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <FiUsers />
          </div>
          <div className="stat-content">
            <h3>{emps.length}</h3>
            <p>Total Employees</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon super">
            <FiShield />
          </div>
          <div className="stat-content">
            <h3>{roleStats.super}</h3>
            <p>Super Admin</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon content">
            <FiTool />
          </div>
          <div className="stat-content">
            <h3>{roleStats.content}</h3>
            <p>Content Manager</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon support">
            <FiHeadphones />
          </div>
          <div className="stat-content">
            <h3>{roleStats.support}</h3>
            <p>Support</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="employees-toolbar">
        <div className="toolbar-left">
          <h2 className="section-title">All Employees</h2>
        </div>
        <div className="toolbar-right">
          <Link to="/admin/employees/new" className="add-employee-btn">
            <FiPlus />
            <span>Add Employee</span>
          </Link>
        </div>
      </div>

      {/* Employees Table */}
      <div className="employees-card">
        {emps.length === 0 ? (
          <div className="empty-state">
            <FiUsers className="empty-state-icon" />
            <h3>No employees found</h3>
            <p>Start building your team by adding employees</p>
            <Link to="/admin/employees/new" className="empty-state-btn">
              <FiPlus />
              Add Employee
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="employees-table">
              <thead>
                <tr>
                  <th>Employee Info</th>
                  <th>Contact Details</th>
                  <th>Gender</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {emps.map((e, index) => (
                  <tr key={e.id} className="employee-row" style={{ animationDelay: `${index * 0.1}s` }}>
                    {/* Employee Info */}
                    <td className="employee-info-cell">
                      <div className="employee-info">
                        <div className="employee-details">
                          <div className="employee-name">{e.name}</div>
                          <div className="employee-username">@{e.username}</div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Details */}
                    <td className="contact-cell">
                      <div className="contact-info">
                        <div className="contact-item">
                          <span className="contact-label">Email:</span>
                          <span className="contact-value">{e.email}</span>
                        </div>
                        <div className="contact-item">
                          <span className="contact-label">Phone:</span>
                          <span className="contact-value">{e.phone || <span className="no-data">Not provided</span>}</span>
                        </div>
                      </div>
                    </td>

                    {/* Gender */}
                    <td>
                      <span className={`gender-badge ${e.gender?.toLowerCase()}`}>
                        {e.gender || 'Not specified'}
                      </span>
                    </td>

                    {/* Role */}
                    <td>
                      <span className={`role-badge ${e.role}`}>
                        {getRoleIcon(e.role)}
                        {getRoleLabel(e.role)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="actions-cell">
                      <div className="actions-container">
                        <Link
                          to={`/admin/employees/${e.id}`}
                          className="action-btn edit-btn"
                          title="Edit Employee"
                        >
                          <FiEdit2 />
                        </Link>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => remove(e.id)}
                          title="Delete Employee"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions
function getRoleIcon(role) {
  switch (role) {
    case 'super':
      return <FiShield />;
    case 'content':
      return <FiTool />;
    case 'support':
      return <FiHeadphones />;
    case 'instructor':
      return <FiUserCheck />;
    default:
      return <FiUsers />;
  }
}

function getRoleLabel(role) {
  switch (role) {
    case 'super':
      return 'Super Admin';
    case 'content':
      return 'Content Manager';
    case 'support':
      return 'Support';
    case 'instructor':
      return 'Instructor';
    default:
      return role?.charAt(0)?.toUpperCase() + role?.slice(1) || 'Unknown';
  }
}
