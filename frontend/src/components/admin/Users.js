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
  FiActivity, FiDollarSign, FiClock, FiLoader
} from 'react-icons/fi';

import './Users.css';

class Users extends Component {
  state = {
    users: [], filtered: [], courses: [],
    editId: null, form: {}, search: '',
    loading: false, savingId: null
  };

  async componentDidMount() {
    console.log('🚀 Users component mounting...');
    
    // Load users with error handling
    try {
      const usersResponse = await listUsers();
      console.log('👥 Users response:', usersResponse);
      
      // ✅ FIXED: Extract users array from response.items
      const usersArray = usersResponse.items || [];
      console.log('✅ Users extracted:', usersArray.length, usersArray);
      
      this.setState({ 
        users: usersArray, 
        filtered: usersArray 
      });
      console.log('✅ Users loaded:', usersArray.length);
    } catch (error) {
      console.error('❌ Failed to load users:', error);
      this.setState({ users: [], filtered: [] });
    }

    // Load courses independently (won't break users if it fails)
    try {
      const coursesResponse = await listCourses();
      console.log('📚 Courses response:', coursesResponse);
      
      // ✅ FIXED: Extract courses array from response.items
      const coursesArray = coursesResponse.items || [];
      console.log('✅ Courses extracted:', coursesArray.length);
      
      this.setState(prevState => ({ 
        ...prevState, 
        courses: coursesArray 
      }));
      console.log('✅ Courses loaded:', coursesArray.length);
    } catch (error) {
      console.error('❌ Failed to load courses (users still work):', error);
      this.setState(prevState => ({ 
        ...prevState, 
        courses: [] 
      }));
    }
  }

  /* ---------- edit helpers ---------- */
  startEdit = u => this.setState({ editId: u.id, form: { ...u } });
  cancel = () => this.setState({ editId: null });
  change = e => this.setState({ form: { ...this.state.form, [e.target.name]: e.target.value } });

  // ✅ IMPROVED: Enhanced save method with proper error handling
  save = async id => {
    if (this.state.savingId === id) return; // Prevent double-clicks
    
    try {
      this.setState({ savingId: id });
      console.log('🔍 Saving user:', id);
      console.log('🔍 Form data:', this.state.form);
      
      // ✅ FIXED: Remove id from form data before sending to avoid DynamoDB primary key error
      const { id: formId, ...updateData } = this.state.form;
      
      console.log('🔍 Update data (excluding id):', updateData);
      
      const up = await updateUser(id, updateData);
      console.log('✅ User updated successfully:', up);
      
      // Only log transaction if there's payment data and it's not empty
      if (updateData.amountPaid && updateData.paymentMode) {
        try {
          await logTransaction(id, { 
            amount: updateData.amountPaid, 
            mode: updateData.paymentMode, 
            date: new Date() 
          });
          console.log('✅ Transaction logged successfully');
        } catch (transactionError) {
          console.error('❌ Transaction logging failed (user still updated):', transactionError);
          // Don't fail the entire save if transaction logging fails
          alert('User updated but transaction logging failed. Please check manually.');
        }
      }
      
      this.setState(s => ({
        users: s.users.map(u => u.id === id ? { ...u, ...updateData } : u),
        filtered: s.filtered.map(u => u.id === id ? { ...u, ...updateData } : u),
        editId: null,
        savingId: null
      }));
      
      // ✅ SUCCESS FEEDBACK
      alert('✅ User updated successfully!');
      
    } catch (error) {
      console.error('❌ Failed to save user:', error);
      this.setState({ savingId: null });
      
      // ✅ IMPROVED: Better error messages based on error type
      if (error.message.includes('500')) {
        alert('❌ Server error: There was a problem updating the user. Please try again or contact support.');
      } else if (error.message.includes('Failed to fetch')) {
        alert('❌ Network error: Please check your internet connection and try again.');
      } else if (error.message.includes('404')) {
        alert('❌ User not found. Please refresh the page and try again.');
      } else if (error.message.includes('401') || error.message.includes('403')) {
        alert('❌ Authentication error. Please log in again.');
      } else {
        alert(`❌ Failed to save user: ${error.message}`);
      }
    }
  };

  // ✅ IMPROVED: Enhanced delete with better error handling
  del = async id => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      this.setState({ loading: true });
      await deleteUser(id);
      
      this.setState(s => ({
        users: s.users.filter(u => u.id !== id),
        filtered: s.filtered.filter(u => u.id !== id),
        loading: false
      }));
      
      alert('✅ User deleted successfully!');
      
    } catch (error) {
      console.error('❌ Failed to delete user:', error);
      this.setState({ loading: false });
      
      if (error.message.includes('Failed to fetch')) {
        alert('❌ Network error: Please check your connection and try again.');
      } else {
        alert('❌ Failed to delete user: ' + error.message);
      }
    }
  };

  // ✅ IMPROVED: Debounced search function
  searchTimeout = null;
  search = e => {
    const q = e.target.value;
    this.setState({ search: q });
    
    // Clear existing timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    // Debounce search by 300ms
    this.searchTimeout = setTimeout(() => {
      const { users } = this.state;
      const query = q.toLowerCase();
      
      if (Array.isArray(users)) {
        this.setState({
          filtered: users.filter(u => 
            (u.name && u.name.toLowerCase().includes(query)) || 
            (u.email && u.email.toLowerCase().includes(query)) ||
            (u.phone && u.phone.toLowerCase().includes(query))
          )
        });
      }
    }, 300);
  };

  /* ---------- receipt ---------- */
  downloadReceipt = async id => {
    try {
      this.setState({ loading: true });
      const blob = await generateReceipt(id);
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `Lurnity_receipt_${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      
      this.setState({ loading: false });
      
    } catch (e) {
      this.setState({ loading: false });
      console.error('❌ Receipt generation failed:', e);
      alert('❌ Failed to generate receipt: ' + (e.message || 'Please try again'));
    }
  };

  // ✅ IMPROVED: Enhanced toggle profile lock with better error handling
  toggleLock = async (user) => {
    if (this.state.loading) return; // Prevent multiple clicks
    
    const newStatus = user.profileLock === "locked" ? "unlocked" : "locked";
    
    try {
      this.setState({ loading: true });
      console.log('🔍 Toggling profile lock for user:', user.id, 'to status:', newStatus);
      
      const updated = await toggleProfileLock(user.id, newStatus);
      console.log('✅ Profile lock toggled successfully:', updated);
      
      this.setState(s => ({
        users: s.users.map(us => us.id === user.id ? { ...us, profileLock: newStatus } : us),
        filtered: s.filtered.map(us => us.id === user.id ? { ...us, profileLock: newStatus } : us),
        loading: false
      }));
      
      alert(`✅ User profile ${newStatus} successfully!`);
      
    } catch (error) {
      console.error('❌ Failed to toggle profile lock:', error);
      this.setState({ loading: false });
      
      if (error.message.includes('Failed to fetch')) {
        alert('❌ Network error: Please check your internet connection and try again.');
      } else if (error.message.includes('404')) {
        alert('❌ Profile lock endpoint not found. Please contact support.');
      } else if (error.message.includes('401') || error.message.includes('403')) {
        alert('❌ Authentication error. Please log in again.');
      } else {
        alert(`❌ Failed to toggle profile lock: ${error.message}`);
      }
    }
  };

  render() {
    const { filtered, editId, form, courses, search, loading, savingId } = this.state;

    // Add safety check for filtered array
    const safeFiltered = Array.isArray(filtered) ? filtered : [];
    console.log('🔍 Rendering users:', safeFiltered.length);

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
              <h3>{safeFiltered.length}</h3>
              <p>Total Users</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon active">
              <FiActivity />
            </div>
            <div className="stat-content">
              <h3>{safeFiltered.filter(u => (u.status || 'active') === 'active').length}</h3>
              <p>Active Users</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon revenue">
              <FiDollarSign />
            </div>
            <div className="stat-content">
              <h3>₹{safeFiltered.reduce((sum, u) => sum + (u.amountPaid || 0), 0).toLocaleString()}</h3>
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
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={this.search}
            />
          </div>
          <button 
            className="export-btn" 
            onClick={() => exportCSV(this.state.users)}
            disabled={loading}
          >
            {loading ? <FiLoader className="spin" /> : <FiDownloadCloud />}
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
                {safeFiltered.map(u => {
                  const bal = (u.courseFee || 0) - (u.amountPaid || 0);
                  const prog = u.courseCompletion || 0;
                  const isEd = editId === u.id;
                  const isSaving = savingId === u.id;

                  return (
                    <tr key={u.id} className={`user-row ${isEd ? 'editing' : ''} ${isSaving ? 'saving' : ''}`}>
                      {/* User Info */}
                      <td className="user-info-cell">
                        <div className="user-info">
                          <div className="user-details">
                            {isEd ? (
                              <>
                                <input
                                  name="name"
                                  className="edit-input"
                                  value={form.name || ''}
                                  onChange={this.change}
                                  placeholder="Name"
                                  disabled={isSaving}
                                />
                                <input
                                  name="email"
                                  className="edit-input email-input"
                                  value={form.email || ''}
                                  onChange={this.change}
                                  placeholder="Email"
                                  disabled={isSaving}
                                />
                                <input
                                  name="phone"
                                  className="edit-input phone-input"
                                  value={form.phone || ''}
                                  onChange={this.change}
                                  placeholder="Phone"
                                  disabled={isSaving}
                                />
                              </>
                            ) : (
                              <>
                                <div className="user-name">{u.name}</div>
                                <div className="user-email">{u.email}</div>
                                {u.phone && <div className="user-phone">{u.phone}</div>}
                              </>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td>
                        {isEd ? (
                          <select 
                            name="role" 
                            className="edit-select" 
                            value={form.role || ''} 
                            onChange={this.change}
                            disabled={isSaving}
                          >
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
                          <select 
                            name="course" 
                            className="edit-select" 
                            value={form.course || ''} 
                            onChange={this.change}
                            disabled={isSaving}
                          >
                            <option value="">None</option>
                            {Array.isArray(courses) && courses.map(c => (
                              <option key={c.id || c._id} value={c.title}>{c.title}</option>
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
                                disabled={isSaving}
                              />
                              <input
                                name="amountPaid"
                                type="number"
                                className="edit-input financial-input"
                                value={form.amountPaid || ''}
                                onChange={this.change}
                                placeholder="Paid"
                                disabled={isSaving}
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
                          <select 
                            name="paymentMode" 
                            className="edit-select" 
                            value={form.paymentMode || ''} 
                            onChange={this.change}
                            disabled={isSaving}
                          >
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
                          <select 
                            name="status" 
                            className="edit-select" 
                            value={form.status || ''} 
                            onChange={this.change}
                            disabled={isSaving}
                          >
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
                              disabled={isSaving}
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
                                onClick={() => this.save(u.id)}
                                title="Save Changes"
                                disabled={isSaving}
                              >
                                {isSaving ? <FiLoader className="spin" /> : <FiSave />}
                              </button>
                              <button
                                className="action-btn cancel-btn"
                                onClick={this.cancel}
                                title="Cancel"
                                disabled={isSaving}
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
                                disabled={loading}
                              >
                                <FiEdit2 />
                              </button>
                              <button
                                className="action-btn delete-btn"
                                onClick={() => this.del(u.id)}
                                title="Delete User"
                                disabled={loading}
                              >
                                <FiTrash2 />
                              </button>
                              <button
                                className="action-btn receipt-btn"
                                onClick={() => this.downloadReceipt(u.id)}
                                title="Download Receipt"
                                disabled={loading}
                              >
                                <FiFileText />
                              </button>
                              <button
                                className="action-btn certificate-btn"
                                onClick={() => this.props.history.push(`/admin/certificates/${u.id}`)}
                                title="View Certificates"
                                disabled={loading}
                              >
                                <FiAward />
                              </button>
                              <button
                                className="action-btn resume-btn"
                                onClick={() => this.props.history.push(`/admin/resume/${u.id}`)}
                                title="Download Resume"
                                disabled={loading}
                              >
                                <FiFile />
                              </button>
                              <button
                                className={`action-btn lock-btn ${u.profileLock === 'locked' ? 'locked' : 'unlocked'}`}
                                onClick={() => this.toggleLock(u)}
                                title={u.profileLock === "locked" ? "Unlock Profile" : "Lock Profile"}
                                disabled={loading}
                              >
                                {loading ? <FiLoader className="spin" /> : (u.profileLock === "locked" ? <FiLock /> : <FiUnlock />)}
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
