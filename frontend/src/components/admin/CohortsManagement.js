import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { listCohorts, createCohort, updateCohort, deleteCohort } from '../../services/adminApi';


export default function CohortsManagement() {
  const [cohorts, setCohorts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentCohort, setCurrentCohort] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    duration: '',
    seatsLeft: '',
    badgeType: 'Premium',
    isActive: true
  });

  useEffect(() => {
    fetchCohorts();
  }, []);

  const fetchCohorts = async () => {
  setIsLoading(true);
  try {
    const response = await fetch('/api/admin/landingpage/cohorts');
    if (!response.ok) throw new Error('Failed to fetch cohorts');
    const data = await response.json();
    setCohorts(data);
  } catch (error) {
    console.error('Error fetching cohorts:', error);
  } finally {
    setIsLoading(false);
  }
};


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'seatsLeft' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const url = currentCohort 
      ? `/api/admin/landingpage/cohorts/${currentCohort._id}`
      : '/api/admin/landingpage/cohorts';
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

    await fetchCohorts(); // ✅ just call the function, no `this`
    
    // ✅ Reset state
    setShowForm(false);
    setCurrentCohort(null);
    setFormData({
      title: '',
      startDate: '',
      duration: '',
      seatsLeft: '',
      badgeType: 'Premium',
      isActive: true
    });

  } catch (error) {
    console.error('Error saving cohort:', error);
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
      isActive: cohort.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
  if (window.confirm('Are you sure you want to delete this cohort?')) {
    try {
      const response = await fetch(`/api/admin/landingpage/cohorts/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete cohort');
      }

      await fetchCohorts(); // ✅ again, no `this`

    } catch (error) {
      console.error('Error deleting cohort:', error);
    }
  }
};


  return (
    <motion.div 
      className="cohorts-management"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="cohorts-header">
        <h2><FaCalendarAlt /> Manage Cohorts</h2>
        <button 
          className="btn-add-cohort"
          onClick={() => {
            setCurrentCohort(null);
            setShowForm(true);
          }}
        >
          <FaPlus /> Add Cohort
        </button>
      </div>

      {showForm && (
        <div className="cohort-form-container">
          <form onSubmit={handleSubmit} className="cohort-form">
            <h3>{currentCohort ? 'Edit Cohort' : 'Add New Cohort'}</h3>
            
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g., 6 months"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Seats Left</label>
                <input
                  type="number"
                  name="seatsLeft"
                  value={formData.seatsLeft}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Badge Type</label>
                <select
                  name="badgeType"
                  value={formData.badgeType}
                  onChange={handleInputChange}
                >
                  <option value="Exclusive">Exclusive</option>
                  <option value="Premium">Premium</option>
                  <option value="Lurnity">Lurnity</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-save">
                {currentCohort ? 'Update Cohort' : 'Add Cohort'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="loading">Loading cohorts...</div>
      ) : (
        <div className="cohorts-list">
          {cohorts.length === 0 ? (
            <div className="empty-state">
              <p>No cohorts found. Add your first cohort to display on the landing page.</p>
            </div>
          ) : (
            <table className="cohorts-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Start Date</th>
                  <th>Duration</th>
                  <th>Seats Left</th>
                  <th>Badge</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map(cohort => (
                  <tr key={cohort._id}>
                    <td>{cohort.title}</td>
                    <td>{new Date(cohort.startDate).toLocaleDateString()}</td>
                    <td>{cohort.duration}</td>
                    <td>{cohort.seatsLeft}</td>
                    <td>
                      <span className={`badge ${cohort.badgeType.toLowerCase()}`}>
                        {cohort.badgeType}
                      </span>
                    </td>
                    <td>
                      <span className={`status ${cohort.isActive ? 'active' : 'inactive'}`}>
                        {cohort.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="actions">
                      <button onClick={() => handleEdit(cohort)} className="btn-edit">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(cohort._id)} className="btn-delete">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </motion.div>
  );
}