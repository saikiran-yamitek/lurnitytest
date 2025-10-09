import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { listTickets, updateTicket } from "../../services/ticketApi";
import { listDemos, markDemoAsBooked } from "../../services/demoApi";
import logo from "../../assets/LURNITY.jpg";
import { 
  FiUser, FiLogOut, FiX, FiSave, FiHeadphones, FiCalendar,
  FiMessageSquare, FiBell, FiRefreshCw, FiCheckCircle, FiAlertTriangle,
  FiTrash2, FiSearch, FiTrendingUp, FiActivity, FiDownload
} from "react-icons/fi";
import "./SupportDashboard.css";
const API = process.env.REACT_APP_API_URL;
export default function SupportDashboard({ emp }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [tickets, setTickets] = useState([]);
  const [demos, setDemos] = useState([]);
  const [welcome, setWelcome] = useState(true);
  const [modal, setModal] = useState({ open: false, note: "", ticket: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, feedbackId: null });
  const [search, setSearch] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const history = useHistory();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
  setLoading(true);
  try {
    console.log("🔄 Starting data fetch...");
    
    // Fetch tickets and demos
    setTickets(await listTickets());
    setDemos(await listDemos());

    // Fetch feedbacks
    console.log("🔄 Fetching feedbacks...");
    const feedbackRes = await fetch(`${API}/api/feedback`);
    console.log("📡 Feedback response status:", feedbackRes.status);
    
    if (!feedbackRes.ok) {
      throw new Error(`Feedback API failed: ${feedbackRes.status}`);
    }
    
    const feedbackJson = await feedbackRes.json();
    console.log("📦 Raw feedback data:", feedbackJson);
    
    // ✅ Handle feedback response format (could be array or {items: []} format)
    const feedbackArray = Array.isArray(feedbackJson) 
      ? feedbackJson 
      : (feedbackJson.items || []);
    
    console.log("📦 Processed feedbacks:", feedbackArray);
    setFeedbacks(feedbackArray);

    // Fetch courses
    console.log("🔄 Fetching courses...");
    const courseRes = await fetch(`${API}/api/courses`);
    console.log("📡 Course response status:", courseRes.status);
    
    if (!courseRes.ok) {
      throw new Error(`Courses API failed: ${courseRes.status}`);
    }
    
    const courseJson = await courseRes.json();
    console.log("📦 Raw course data:", courseJson);
    
    // ✅ Extract courses from the {items: []} format
    const courseArray = courseJson.items || [];
    
    console.log("📦 Processed courses:", courseArray);
    setCourses(courseArray);
    
    console.log("✅ All data fetched successfully");
  } catch (error) {
    console.error("❌ Error in fetchAllData:", error);
    setPopupMessage(`❌ Failed to load data: ${error.message}`);
    setTimeout(() => setPopupMessage(""), 3000);
  } finally {
    setLoading(false);
  }
};


  const openModal = (t) => setModal({ open: true, note: "", ticket: t });
  const closeModal = () => setModal({ open: false, note: "", ticket: null });

  const saveResolution = async () => {
    const { ticket, note } = modal;
    if (!note.trim()) {
      setPopupMessage("⚠️ Resolution note required.");
      setTimeout(() => setPopupMessage(""), 3000);
      return;
    }

    await updateTicket(ticket.id, {
      status: "Resolved",
      closedBy: emp.name,
      resolutionNote: note.trim()
    });

    await fetch(`${API}/api/user/alert`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: ticket.userEmail,
        alert: true
      })
    });

    setTickets((prev) =>
      prev.map((x) =>
        x._id === ticket._id
          ? { ...x, status: "Resolved", closedBy: emp.name, resolutionNote: note.trim() }
          : x
      )
    );

    closeModal();
    setPopupMessage("✅ Ticket resolved and alert created for the user.");
    setTimeout(() => setPopupMessage(""), 3000);
  };

  const handleMarkBooked = async (id) => {
    try {
      await markDemoAsBooked(id);
      setDemos(await listDemos());
      setPopupMessage("✅ Demo marked as booked");
      setTimeout(() => setPopupMessage(""), 3000);
    } catch (err) {
      setPopupMessage("❌ Failed to mark demo as booked");
      setTimeout(() => setPopupMessage(""), 3000);
    }
  };

  const doLogout = () => {
    localStorage.removeItem("empInfo");
    localStorage.removeItem("empToken");
    history.replace("/employee/login");
  };

  const getCourseDetails = (courseId, subIndex, videoIndex) => {
  console.log("🔍 Looking for course:", { courseId, subIndex, videoIndex });
  console.log("📚 Available courses:", courses.length);
  
  // ✅ Check if courses is an array
  if (!Array.isArray(courses) || courses.length === 0) {
    console.warn("Courses data not available:", courses);
    return {
      courseTitle: "Loading courses...",
      subCourseTitle: "Loading...",
      videoTitle: "Loading..."
    };
  }

  // ✅ Find course by id (note: course structure uses 'id' not '_id')
  const course = courses.find((c) => c.id === courseId || c._id === courseId);
  
  if (!course) {
    console.warn("Course not found:", courseId);
    console.log("Available course IDs:", courses.map(c => c.id || c._id));
    return {
      courseTitle: "Unknown Course",
      subCourseTitle: "Unknown SubCourse",
      videoTitle: "Unknown Video"
    };
  }

  console.log("✅ Found course:", course.title);

  // ✅ Get subcourse and video details
  const subCourse = course.subCourses?.[subIndex];
  const video = subCourse?.videos?.[videoIndex];

  const result = {
    courseTitle: course.title || "Unknown Course",
    subCourseTitle: subCourse?.title || "Unknown SubCourse",
    videoTitle: video?.title || "Unknown Video"
  };

  console.log("📋 Course details result:", result);
  return result;
};


  const openDeleteModal = (id) => {
    setDeleteModal({ open: true, feedbackId: id });
  };

  const confirmDeleteFeedback = async () => {
    const id = deleteModal.feedbackId;
    try {
      const res = await fetch(`${API}/api/feedback/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        setFeedbacks((prev) => prev.filter((f) => f._id !== id));
        setPopupMessage("✅ Feedback deleted successfully!");
        setTimeout(() => setPopupMessage(""), 3000);
      } else {
        setPopupMessage(data.error || "❌ Failed to delete feedback");
        setTimeout(() => setPopupMessage(""), 3000);
      }
    } catch (err) {
      setPopupMessage("❌ Error deleting feedback");
      setTimeout(() => setPopupMessage(""), 3000);
    } finally {
      setDeleteModal({ open: false, feedbackId: null });
    }
  };

  const openTickets = tickets.filter((t) => t.status !== "Resolved");
  const resolvedTickets = tickets
    .filter((t) => t.status === "Resolved")
    .filter(
      (t) =>
        t.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
        t.subject?.toLowerCase().includes(search.toLowerCase())
    );

  const bookedDemos = demos.filter((d) => d.booked);
  const newDemos = demos.filter((d) => !d.booked);

  // Calculate statistics
  const totalTickets = tickets.length;
  const openCount = openTickets.length;
  const resolvedCount = totalTickets - openCount;
  const totalDemos = demos.length;
  const bookedCount = bookedDemos.length;
  const resolutionRate = totalTickets > 0 ? ((resolvedCount / totalTickets) * 100).toFixed(1) : 0;

  return (
    <div className="support-dashboard-wrapper">
      {/* Sidebar */}
      <aside className="support-sidebar">
        <div className="support-sidebar-header">
          <div className="support-logo-container">
            <img src={logo} alt="Lurnity" className="support-logo" />
            <div className="support-brand-info">
              <h2 className="support-brand-title">Support Center</h2>
              <p className="support-brand-subtitle">Service & Help Desk</p>
            </div>
          </div>
        </div>
        
        <nav className="support-sidebar-nav">
          <div className="support-nav-section">
            <span className="support-nav-section-title">Main</span>
            <button 
              className={`support-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} 
              onClick={() => setActiveTab('dashboard')}
            >
              <FiTrendingUp />
              <span>Dashboard</span>
            </button>
            <button 
              className={`support-nav-item ${activeTab === 'tickets' ? 'active' : ''}`} 
              onClick={() => setActiveTab('tickets')}
            >
              <FiHeadphones />
              <span>Tickets</span>
              {openCount > 0 && (
                <span className="support-nav-badge">{openCount}</span>
              )}
            </button>
          </div>

          <div className="support-nav-section">
            <span className="support-nav-section-title">Management</span>
            <button 
              className={`support-nav-item ${activeTab === 'demos' ? 'active' : ''}`} 
              onClick={() => setActiveTab('demos')}
            >
              <FiCalendar />
              <span>Demos</span>
              {newDemos.length > 0 && (
                <span className="support-nav-badge">{newDemos.length}</span>
              )}
            </button>
            <button 
              className={`support-nav-item ${activeTab === 'feedbacks' ? 'active' : ''}`} 
              onClick={() => setActiveTab('feedbacks')}
            >
              <FiMessageSquare />
              <span>Feedbacks</span>
            </button>
          </div>
        </nav>

        <div className="support-sidebar-footer">
          <div className="support-user-card">
            <div className="support-user-avatar">
              <FiUser />
            </div>
            <div className="support-user-info">
              <span className="support-user-name">{emp?.name}</span>
              <span className="support-user-role">Support Executive</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="support-main-content">
        {/* Top Header */}
        <header className="support-header">
          <div className="support-header-left">
            <div className="support-page-info">
              <h1 className="support-page-title">
                {activeTab === 'dashboard' && 'Support Dashboard'}
                {activeTab === 'tickets' && 'Ticket Management'}
                {activeTab === 'demos' && 'Demo Requests'}
                {activeTab === 'feedbacks' && 'User Feedbacks'}
              </h1>
              <p className="support-page-subtitle">
                {activeTab === 'dashboard' && 'Monitor support activities and track performance metrics'}
                {activeTab === 'tickets' && 'Manage and resolve support tickets'}
                {activeTab === 'demos' && 'Handle demo booking requests'}
                {activeTab === 'feedbacks' && 'Review and manage user feedback'}
              </p>
            </div>
          </div>
          <div className="support-header-right">
            <button className="support-header-btn" onClick={fetchAllData}>
              <FiRefreshCw />
            </button>
            <button className="support-header-btn">
              <FiBell />
            </button>
            <button className="support-logout-btn" onClick={doLogout} title="Logout">
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="support-content">
          {loading && (
            <div className="support-loading-overlay">
              <div className="support-loading-spinner">
                <div className="support-spinner"></div>
                <p>Loading...</p>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="support-dashboard">
              {/* Statistics Cards */}
              <div className="support-stats-grid">
                <div className="support-stat-card support-stat-primary">
                  <div className="support-stat-header">
                    <div className="support-stat-icon">
                      <FiHeadphones />
                    </div>
                    <div className="support-stat-info">
                      <h3 className="support-stat-value">{totalTickets}</h3>
                      <p className="support-stat-label">Total Tickets</p>
                    </div>
                  </div>
                  <div className="support-stat-footer">
                    <span className="support-stat-trend positive">
                      <FiTrendingUp />
                      All support requests
                    </span>
                  </div>
                </div>

                <div className="support-stat-card support-stat-warning">
                  <div className="support-stat-header">
                    <div className="support-stat-icon">
                      <FiAlertTriangle />
                    </div>
                    <div className="support-stat-info">
                      <h3 className="support-stat-value">{openCount}</h3>
                      <p className="support-stat-label">Open Tickets</p>
                    </div>
                  </div>
                  <div className="support-stat-footer">
                    <span className="support-stat-trend neutral">
                      <FiActivity />
                      Pending resolution
                    </span>
                  </div>
                </div>

                <div className="support-stat-card support-stat-success">
                  <div className="support-stat-header">
                    <div className="support-stat-icon">
                      <FiCheckCircle />
                    </div>
                    <div className="support-stat-info">
                      <h3 className="support-stat-value">{resolvedCount}</h3>
                      <p className="support-stat-label">Resolved</p>
                    </div>
                  </div>
                  <div className="support-stat-footer">
                    <span className="support-stat-trend positive">
                      <FiTrendingUp />
                      {resolutionRate}% resolved
                    </span>
                  </div>
                </div>

                <div className="support-stat-card support-stat-info">
                  <div className="support-stat-header">
                    <div className="support-stat-icon">
                      <FiCalendar />
                    </div>
                    <div className="support-stat-info">
                      <h3 className="support-stat-value">{totalDemos}</h3>
                      <p className="support-stat-label">Demo Requests</p>
                    </div>
                  </div>
                  <div className="support-stat-footer">
                    <span className="support-stat-trend neutral">
                      <FiActivity />
                      {bookedCount} booked
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="support-quick-actions-section">
                <div className="support-section-header">
                  <h2 className="support-section-title">Quick Actions</h2>
                  <p className="support-section-subtitle">Common support management tasks</p>
                </div>
                <div className="support-quick-actions">
                  <button 
                    className="support-quick-action-card primary"
                    onClick={() => setActiveTab('tickets')}
                  >
                    <div className="support-action-icon">
                      <FiHeadphones />
                    </div>
                    <div className="support-action-content">
                      <h3>Manage Tickets</h3>
                      <p>Resolve support issues</p>
                    </div>
                  </button>

                  <button 
                    className="support-quick-action-card secondary"
                    onClick={() => setActiveTab('demos')}
                  >
                    <div className="support-action-icon">
                      <FiCalendar />
                    </div>
                    <div className="support-action-content">
                      <h3>Handle Demos</h3>
                      <p>Process demo requests</p>
                    </div>
                  </button>

                  <button 
                    className="support-quick-action-card tertiary"
                    onClick={() => setActiveTab('feedbacks')}
                  >
                    <div className="support-action-icon">
                      <FiMessageSquare />
                    </div>
                    <div className="support-action-content">
                      <h3>Review Feedback</h3>
                      <p>Manage user feedback</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recent Activities */}
              <div className="support-recent-section">
                <div className="support-section-header">
                  <h2 className="support-section-title">Recent Activities</h2>
                  <button 
                    className="support-view-all-btn"
                    onClick={() => setActiveTab('tickets')}
                  >
                    View All
                  </button>
                </div>
                <div className="support-recent-activities">
                  {[...openTickets, ...resolvedTickets.slice(0, 2)].slice(0, 3).map((ticket) => (
                    <div key={ticket._id} className="support-recent-activity-item">
                      <div className="support-recent-activity-header">
                        <div className="support-activity-icon">
                          <FiHeadphones />
                        </div>
                        <div className="support-activity-info">
                          <h4 className="support-activity-title">{ticket.subject}</h4>
                          <p className="support-activity-user">{ticket.userEmail}</p>
                        </div>
                        <div className="support-activity-status">
                          <span className={`support-status-badge ${ticket.status === 'Resolved' ? 'resolved' : 'open'}`}>
                            {ticket.status || 'Open'}
                          </span>
                        </div>
                      </div>
                      <div className="support-recent-activity-meta">
                        <span className="support-activity-category">{ticket.category}</span>
                        <span className="support-activity-priority">
                          Priority: {ticket.priority || 'Normal'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="support-tickets-section">
              <div className="support-section-header">
                <div className="support-section-info">
                  <h2 className="support-section-title">Open Tickets</h2>
                  <p className="support-section-subtitle">Tickets requiring attention ({openCount} open)</p>
                </div>
              </div>

              {openTickets.length === 0 ? (
                <div className="support-empty-state">
                  <div className="support-empty-icon">
                    <FiHeadphones />
                  </div>
                  <h3 className="support-empty-title">No Open Tickets</h3>
                  <p className="support-empty-description">
                    All tickets have been resolved. Great job!
                  </p>
                </div>
              ) : (
                <div className="support-tickets-grid">
                  {openTickets.map((ticket) => (
                    <div className="support-ticket-card" key={ticket._id}>
                      <div className="support-ticket-card-header">
                        <div className="support-ticket-main-info">
                          <div className="support-ticket-badge">
                            <FiHeadphones />
                          </div>
                          <div className="support-ticket-details">
                            <h3 className="support-ticket-subject">{ticket.subject}</h3>
                            <p className="support-ticket-user">{ticket.userEmail}</p>
                          </div>
                        </div>
                        <div className="support-ticket-priority">
                          <span className={`support-priority-badge ${ticket.priority?.toLowerCase() || 'normal'}`}>
                            {ticket.priority || 'Normal'}
                          </span>
                        </div>
                      </div>

                      <div className="support-ticket-card-body">
                        <div className="support-ticket-meta">
                          <span className="support-ticket-category">{ticket.category}</span>
                        </div>
                        <div className="support-ticket-description">
                          <p>{ticket.description}</p>
                        </div>
                      </div>

                      <div className="support-ticket-card-footer">
                        <button 
                          className="support-btn support-btn-success" 
                          onClick={() => openModal(ticket)}
                        >
                          <FiCheckCircle />
                          Mark Resolved
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="support-divider"></div>

              <div className="support-section-header">
                <div className="support-section-info">
                  <h3 className="support-section-title">Recently Resolved</h3>
                  <p className="support-section-subtitle">Previously closed tickets</p>
                </div>
                <div className="support-section-actions">
                  <div className="support-search-container">
                    <FiSearch className="support-search-icon" />
                    <input
                      type="text"
                      placeholder="Search by email or subject..."
                      className="support-search-input"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="support-resolved-tickets">
                {resolvedTickets.length === 0 ? (
                  <div className="support-empty-state">
                    <p>No resolved tickets match your search.</p>
                  </div>
                ) : (
                  <div className="support-resolved-list">
                    {resolvedTickets.map((ticket) => (
                      <div key={ticket._id} className="support-resolved-item">
                        <div className="support-resolved-header">
                          <div className="support-resolved-info">
                            <h4 className="support-resolved-subject">{ticket.subject}</h4>
                            <p className="support-resolved-user">{ticket.userEmail}</p>
                          </div>
                          <div className="support-resolved-meta">
                            <span className="support-resolved-by">Closed by {ticket.closedBy}</span>
                          </div>
                        </div>
                        {ticket.resolutionNote && (
                          <div className="support-resolved-note">
                            <p title={ticket.resolutionNote}>
                              <em>
                                {ticket.resolutionNote.length > 100
                                  ? ticket.resolutionNote.slice(0, 100) + "…"
                                  : ticket.resolutionNote}
                              </em>
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'demos' && (
            <div className="support-demos-section">
              <div className="support-section-header">
                <div className="support-section-info">
                  <h2 className="support-section-title">New Demo Requests</h2>
                  <p className="support-section-subtitle">Pending demo bookings ({newDemos.length} new)</p>
                </div>
              </div>

              {newDemos.length === 0 ? (
                <div className="support-empty-state">
                  <div className="support-empty-icon">
                    <FiCalendar />
                  </div>
                  <h3 className="support-empty-title">No New Demo Requests</h3>
                  <p className="support-empty-description">
                    All demo requests have been processed.
                  </p>
                </div>
              ) : (
                <div className="support-demos-grid">
                  {newDemos.map((demo) => (
                    <div className="support-demo-card" key={demo.id}>
                      <div className="support-demo-card-header">
                        <div className="support-demo-main-info">
                          <div className="support-demo-badge">
                            <FiCalendar />
                          </div>
                          <div className="support-demo-details">
                            <h3 className="support-demo-name">{demo.name}</h3>
                            <p className="support-demo-contact">{demo.email} • {demo.phone}</p>
                          </div>
                        </div>
                      </div>

                      <div className="support-demo-card-body">
                        <div className="support-demo-info">
                          <div className="support-demo-education">
                            <p><strong>Education:</strong> {demo.education}</p>
                            <p><strong>Current:</strong> {demo.currentEducation}</p>
                          </div>
                          <div className="support-demo-location">
                            <p><strong>Location:</strong> {demo.city}</p>
                            <p><strong>College:</strong> {demo.college}</p>
                          </div>
                        </div>
                      </div>

                      <div className="support-demo-card-footer">
                        <button 
                          className="support-btn support-btn-primary" 
                          onClick={() => handleMarkBooked(demo.id)}
                        >
                          <FiCheckCircle />
                          Mark as Booked
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="support-divider"></div>

              <div className="support-section-header">
                <div className="support-section-info">
                  <h3 className="support-section-title">Booked Demos</h3>
                  <p className="support-section-subtitle">Successfully processed demos ({bookedCount} booked)</p>
                </div>
              </div>

              <div className="support-booked-demos">
                {bookedDemos.length === 0 ? (
                  <div className="support-empty-state">
                    <p>No demos have been marked as booked yet.</p>
                  </div>
                ) : (
                  <div className="support-booked-list">
                    {bookedDemos.map((demo) => (
                      <div key={demo.id} className="support-booked-item">
                        <div className="support-booked-header">
                          <div className="support-booked-info">
                            <h4 className="support-booked-name">{demo.name}</h4>
                            <p className="support-booked-contact">{demo.email} • {demo.phone}</p>
                          </div>
                          <span className="support-status-badge booked">BOOKED</span>
                        </div>
                        <div className="support-booked-details">
                          <p>{demo.education} • {demo.currentEducation}</p>
                          <p>{demo.city}, {demo.collegeAddress}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'feedbacks' && (
  <div className="support-feedbacks-section">
    <div className="support-section-header">
      <div className="support-section-info">
        <h2 className="support-section-title">User Feedbacks</h2>
        <p className="support-section-subtitle">Course and video feedback from students</p>
      </div>
      <div className="support-section-actions">
        <button className="support-btn support-btn-outline">
          <FiDownload />
          Export Feedback
        </button>
      </div>
    </div>

    {/* ✅ Debug info (remove in production) */}
    <div className="debug-info" style={{padding: '10px', background: '#f0f0f0', margin: '10px 0', fontSize: '12px'}}>
      <p>📊 Debug Info:</p>
      <p>• Feedbacks: {feedbacks.length} items</p>
      <p>• Courses: {courses.length} items</p>
      <p>• Courses loaded: {Array.isArray(courses) ? 'Yes' : 'No'}</p>
    </div>

    {!Array.isArray(feedbacks) || feedbacks.length === 0 ? (
      <div className="support-empty-state">
        <div className="support-empty-icon">
          <FiMessageSquare />
        </div>
        <h3 className="support-empty-title">No Feedbacks Available</h3>
        <p className="support-empty-description">
          {!Array.isArray(feedbacks) ? 
            "Loading feedback data..." : 
            "User feedback will appear here when submitted."
          }
        </p>
      </div>
    ) : (
      <div className="support-feedbacks-grid">
        {feedbacks.map((feedback, index) => {
          if (!feedback) {
            return (
              <div key={index} className="support-error-card">
                <p>Invalid feedback data</p>
              </div>
            );
          }

          try {
            const { courseTitle, subCourseTitle, videoTitle } = getCourseDetails(
              feedback.courseId,
              feedback.subIndex,
              feedback.videoIndex
            );

            return (
              <div className="support-feedback-card" key={feedback.id || feedback._id || index}>
                <div className="support-feedback-card-header">
                  <div className="support-feedback-main-info">
                    <div className="support-feedback-badge">
                      <FiMessageSquare />
                    </div>
                    <div className="support-feedback-details">
                      <h3 className="support-feedback-user">
                        {feedback.userName || feedback.userEmail || "Unknown User"}
                      </h3>
                      <p className="support-feedback-course">{courseTitle}</p>
                    </div>
                  </div>
                  <div className="support-feedback-actions">
                    <button 
                      className="support-action-btn support-action-btn-delete" 
                      onClick={() => openDeleteModal(feedback.id || feedback._id)}
                      title="Delete Feedback"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                <div className="support-feedback-card-body">
                  <div className="support-feedback-content">
                    <div className="support-feedback-details-section">
                      <p><strong>Course:</strong> {courseTitle}</p>
                      {subCourseTitle && subCourseTitle !== "Unknown SubCourse" && (
                        <p><strong>Section:</strong> {subCourseTitle}</p>
                      )}
                      {videoTitle && videoTitle !== "Unknown Video" && (
                        <p><strong>Video:</strong> {videoTitle}</p>
                      )}
                    </div>
                    
                    <div className="support-feedback-message">
                      <h4>Feedback:</h4>
                      <p>{feedback.feedback || feedback.message || feedback.text || "No feedback message"}</p>
                    </div>

                    {feedback.rating && (
                      <div className="support-feedback-rating">
                        <span className="support-rating-label">Rating:</span>
                        <span className="support-rating-stars">
                          {"★".repeat(Number(feedback.rating))}{"☆".repeat(5 - Number(feedback.rating))}
                        </span>
                        <span className="support-rating-value">({feedback.rating}/5)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="support-feedback-card-footer">
                  <div className="support-feedback-meta">
                    <span className="support-feedback-date">
                      {feedback.createdAt ? new Date(feedback.createdAt).toLocaleDateString() : "Date unknown"}
                    </span>
                    <span className="support-feedback-type">
                      {feedback.type || "General Feedback"}
                    </span>
                  </div>
                </div>
              </div>
            );
          } catch (error) {
            console.error('Error rendering feedback:', error, feedback);
            return (
              <div key={index} className="support-error-card">
                <p>⚠️ Error rendering feedback #{index + 1}</p>
                <small>{error.message}</small>
              </div>
            );
          }
        })}
      </div>
    )}
  </div>
)}

        </main>
      </div>

      {/* Welcome Modal */}
      {welcome && (
        <div className="support-modal-overlay" onClick={() => setWelcome(false)}>
          <div className="support-modal" onClick={(e) => e.stopPropagation()}>
            <div className="support-modal-header">
              <h2 className="support-modal-title">Welcome, {emp.name}!</h2>
            </div>
            <div className="support-modal-body">
              <p>Track open tickets, manage demos, and help students succeed with their learning journey.</p>
            </div>
            <div className="support-modal-footer">
              <button className="support-btn support-btn-success" onClick={() => setWelcome(false)}>
                Let's get started
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolution Modal */}
      {modal.open && (
        <div className="support-modal-overlay" onClick={closeModal}>
          <div className="support-modal" onClick={(e) => e.stopPropagation()}>
            <div className="support-modal-header">
              <h3 className="support-modal-title">Resolution Note</h3>
              <button 
                className="support-modal-close" 
                onClick={closeModal}
              >
                <FiX />
              </button>
            </div>
            <div className="support-modal-body">
              <textarea
                className="support-textarea"
                rows="4"
                placeholder="How did you resolve the issue?"
                value={modal.note}
                onChange={(e) => setModal({ ...modal, note: e.target.value })}
              />
            </div>
            <div className="support-modal-footer">
              <button className="support-btn support-btn-outline" onClick={closeModal}>
                <FiX />
                Cancel
              </button>
              <button className="support-btn support-btn-success" onClick={saveResolution}>
                <FiSave />
                Save & Resolve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="support-modal-overlay" onClick={() => setDeleteModal({ open: false, feedbackId: null })}>
          <div className="support-modal" onClick={(e) => e.stopPropagation()}>
            <div className="support-modal-header">
              <h3 className="support-modal-title">Confirm Delete</h3>
              <button 
                className="support-modal-close" 
                onClick={() => setDeleteModal({ open: false, feedbackId: null })}
              >
                <FiX />
              </button>
            </div>
            <div className="support-modal-body">
              <div className="support-modal-icon warning">
                <FiTrash2 />
              </div>
              <p>Are you sure you want to delete this feedback? This action cannot be undone.</p>
            </div>
            <div className="support-modal-footer">
              <button 
                className="support-btn support-btn-outline" 
                onClick={() => setDeleteModal({ open: false, feedbackId: null })}
              >
                Cancel
              </button>
              <button className="support-btn support-btn-danger" onClick={confirmDeleteFeedback}>
                <FiTrash2 />
                Delete Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {popupMessage && (
        <div className={`support-toast ${popupMessage.startsWith("✅") ? "success" : popupMessage.startsWith("❌") ? "error" : "info"}`}>
          <div className="support-toast-content">
            {popupMessage}
          </div>
        </div>
      )}
    </div>
  );
}
