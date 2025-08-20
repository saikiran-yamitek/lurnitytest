// src/components/admin/Hiring.js
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import './Hiring.css'; // keep your existing styles, add modal styles here if needed

export default function Hiring() {
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({
    department: 'Engineering',
    roleName: '',
    location: '',
    type: 'Full-time',
    experience: '',
    description: '',
    requirements: [''],
    isActive: true
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [applicantsModalOpen, setApplicantsModalOpen] = useState(false);
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const history = useHistory();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        // Expecting each job to include an "applications" array (per schema).
        setJobs(data);
      } else {
        throw new Error(data.message || 'Failed to fetch jobs');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      alert('Error fetching jobs');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleRequirementChange = (index, value) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData({ ...formData, requirements: newRequirements });
  };

  const addRequirementField = () => {
    setFormData({ ...formData, requirements: [...formData.requirements, ''] });
  };

  const removeRequirementField = (index) => {
    const newRequirements = formData.requirements.filter((_, i) => i !== index);
    setFormData({ ...formData, requirements: newRequirements });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isEditing ? `/api/jobs/${currentJobId}` : '/api/jobs';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        alert(isEditing ? 'Job updated successfully!' : 'Job created successfully!');
        fetchJobs();
        resetForm();
      } else {
        throw new Error(data.message || 'Failed to save job');
      }
    } catch (error) {
      console.error('Error saving job:', error);
      alert('Error saving job');
    }
  };

  const editJob = (job) => {
    setFormData({
      department: job.department,
      roleName: job.roleName,
      location: job.location,
      type: job.type,
      experience: job.experience,
      description: job.description,
      requirements: job.requirements && job.requirements.length > 0 ? job.requirements : [''],
      isActive: job.isActive
    });
    setIsEditing(true);
    setCurrentJobId(job._id);
    // scroll to form if desired
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleJobStatus = async (jobId, currentStatus) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      const data = await response.json();
      if (response.ok) {
        alert('Job status updated successfully!');
        fetchJobs();
      } else {
        throw new Error(data.message || 'Failed to update job status');
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      alert('Error updating job status');
    }
  };

  const deleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        const response = await fetch(`/api/jobs/${jobId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        });

        if (response.ok) {
          alert('Job deleted successfully!');
          fetchJobs();
        } else {
          const data = await response.json();
          throw new Error(data.message || 'Failed to delete job');
        }
      } catch (error) {
        console.error('Error deleting job:', error);
        alert('Error deleting job');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      department: 'Engineering',
      roleName: '',
      location: '',
      type: 'Full-time',
      experience: '',
      description: '',
      requirements: [''],
      isActive: true
    });
    setIsEditing(false);
    setCurrentJobId(null);
  };

  // NEW: open applicants modal for job
  const openApplicantsModal = (job) => {
    const apps = job.applications || []; // per schema, applications stored in job doc
    setSelectedApplicants(apps);
    setSelectedJobTitle(job.roleName || 'Applicants');
    setApplicantsModalOpen(true);
  };

  const closeApplicantsModal = () => {
    setApplicantsModalOpen(false);
    setSelectedApplicants([]);
    setSelectedJobTitle('');
  };

  // helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString(); // localized readable format
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="hiring-container">
      <h2>Job Postings</h2>

      <div className="hiring-content">
        <div className="job-form-section">
          <h3>{isEditing ? 'Edit Job' : 'Create New Job'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
              >
                <option value="Engineering">Engineering</option>
                <option value="Content">Content</option>
                <option value="Design">Design</option>
                <option value="Business">Business</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>

            <div className="form-group">
              <label>Role Name</label>
              <input
                type="text"
                name="roleName"
                value={formData.roleName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Job Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="Full-time">Full-time</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div className="form-group">
              <label>Experience</label>
              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Requirements</label>
              {formData.requirements.map((req, index) => (
                <div key={index} className="requirement-input">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                    required
                  />
                  {formData.requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRequirementField(index)}
                      className="remove-req"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addRequirementField}
                className="add-req"
              >
                + Add Requirement
              </button>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                Active
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {isEditing ? 'Update Job' : 'Create Job'}
              </button>
              {isEditing && (
                <button type="button" onClick={resetForm} className="cancel-btn">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="jobs-list-section">
          <h3>Current Job Postings</h3>
          {jobs.length === 0 ? (
            <p>No jobs posted yet.</p>
          ) : (
            <div className="jobs-grid">
              {jobs.map((job) => (
                <div key={job._id} className="job-card">
                  <div className="job-header">
                    <h4>{job.roleName}</h4>
                    <span className={`status-badge ${job.isActive ? 'active' : 'inactive'}`}>
                      {job.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="job-details">
                    <p><strong>Department:</strong> {job.department}</p>
                    <p><strong>Location:</strong> {job.location}</p>
                    <p><strong>Type:</strong> {job.type}</p>
                    <p><strong>Experience:</strong> {job.experience}</p>
                  </div>
                  <div className="job-actions">
                    <button onClick={() => editJob(job)} className="edit-btn">
                      Edit
                    </button>

                    {/* NEW: Applicants button */}
                    <button
                      onClick={() => openApplicantsModal(job)}
                      className="applicants-btn"
                      title="View applicants for this job"
                    >
                      Applicants ({(job.applications && job.applications.length) || 0})
                    </button>

                    <button
                      onClick={() => toggleJobStatus(job._id, job.isActive)}
                      className={`status-btn ${job.isActive ? 'deactivate' : 'activate'}`}
                    >
                      {job.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => deleteJob(job._id)} className="delete-btn">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Applicants Modal */}
      {applicantsModalOpen && (
        <div className="applicants-modal-overlay" onClick={closeApplicantsModal}>
          <div className="applicants-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedJobTitle} — Applicants</h3>
              <button className="modal-close" onClick={closeApplicantsModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {selectedApplicants.length === 0 ? (
                <p>No applicants have applied to this job yet.</p>
              ) : (
                <div className="applicants-list">
                  {selectedApplicants.map((app, idx) => (
                    <div key={idx} className="applicant-card">
                      <div className="applicant-main">
                        <div>
                          <p className="applicant-name"><strong>{app.name || '-'}</strong></p>
                          <p><strong>Email:</strong> <a href={`mailto:${app.email}`}>{app.email || '-'}</a></p>
                          <p><strong>Contact:</strong> {app.contactNumber || '-'}</p>
                          <p><strong>Applied At:</strong> {formatDate(app.appliedAt)}</p>
                        </div>
                        <div className="applicant-actions">
                          {app.resumeUrl ? (
                            <a
                              href={app.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="resume-link"
                            >
                              View Resume
                            </a>
                          ) : (
                            <span className="no-resume">No resume link</span>
                          )}
                        </div>
                      </div>

                      {app.coverLetter && (
                        <div className="applicant-cover">
                          <strong>Cover Letter:</strong>
                          <p>{app.coverLetter}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="close-btn" onClick={closeApplicantsModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
