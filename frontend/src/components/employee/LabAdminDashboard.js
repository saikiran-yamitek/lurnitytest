import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import logo from "../../assets/LURNITY.jpg";
import { listCourses } from "../../services/empApi";
import {
  FiUser,
  FiLogOut,
  FiPlus,
  FiUsers,
  FiTrash2,
  FiX,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiBell,
  FiTrendingUp,
  FiBook,
  FiHome,
  FiEye,
  FiEdit,
  FiDownload,
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiRefreshCw,
  FiActivity
} from "react-icons/fi";
import { listEmployees } from "../../services/adminApi";
import {
  listWorkshops,
  createWorkshop,
} from "../../services/workshopApi";
import "./LabAdminDashboard.css";
const API = process.env.REACT_APP_API_URL;
export default function LabAdminDashboard() {
  const [workshops, setWorkshops] = useState([]);
  const [incharges, setIncharges] = useState([]);
  const [form, setForm] = useState({});
  const [popup, setPopup] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [workshopToDelete, setWorkshopToDelete] = useState(null);
  const [showStudentPopup, setShowStudentPopup] = useState(false);
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const history = useHistory();
  const emp = JSON.parse(localStorage.getItem("empInfo"));

  useEffect(() => {
    if (!emp || !emp.id) {
      alert("Session expired. Please login again.");
      history.replace("/employee/login");
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const all = await listEmployees();
      const inchargesOnly = all.filter((e) => e.role === "lab incharge");
      setIncharges(inchargesOnly);
      setWorkshops(await listWorkshops());
      setCourses(await listCourses());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async () => {
    setLoading(true);
    try {
      const payload = { ...form, createdBy: emp.id };

      const selectedCourse = courses.find((c) => c._id === form.courseId);
      const selectedSubCourse = selectedCourse?.subCourses?.find((sub) => sub._id === form.labName);

      if (!selectedSubCourse) {
        setPopup("❌ Invalid subcourse selected.");
        setTimeout(() => setPopup(""), 3000);
        return;
      }

      payload.labName = selectedSubCourse.title;
      payload.subCourseId = selectedSubCourse._id;

      await createWorkshop(payload);
      setPopup("✅ Workshop scheduled successfully");
      setForm({});
      await fetchData();
      setActiveTab("workshops");
      setTimeout(() => setPopup(""), 3000);
    } catch (err) {
      console.error("Workshop creation error:", err);
      setPopup("❌ Failed to schedule workshop");
      setTimeout(() => setPopup(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteWorkshop = async () => {
    try {
      await fetch(`${API}/api/workshops/${workshopToDelete}`,{
        method: "DELETE",
      });
      setPopup("🗑️ Workshop deleted successfully");
      await fetchData();
      setWorkshopToDelete(null);
      setTimeout(() => setPopup(""), 3000);
    } catch (err) {
      setPopup("❌ Failed to delete workshop");
      setTimeout(() => setPopup(""), 3000);
      console.error(err);
    }
  };

  const handleViewStudents = async (workshopId) => {
    try {
      const res = await fetch(`${API}/api/workshops/${workshopId}/students`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setSelectedStudents(data);
      } else {
        console.warn("Expected array, got:", data);
        setSelectedStudents([]);
      }

      setShowStudentPopup(true);
    } catch (err) {
      setPopup("❌ Failed to fetch registered students");
      setTimeout(() => setPopup(""), 3000);
      console.error(err);
    }
  };

  const doLogout = () => {
    localStorage.removeItem("empInfo");
    history.replace("/employee/login");
  };

  // Calculate dashboard statistics
  const totalWorkshops = workshops.length;
  const totalRegistrations = workshops.reduce((sum, w) => sum + (w.registeredStudents?.length || 0), 0);
  const totalSeats = workshops.reduce((sum, w) => sum + (w.memberCount || 0), 0);
  const occupancyRate = totalSeats > 0 ? ((totalRegistrations / totalSeats) * 100).toFixed(1) : 0;

  // Filter workshops based on search
  const filteredWorkshops = workshops.filter(w => 
    w.labName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.labAddress?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="lab-admin-dashboard-wrapper">
      {/* Sidebar */}
      <aside className="lab-sidebar">
        <div className="lab-sidebar-header">
          <div className="lab-logo-container">
            <img src={logo} alt="Lurnity" className="lab-logo" />
            <div className="lab-brand-info">
              <h2 className="lab-brand-title">Lab Admin</h2>
              <p className="lab-brand-subtitle">Management Portal</p>
            </div>
          </div>
        </div>
        
        <nav className="lab-sidebar-nav">
          <div className="lab-nav-section">
            <span className="lab-nav-section-title">Main</span>
            <button 
              className={`lab-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} 
              onClick={() => setActiveTab('dashboard')}
            >
              <FiTrendingUp />
              <span>Dashboard</span>
            </button>
            <button 
              className={`lab-nav-item ${activeTab === 'create' ? 'active' : ''}`} 
              onClick={() => setActiveTab('create')}
            >
              <FiPlus />
              <span>Schedule Workshop</span>
            </button>
          </div>

          <div className="lab-nav-section">
            <span className="lab-nav-section-title">Management</span>
            <button 
              className={`lab-nav-item ${activeTab === 'workshops' ? 'active' : ''}`} 
              onClick={() => setActiveTab('workshops')}
            >
              <FiBook />
              <span>Workshops</span>
              {workshops.length > 0 && (
                <span className="lab-nav-badge">{workshops.length}</span>
              )}
            </button>
            <button 
              className={`lab-nav-item ${activeTab === 'courses' ? 'active' : ''}`} 
              onClick={() => setActiveTab('courses')}
            >
              <FiHome />
              <span>Courses</span>
            </button>
          </div>
        </nav>

        <div className="lab-sidebar-footer">
          <div className="lab-user-card">
            <div className="lab-user-avatar">
              <FiUser />
            </div>
            <div className="lab-user-info">
              <span className="lab-user-name">{emp?.name}</span>
              <span className="lab-user-role">Lab Administrator</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lab-main-content">
        {/* Top Header */}
        <header className="lab-header">
          <div className="lab-header-left">
            <div className="lab-page-info">
              <h1 className="lab-page-title">
                {activeTab === 'dashboard' && 'Lab Management Dashboard'}
                {activeTab === 'create' && 'Schedule New Workshop'}
                {activeTab === 'workshops' && 'Workshop Management'}
                {activeTab === 'courses' && 'Course Management'}
              </h1>
              <p className="lab-page-subtitle">
                {activeTab === 'dashboard' && 'Monitor lab activities and track performance metrics'}
                {activeTab === 'create' && 'Create and schedule new workshop sessions for students'}
                {activeTab === 'workshops' && `Managing ${workshops.length} workshop sessions`}
                {activeTab === 'courses' && 'View and manage available course offerings'}
              </p>
            </div>
          </div>
          <div className="lab-header-right">
            <button className="lab-header-btn">
              <FiRefreshCw />
            </button>
            <button className="lab-header-btn">
              <FiBell />
            </button>
            <button className="lab-logout-btn" onClick={doLogout} title="Logout">
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="lab-content">
          {loading && (
            <div className="lab-loading-overlay">
              <div className="lab-loading-spinner">
                <div className="lab-spinner"></div>
                <p>Loading...</p>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="lab-dashboard">
              {/* Statistics Cards */}
              <div className="lab-stats-grid">
                <div className="lab-stat-card lab-stat-primary">
                  <div className="lab-stat-header">
                    <div className="lab-stat-icon">
                      <FiBook />
                    </div>
                    <div className="lab-stat-info">
                      <h3 className="lab-stat-value">{totalWorkshops}</h3>
                      <p className="lab-stat-label">Active Workshops</p>
                    </div>
                  </div>
                  <div className="lab-stat-footer">
                    <span className="lab-stat-trend positive">
                      <FiTrendingUp />
                      +12% from last month
                    </span>
                  </div>
                </div>

                <div className="lab-stat-card lab-stat-success">
                  <div className="lab-stat-header">
                    <div className="lab-stat-icon">
                      <FiUsers />
                    </div>
                    <div className="lab-stat-info">
                      <h3 className="lab-stat-value">{totalRegistrations}</h3>
                      <p className="lab-stat-label">Total Registrations</p>
                    </div>
                  </div>
                  <div className="lab-stat-footer">
                    <span className="lab-stat-trend positive">
                      <FiTrendingUp />
                      +8% this week
                    </span>
                  </div>
                </div>

                <div className="lab-stat-card lab-stat-warning">
                  <div className="lab-stat-header">
                    <div className="lab-stat-icon">
                      <FiActivity />
                    </div>
                    <div className="lab-stat-info">
                      <h3 className="lab-stat-value">{occupancyRate}%</h3>
                      <p className="lab-stat-label">Occupancy Rate</p>
                    </div>
                  </div>
                  <div className="lab-stat-footer">
                    <span className="lab-stat-trend positive">
                      <FiTrendingUp />
                      Excellent capacity
                    </span>
                  </div>
                </div>

                <div className="lab-stat-card lab-stat-info">
                  <div className="lab-stat-header">
                    <div className="lab-stat-icon">
                      <FiHome />
                    </div>
                    <div className="lab-stat-info">
                      <h3 className="lab-stat-value">{courses.length}</h3>
                      <p className="lab-stat-label">Available Courses</p>
                    </div>
                  </div>
                  <div className="lab-stat-footer">
                    <span className="lab-stat-trend neutral">
                      <FiActivity />
                      All systems active
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="lab-quick-actions-section">
                <div className="lab-section-header">
                  <h2 className="lab-section-title">Quick Actions</h2>
                  <p className="lab-section-subtitle">Frequently used management tools</p>
                </div>
                <div className="lab-quick-actions">
                  <button 
                    className="lab-quick-action-card primary"
                    onClick={() => setActiveTab('create')}
                  >
                    <div className="lab-action-icon">
                      <FiPlus />
                    </div>
                    <div className="lab-action-content">
                      <h3>Schedule Workshop</h3>
                      <p>Create new workshop session</p>
                    </div>
                  </button>

                  <button 
                    className="lab-quick-action-card secondary"
                    onClick={() => setActiveTab('workshops')}
                  >
                    <div className="lab-action-icon">
                      <FiBook />
                    </div>
                    <div className="lab-action-content">
                      <h3>Manage Workshops</h3>
                      <p>View and edit workshops</p>
                    </div>
                  </button>

                  <button 
                    className="lab-quick-action-card tertiary"
                    onClick={() => setActiveTab('courses')}
                  >
                    <div className="lab-action-icon">
                      <FiHome />
                    </div>
                    <div className="lab-action-content">
                      <h3>Course Overview</h3>
                      <p>Browse available courses</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recent Workshops */}
              <div className="lab-recent-section">
                <div className="lab-section-header">
                  <h2 className="lab-section-title">Recent Workshops</h2>
                  <button 
                    className="lab-view-all-btn"
                    onClick={() => setActiveTab('workshops')}
                  >
                    View All
                  </button>
                </div>
                <div className="lab-recent-workshops">
                  {workshops.slice(0, 3).map((workshop) => (
                    <div key={workshop._id} className="lab-recent-workshop-item">
                      <div className="lab-recent-workshop-header">
                        <div className="lab-workshop-icon">
                          <FiBook />
                        </div>
                        <div className="lab-workshop-info">
                          <h4 className="lab-workshop-title">{workshop.labName}</h4>
                          <p className="lab-workshop-address">{workshop.labAddress}</p>
                        </div>
                        <div className="lab-workshop-status">
                          <span className="lab-status-badge scheduled">Scheduled</span>
                        </div>
                      </div>
                      <div className="lab-recent-workshop-meta">
                        <span className="lab-workshop-date">
                          <FiCalendar />
                          {new Date(workshop.time).toLocaleDateString()}
                        </span>
                        <span className="lab-workshop-participants">
                          <FiUsers />
                          {workshop.registeredStudents?.length || 0}/{workshop.memberCount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'create' && (
            <div className="lab-create-section">
              <div className="lab-form-container">
                <div className="lab-form-header">
                  <h2 className="lab-form-title">Workshop Details</h2>
                  <p className="lab-form-subtitle">Fill in the information to schedule a new workshop session</p>
                </div>

                <form className="lab-form">
                  <div className="lab-form-row">
                    <div className="lab-form-group">
                      <label className="lab-form-label">
                        Course Selection <span className="lab-required">*</span>
                      </label>
                      <select
                        className="lab-form-input lab-form-select"
                        name="courseId"
                        value={form.courseId || ""}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Choose a course...</option>
                        {courses.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="lab-form-group">
                      <label className="lab-form-label">
                        Lab Selection <span className="lab-required">*</span>
                      </label>
                      <select
                        className="lab-form-input lab-form-select"
                        name="labName"
                        value={form.labName || ""}
                        onChange={handleChange}
                        disabled={!form.courseId}
                        required
                      >
                        <option value="">Select lab name...</option>
                        {courses
                          .find((c) => c._id === form.courseId)?.subCourses?.map((sub) => (
                            <option key={sub._id} value={sub._id}>
                              {sub.title}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="lab-form-row">
                    <div className="lab-form-group">
                      <label className="lab-form-label">
                        Lab Address <span className="lab-required">*</span>
                      </label>
                      <input
                        className="lab-form-input"
                        type="text"
                        placeholder="Enter lab address or location"
                        name="labAddress"
                        value={form.labAddress || ""}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="lab-form-group">
                      <label className="lab-form-label">
                        Workshop Date & Time <span className="lab-required">*</span>
                      </label>
                      <input
                        className="lab-form-input"
                        type="datetime-local"
                        name="time"
                        value={form.time || ""}
                        onChange={handleChange}
                        min={new Date().toISOString().slice(0, 16)}
                        required
                      />
                    </div>
                  </div>

                  <div className="lab-form-row">
                    <div className="lab-form-group">
                      <label className="lab-form-label">
                        Maximum Participants <span className="lab-required">*</span>
                      </label>
                      <input
                        className="lab-form-input"
                        type="number"
                        placeholder="Enter maximum number of participants"
                        name="memberCount"
                        min="1"
                        max="100"
                        value={form.memberCount || ""}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="lab-form-group">
                      <label className="lab-form-label">
                        Assign Lab Incharge <span className="lab-required">*</span>
                      </label>
                      <select
                        className="lab-form-input lab-form-select"
                        name="inchargeId"
                        value={form.inchargeId || ""}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select incharge...</option>
                        {incharges.map((e) => (
                          <option key={e._id} value={e._id}>
                            {e.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="lab-form-actions">
                    <button 
                      type="button"
                      className="lab-btn lab-btn-secondary" 
                      onClick={() => setForm({})}
                    >
                      <FiX />
                      Clear Form
                    </button>
                    <button 
                      type="button"
                      className="lab-btn lab-btn-primary" 
                      onClick={handleCreate}
                      disabled={loading}
                    >
                      <FiPlus />
                      Schedule Workshop
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'workshops' && (
            <div className="lab-workshops-section">
              <div className="lab-section-header">
                <div className="lab-section-info">
                  <h2 className="lab-section-title">Workshop Management</h2>
                  <p className="lab-section-subtitle">Manage all scheduled workshop sessions</p>
                </div>
                <div className="lab-section-actions">
                  <div className="lab-search-container">
                    <FiSearch className="lab-search-icon" />
                    <input
                      type="text"
                      placeholder="Search workshops..."
                      className="lab-search-input"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button className="lab-btn lab-btn-primary" onClick={() => setActiveTab('create')}>
                    <FiPlus />
                    New Workshop
                  </button>
                </div>
              </div>

              {filteredWorkshops.length === 0 ? (
                <div className="lab-empty-state">
                  <div className="lab-empty-icon">
                    <FiBook />
                  </div>
                  <h3 className="lab-empty-title">No Workshops Found</h3>
                  <p className="lab-empty-description">
                    {searchTerm ? 'No workshops match your search criteria.' : 'Create your first workshop to get started.'}
                  </p>
                  {!searchTerm && (
                    <button 
                      className="lab-btn lab-btn-primary" 
                      onClick={() => setActiveTab('create')}
                    >
                      <FiPlus />
                      Schedule Workshop
                    </button>
                  )}
                </div>
              ) : (
                <div className="lab-workshops-grid">
                  {filteredWorkshops.map((workshop) => {
                    const registered = workshop.registeredStudents?.length || 0;
                    const seatsAvailable = workshop.memberCount - registered;
                    const occupancyPercentage = (registered / workshop.memberCount) * 100;
                    
                    return (
                      <div className="lab-workshop-card" key={workshop._id}>
                        <div className="lab-workshop-card-header">
                          <div className="lab-workshop-main-info">
                            <div className="lab-workshop-badge">
                              <FiBook />
                            </div>
                            <div className="lab-workshop-details">
                              <h3 className="lab-workshop-name">{workshop.labName}</h3>
                              <p className="lab-workshop-location">
                                <FiMapPin />
                                {workshop.labAddress}
                              </p>
                            </div>
                          </div>
                          <div className="lab-workshop-actions">
                            <button 
                              className="lab-action-btn lab-action-btn-danger" 
                              onClick={() => setWorkshopToDelete(workshop._id)}
                              title="Delete Workshop"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>

                        <div className="lab-workshop-card-body">
                          <div className="lab-workshop-meta">
                            <div className="lab-meta-item">
                              <FiCalendar className="lab-meta-icon" />
                              <div className="lab-meta-content">
                                <span className="lab-meta-label">Date</span>
                                <span className="lab-meta-value">{new Date(workshop.time).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="lab-meta-item">
                              <FiClock className="lab-meta-icon" />
                              <div className="lab-meta-content">
                                <span className="lab-meta-label">Time</span>
                                <span className="lab-meta-value">{new Date(workshop.time).toLocaleTimeString()}</span>
                              </div>
                            </div>
                            <div className="lab-meta-item">
                              <FiUser className="lab-meta-icon" />
                              <div className="lab-meta-content">
                                <span className="lab-meta-label">Incharge</span>
                                <span className="lab-meta-value">
                                  {typeof workshop.inchargeId === "object"
                                    ? workshop.inchargeId.name
                                    : incharges.find((i) => i._id === workshop.inchargeId)?.name || "—"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="lab-workshop-stats">
                            <div className="lab-stat-row">
                              <div className="lab-stat-item">
                                <span className="lab-stat-number">{workshop.memberCount}</span>
                                <span className="lab-stat-text">Total Seats</span>
                              </div>
                              <div className="lab-stat-item">
                                <span className="lab-stat-number">{registered}</span>
                                <span className="lab-stat-text">Registered</span>
                              </div>
                              <div className="lab-stat-item">
                                <span className="lab-stat-number">{seatsAvailable}</span>
                                <span className="lab-stat-text">Available</span>
                              </div>
                            </div>
                            <div className="lab-progress-container">
                              <div className="lab-progress-bar">
                                <div 
                                  className="lab-progress-fill" 
                                  style={{ width: `${occupancyPercentage}%` }}
                                ></div>
                              </div>
                              <span className="lab-progress-text">{occupancyPercentage.toFixed(0)}% Full</span>
                            </div>
                          </div>
                        </div>

                        <div className="lab-workshop-card-footer">
                          <button 
                            className="lab-btn lab-btn-outline" 
                            onClick={() => handleViewStudents(workshop._id)}
                          >
                            <FiUsers />
                            View Participants ({registered})
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="lab-courses-section">
              <div className="lab-section-header">
                <div className="lab-section-info">
                  <h2 className="lab-section-title">Course Management</h2>
                  <p className="lab-section-subtitle">Overview of available courses and lab sessions</p>
                </div>
                <div className="lab-section-actions">
                  <button className="lab-btn lab-btn-outline">
                    <FiDownload />
                    Export
                  </button>
                </div>
              </div>

              <div className="lab-courses-grid">
                {courses.map((course) => (
                  <div key={course._id} className="lab-course-card">
                    <div className="lab-course-header">
                      <div className="lab-course-icon">
                        <FiHome />
                      </div>
                      <div className="lab-course-info">
                        <h3 className="lab-course-title">{course.title}</h3>
                        <p className="lab-course-description">
                          {course.description || "No description available"}
                        </p>
                      </div>
                    </div>
                    <div className="lab-course-body">
                      <div className="lab-course-stats">
                        <div className="lab-course-stat">
                          <span className="lab-stat-value">{course.subCourses?.length || 0}</span>
                          <span className="lab-stat-label">Available Labs</span>
                        </div>
                        <div className="lab-course-stat">
                          <span className="lab-stat-value">
                            {workshops.filter(w => 
                              course.subCourses?.some(sub => sub.title === w.labName)
                            ).length}
                          </span>
                          <span className="lab-stat-label">Active Workshops</span>
                        </div>
                      </div>
                      <div className="lab-subcourses">
                        <h4 className="lab-subcourses-title">Lab Sessions</h4>
                        <div className="lab-subcourse-list">
                          {course.subCourses?.slice(0, 4).map((sub) => (
                            <span key={sub._id} className="lab-subcourse-tag">
                              {sub.title}
                            </span>
                          ))}
                          {course.subCourses?.length > 4 && (
                            <span className="lab-subcourse-more">
                              +{course.subCourses.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Toast Notifications */}
      {popup && (
        <div className={`lab-toast ${popup.startsWith("✅") ? "success" : popup.startsWith("❌") ? "error" : "info"}`}>
          <div className="lab-toast-content">
            {popup}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {workshopToDelete && (
        <div className="lab-modal-overlay">
          <div className="lab-modal">
            <div className="lab-modal-header">
              <h3 className="lab-modal-title">Confirm Deletion</h3>
              <button 
                className="lab-modal-close" 
                onClick={() => setWorkshopToDelete(null)}
              >
                <FiX />
              </button>
            </div>
            <div className="lab-modal-body">
              <div className="lab-modal-icon warning">
                <FiTrash2 />
              </div>
              <p className="lab-modal-text">
                Are you sure you want to delete this workshop? This action cannot be undone and will permanently remove all participant registrations.
              </p>
            </div>
            <div className="lab-modal-footer">
              <button 
                className="lab-btn lab-btn-outline" 
                onClick={() => setWorkshopToDelete(null)}
              >
                Cancel
              </button>
              <button 
                className="lab-btn lab-btn-danger" 
                onClick={confirmDeleteWorkshop}
              >
                <FiTrash2 />
                Delete Workshop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Students Modal */}
      {showStudentPopup && (
        <div className="lab-modal-overlay">
          <div className="lab-modal lab-modal-large">
            <div className="lab-modal-header">
              <h3 className="lab-modal-title">Workshop Participants</h3>
              <button 
                className="lab-modal-close" 
                onClick={() => setShowStudentPopup(false)}
              >
                <FiX />
              </button>
            </div>
            <div className="lab-modal-body">
              {selectedStudents.length === 0 ? (
                <div className="lab-empty-state">
                  <div className="lab-empty-icon">
                    <FiUsers />
                  </div>
                  <h3 className="lab-empty-title">No Participants Registered</h3>
                  <p className="lab-empty-description">
                    Students who register for this workshop will appear here.
                  </p>
                </div>
              ) : (
                <div className="lab-participants-section">
                  <div className="lab-participants-header">
                    <div className="lab-participants-info">
                      <h4 className="lab-participants-title">
                        Registered Participants ({selectedStudents.length})
                      </h4>
                      <p className="lab-participants-subtitle">
                        List of students enrolled in this workshop
                      </p>
                    </div>
                    <div className="lab-participants-actions">
                      <button className="lab-btn lab-btn-outline lab-btn-sm">
                        <FiDownload />
                        Export List
                      </button>
                    </div>
                  </div>

                  <div className="lab-participants-table-container">
                    <table className="lab-participants-table">
                      <thead>
                        <tr>
                          <th>Participant</th>
                          <th>Contact Information</th>
                          <th>Status</th>
                          <th>Registration Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedStudents.map((student) => (
                          <tr key={student._id}>
                            <td>
                              <div className="lab-participant-info">
                                <div className="lab-participant-avatar">
                                  <FiUser />
                                </div>
                                <div className="lab-participant-details">
                                  <span className="lab-participant-name">{student.name}</span>
                                  <span className="lab-participant-email">{student.email}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="lab-participant-phone">{student.phone}</span>
                            </td>
                            <td>
                              <span className="lab-status-badge registered">
                                Registered
                              </span>
                            </td>
                            <td>
                              <span className="lab-registration-date">
                                {student.registrationDate 
                                  ? new Date(student.registrationDate).toLocaleDateString()
                                  : "N/A"}
                              </span>
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
