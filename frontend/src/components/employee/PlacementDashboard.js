import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import logo from "../../assets/LURNITY.jpg";
import { 
  FiUser, FiLogOut, FiUsers, FiCalendar, FiX, FiPlus, 
   FiEdit, FiTrash2, FiEye, FiCheck, FiSearch,
  FiHome, FiMapPin, FiClock, FiAward, FiBell, FiTrendingUp,
  FiActivity, FiRefreshCw, FiDownload, FiSave, 
} from "react-icons/fi";
import { listPlacements, createPlacementDrive, getStudentsForDrive, deletePlacementDrive } from "../../services/placementApi";
import "./PlacementDashboard.css"

export default function PlacementDashboard() {
  const [form, setForm] = useState({});
  const [popup, setPopup] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [showStudentPopup, setShowStudentPopup] = useState(false);
  const [driveToDelete, setDriveToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [companies, setCompanies] = useState([]);
  const [newCompany, setNewCompany] = useState({ name: "", about: "", website: "", linkedin: "" });
  const [scheduledDrives, setScheduledDrives] = useState([]);
  const [completedDrives, setCompletedDrives] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [rankingSortBy, setRankingSortBy] = useState("lab");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [emp] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem("empInfo"));
  } catch (e) {
    return null;
  }
});

  const history = useHistory();

  const fetchCompanies = async () => {
    try {
      const res = await fetch("/api/companies");
      if (!res.ok) throw new Error("Failed to load companies");
      const data = await res.json();
      setCompanies(data);
    } catch (err) {
      console.error("fetchCompanies:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "rankings") {
      fetchRankings(rankingSortBy);
    }
  }, [activeTab, rankingSortBy]);

  useEffect(() => {
  const stored = emp; // stable via useState initializer
  if (!stored || !stored.id) {
    alert("Session expired. Please login again.");
    history.replace("/employee/login");
    return;
  }
  fetchDrives();
  fetchCompanies();
  // no deps needed because emp is stable
}, []);

useEffect(() => {
  if (activeTab === "rankings") {
    fetchRankings(rankingSortBy);
  }
}, [activeTab, rankingSortBy]);



  const fetchDrives = async () => {
    setLoading(true);
    try {
      const all = await listPlacements();
      setScheduledDrives(all.filter((d) => d.status === 'SCHEDULED'));
      setCompletedDrives(all.filter((d) => d.status === 'COMPLETED'));
    } catch (error) {
      setPopup("❌ Failed to fetch drives");
      setTimeout(() => setPopup(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async () => {
    setLoading(true);
    try {
      const payload = { ...form, createdBy: emp.id };

      if (form._id) {
        await fetch(`/api/placements/${form._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setPopup("✅ Drive Updated Successfully");
      } else {
        await createPlacementDrive(payload);
        setPopup("✅ Drive Created Successfully");
      }

      setForm({});
      fetchDrives();
      setActiveTab("scheduled");
      setTimeout(() => setPopup(""), 3000);
    } catch (err) {
      setPopup("❌ Failed to save drive");
      setTimeout(() => setPopup(""), 3000);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudents = async (driveId) => {
    try {
      const data = await getStudentsForDrive(driveId);
      setStudents(data);
      setSelectedDrive(driveId);
      setShowStudentPopup(true);
    } catch (err) {
      setPopup("❌ Failed to fetch students");
      setTimeout(() => setPopup(""), 3000);
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePlacementDrive(driveToDelete);
      setPopup("🗑️ Drive deleted successfully");
      fetchDrives();
      setDriveToDelete(null);
      setTimeout(() => setPopup(""), 3000);
    } catch (err) {
      setPopup("❌ Failed to delete drive");
      setTimeout(() => setPopup(""), 3000);
      console.error(err);
    }
  };

  const handleEditDrive = (drive) => {
    setForm({
  ...drive,
  lastDateToApply: drive.lastDateToApply ? drive.lastDateToApply.split("T")[0] : "",
  driveDate: drive.driveDate ? drive.driveDate.split("T")[0] : "",
});
    setActiveTab("create");
  };

  const doLogout = () => {
    localStorage.removeItem("empInfo");
    history.replace("/employee/login");
  };

  const fetchRankings = async (sortBy = "lab") => {
    const res = await fetch(`/api/rankings?sortBy=${sortBy}`);
    const data = await res.json();
    setRankings(data);
  };

  // Calculate dashboard statistics
  const totalDrives = scheduledDrives.length + completedDrives.length;
  const totalApplications = [...scheduledDrives, ...completedDrives].reduce((sum, drive) => 
    sum + (drive.registered?.length || 0), 0
  );
  const totalPlacements = completedDrives.reduce((sum, drive) => 
    sum + (drive.registered?.filter(s => s.status === "PLACED").length || 0), 0
  );
  const placementRate = totalApplications > 0 ? ((totalPlacements / totalApplications) * 100).toFixed(1) : 0;

  return (
    <div className="placement-dashboard-wrapper">
      {/* Sidebar */}
      <aside className="placement-sidebar">
        <div className="placement-sidebar-header">
          <div className="placement-logo-container">
            <img src={logo} alt="Lurnity" className="placement-logo" />
            <div className="placement-brand-info">
              <h2 className="placement-brand-title">Placement Portal</h2>
              <p className="placement-brand-subtitle">Career Management</p>
            </div>
          </div>
        </div>
        
        <nav className="placement-sidebar-nav">
          <div className="placement-nav-section">
            <span className="placement-nav-section-title">Main</span>
            <button 
              className={`placement-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} 
              onClick={() => setActiveTab('dashboard')}
            >
              <FiTrendingUp />
              <span>Dashboard</span>
            </button>
            <button 
              className={`placement-nav-item ${activeTab === 'create' ? 'active' : ''}`} 
              onClick={() => setActiveTab('create')}
            >
              <FiPlus />
              <span>Create Drive</span>
            </button>
          </div>

          <div className="placement-nav-section">
            <span className="placement-nav-section-title">Management</span>
            <button 
              className={`placement-nav-item ${activeTab === 'scheduled' ? 'active' : ''}`} 
              onClick={() => setActiveTab('scheduled')}
            >
              <FiClock />
              <span>Scheduled</span>
              {scheduledDrives.length > 0 && (
                <span className="placement-nav-badge">{scheduledDrives.length}</span>
              )}
            </button>
            <button 
              className={`placement-nav-item ${activeTab === 'companies' ? 'active' : ''}`} 
              onClick={() => setActiveTab('companies')}
            >
              <FiHome />
              <span>Companies</span>
            </button>
            <button 
              className={`placement-nav-item ${activeTab === 'completed' ? 'active' : ''}`} 
              onClick={() => setActiveTab('completed')}
            >
              <FiCheck />
              <span>Completed</span>
            </button>
            <button
              className={`placement-nav-item ${activeTab === 'rankings' ? 'active' : ''}`}
              onClick={() => setActiveTab('rankings')}
            >
              <FiAward />
              <span>Rankings</span>
            </button>
          </div>
        </nav>

        <div className="placement-sidebar-footer">
          <div className="placement-user-card">
            <div className="placement-user-avatar">
              <FiUser />
            </div>
            <div className="placement-user-info">
              <span className="placement-user-name">{emp?.name}</span>
              <span className="placement-user-role">Placement Officer</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="placement-main-content">
        {/* Top Header */}
        <header className="placement-header">
          <div className="placement-header-left">
            <div className="placement-page-info">
              <h1 className="placement-page-title">
                {activeTab === 'dashboard' && 'Placement Dashboard'}
                {activeTab === 'create' && (form._id ? 'Edit Placement Drive' : 'Create New Drive')}
                {activeTab === 'scheduled' && 'Scheduled Drives'}
                {activeTab === 'companies' && 'Company Management'}
                {activeTab === 'completed' && 'Completed Drives'}
                {activeTab === 'rankings' && 'Student Rankings'}
              </h1>
              <p className="placement-page-subtitle">
                {activeTab === 'dashboard' && 'Manage campus placement drives and track student progress'}
                {activeTab === 'create' && 'Fill in the details to create a new campus placement opportunity'}
                {activeTab === 'scheduled' && `Managing ${scheduledDrives.length} upcoming drives`}
                {activeTab === 'companies' && 'Add and manage company profiles for placement drives'}
                {activeTab === 'completed' && `View results of ${completedDrives.length} completed drives`}
                {activeTab === 'rankings' && 'View and manage student performance rankings'}
              </p>
            </div>
          </div>
          <div className="placement-header-right">
            <button className="placement-header-btn" onClick={fetchDrives}>
              <FiRefreshCw />
            </button>
            <button className="placement-header-btn">
              <FiBell />
            </button>
            <button className="placement-logout-btn" onClick={doLogout} title="Logout">
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="placement-content">
          {loading && (
            <div className="placement-loading-overlay">
              <div className="placement-loading-spinner">
                <div className="placement-spinner"></div>
                <p>Loading...</p>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="placement-dashboard">
              {/* Statistics Cards */}
              <div className="placement-stats-grid">
                <div className="placement-stat-card placement-stat-primary">
                  <div className="placement-stat-header">
                    <div className="placement-stat-icon">
                      <FiCalendar />
                    </div>
                    <div className="placement-stat-info">
                      <h3 className="placement-stat-value">{totalDrives}</h3>
                      <p className="placement-stat-label">Total Drives</p>
                    </div>
                  </div>
                  <div className="placement-stat-footer">
                    <span className="placement-stat-trend positive">
                      <FiTrendingUp />
                      All placement activities
                    </span>
                  </div>
                </div>

                <div className="placement-stat-card placement-stat-success">
                  <div className="placement-stat-header">
                    <div className="placement-stat-icon">
                      <FiUsers />
                    </div>
                    <div className="placement-stat-info">
                      <h3 className="placement-stat-value">{totalPlacements}</h3>
                      <p className="placement-stat-label">Students Placed</p>
                    </div>
                  </div>
                  <div className="placement-stat-footer">
                    <span className="placement-stat-trend positive">
                      <FiTrendingUp />
                      Successful placements
                    </span>
                  </div>
                </div>

                <div className="placement-stat-card placement-stat-warning">
                  <div className="placement-stat-header">
                    <div className="placement-stat-icon">
                      <FiActivity />
                    </div>
                    <div className="placement-stat-info">
                      <h3 className="placement-stat-value">{placementRate}%</h3>
                      <p className="placement-stat-label">Placement Rate</p>
                    </div>
                  </div>
                  <div className="placement-stat-footer">
                    <span className="placement-stat-trend positive">
                      <FiTrendingUp />
                      Success percentage
                    </span>
                  </div>
                </div>

                <div className="placement-stat-card placement-stat-info">
                  <div className="placement-stat-header">
                    <div className="placement-stat-icon">
                      <FiHome />
                    </div>
                    <div className="placement-stat-info">
                      <h3 className="placement-stat-value">{companies.length}</h3>
                      <p className="placement-stat-label">Partner Companies</p>
                    </div>
                  </div>
                  <div className="placement-stat-footer">
                    <span className="placement-stat-trend neutral">
                      <FiActivity />
                      Registered partners
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="placement-quick-actions-section">
                <div className="placement-section-header">
                  <h2 className="placement-section-title">Quick Actions</h2>
                  <p className="placement-section-subtitle">Frequently used placement management tools</p>
                </div>
                <div className="placement-quick-actions">
                  <button 
                    className="placement-quick-action-card primary"
                    onClick={() => setActiveTab('create')}
                  >
                    <div className="placement-action-icon">
                      <FiPlus />
                    </div>
                    <div className="placement-action-content">
                      <h3>Create Drive</h3>
                      <p>Schedule new placement drive</p>
                    </div>
                  </button>

                  <button 
                    className="placement-quick-action-card secondary"
                    onClick={() => setActiveTab('companies')}
                  >
                    <div className="placement-action-icon">
                      <FiHome />
                    </div>
                    <div className="placement-action-content">
                      <h3>Manage Companies</h3>
                      <p>Add and edit company profiles</p>
                    </div>
                  </button>

                  <button 
                    className="placement-quick-action-card tertiary"
                    onClick={() => setActiveTab('rankings')}
                  >
                    <div className="placement-action-icon">
                      <FiAward />
                    </div>
                    <div className="placement-action-content">
                      <h3>View Rankings</h3>
                      <p>Student performance analytics</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recent Activities */}
              <div className="placement-recent-section">
                <div className="placement-section-header">
                  <h2 className="placement-section-title">Recent Drives</h2>
                  <button 
                    className="placement-view-all-btn"
                    onClick={() => setActiveTab('scheduled')}
                  >
                    View All
                  </button>
                </div>
                <div className="placement-recent-drives">
                  {[...scheduledDrives, ...completedDrives].slice(0, 3).map((drive) => (
                    <div key={drive._id} className="placement-recent-drive-item">
                      <div className="placement-recent-drive-header">
                        <div className="placement-drive-icon">
                          <FiHome />
                        </div>
                        <div className="placement-drive-info">
                          <h4 className="placement-drive-title">{drive.company}</h4>
                          <p className="placement-drive-role">{drive.role}</p>
                        </div>
                        <div className="placement-drive-status">
                          <span className={`placement-status-badge ${drive.status.toLowerCase()}`}>
                            {drive.status}
                          </span>
                        </div>
                      </div>
                      <div className="placement-recent-drive-meta">
                        <span className="placement-drive-date">
                          <FiCalendar />
                          {new Date(drive.driveDate).toLocaleDateString()}
                        </span>
                        <span className="placement-drive-applications">
                          <FiUsers />
                          {drive.registered?.length || 0}/{drive.seats}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'create' && (
            <div className="placement-create-section">
              <div className="placement-form-container">
                <div className="placement-form-header">
                  <h2 className="placement-form-title">
                    {form._id ? 'Edit Placement Drive' : 'Drive Details'}
                  </h2>
                  <p className="placement-form-subtitle">
                    Fill in the information to {form._id ? 'update' : 'create'} a placement opportunity
                  </p>
                </div>

                <form className="placement-form">
                  <div className="placement-form-row">
                    <div className="placement-form-group">
                      <label className="placement-form-label">
                        Select Company <span className="placement-required">*</span>
                      </label>
                      <select 
                        className="placement-form-input placement-form-select" 
                        onChange={(e) => {
                          const selected = companies.find(c => c._id === e.target.value);
                          if (!selected) return;
                          setForm({
                            ...form,
                            companyId: selected._id,
                            company: selected.name,
                            aboutCompany: selected.about,
                            companyWebsite: selected.website,
                            companyLinkedin: selected.linkedin
                          });
                        }}
                        required
                      >
                        <option value="">Choose a company...</option>
                        {companies.map((c) => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="placement-form-group">
                      <label className="placement-form-label">
                        Job Role <span className="placement-required">*</span>
                      </label>
                      <input 
                        className="placement-form-input" 
                        name="role" 
                        placeholder="e.g. Software Engineer" 
                        value={form.role || ""} 
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="placement-form-row">
                    <div className="placement-form-group">
                      <label className="placement-form-label">
                        Number of Positions <span className="placement-required">*</span>
                      </label>
                      <input 
                        className="placement-form-input" 
                        type="number" 
                        name="seats" 
                        placeholder="Enter number of seats" 
                        value={form.seats || ""} 
                        onChange={handleChange}
                        min="1"
                        required
                      />
                    </div>

                    <div className="placement-form-group">
                      <label className="placement-form-label">
                        CTC Package <span className="placement-required">*</span>
                      </label>
                      <input 
                        className="placement-form-input" 
                        name="ctc" 
                        placeholder="e.g. 8-12 LPA" 
                        value={form.ctc || ""} 
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="placement-form-row">
                    <div className="placement-form-group">
                      <label className="placement-form-label">Service Agreement</label>
                      <input 
                        className="placement-form-input" 
                        name="serviceAgreement" 
                        placeholder="e.g. 2 years" 
                        value={form.serviceAgreement || ""} 
                        onChange={handleChange} 
                      />
                    </div>

                    <div className="placement-form-group">
                      <label className="placement-form-label">
                        Job Location <span className="placement-required">*</span>
                      </label>
                      <input 
                        className="placement-form-input" 
                        name="jobLocation" 
                        placeholder="e.g. Bangalore, Mumbai" 
                        value={form.jobLocation || ""} 
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="placement-form-row">
                    <div className="placement-form-group">
                      <label className="placement-form-label">
                        Last Date to Apply <span className="placement-required">*</span>
                      </label>
                      <input
                        className="placement-form-input"
                        type="date"
                        name="lastDateToApply"
                        value={form.lastDateToApply || ""}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="placement-form-group">
                      <label className="placement-form-label">
                        Drive Date <span className="placement-required">*</span>
                      </label>
                      <input
                        className="placement-form-input"
                        type="date"
                        name="driveDate"
                        value={form.driveDate || ""}
                        min={
                          form.lastDateToApply
                            ? new Date(new Date(form.lastDateToApply).getTime() + 86400000)
                                .toISOString()
                                .split("T")[0]
                            : ""
                        }
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="placement-form-row">
                    <div className="placement-form-group placement-form-group-full">
                      <label className="placement-form-label">Skills Required</label>
                      <input 
                        className="placement-form-input" 
                        name="skillsRequired" 
                        placeholder="e.g. Java, React, Node.js (comma-separated)" 
                        value={form.skillsRequired || ""} 
                        onChange={handleChange} 
                      />
                    </div>
                  </div>

                  <div className="placement-form-row">
                    <div className="placement-form-group placement-form-group-full">
                      <label className="placement-form-label">
                        Eligibility Criteria <span className="placement-required">*</span>
                      </label>
                      <textarea 
                        className="placement-form-textarea" 
                        name="eligibilityCriteria" 
                        placeholder="Enter eligibility requirements..." 
                        value={form.eligibilityCriteria || ""} 
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="placement-form-row">
                    <div className="placement-form-group placement-form-group-full">
                      <label className="placement-form-label">About Company</label>
                      <textarea 
                        className="placement-form-textarea" 
                        name="aboutCompany" 
                        placeholder="Brief description about the company..." 
                        value={form.aboutCompany || ""} 
                        onChange={handleChange}
                        readOnly={!!form.companyId}
                      />
                    </div>
                  </div>

                  <div className="placement-form-row">
                    <div className="placement-form-group">
                      <label className="placement-form-label">Company Website</label>
                      <input 
                        className="placement-form-input" 
                        name="companyWebsite" 
                        placeholder="https://company.com" 
                        value={form.companyWebsite || ""} 
                        onChange={handleChange}
                        type="url"
                        readOnly={!!form.companyId}
                      />
                    </div>

                    <div className="placement-form-group">
                      <label className="placement-form-label">Company LinkedIn</label>
                      <input 
                        className="placement-form-input" 
                        name="companyLinkedin" 
                        placeholder="https://linkedin.com/company/..." 
                        value={form.companyLinkedin || ""} 
                        onChange={handleChange}
                        type="url"
                        readOnly={!!form.companyId}
                      />
                    </div>
                  </div>

                  <div className="placement-form-row">
                    <div className="placement-form-group placement-form-group-full">
                      <label className="placement-form-label">Additional Notes</label>
                      <textarea 
                        className="placement-form-textarea" 
                        name="note" 
                        placeholder="Any additional information for students..." 
                        value={form.note || ""} 
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="placement-form-actions">
                    <button 
                      type="button"
                      className="placement-btn placement-btn-secondary" 
                      onClick={() => setForm({})}
                    >
                      <FiX />
                      Clear Form
                    </button>
                    <button 
                      type="button"
                      className="placement-btn placement-btn-primary" 
                      onClick={handleCreate}
                      disabled={loading}
                    >
                      <FiCalendar />
                      {form._id ? 'Update Drive' : 'Create Drive'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'scheduled' && (
            <div className="placement-drives-section">
              {scheduledDrives.length === 0 ? (
                <div className="placement-empty-state">
                  <div className="placement-empty-icon">
                    <FiCalendar />
                  </div>
                  <h3 className="placement-empty-title">No Scheduled Drives</h3>
                  <p className="placement-empty-description">
                    Create your first placement drive to get started
                  </p>
                  <button 
                    className="placement-btn placement-btn-primary" 
                    onClick={() => setActiveTab('create')}
                  >
                    <FiPlus />
                    Create Drive
                  </button>
                </div>
              ) : (
                <div className="placement-drives-grid">
                  {scheduledDrives.map((drive) => (
                    <div className="placement-drive-card" key={drive._id}>
                      <div className="placement-drive-card-header">
                        <div className="placement-drive-main-info">
                          <div className="placement-drive-badge">
                            <FiHome />
                          </div>
                          <div className="placement-drive-details">
                            <h3 className="placement-drive-name">{drive.company}</h3>
                            <p className="placement-drive-role">{drive.role}</p>
                          </div>
                        </div>
                        <div className="placement-drive-actions">
                          <button 
                            className="placement-action-btn placement-action-btn-edit" 
                            onClick={() => handleEditDrive(drive)}
                            title="Edit Drive"
                          >
                            <FiEdit />
                          </button>
                          <button 
                            className="placement-action-btn placement-action-btn-delete" 
                            onClick={() => setDriveToDelete(drive._id)}
                            title="Delete Drive"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>

                      <div className="placement-drive-card-body">
                        <div className="placement-drive-meta">
                          <div className="placement-meta-item">
                            <FiCalendar className="placement-meta-icon" />
                            <div className="placement-meta-content">
                              <span className="placement-meta-label">Drive Date</span>
                              <span className="placement-meta-value">{new Date(drive.driveDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="placement-meta-item">
                            <FiClock className="placement-meta-icon" />
                            <div className="placement-meta-content">
                              <span className="placement-meta-label">Apply by</span>
                              <span className="placement-meta-value">{new Date(drive.lastDateToApply).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="placement-meta-item">
                            <FiMapPin className="placement-meta-icon" />
                            <div className="placement-meta-content">
                              <span className="placement-meta-label">Location</span>
                              <span className="placement-meta-value">{drive.jobLocation}</span>
                            </div>
                          </div>
                        </div>

                        <div className="placement-drive-stats">
                          <div className="placement-stat-row">
                            <div className="placement-stat-item">
                              <span className="placement-stat-number">{drive.seats}</span>
                              <span className="placement-stat-text">Positions</span>
                            </div>
                            <div className="placement-stat-item">
                              <span className="placement-stat-number">{drive.registered?.length || 0}</span>
                              <span className="placement-stat-text">Registered</span>
                            </div>
                            <div className="placement-stat-item">
                              <span className="placement-stat-number">{drive.registered?.filter(s => s.status === "PLACED").length || 0}</span>
                              <span className="placement-stat-text">Placed</span>
                            </div>
                          </div>
                          <div className="placement-progress-container">
                            <div className="placement-progress-bar">
                              <div 
                                className="placement-progress-fill" 
                                style={{ width: `${((drive.registered?.length || 0) / drive.seats) * 100}%` }}
                              ></div>
                            </div>
                            <span className="placement-progress-text">
                              {Math.round(((drive.registered?.length || 0) / drive.seats) * 100)}% Applied
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="placement-drive-card-footer">
                        <button 
                          className="placement-btn placement-btn-outline" 
                          onClick={() => handleViewStudents(drive._id)}
                        >
                          <FiUsers />
                          View Students ({drive.registered?.length || 0})
                        </button>
                        <button
                          className="placement-btn placement-btn-success"
                          onClick={async () => {
                            try {
                              const studentRes = await fetch(`/api/placements/${drive._id}/students`);
                              const studentList = await studentRes.json();

                              let hasError = false;
                              let errorMsg = "";

                              for (let s of studentList) {
                                if (!s.remarks || s.remarks.trim() === "") {
                                  hasError = true;
                                  errorMsg = `❌ Cannot end drive: ${s.name} is missing remarks.`;
                                  break;
                                }
                                if (s.status === "PLACED" && (!s.offerLetterURL || s.offerLetterURL.trim() === "")) {
                                  hasError = true;
                                  errorMsg = `❌ Cannot end drive: ${s.name} is marked as PLACED but missing offer letter URL.`;
                                  break;
                                }
                                if (s.status === "PENDING") {
                                  hasError = true;
                                  errorMsg = `❌ Cannot end drive: ${s.name} has status set to PENDING.`;
                                  break;
                                }
                              }

                              if (hasError) {
                                setPopup(errorMsg);
                                setTimeout(() => setPopup(""), 4000);
                                return;
                              }

                              await fetch(`/api/placements/${drive._id}/complete`, { method: "PUT" });
                              fetchDrives();
                              setPopup("✅ Drive marked as completed");
                              setTimeout(() => setPopup(""), 2000);
                            } catch (err) {
                              console.error(err);
                              setPopup("❌ Failed to end drive");
                              setTimeout(() => setPopup(""), 3000);
                            }
                          }}
                        >
                          <FiCheck />
                          Complete Drive
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="placement-companies-section">
              <div className="placement-company-form-card">
                <h3>{newCompany._id ? 'Edit Company' : 'Add New Company'}</h3>
                
                <div className="placement-form-grid">
                  <div className="placement-form-group">
                    <label className="placement-form-label">
                      Company Name <span className="placement-required">*</span>
                    </label>
                    <input 
                      className="placement-form-input" 
                      name="name" 
                      placeholder="Enter company name"
                      value={newCompany.name} 
                      onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="placement-form-group">
                    <label className="placement-form-label">Website URL</label>
                    <input 
                      className="placement-form-input" 
                      name="website" 
                      placeholder="https://company.com"
                      value={newCompany.website} 
                      onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                      type="url"
                    />
                  </div>

                  <div className="placement-form-group placement-form-group-full">
                    <label className="placement-form-label">LinkedIn Profile</label>
                    <input 
                      className="placement-form-input" 
                      name="linkedin" 
                      placeholder="https://linkedin.com/company/..."
                      value={newCompany.linkedin} 
                      onChange={(e) => setNewCompany({ ...newCompany, linkedin: e.target.value })}
                      type="url"
                    />
                  </div>

                  <div className="placement-form-group placement-form-group-full">
                    <label className="placement-form-label">About Company</label>
                    <textarea 
                      className="placement-form-textarea" 
                      placeholder="Brief description about the company..."
                      value={newCompany.about} 
                      onChange={(e) => setNewCompany({ ...newCompany, about: e.target.value })}
                    />
                  </div>
                </div>

                <div className="placement-form-actions">
                  <button 
                    className="placement-btn placement-btn-secondary" 
                    onClick={() => setNewCompany({ name: "", about: "", website: "", linkedin: "" })}
                  >
                    Clear
                  </button>
                  <button 
                    className="placement-btn placement-btn-primary" 
                    onClick={async () => {
                      try {
                        if (newCompany._id) {
                          await fetch(`/api/companies/${newCompany._id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(newCompany)
                          });
                          setPopup("✅ Company Updated Successfully");
                        } else {
                          await fetch("/api/companies", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(newCompany)
                          });
                          setPopup("✅ Company Added Successfully");
                        }

                        setNewCompany({ name: "", about: "", website: "", linkedin: "" });
                        fetchCompanies();
                        setTimeout(() => setPopup(""), 3000);
                      } catch (err) {
                        setPopup("❌ Failed to save company");
                        setTimeout(() => setPopup(""), 3000);
                      }
                    }}
                  >
                    <FiHome />
                    {newCompany._id ? "Update Company" : "Add Company"}
                  </button>
                </div>
              </div>

              <div className="placement-companies-list">
                <h3>Registered Companies</h3>
                <div className="placement-table-container">
                  <table className="placement-table">
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>Website</th>
                        <th>LinkedIn</th>
                        <th>Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companies.map((company) => (
                        <tr key={company._id}>
                          <td>
                            <div className="placement-company-cell">
                              <div className="placement-company-avatar">
                                <FiHome />
                              </div>
                              <span className="placement-company-name">{company.name}</span>
                            </div>
                          </td>
                          <td>
                            {company.website && (
                              <a 
                                href={company.website} 
                                target="_blank" 
                                rel="noreferrer"
                                className="placement-link"
                              >
                                Visit Website
                              </a>
                            )}
                          </td>
                          <td>
                            {company.linkedin && (
                              <a 
                                href={company.linkedin} 
                                target="_blank" 
                                rel="noreferrer"
                                className="placement-link"
                              >
                                View LinkedIn
                              </a>
                            )}
                          </td>
                          <td className="placement-company-description">
                            {company.about ? company.about.substring(0, 100) + (company.about.length > 100 ? '...' : '') : '-'}
                          </td>
                          <td>
                            <button 
                              className="placement-action-btn placement-action-btn-primary" 
                              onClick={() => setNewCompany(company)}
                              title="Edit Company"
                            >
                              <FiEdit />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'completed' && (
            <div className="placement-drives-section">
              {completedDrives.length === 0 ? (
                <div className="placement-empty-state">
                  <div className="placement-empty-icon">
                    <FiCheck />
                  </div>
                  <h3 className="placement-empty-title">No Completed Drives</h3>
                  <p className="placement-empty-description">
                    Completed placement drives will appear here
                  </p>
                </div>
              ) : (
                <div className="placement-drives-grid">
                  {completedDrives.map((drive) => (
                    <div className="placement-drive-card placement-drive-card-completed" key={drive._id}>
                      <div className="placement-drive-card-header">
                        <div className="placement-drive-main-info">
                          <div className="placement-drive-badge">
                            <FiHome />
                          </div>
                          <div className="placement-drive-details">
                            <h3 className="placement-drive-name">{drive.company}</h3>
                            <p className="placement-drive-role">{drive.role}</p>
                          </div>
                        </div>
                        <div className="placement-status-badge placement-status-completed">
                          <FiCheck />
                          COMPLETED
                        </div>
                      </div>

                      <div className="placement-drive-card-body">
                        <div className="placement-drive-meta">
                          <div className="placement-meta-item">
                            <FiCalendar className="placement-meta-icon" />
                            <div className="placement-meta-content">
                              <span className="placement-meta-label">Completed</span>
                              <span className="placement-meta-value">{new Date(drive.driveDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="placement-meta-item">
                            <FiMapPin className="placement-meta-icon" />
                            <div className="placement-meta-content">
                              <span className="placement-meta-label">Location</span>
                              <span className="placement-meta-value">{drive.jobLocation}</span>
                            </div>
                          </div>
                        </div>

                        <div className="placement-drive-stats">
                          <div className="placement-stat-row">
                            <div className="placement-stat-item">
                              <span className="placement-stat-number">{drive.seats}</span>
                              <span className="placement-stat-text">Positions</span>
                            </div>
                            <div className="placement-stat-item">
                              <span className="placement-stat-number">{drive.registered?.length || 0}</span>
                              <span className="placement-stat-text">Applied</span>
                            </div>
                            <div className="placement-stat-item placement-stat-success">
                              <span className="placement-stat-number">{drive.registered?.filter(s => s.status === "PLACED").length || 0}</span>
                              <span className="placement-stat-text">Placed</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="placement-drive-card-footer">
                        <button 
                          className="placement-btn placement-btn-outline" 
                          onClick={() => handleViewStudents(drive._id)}
                        >
                          <FiEye />
                          View Results
                        </button>
                        <button
                          className="placement-btn placement-btn-warning"
                          onClick={async () => {
                            await fetch(`/api/placements/${drive._id}/revoke`, { method: "PUT" });
                            fetchDrives();
                            setPopup("🔄 Drive status reverted to Scheduled");
                            setTimeout(() => setPopup(""), 2000);
                          }}
                        >
                          Revoke Status
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "rankings" && (
            <div className="placement-rankings-section">
              <div className="placement-section-header">
                <div className="placement-section-info">
                  <h2 className="placement-section-title">Student Rankings</h2>
                  <p className="placement-section-subtitle">View and manage student performance rankings</p>
                </div>
                <div className="placement-section-actions">
                  <button className="placement-btn placement-btn-outline">
                    <FiDownload />
                    Export Rankings
                  </button>
                </div>
              </div>

              <div className="placement-rankings-controls">
                <div className="placement-filter-controls">
                  <div className="placement-filter-group">
                    <label className="placement-form-label">Sort By:</label>
                    <select
  value={rankingSortBy}
  onChange={(e) => {
    setRankingSortBy(e.target.value);
  }}
  className="placement-form-select"
>

                      <option value="lab">Lab Grades</option>
                      <option value="degree">Bachelor's CGPA / Percentage</option>
                    </select>
                  </div>

                  <div className="placement-search-group">
                    <div className="placement-search-input-wrapper">
                      <FiSearch className="placement-search-icon" />
                      <input
                        type="text"
                        placeholder="Search by student name..."
                        className="placement-search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="placement-table-container">
                <table className="placement-table placement-rankings-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Student</th>
                      <th>Email</th>
                      <th>Lab Grade</th>
                      <th>CGPA / Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankings
                      .filter((student) =>
                        student.name?.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((student, index) => (
                        <tr key={student._id}>
                          <td>
                            <div className={`placement-rank-badge ${index < 3 ? 'placement-rank-top' : ''}`}>
                              #{index + 1}
                            </div>
                          </td>
                          <td>
                            <div className="placement-student-info">
                              <div className="placement-student-avatar">
                                <FiUser />
                              </div>
                              <span className="placement-student-name">{student.name}</span>
                            </div>
                          </td>
                          <td className="placement-student-email">{student.email}</td>
                          <td>
                            <span className={`placement-grade-badge placement-grade-${student.labGrade?.toLowerCase()}`}>
                              {student.labGrade}
                            </span>
                          </td>
                          <td>{student.bachelors?.cgpa || student.bachelors?.percentage || "-"}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Toast Notifications */}
      {popup && (
        <div className={`placement-toast ${popup.startsWith("✅") ? "success" : popup.startsWith("❌") ? "error" : "info"}`}>
          <div className="placement-toast-content">
            {popup}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {driveToDelete && (
        <div className="placement-modal-overlay">
          <div className="placement-modal">
            <div className="placement-modal-header">
              <h3 className="placement-modal-title">Confirm Deletion</h3>
              <button 
                className="placement-modal-close" 
                onClick={() => setDriveToDelete(null)}
              >
                <FiX />
              </button>
            </div>
            <div className="placement-modal-body">
              <div className="placement-modal-icon warning">
                <FiTrash2 />
              </div>
              <p className="placement-modal-text">
                Are you sure you want to delete this placement drive? This action cannot be undone and will permanently remove all associated data.
              </p>
            </div>
            <div className="placement-modal-footer">
              <button 
                className="placement-btn placement-btn-outline" 
                onClick={() => setDriveToDelete(null)}
              >
                Cancel
              </button>
              <button 
                className="placement-btn placement-btn-danger" 
                onClick={handleDelete}
              >
                <FiTrash2 />
                Delete Drive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Students Management Modal */}
      {showStudentPopup && (
        <div className="placement-modal-overlay">
          <div className="placement-modal placement-modal-large">
            <div className="placement-modal-header">
              <h3 className="placement-modal-title">Student Management</h3>
              <button 
                className="placement-modal-close" 
                onClick={() => setShowStudentPopup(false)}
              >
                <FiX />
              </button>
            </div>
            <div className="placement-modal-body">
              {students.length === 0 ? (
                <div className="placement-empty-state">
                  <div className="placement-empty-icon">
                    <FiUsers />
                  </div>
                  <h3 className="placement-empty-title">No Students Registered</h3>
                  <p className="placement-empty-description">
                    Students who register for this drive will appear here
                  </p>
                </div>
              ) : (
                <div className="placement-students-section">
                  <div className="placement-students-header">
                    <div className="placement-students-info">
                      <h4 className="placement-students-title">
                        Registered Students ({students.length})
                      </h4>
                      <p className="placement-students-subtitle">
                        Manage student applications and placement status
                      </p>
                    </div>
                    <div className="placement-students-actions">
                      <button className="placement-btn placement-btn-outline placement-btn-sm">
                        <FiDownload />
                        Export List
                      </button>
                    </div>
                  </div>

                  <div className="placement-students-table-container">
                    <table className="placement-students-table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Contact</th>
                          <th>Status</th>
                          <th>Remarks</th>
                          <th>Offer Letter</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student, index) => (
                          <tr key={student._id}>
                            <td>
                              <div className="placement-student-info">
                                <div className="placement-student-avatar">
                                  <FiUser />
                                </div>
                                <div className="placement-student-details">
                                  <span className="placement-student-name">{student.name}</span>
                                  <span className="placement-student-email">{student.email}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="placement-student-phone">{student.phone}</span>
                            </td>
                            <td>
                              <select
                                className="placement-form-select placement-form-select-sm"
                                value={student.status}
                                onChange={(e) => {
                                  const updated = [...students];
                                  updated[index].status = e.target.value;
                                  if (e.target.value !== "PLACED") {
                                    updated[index].offerLetterURL = "";
                                  }
                                  setStudents(updated);
                                }}
                              >
                                <option value="PLACED">PLACED</option>
                                <option value="PENDING">PENDING</option>
                                <option value="NOT PLACED">NOT PLACED</option>
                              </select>
                            </td>
                            <td>
                              <input
                                type="text"
                                className="placement-form-input placement-form-input-sm"
                                placeholder="Enter remarks..."
                                value={student.remarks || ""}
                                onChange={(e) => {
                                  const updated = [...students];
                                  updated[index].remarks = e.target.value;
                                  setStudents(updated);
                                }}
                              />
                            </td>
                            <td>
                              {student.status === "PLACED" && (
                                <input
                                  type="url"
                                  className="placement-form-input placement-form-input-sm"
                                  placeholder="Offer letter URL..."
                                  value={student.offerLetterURL || ""}
                                  onChange={(e) => {
                                    const updated = [...students];
                                    updated[index].offerLetterURL = e.target.value;
                                    setStudents(updated);
                                  }}
                                />
                              )}
                            </td>
                            <td>
                              <button
                                className="placement-btn placement-btn-primary placement-btn-sm"
                                onClick={async () => {
                                  try {
                                    await fetch(`/api/placements/${selectedDrive}/students/${student._id}`, {
                                      method: "PUT",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        status: student.status,
                                        remarks: student.remarks,
                                        offerLetterURL: student.offerLetterURL,
                                      }),
                                    });
                                    setPopup("✅ Student updated successfully");
                                    setTimeout(() => setPopup(""), 2000);
                                  } catch (err) {
                                    console.error("Update failed", err);
                                    setPopup("❌ Failed to update student");
                                    setTimeout(() => setPopup(""), 3000);
                                  }
                                }}
                              >
                                <FiSave />
                                Save
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
