// src/components/admin/Users.js
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import {
  listUsers, deleteUser, updateUser,
  listCourses, exportCSV, logTransaction, generateReceipt, toggleProfileLock
} from '../../services/adminApi';



import {
  FiDownloadCloud, FiEdit2, FiSave, FiX,
  FiTrash2, FiFileText, FiUsers, FiSearch,
  FiLock, FiUnlock, FiAward, FiFile,
  FiActivity, FiDollarSign, FiClock
} from 'react-icons/fi';

import './Users.css';

class Users extends Component {
  state = {
    users: [], filtered: [], courses: [],
    editId: null, form: {}, search: ''
  };

  async componentDidMount() {
    const [users, courses] = await Promise.all([listUsers(), listCourses()]);
    this.setState({ users, filtered: users, courses });
  }

  /* ---------- edit helpers ---------- */
  startEdit = u => this.setState({ editId: u._id, form: { ...u } });
  cancel = () => this.setState({ editId: null });
  change = e => this.setState({ form: { ...this.state.form, [e.target.name]: e.target.value } });

  save = async id => {
    const up = await updateUser(id, this.state.form);
    await logTransaction(id, { amount: this.state.form.amountPaid, mode: this.state.form.paymentMode, date: new Date() });
    this.setState(s => ({
      users: s.users.map(u => u._id === id ? up : u),
      filtered: s.filtered.map(u => u._id === id ? up : u),
      editId: null
    }));
  };

  del = async id => {
    if (!window.confirm('Delete user?')) return;
    await deleteUser(id);
    this.setState(s => ({
      users: s.users.filter(u => u._id !== id),
      filtered: s.filtered.filter(u => u._id !== id)
    }));
  };

  search = e => {
    const q = e.target.value.toLowerCase();
    this.setState({
      search: q,
      filtered: this.state.users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    });
  };

  /* ---------- receipt ---------- */
  downloadReceipt = async id => {
    try {
      const blob = await generateReceipt(id);
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `Lurnity_receipt_${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e.message || 'Failed to generate receipt');
    }
  };

  render() {
    const { filtered, editId, form, courses, search } = this.state;

    return (
      <div className="users-page">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-title-container">
            <FiUsers className="page-icon" />
            <h1 className="page-titlepo">Users Management</h1>
          </div>
          <p className="page-subtitle">Manage user accounts, enrollments, and payments</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <FiUsers />
            </div>
            <div className="stat-content">
              <h3>{filtered.length}</h3>
              <p>Total Users</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon active">
              <FiActivity />
            </div>
            <div className="stat-content">
              <h3>{filtered.filter(u => (u.status || 'active') === 'active').length}</h3>
              <p>Active Users</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon revenue">
              <FiDollarSign />
            </div>
            <div className="stat-content">
              <h3>₹{filtered.reduce((sum, u) => sum + (u.amountPaid || 0), 0).toLocaleString()}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="users-toolbar">
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by name or email..."
              value={search}
              onChange={this.search}
            />
          </div>
          <button className="export-btn" onClick={() => exportCSV(this.state.users)}>
            <FiDownloadCloud />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Users Table */}
        <div className="users-card">
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User Info</th>
                  <th>Role</th>
                  <th>Course</th>
                  <th>Financial</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Hours</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => {
                  const bal = (u.courseFee || 0) - (u.amountPaid || 0);
                  const prog = u.courseCompletion || 0;
                  const isEd = editId === u._id;

                  return (
                    <tr key={u._id} className={`user-row ${isEd ? 'editing' : ''}`}>
                      {/* User Info */}
                      <td className="user-info-cell">
                        <div className="user-info">
                          <div className="user-details">
                            {isEd ? (
                              <>
                                <input
                                  name="name"
                                  className="edit-input"
                                  value={form.name}
                                  onChange={this.change}
                                  placeholder="Name"
                                />
                                <input
                                  name="email"
                                  className="edit-input email-input"
                                  value={form.email}
                                  onChange={this.change}
                                  placeholder="Email"
                                />
                              </>
                            ) : (
                              <>
                                <div className="user-name">{u.name}</div>
                                <div className="user-email">{u.email}</div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td>
                        {isEd ? (
                          <select name="role" className="edit-select" value={form.role} onChange={this.change}>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span className={`role-badge ${u.role}`}>
                            {u.role?.toUpperCase() || 'USER'}
                          </span>
                        )}
                      </td>

                      {/* Course */}
                      <td>
                        {isEd ? (
                          <select name="course" className="edit-select" value={form.course || ''} onChange={this.change}>
                            <option value="">None</option>
                            {courses.map(c => (
                              <option key={c._id} value={c.title}>{c.title}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="course-info">
                            {u.course || <span className="no-course">No Course</span>}
                          </div>
                        )}
                      </td>

                      {/* Financial */}
                      <td>
                        <div className="financial-info">
                          {isEd ? (
                            <>
                              <input
                                name="courseFee"
                                type="number"
                                className="edit-input financial-input"
                                value={form.courseFee || ''}
                                onChange={this.change}
                                placeholder="Fee"
                              />
                              <input
                                name="amountPaid"
                                type="number"
                                className="edit-input financial-input"
                                value={form.amountPaid || ''}
                                onChange={this.change}
                                placeholder="Paid"
                              />
                            </>
                          ) : (
                            <>
                              <div className="fee-item">
                                <span className="label">Fee:</span>
                                <span className="amount">₹{(u.courseFee || 0).toLocaleString()}</span>
                              </div>
                              <div className="fee-item">
                                <span className="label">Paid:</span>
                                <span className="amount">₹{(u.amountPaid || 0).toLocaleString()}</span>
                              </div>
                              <div className="fee-item balance">
                                <span className="label">Balance:</span>
                                <span className={`amount ${bal > 0 ? 'pending' : 'clear'}`}>
                                  ₹{bal.toLocaleString()}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Payment Mode */}
                      <td>
                        {isEd ? (
                          <select name="paymentMode" className="edit-select" value={form.paymentMode || ''} onChange={this.change}>
                            <option value="">Select</option>
                            <option value="cash">Cash</option>
                            <option value="online">Online</option>
                            <option value="upi">UPI</option>
                            <option value="bank">Bank Transfer</option>
                          </select>
                        ) : (
                          <div className="payment-mode">
                            {u.paymentMode ? (
                              <span className={`payment-badge ${u.paymentMode}`}>
                                {u.paymentMode.toUpperCase()}
                              </span>
                            ) : (
                              <span className="no-payment">—</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        {isEd ? (
                          <select name="status" className="edit-select" value={form.status} onChange={this.change}>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="banned">Banned</option>
                          </select>
                        ) : (
                          <span className={`status-badge ${u.status || 'active'}`}>
                            {(u.status || 'active').toUpperCase()}
                          </span>
                        )}
                      </td>

                      {/* Progress */}
                      <td>
                        <div className="progress-container">
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${prog}%` }} />
                          </div>
                          <span className="progress-text">{prog}%</span>
                        </div>
                      </td>

                      {/* Learning Hours */}
                      <td>
                        <div className="hours-container">
                          {isEd ? (
                            <select
                              name="learningHours"
                              className="edit-select hours-select"
                              value={form.learningHours || 3}
                              onChange={this.change}
                            >
                              {[3, 4, 5, 6].map(hr => (
                                <option key={hr} value={hr}>{hr}h</option>
                              ))}
                            </select>
                          ) : (
                            <div className="hours-display">
                              <FiClock className="hours-icon" />
                              <span>{u.learningHours || 3}h</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="actions-cell">
                        <div className="actions-container">
                          {isEd ? (
                            <div className="edit-actions">
                              <button
                                className="action-btn save-btn"
                                onClick={() => this.save(u._id)}
                                title="Save Changes"
                              >
                                <FiSave />
                              </button>
                              <button
                                className="action-btn cancel-btn"
                                onClick={this.cancel}
                                title="Cancel"
                              >
                                <FiX />
                              </button>
                            </div>
                          ) : (
                            <div className="user-actions">
                              <button
                                className="action-btn edit-btn"
                                onClick={() => this.startEdit(u)}
                                title="Edit User"
                              >
                                <FiEdit2 />
                              </button>
                              <button
                                className="action-btn delete-btn"
                                onClick={() => this.del(u._id)}
                                title="Delete User"
                              >
                                <FiTrash2 />
                              </button>
                              <button
                                className="action-btn receipt-btn"
                                onClick={() => this.downloadReceipt(u._id)}
                                title="Download Receipt"
                              >
                                <FiFileText />
                              </button>
                              <button
                                className="action-btn certificate-btn"
                                onClick={() => this.props.history.push(`/admin/certificates/${u._id}`)}
                                title="View Certificates"
                              >
                                <FiAward />
                              </button>
                              <button
                                className="action-btn resume-btn"
                                onClick={() => this.props.history.push(`/admin/resume/${u._id}`)}
                                title="Download Resume"
                              >
                                <FiFile />
                              </button>
                              <button
                                className={`action-btn lock-btn ${u.profileLock === 'locked' ? 'locked' : 'unlocked'}`}
                                onClick={async () => {
                                  const newStatus = u.profileLock === "locked" ? "unlocked" : "locked";
                                  const updated = await toggleProfileLock(u._id, newStatus);
                                  this.setState(s => ({
                                    users: s.users.map(us => us._id === u._id ? updated : us),
                                    filtered: s.filtered.map(us => us._id === u._id ? updated : us)
                                  }));
                                }}
                                title={u.profileLock === "locked" ? "Unlock Profile" : "Lock Profile"}
                              >
                                {u.profileLock === "locked" ? <FiLock /> : <FiUnlock />}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Users);
