import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import logo from "../../assets/LURNITY.jpg";
import { 
  FiUser, 
  FiLogOut, 
  FiUsers, 
  FiX, 
  FiCalendar,
  FiClock,
  FiMapPin,
  FiBell,
  FiTrendingUp,
  FiBook,
  FiCheck,
  FiSave,
  FiActivity,
  FiAward,
  FiRefreshCw,
  FiDownload
} from "react-icons/fi";
import "./InchargeDashboard.css";
const API = process.env.REACT_APP_API_URL;
export default function InchargeDashboard() {
  const [workshops, setWorkshops] = useState([]);
  const [emp, setEmp] = useState(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [showStudentPopup, setShowStudentPopup] = useState(false);
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [editedStudents, setEditedStudents] = useState({});
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState("");
  
  const history = useHistory();

  useEffect(() => {
    const storedEmp = JSON.parse(localStorage.getItem("empInfo"));
    if (!storedEmp || storedEmp.role !== "lab incharge") {
      alert("Unauthorized access");
      history.replace("/employee/login");
      return;
    }

    setEmp(storedEmp);
    fetchWorkshops(storedEmp);
  }, [history]);

  const fetchWorkshops = async (employee) => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/workshops/incharge/${employee.id}`);
      const data = await response.json();
      setWorkshops(data);
    } catch (err) {
      console.error("Failed to fetch workshops", err);
      setPopup("❌ Error fetching workshops");
      setTimeout(() => setPopup(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("empInfo");
    history.push("/employee/login");
  };

  const handleViewStudents = async (workshopId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/workshops/${workshopId}/students`);
      const data = await res.json();
      setRegisteredStudents(Array.isArray(data) ? data : []);
      setSelectedWorkshop(workshopId);
      setEditedStudents({});
      setShowStudentPopup(true);
    } catch (err) {
      console.error("Failed to fetch students", err);
      setPopup("❌ Error fetching students");
      setTimeout(() => setPopup(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (studentId, field, value) => {
    setEditedStudents((prev) => {
      const currentEdited = prev[studentId] || {};
      
      const updated = { 
        ...currentEdited,
        [field]: field === "attendance" ? value === "present" : value 
      };

      // If attendance is set to absent, auto-set grade to F and result to fail
      if (field === "attendance" && value === "absent") {
        updated.grade = "F";
        updated.result = "fail";
      }

      // If grade is changed, update result
      if (field === "grade") {
        updated.result = value === "F" ? "fail" : "pass";
      }

      return {
        ...prev,
        [studentId]: updated,
      };
    });
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const updates = Object.entries(editedStudents);

      

for (const [studentId, fields] of updates) {
  if (fields.attendance === undefined || !fields.grade) {
    setPopup("⚠️ Please mark both attendance and grade for all students.");
    setTimeout(() => setPopup(""), 3000);
    return;
  }
}



      for (const [studentId, fields] of updates) {
        const res = await fetch(`${API}/api/workshops/${selectedWorkshop}/attendance`,
          
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentId, ...fields }),
          }
        );
        if (!res.ok) throw new Error("Update failed");
      }

      await handleViewStudents(selectedWorkshop); // Refresh data
      setEditedStudents({});
      setPopup("✅ Changes saved successfully.");
      setTimeout(() => setPopup(""), 3000);
    } catch (error) {
      console.error("Save error", error);
      setPopup("❌ Failed to save changes.");
      setTimeout(() => setPopup(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalWorkshops = workshops.length;
  const totalStudents = workshops.reduce((sum, ws) => sum + (ws.registeredStudents?.length || 0), 0);
  const completedWorkshops = workshops.filter(ws => 
    ws.registeredStudents?.every(student => student.grade && student.attendance !== undefined)
  ).length;
  const pendingWorkshops = totalWorkshops - completedWorkshops;

  return (
    <div className="incharge-dashboard-wrapper">
      {/* Sidebar */}
      <aside className="incharge-sidebar">
        <div className="incharge-sidebar-header">
          <div className="incharge-logo-container">
            <img src={logo} alt="Lurnity" className="incharge-logo" />
            <div className="incharge-brand-info">
              <h2 className="incharge-brand-title">Lab Incharge</h2>
              <p className="incharge-brand-subtitle">Workshop Management</p>
            </div>
          </div>
        </div>
        
        <nav className="incharge-sidebar-nav">
          <div className="incharge-nav-section">
            <span className="incharge-nav-section-title">Main</span>
            <button 
              className={`incharge-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} 
              onClick={() => setActiveTab('dashboard')}
            >
              <FiTrendingUp />
              <span>Dashboard</span>
            </button>
            <button 
              className={`incharge-nav-item ${activeTab === 'workshops' ? 'active' : ''}`} 
              onClick={() => setActiveTab('workshops')}
            >
              <FiBook />
              <span>My Workshops</span>
              {workshops.length > 0 && (
                <span className="incharge-nav-badge">{workshops.length}</span>
              )}
            </button>
          </div>

          <div className="incharge-nav-section">
            <span className="incharge-nav-section-title">Tools</span>
            <button 
              className={`incharge-nav-item ${activeTab === 'attendance' ? 'active' : ''}`} 
              onClick={() => setActiveTab('attendance')}
            >
              <FiCheck />
              <span>Attendance</span>
            </button>
            <button 
              className={`incharge-nav-item ${activeTab === 'reports' ? 'active' : ''}`} 
              onClick={() => setActiveTab('reports')}
            >
              <FiAward />
              <span>Reports</span>
            </button>
          </div>
        </nav>

        <div className="incharge-sidebar-footer">
          <div className="incharge-user-card">
            <div className="incharge-user-avatar">
              <FiUser />
            </div>
            <div className="incharge-user-info">
              <span className="incharge-user-name">{emp?.name}</span>
              <span className="incharge-user-role">Lab Incharge</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="incharge-main-content">
        {/* Top Header */}
        <header className="incharge-header">
          <div className="incharge-header-left">
            <div className="incharge-page-info">
              <h1 className="incharge-page-title">
                {activeTab === 'dashboard' && 'Incharge Dashboard'}
                {activeTab === 'workshops' && 'My Workshops'}
                {activeTab === 'attendance' && 'Attendance Management'}
                {activeTab === 'reports' && 'Performance Reports'}
              </h1>
              <p className="incharge-page-subtitle">
                {activeTab === 'dashboard' && 'Overview of your workshop assignments and activities'}
                {activeTab === 'workshops' && `Managing ${workshops.length} workshop sessions`}
                {activeTab === 'attendance' && 'Track and manage student attendance'}
                {activeTab === 'reports' && 'View detailed performance analytics'}
              </p>
            </div>
          </div>
          <div className="incharge-header-right">
            <button className="incharge-header-btn" onClick={() => fetchWorkshops(emp)}>
              <FiRefreshCw />
            </button>
            <button className="incharge-header-btn">
              <FiBell />
            </button>
            <button className="incharge-logout-btn" onClick={handleLogout} title="Logout">
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="incharge-content">
          {loading && (
            <div className="incharge-loading-overlay">
              <div className="incharge-loading-spinner">
                <div className="incharge-spinner"></div>
                <p>Loading...</p>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="incharge-dashboard">
              {/* Statistics Cards */}
              <div className="incharge-stats-grid">
                <div className="incharge-stat-card incharge-stat-primary">
                  <div className="incharge-stat-header">
                    <div className="incharge-stat-icon">
                      <FiBook />
                    </div>
                    <div className="incharge-stat-info">
                      <h3 className="incharge-stat-value">{totalWorkshops}</h3>
                      <p className="incharge-stat-label">Assigned Workshops</p>
                    </div>
                  </div>
                  <div className="incharge-stat-footer">
                    <span className="incharge-stat-trend positive">
                      <FiTrendingUp />
                      All active sessions
                    </span>
                  </div>
                </div>

                <div className="incharge-stat-card incharge-stat-success">
                  <div className="incharge-stat-header">
                    <div className="incharge-stat-icon">
                      <FiUsers />
                    </div>
                    <div className="incharge-stat-info">
                      <h3 className="incharge-stat-value">{totalStudents}</h3>
                      <p className="incharge-stat-label">Total Students</p>
                    </div>
                  </div>
                  <div className="incharge-stat-footer">
                    <span className="incharge-stat-trend positive">
                      <FiTrendingUp />
                      Registered participants
                    </span>
                  </div>
                </div>

                <div className="incharge-stat-card incharge-stat-warning">
                  <div className="incharge-stat-header">
                    <div className="incharge-stat-icon">
                      <FiCheck />
                    </div>
                    <div className="incharge-stat-info">
                      <h3 className="incharge-stat-value">{completedWorkshops}</h3>
                      <p className="incharge-stat-label">Completed</p>
                    </div>
                  </div>
                  <div className="incharge-stat-footer">
                    <span className="incharge-stat-trend positive">
                      <FiActivity />
                      Grading completed
                    </span>
                  </div>
                </div>

                <div className="incharge-stat-card incharge-stat-info">
                  <div className="incharge-stat-header">
                    <div className="incharge-stat-icon">
                      <FiClock />
                    </div>
                    <div className="incharge-stat-info">
                      <h3 className="incharge-stat-value">{pendingWorkshops}</h3>
                      <p className="incharge-stat-label">Pending Reviews</p>
                    </div>
                  </div>
                  <div className="incharge-stat-footer">
                    <span className="incharge-stat-trend neutral">
                      <FiActivity />
                      Awaiting evaluation
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="incharge-quick-actions-section">
                <div className="incharge-section-header">
                  <h2 className="incharge-section-title">Quick Actions</h2>
                  <p className="incharge-section-subtitle">Common workshop management tasks</p>
                </div>
                <div className="incharge-quick-actions">
                  <button 
                    className="incharge-quick-action-card primary"
                    onClick={() => setActiveTab('workshops')}
                  >
                    <div className="incharge-action-icon">
                      <FiBook />
                    </div>
                    <div className="incharge-action-content">
                      <h3>View Workshops</h3>
                      <p>Manage assigned sessions</p>
                    </div>
                  </button>

                  <button 
                    className="incharge-quick-action-card secondary"
                    onClick={() => setActiveTab('attendance')}
                  >
                    <div className="incharge-action-icon">
                      <FiCheck />
                    </div>
                    <div className="incharge-action-content">
                      <h3>Mark Attendance</h3>
                      <p>Record student attendance</p>
                    </div>
                  </button>

                  <button 
                    className="incharge-quick-action-card tertiary"
                    onClick={() => setActiveTab('reports')}
                  >
                    <div className="incharge-action-icon">
                      <FiAward />
                    </div>
                    <div className="incharge-action-content">
                      <h3>View Reports</h3>
                      <p>Performance analytics</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recent Workshops */}
              <div className="incharge-recent-section">
                <div className="incharge-section-header">
                  <h2 className="incharge-section-title">Upcoming Workshops</h2>
                  <button 
                    className="incharge-view-all-btn"
                    onClick={() => setActiveTab('workshops')}
                  >
                    View All
                  </button>
                </div>
                <div className="incharge-recent-workshops">
                  {workshops.slice(0, 3).map((workshop) => (
                    <div key={workshop.id} className="incharge-recent-workshop-item">
                      <div className="incharge-recent-workshop-header">
                        <div className="incharge-workshop-icon">
                          <FiBook />
                        </div>
                        <div className="incharge-workshop-info">
                          <h4 className="incharge-workshop-title">{workshop.labName}</h4>
                          <p className="incharge-workshop-address">{workshop.labAddress}</p>
                        </div>
                        <div className="incharge-workshop-status">
                          <span className="incharge-status-badge scheduled">Scheduled</span>
                        </div>
                      </div>
                      <div className="incharge-recent-workshop-meta">
                        <span className="incharge-workshop-date">
                          <FiCalendar />
                          {new Date(workshop.time).toLocaleDateString()}
                        </span>
                        <span className="incharge-workshop-participants">
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

          {(activeTab === 'workshops' || activeTab === 'attendance') && (
            <div className="incharge-workshops-section">
              {workshops.length === 0 ? (
                <div className="incharge-empty-state">
                  <div className="incharge-empty-icon">
                    <FiBook />
                  </div>
                  <h3 className="incharge-empty-title">No Workshops Assigned</h3>
                  <p className="incharge-empty-description">
                    You don't have any workshops assigned yet. Contact the lab administrator for assignments.
                  </p>
                </div>
              ) : (
                <div className="incharge-workshops-grid">
                  {workshops.map((workshop) => {
                    const registered = workshop.registeredStudents?.length || 0;
                    const available = workshop.memberCount - registered;
                    const occupancyPercentage = (registered / workshop.memberCount) * 100;
                    const isCompleted = workshop.registeredStudents?.every(student => 
                      student.grade && student.attendance !== undefined
                    );
                    
                    return (
                      <div className="incharge-workshop-card" key={workshop.id}>
                        <div className="incharge-workshop-card-header">
                          <div className="incharge-workshop-main-info">
                            <div className="incharge-workshop-badge">
                              <FiBook />
                            </div>
                            <div className="incharge-workshop-details">
                              <h3 className="incharge-workshop-name">{workshop.labName}</h3>
                              <p className="incharge-workshop-location">
                                <FiMapPin />
                                {workshop.labAddress}
                              </p>
                            </div>
                          </div>
                          <div className="incharge-workshop-status-indicator">
                            <span className={`incharge-status-badge ${isCompleted ? 'completed' : 'pending'}`}>
                              {isCompleted ? 'Completed' : 'Pending'}
                            </span>
                          </div>
                        </div>

                        <div className="incharge-workshop-card-body">
                          <div className="incharge-workshop-meta">
                            <div className="incharge-meta-item">
                              <FiCalendar className="incharge-meta-icon" />
                              <div className="incharge-meta-content">
                                <span className="incharge-meta-label">Date</span>
                                <span className="incharge-meta-value">{new Date(workshop.time).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="incharge-meta-item">
                              <FiClock className="incharge-meta-icon" />
                              <div className="incharge-meta-content">
                                <span className="incharge-meta-label">Time</span>
                                <span className="incharge-meta-value">{new Date(workshop.time).toLocaleTimeString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="incharge-workshop-stats">
                            <div className="incharge-stat-row">
                              <div className="incharge-stat-item">
                                <span className="incharge-stat-number">{workshop.memberCount}</span>
                                <span className="incharge-stat-text">Total Seats</span>
                              </div>
                              <div className="incharge-stat-item">
                                <span className="incharge-stat-number">{registered}</span>
                                <span className="incharge-stat-text">Registered</span>
                              </div>
                              <div className="incharge-stat-item">
                                <span className="incharge-stat-number">{available}</span>
                                <span className="incharge-stat-text">Available</span>
                              </div>
                            </div>
                            <div className="incharge-progress-container">
                              <div className="incharge-progress-bar">
                                <div 
                                  className="incharge-progress-fill" 
                                  style={{ width: `${occupancyPercentage}%` }}
                                ></div>
                              </div>
                              <span className="incharge-progress-text">{occupancyPercentage.toFixed(0)}% Full</span>
                            </div>
                          </div>
                        </div>

                        <div className="incharge-workshop-card-footer">
                          <button 
                            className="incharge-btn incharge-btn-outline" 
                            onClick={() => handleViewStudents(workshop.id)}
                          >
                            <FiUsers />
                            Manage Students ({registered})
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="incharge-reports-section">
              <div className="incharge-section-header">
                <div className="incharge-section-info">
                  <h2 className="incharge-section-title">Performance Reports</h2>
                  <p className="incharge-section-subtitle">Detailed analytics of workshop performance</p>
                </div>
                <div className="incharge-section-actions">
                  <button className="incharge-btn incharge-btn-outline">
                    <FiDownload />
                    Export Report
                  </button>
                </div>
              </div>

              <div className="incharge-reports-grid">
                {workshops.map((workshop) => {
                  const students = workshop.registeredStudents || [];
                  const totalStudents = students.length;
                  const presentCount = students.filter(s => s.attendance === true).length;
                  const passCount = students.filter(s => s.result === 'pass').length;
                  const attendanceRate = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : 0;
                  const passRate = totalStudents > 0 ? ((passCount / totalStudents) * 100).toFixed(1) : 0;

                  return (
                    <div key={workshop.id} className="incharge-report-card">
                      <div className="incharge-report-header">
                        <div className="incharge-report-icon">
                          <FiAward />
                        </div>
                        <div className="incharge-report-info">
                          <h3 className="incharge-report-title">{workshop.labName}</h3>
                          <p className="incharge-report-date">
                            {new Date(workshop.time).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="incharge-report-body">
                        <div className="incharge-report-stats">
                          <div className="incharge-report-stat">
                            <span className="incharge-stat-value">{totalStudents}</span>
                            <span className="incharge-stat-label">Registered</span>
                          </div>
                          <div className="incharge-report-stat">
                            <span className="incharge-stat-value">{attendanceRate}%</span>
                            <span className="incharge-stat-label">Attendance</span>
                          </div>
                          <div className="incharge-report-stat">
                            <span className="incharge-stat-value">{passRate}%</span>
                            <span className="incharge-stat-label">Pass Rate</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Toast Notifications */}
      {popup && (
        <div className={`incharge-toast ${popup.startsWith("✅") ? "success" : popup.startsWith("❌") ? "error" : "info"}`}>
          <div className="incharge-toast-content">
            {popup}
          </div>
        </div>
      )}

      {/* Students Management Modal */}
      {showStudentPopup && (
        <div className="incharge-modal-overlay">
          <div className="incharge-modal incharge-modal-large">
            <div className="incharge-modal-header">
              <h3 className="incharge-modal-title">Student Management</h3>
              <button 
                className="incharge-modal-close" 
                onClick={() => setShowStudentPopup(false)}
              >
                <FiX />
              </button>
            </div>
            <div className="incharge-modal-body">
              {registeredStudents.length === 0 ? (
                <div className="incharge-empty-state">
                  <div className="incharge-empty-icon">
                    <FiUsers />
                  </div>
                  <h3 className="incharge-empty-title">No Students Registered</h3>
                  <p className="incharge-empty-description">
                    No students have registered for this workshop yet.
                  </p>
                </div>
              ) : (
                <div className="incharge-students-section">
                  <div className="incharge-students-header">
                    <div className="incharge-students-info">
                      <h4 className="incharge-students-title">
                        Registered Students ({registeredStudents.length})
                      </h4>
                      <p className="incharge-students-subtitle">
                        Manage attendance and grades for workshop participants
                      </p>
                    </div>
                    <div className="incharge-students-actions">
                      <button 
                        className="incharge-btn incharge-btn-primary"
                        onClick={handleSaveChanges}
                        disabled={Object.keys(editedStudents).length === 0}
                      >
                        <FiSave />
                        Save Changes
                      </button>
                    </div>
                  </div>

                  <div className="incharge-students-table-container">
                    <table className="incharge-students-table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Contact</th>
                          <th>Attendance</th>
                          <th>Grade</th>
                          <th>Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registeredStudents.map((student) => {
                          const edited = editedStudents[student.id] || {};
                          const attendanceValue =
                            edited.attendance !== undefined
                              ? edited.attendance
                                ? "present"
                                : "absent"
                              : student.attendance === true
                                ? "present"
                                : "absent";

                          const gradeValue =
                            edited.grade !== undefined
                              ? edited.grade
                              : student.grade || "";

                          const resultValue =
                            gradeValue === "F"
                              ? "fail"
                              : gradeValue !== ""
                                ? "pass"
                                : "pending";

                          return (
                            <tr key={student.id}>
                              <td>
                                <div className="incharge-student-info">
                                  <div className="incharge-student-avatar">
                                    <FiUser />
                                  </div>
                                  <div className="incharge-student-details">
                                    <span className="incharge-student-name">{student.name}</span>
                                    <span className="incharge-student-email">{student.email}</span>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className="incharge-student-phone">{student.phone || "N/A"}</span>
                              </td>
                              <td>
                                <select
                                  className="incharge-form-select incharge-form-select-sm"
                                  value={attendanceValue}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      student.id,
                                      "attendance",
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="present">Present</option>
                                  <option value="absent">Absent</option>
                                </select>
                              </td>
                              <td>
                                <select
                                  className="incharge-form-select incharge-form-select-sm"
                                  value={gradeValue}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      student.id,
                                      "grade",
                                      e.target.value
                                    )
                                  }
                                  disabled={attendanceValue === "absent"}
                                >
                                  <option value="">-- Select --</option>
                                  <option value="S">S</option>
                                  <option value="A">A</option>
                                  <option value="B">B</option>
                                  <option value="C">C</option>
                                  <option value="D">D</option>
                                  <option value="E">E</option>
                                  <option value="F">F</option>
                                </select>
                              </td>
                              <td>
                                <span className={`incharge-result-badge ${resultValue}`}>
                                  {resultValue.charAt(0).toUpperCase() + resultValue.slice(1)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
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
