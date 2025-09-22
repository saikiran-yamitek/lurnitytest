// src/components/admin/CohortsManagement.js
import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import {
  FiCalendar,
  FiClock,
  FiUsers,
  FiTag,
  FiActivity,
  FiX,
  FiSave,
  FiEdit,
  FiTrash2,
  FiTarget
} from 'react-icons/fi';
import './CohortsManagement.css';
const API_BASE = process.env.REACT_APP_API_URL;
export default function CohortsManagement() {
  const [cohorts, setCohorts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentCohort, setCurrentCohort] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    duration: '',
    seatsLeft: '',
    badgeType: 'Premium',
    isActive: true,
    tagline: '',
    speakerName: '',
    speakerCompany: '',
    rating: '',
    whatYouWillLearn: []
  });

  useEffect(() => {
    fetchCohorts();
  }, []);

  const fetchCohorts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/landingpage/cohorts`);
      if (!response.ok) throw new Error('Failed to fetch cohorts');
      const data = await response.json();
      setCohorts(data);
    } catch (error) {
      console.error('Error fetching cohorts:', error);
      alert('Failed to fetch cohorts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? checked 
        : name === 'seatsLeft' || name === 'rating'
          ? parseInt(value) || 0
          : value
    }));
  };

  // For "What You Will Learn" dynamic fields
  const handleLearnChange = (index, value) => {
    const updated = [...formData.whatYouWillLearn];
    updated[index] = value;
    setFormData(prev => ({ ...prev, whatYouWillLearn: updated }));
  };

  const addLearnPoint = () => {
    setFormData(prev => ({ ...prev, whatYouWillLearn: [...prev.whatYouWillLearn, ''] }));
  };

  const removeLearnPoint = (index) => {
    const updated = [...formData.whatYouWillLearn];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, whatYouWillLearn: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.startDate || !formData.duration || formData.seatsLeft === '') {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      setSaving(true);
      const url = currentCohort 
        ? `${API_BASE}/api/landingpage/cohorts/${currentCohort.id}`
        : `${API_BASE}/api/landingpage/cohorts`;
      const method = currentCohort ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error(currentCohort ? 'Failed to update cohort' : 'Failed to create cohort');
      }

      await fetchCohorts();
      setShowForm(false);
      setCurrentCohort(null);
      setFormData({
        title: '',
        startDate: '',
        duration: '',
        seatsLeft: '',
        badgeType: 'Premium',
        isActive: true,
        tagline: '',
        speakerName: '',
        speakerCompany: '',
        rating: '',
        whatYouWillLearn: []
      });

    } catch (error) {
      console.error('Error saving cohort:', error);
      alert('Failed to save cohort. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cohort) => {
    setCurrentCohort(cohort);
    setFormData({
      title: cohort.title,
      startDate: cohort.startDate.split('T')[0],
      duration: cohort.duration,
      seatsLeft: cohort.seatsLeft,
      badgeType: cohort.badgeType,
      isActive: cohort.isActive,
      tagline: cohort.tagline || '',
      speakerName: cohort.speakerName || '',
      speakerCompany: cohort.speakerCompany || '',
      rating: cohort.rating || '',
      whatYouWillLearn: cohort.whatYouWillLearn || []
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this cohort?')) {
      try {
        const response = await fetch(`/api/landingpage/cohorts/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete cohort');
        await fetchCohorts();
      } catch (error) {
        console.error('Error deleting cohort:', error);
        alert('Failed to delete cohort. Please try again.');
      }
    }
  };

  const getBadgeIcon = (badgeType) => {
    switch (badgeType) {
      case 'Exclusive':
        return <FiTarget />;
      case 'Premium':
        return <FiTag />;
      case 'Lurnity':
        return <FiActivity />;
      default:
        return <FiTag />;
    }
  };

  if (isLoading) {
    return (
      <div className="cohorts-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading cohorts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cohorts-page">
      <div className="page-header">
        <div className="page-title-container">
          <FiCalendar className="page-icon" />
          <h1 className="page-titlepo">Masterclass Management</h1>
        </div>
        <p className="page-subtitle">Manage training cohorts and batch schedules</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total"><FiCalendar /></div>
          <div className="stat-content">
            <h3>{cohorts.length}</h3>
            <p>Total Cohorts</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active"><FiActivity /></div>
          <div className="stat-content">
            <h3>{cohorts.filter(c => c.isActive).length}</h3>
            <p>Active Cohorts</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon seats"><FiUsers /></div>
          <div className="stat-content">
            <h3>{cohorts.reduce((sum, c) => sum + (c.seatsLeft || 0), 0)}</h3>
            <p>Available Seats</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="cohorts-toolbar">
        <div className="toolbar-left"><h2 className="section-title">All Cohorts</h2></div>
        <div className="toolbar-right">
          <button 
            className="add-cohort-btn"
            onClick={() => {
              setCurrentCohort(null);
              setFormData({
                title: '',
                startDate: '',
                duration: '',
                seatsLeft: '',
                badgeType: 'Premium',
                isActive: true,
                tagline: '',
                speakerName: '',
                speakerCompany: '',
                rating: '',
                whatYouWillLearn: []
              });
              setShowForm(true);
            }}
          >
            <FaPlus /><span>Add Cohort</span>
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-backdrop">
          <div className="modal-card cohort-form-modal">
            {saving && (
              <div className="saving-overlay">
                <div className="saving-content">
                  <div className="saving-spinner"></div>
                  <p>{currentCohort ? 'Updating cohort...' : 'Creating cohort...'}</p>
                </div>
              </div>
            )}

            <div className="modal-header">
              <h3>
                <FiCalendar className="modal-icon" />
                {currentCohort ? 'Edit Cohort' : 'Add New Cohort'}
              </h3>
              <button className="close-btn" onClick={() => setShowForm(false)}><FiX /></button>
            </div>

            <form onSubmit={handleSubmit} className="cohort-form">
              <div className="modal-content">
                {/* Title */}
                <div className="form-group">
                  <label className="form-label"><FiTarget className="label-icon" />Cohort Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Enter cohort title"
                    required
                  />
                </div>

                {/* Start Date & Duration */}
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label"><FiCalendar className="label-icon" />Start Date *</label>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="form-control" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label"><FiClock className="label-icon" />Duration *</label>
                    <input type="text" name="duration" value={formData.duration} onChange={handleInputChange} className="form-control" placeholder="e.g., 6 months" required />
                  </div>
                </div>

                {/* Seats & Badge */}
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label"><FiUsers className="label-icon" />Available Seats *</label>
                    <input type="number" name="seatsLeft" value={formData.seatsLeft} onChange={handleInputChange} className="form-control" placeholder="Number of seats" min="0" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label"><FiTag className="label-icon" />Badge Type</label>
                    <select name="badgeType" value={formData.badgeType} onChange={handleInputChange} className="form-select">
                      <option value="Exclusive">Exclusive</option>
                      <option value="Premium">Premium</option>
                      <option value="Lurnity">Lurnity</option>
                    </select>
                  </div>
                </div>

                {/* Active Checkbox */}
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="checkbox-input" />
                    <span className="checkbox-text">Active (visible on landing page)</span>
                  </label>
                </div>

                {/* New Fields */}
                <div className="form-group">
                  <label className="form-label">Tagline</label>
                  <input type="text" name="tagline" value={formData.tagline} onChange={handleInputChange} className="form-control" placeholder="Enter tagline" />
                </div>
                <div className="form-group">
                  <label className="form-label">Speaker Name</label>
                  <input type="text" name="speakerName" value={formData.speakerName} onChange={handleInputChange} className="form-control" placeholder="Enter speaker name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Speaker Company</label>
                  <input type="text" name="speakerCompany" value={formData.speakerCompany} onChange={handleInputChange} className="form-control" placeholder="Enter company name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <input type="number" name="rating" value={formData.rating} onChange={handleInputChange} className="form-control" placeholder="Enter rating (1-5)" min="1" max="5" />
                </div>

                {/* What You Will Learn */}
                <div className="form-group">
                  <label className="form-label">What You Will Learn</label>
                  {formData.whatYouWillLearn.map((point, index) => (
                    <div key={index} className="learn-point">
                      <input type="text" value={point} onChange={(e) => handleLearnChange(index, e.target.value)} className="form-control" placeholder={`Point ${index + 1}`} />
                      <button type="button" onClick={() => removeLearnPoint(index)} className="remove-btn">Remove</button>
                    </div>
                  ))}
                  <button type="button" onClick={addLearnPoint} className="add-btn">+ Add Point</button>
                </div>

              </div>

              {/* Actions */}
              <div className="modal-actions">
                <button type="button" onClick={() => setShowForm(false)} className="modal-btn cancel-btn" disabled={saving}>Cancel</button>
                <button type="submit" className="modal-btn save-btn" disabled={saving}>
                  <FiSave /> {saving ? (currentCohort ? 'Updating...' : 'Creating...') : (currentCohort ? 'Update Cohort' : 'Create Cohort')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cohorts Table */}
      <div className="cohorts-card">
        {cohorts.length === 0 ? (
          <div className="empty-state">
            <FiCalendar className="empty-state-icon" />
            <h3>No cohorts found</h3>
            <p>Create your first cohort to display on the landing page</p>
            <button className="empty-state-btn" onClick={() => {
              setCurrentCohort(null);
              setFormData({
                title: '',
                startDate: '',
                duration: '',
                seatsLeft: '',
                badgeType: 'Premium',
                isActive: true,
                tagline: '',
                speakerName: '',
                speakerCompany: '',
                rating: '',
                whatYouWillLearn: []
              });
              setShowForm(true);
            }}>
              <FaPlus /> Add First Cohort
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="cohorts-table">
              <thead>
                <tr>
                  <th>Cohort Details</th>
                  <th>Schedule</th>
                  <th>Capacity</th>
                  <th>Badge</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map((cohort, index) => (
                  <tr key={cohort.id} className="cohort-row" style={{ animationDelay: `${index * 0.1}s` }}>
                    <td className="cohort-details-cell">
                      <div className="cohort-details">
                        <div className="cohort-title">{cohort.title}</div>
                        <div className="cohort-tagline">{cohort.tagline}</div>
                        <div className="cohort-speaker">{cohort.speakerName} ({cohort.speakerCompany})</div>
                        <div className="cohort-rating">Rating: {cohort.rating}</div>
                        <div className="cohort-id">ID: {cohort.id.slice(-6)}</div>
                      </div>
                    </td>
                    <td className="schedule-cell">
                      <div className="schedule-info">
                        <div className="schedule-item"><FiCalendar className="schedule-icon" /><span>{new Date(cohort.startDate).toLocaleDateString()}</span></div>
                        <div className="schedule-item"><FiClock className="schedule-icon" /><span>{cohort.duration}</span></div>
                      </div>
                    </td>
                    <td>
                      <div className="capacity-info"><FiUsers className="capacity-icon" /><span className="seats-number">{cohort.seatsLeft}</span><span className="seats-label">seats left</span></div>
                    </td>
                    <td>
                      <span className={`badge-type ${cohort.badgeType.toLowerCase()}`}>{getBadgeIcon(cohort.badgeType)}{cohort.badgeType}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${cohort.isActive ? 'active' : 'inactive'}`}>{cohort.isActive ? <FaCheck /> : <FaTimes />}{cohort.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="actions-cell">
                      <div className="actions-container">
                        <button onClick={() => handleEdit(cohort)} className="action-btn edit-btn" title="Edit Cohort"><FiEdit /></button>
                        <button onClick={() => handleDelete(cohort.id)} className="action-btn delete-btn" title="Delete Cohort"><FiTrash2 /></button>
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
