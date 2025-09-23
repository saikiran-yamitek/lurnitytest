// src/components/admin/Hiring.js
import React, { useState, useEffect } from 'react';
import {
  FiEdit,
  FiTrash2,
  FiUsers,
  FiX,
  FiBriefcase,
  FiMapPin,
  FiClock,
  FiBookOpen,
  FiPlus,
  FiMinus,
  FiSave,
  FiEye,
  FiMail,
  FiPhone,
  FiCalendar,
  FiFileText,
  FiActivity,
  FiTarget,
  FiCheck
} from 'react-icons/fi';
import './Hiring.css';

const API = process.env.REACT_APP_API_URL;

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/landingpage/jobs`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setJobs(data);
      } else if (res.ok) {
        // if backend returns an object with items key
        setJobs(Array.isArray(data.items) ? data.items : []);
      } else {
        throw new Error(data.message || 'Failed to fetch jobs');
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      alert('Error fetching jobs. Check console for details.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData((p) => ({ ...p, [name]: checked }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const handleRequirementChange = (index, value) => {
    setFormData((p) => {
      const reqs = [...p.requirements];
      reqs[index] = value;
      return { ...p, requirements: reqs };
    });
  };

  const addRequirementField = () => {
    setFormData((p) => ({ ...p, requirements: [...p.requirements, ''] }));
  };

  const removeRequirementField = (index) => {
    setFormData((p) => ({ ...p, requirements: p.requirements.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic validation
    if (!formData.roleName || !formData.location || !formData.experience || !formData.description) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      setSaving(true);
      const url = isEditing
        ? `${API}/api/landingpage/jobs/${currentJobId}`
        : `${API}/api/landingpage/jobs`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        alert(isEditing ? 'Job updated successfully!' : 'Job created successfully!');
        await fetchJobs();
        resetForm();
      } else {
        throw new Error(data.message || 'Failed to save job');
      }
    } catch (err) {
      console.error('Error saving job:', err);
      alert('Error saving job. See console for details.');
    } finally {
      setSaving(false);
    }
  };

  const editJob = (job) => {
    setFormData({
      department: job.department || 'Engineering',
      roleName: job.roleName || '',
      location: job.location || '',
      type: job.type || 'Full-time',
      experience: job.experience || '',
      description: job.description || '',
      requirements: job.requirements && job.requirements.length > 0 ? job.requirements : [''],
      isActive: typeof job.isActive === 'boolean' ? job.isActive : true
    });
    setIsEditing(true);
    setCurrentJobId(job._id || job.id || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleJobStatus = async (jobId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this job?`)) return;
    try {
      const res = await fetch(`${API}/api/landingpage/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Job status updated successfully!');
        fetchJobs();
      } else {
        throw new Error(data.message || 'Failed to update job status');
      }
    } catch (err) {
      console.error('Error updating job status:', err);
      alert('Error updating job status. See console for details.');
    }
  };

  const deleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) return;
    try {
      const res = await fetch(`${API}/api/landingpage/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (res.ok) {
        alert('Job deleted successfully!');
        fetchJobs();
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to delete job');
      }
    } catch (err) {
      console.error('Error deleting job:', err);
      alert('Error deleting job. See console for details.');
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

  const openApplicantsModal = (job) => {
    const apps = Array.isArray(job.applications) ? job.applications : [];
    setSelectedApplicants(apps);
    setSelectedJobTitle(job.roleName || 'Applicants');
    setApplicantsModalOpen(true);
  };

  const closeApplicantsModal = () => {
    setApplicantsModalOpen(false);
    setSelectedApplicants([]);
    setSelectedJobTitle('');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString();
    } catch {
      return dateStr;
    }
  };

  const getDepartmentIcon = (department) => {
    switch (department) {
      case 'Engineering':
        return <FiTarget />;
      case 'Content':
        return <FiBookOpen />;
      case 'Design':
        return <FiBriefcase />;
      case 'Business':
        return <FiActivity />;
      case 'Marketing':
        return <FiUsers />;
      default:
        return <FiBriefcase />;
    }
  };

  if (loading) {
    return (
      <div className="hiring-page">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading job postings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hiring-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-container">
          <FiBriefcase className="page-icon" />
          <h1 className="page-titlepo">Hiring Management</h1>
        </div>
        <p className="page-subtitle">Manage job postings and track applications</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <FiBriefcase />
          </div>
          <div className="stat-content">
            <h3>{jobs.length}</h3>
            <p>Total Jobs</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <FiCheck />
          </div>
          <div className="stat-content">
            <h3>{jobs.filter((job) => job.isActive).length}</h3>
            <p>Active Jobs</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon applicants">
            <FiUsers />
          </div>
          <div className="stat-content">
            <h3>{jobs.reduce((sum, job) => sum + (job.applications?.length || 0), 0)}</h3>
            <p>Total Applications</p>
          </div>
        </div>
      </div>

      <div className="hiring-content">
        {/* Job Form Section */}
        <div className="job-form-card">
          {saving && (
            <div className="saving-overlay">
              <div className="saving-content">
                <div className="saving-spinner" />
                <p>{isEditing ? 'Updating job...' : 'Creating job...'}</p>
              </div>
            </div>
          )}

          <div className="form-header">
            <h3>
              <FiBriefcase className="form-icon" />
              {isEditing ? 'Edit Job Posting' : 'Create New Job'}
            </h3>
            {isEditing && (
              <button className="cancel-form-btn" onClick={resetForm} title="Cancel edit">
                <FiX />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="job-form">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  <FiTarget className="label-icon" />
                  Department *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="form-select"
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
                <label className="form-label">
                  <FiBriefcase className="label-icon" />
                  Role Name *
                </label>
                <input
                  type="text"
                  name="roleName"
                  value={formData.roleName}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Enter job role"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FiMapPin className="label-icon" />
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="e.g., Remote, New York, etc."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FiClock className="label-icon" />
                  Job Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FiActivity className="label-icon" />
                  Experience Required *
                </label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="e.g., 2-3 years, Fresher, etc."
                  required
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label className="form-label">
                <FiFileText className="label-icon" />
                Job Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-control textarea"
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                required
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">
                <FiBookOpen className="label-icon" />
                Requirements
              </label>
              <div className="requirements-container">
                {formData.requirements.map((req, index) => (
                  <div key={index} className="requirement-input">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => handleRequirementChange(index, e.target.value)}
                      className="form-control"
                      placeholder="Enter a requirement"
                      required
                    />
                    {formData.requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRequirementField(index)}
                        className="remove-req-btn"
                        title="Remove requirement"
                      >
                        <FiMinus />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addRequirementField} className="add-req-btn">
                  <FiPlus />
                  Add Requirement
                </button>
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="checkbox-input"
                />
                <span className="checkbox-text">Active (visible to applicants)</span>
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={saving}>
                <FiSave />
                {saving ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Job' : 'Create Job')}
              </button>
              {isEditing && (
                <button type="button" onClick={resetForm} className="cancel-btn">
                  <FiX />
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Jobs List Section */}
        <div className="jobs-list-card">
          <div className="list-header">
            <h3>
              <FiBriefcase className="list-icon" />
              Current Job Postings
            </h3>
            <span className="jobs-count">{jobs.length} jobs</span>
          </div>

          {jobs.length === 0 ? (
            <div className="empty-state">
              <FiBriefcase className="empty-state-icon" />
              <h4>No job postings yet</h4>
              <p>Create your first job posting to start hiring</p>
            </div>
          ) : (
            <div className="jobs-container">
              {jobs.map((job, index) => (
                <div
                  key={job._id || job.id || index}
                  className={`job-card ${job.isActive ? 'active' : 'inactive'}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="job-header">
                    <div className="job-title-section">
                      {getDepartmentIcon(job.department)}
                      <div className="job-title-info">
                        <h4 className="job-title">{job.roleName}</h4>
                        <span className="job-department">{job.department}</span>
                      </div>
                    </div>
                    <span className={`status-badge ${job.isActive ? 'active' : 'inactive'}`}>
                      {job.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="job-details">
                    <div className="detail-item">
                      <FiMapPin className="detail-icon" />
                      <span>{job.location}</span>
                    </div>
                    <div className="detail-item">
                      <FiClock className="detail-icon" />
                      <span>{job.type}</span>
                    </div>
                    <div className="detail-item">
                      <FiActivity className="detail-icon" />
                      <span>{job.experience}</span>
                    </div>
                  </div>

                  <div className="job-description">
                    <p>{(job.description || '').substring(0, 120)}{(job.description || '').length > 120 ? '...' : ''}</p>
                  </div>

                  <div className="job-stats">
                    <div className="stat-item">
                      <FiUsers className="stat-icon" />
                      <span>{(job.applications && job.applications.length) || 0} applicants</span>
                    </div>
                  </div>

                  <div className="job-actions">
                    <button onClick={() => editJob(job)} className="action-btn edit-btn" title="Edit Job">
                      <FiEdit />
                    </button>

                    <button onClick={() => openApplicantsModal(job)} className="action-btn applicants-btn" title="View Applicants">
                      <FiUsers />
                      <span>({(job.applications && job.applications.length) || 0})</span>
                    </button>

                    <button
                      onClick={() => toggleJobStatus(job._id || job.id, job.isActive)}
                      className={`action-btn status-btn ${job.isActive ? 'deactivate' : 'activate'}`}
                      title={job.isActive ? 'Deactivate Job' : 'Activate Job'}
                    >
                      {job.isActive ? <FiX /> : <FiCheck />}
                    </button>

                    <button onClick={() => deleteJob(job._id || job.id)} className="action-btn delete-btn" title="Delete Job">
                      <FiTrash2 />
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
        <div className="modal-backdrop">
          <div className="modal-card applicants-modal">
            <div className="modal-header">
              <h3>
                <FiUsers className="modal-icon" />
                {selectedJobTitle} — Applicants
              </h3>
              <button className="close-btn" onClick={closeApplicantsModal}>
                <FiX />
              </button>
            </div>

            <div className="modal-content">
              {selectedApplicants.length === 0 ? (
                <div className="empty-applicants">
                  <FiUsers className="empty-icon" />
                  <h4>No applications yet</h4>
                  <p>Applications will appear here once candidates apply for this position</p>
                </div>
              ) : (
                <div className="applicants-list">
                  {selectedApplicants.map((app, idx) => (
                    <div key={idx} className="applicant-card">
                      <div className="applicant-header">
                        <div className="applicant-info">
                          <h4 className="applicant-name">{app.name || 'Unknown'}</h4>
                          <div className="applicant-contact">
                            <div className="contact-item">
                              <FiMail className="contact-icon" />
                              <a href={`mailto:${app.email}`}>{app.email}</a>
                            </div>
                            {app.contactNumber && (
                              <div className="contact-item">
                                <FiPhone className="contact-icon" />
                                <span>{app.contactNumber}</span>
                              </div>
                            )}
                            <div className="contact-item">
                              <FiCalendar className="contact-icon" />
                              <span>{formatDate(app.appliedAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="applicant-actions">
                          {app.resumeUrl ? (
                            <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="resume-btn">
                              <FiEye />
                              View Resume
                            </a>
                          ) : (
                            <span className="no-resume">No resume</span>
                          )}
                        </div>
                      </div>

                      {app.coverLetter && (
                        <div className="cover-letter">
                          <h5>Cover Letter:</h5>
                          <p>{app.coverLetter}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedApplicants.length > 0 && (
              <div className="modal-footer">
                <div className="applicants-count">Total: {selectedApplicants.length} applications</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
