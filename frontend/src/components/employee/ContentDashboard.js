import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { listCourses } from "../../services/adminApi";
import logo from "../../assets/LURNITY.jpg";
import { 
  FiUser, FiLogOut, FiPlus, FiBookOpen, FiLock, FiEdit3,
  FiBell, FiRefreshCw, FiTrendingUp, FiActivity, FiBook, FiEye
} from "react-icons/fi";
import "./ContentDashboard.css";

export default function ContentDashboard({ emp }) {
  const [courses, setCourses] = useState([]);
  const [welcome, setWelcome] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  
  const history = useHistory();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
  setLoading(true);
  try {
    const data = await listCourses();
    setCourses(Array.isArray(data.items) ? data.items : []); // ✅ use items array
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    setCourses([]);
  } finally {
    setLoading(false);
  }
};


  const doLogout = () => {
    localStorage.removeItem("empInfo");
    history.replace("/employee/login");
  };

  // Calculate statistics
  const totalCourses = courses.length;
  const publishedCourses = courses.filter(c => c.status === "Published").length;
  const draftCourses = courses.filter(c => c.status === "Draft").length;
  const publishRate = totalCourses > 0 ? ((publishedCourses / totalCourses) * 100).toFixed(1) : 0;

  return (
    <div className="content-dashboard-wrapper">
      {/* Sidebar */}
      <aside className="content-sidebar">
        <div className="content-sidebar-header">
          <div className="content-logo-container">
            <img src={logo} alt="Lurnity" className="content-logo" />
            <div className="content-brand-info">
              <h2 className="content-brand-title">Course Studio</h2>
              <p className="content-brand-subtitle">Content Creation</p>
            </div>
          </div>
        </div>
        
        <nav className="content-sidebar-nav">
          <div className="content-nav-section">
            <span className="content-nav-section-title">Main</span>
            <button 
              className={`content-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} 
              onClick={() => setActiveTab('dashboard')}
            >
              <FiTrendingUp />
              <span>Dashboard</span>
            </button>
            <button 
              className={`content-nav-item ${activeTab === 'courses' ? 'active' : ''}`} 
              onClick={() => setActiveTab('courses')}
            >
              <FiBook />
              <span>All Courses</span>
              {totalCourses > 0 && (
                <span className="content-nav-badge">{totalCourses}</span>
              )}
            </button>
          </div>

          <div className="content-nav-section">
            <span className="content-nav-section-title">Actions</span>
            <Link 
              to="/employee/content/new" 
              className="content-nav-item content-nav-link"
            >
              <FiPlus />
              <span>Create Course</span>
            </Link>
          </div>
        </nav>

        <div className="content-sidebar-footer">
          <div className="content-user-card">
            <div className="content-user-avatar">
              <FiUser />
            </div>
            <div className="content-user-info">
              <span className="content-user-name">{emp?.name}</span>
              <span className="content-user-role">Content Creator</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="content-main-content">
        {/* Top Header */}
        <header className="content-header">
          <div className="content-header-left">
            <div className="content-page-info">
              <h1 className="content-page-title">
                {activeTab === 'dashboard' && 'Content Dashboard'}
                {activeTab === 'courses' && 'Course Management'}
              </h1>
              <p className="content-page-subtitle">
                {activeTab === 'dashboard' && 'Overview of your course creation activities'}
                {activeTab === 'courses' && `Managing ${totalCourses} courses`}
              </p>
            </div>
          </div>
          <div className="content-header-right">
            <button className="content-header-btn" onClick={fetchCourses}>
              <FiRefreshCw />
            </button>
            <button className="content-header-btn">
              <FiBell />
            </button>
            <button className="content-logout-btn" onClick={doLogout} title="Logout">
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="content-content">
          {loading && (
            <div className="content-loading-overlay">
              <div className="content-loading-spinner">
                <div className="content-spinner"></div>
                <p>Loading...</p>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="content-dashboard">
              {/* Statistics Cards */}
              <div className="content-stats-grid">
                <div className="content-stat-card content-stat-primary">
                  <div className="content-stat-header">
                    <div className="content-stat-icon">
                      <FiBook />
                    </div>
                    <div className="content-stat-info">
                      <h3 className="content-stat-value">{totalCourses}</h3>
                      <p className="content-stat-label">Total Courses</p>
                    </div>
                  </div>
                  <div className="content-stat-footer">
                    <span className="content-stat-trend positive">
                      <FiTrendingUp />
                      All your content
                    </span>
                  </div>
                </div>

                <div className="content-stat-card content-stat-success">
                  <div className="content-stat-header">
                    <div className="content-stat-icon">
                      <FiBookOpen />
                    </div>
                    <div className="content-stat-info">
                      <h3 className="content-stat-value">{publishedCourses}</h3>
                      <p className="content-stat-label">Published</p>
                    </div>
                  </div>
                  <div className="content-stat-footer">
                    <span className="content-stat-trend positive">
                      <FiTrendingUp />
                      Live for students
                    </span>
                  </div>
                </div>

                <div className="content-stat-card content-stat-warning">
                  <div className="content-stat-header">
                    <div className="content-stat-icon">
                      <FiEdit3 />
                    </div>
                    <div className="content-stat-info">
                      <h3 className="content-stat-value">{draftCourses}</h3>
                      <p className="content-stat-label">Drafts</p>
                    </div>
                  </div>
                  <div className="content-stat-footer">
                    <span className="content-stat-trend neutral">
                      <FiActivity />
                      In progress
                    </span>
                  </div>
                </div>

                <div className="content-stat-card content-stat-info">
                  <div className="content-stat-header">
                    <div className="content-stat-icon">
                      <FiActivity />
                    </div>
                    <div className="content-stat-info">
                      <h3 className="content-stat-value">{publishRate}%</h3>
                      <p className="content-stat-label">Publish Rate</p>
                    </div>
                  </div>
                  <div className="content-stat-footer">
                    <span className="content-stat-trend positive">
                      <FiTrendingUp />
                      Completion rate
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="content-quick-actions-section">
                <div className="content-section-header">
                  <h2 className="content-section-title">Quick Actions</h2>
                  <p className="content-section-subtitle">Common course creation tasks</p>
                </div>
                <div className="content-quick-actions">
                  <Link 
                    to="/employee/content/new"
                    className="content-quick-action-card primary"
                  >
                    <div className="content-action-icon">
                      <FiPlus />
                    </div>
                    <div className="content-action-content">
                      <h3>Create Course</h3>
                      <p>Start a new course</p>
                    </div>
                  </Link>

                  <button 
                    className="content-quick-action-card secondary"
                    onClick={() => setActiveTab('courses')}
                  >
                    <div className="content-action-icon">
                      <FiEdit3 />
                    </div>
                    <div className="content-action-content">
                      <h3>Edit Drafts</h3>
                      <p>Continue working on drafts</p>
                    </div>
                  </button>

                  <button 
                    className="content-quick-action-card tertiary"
                    onClick={() => setActiveTab('courses')}
                  >
                    <div className="content-action-icon">
                      <FiEye />
                    </div>
                    <div className="content-action-content">
                      <h3>View Published</h3>
                      <p>See live courses</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recent Courses */}
              <div className="content-recent-section">
                <div className="content-section-header">
                  <h2 className="content-section-title">Recent Courses</h2>
                  <button 
                    className="content-view-all-btn"
                    onClick={() => setActiveTab('courses')}
                  >
                    View All
                  </button>
                </div>
                <div className="content-recent-courses">
                  {courses.slice(0, 3).map((course) => (
                    <div key={course.id} className="content-recent-course-item">
                      <div className="content-recent-course-header">
                        <div className="content-course-icon">
                          <FiBook />
                        </div>
                        <div className="content-course-info">
                          <h4 className="content-course-title">{course.title}</h4>
                          <p className="content-course-status">
                            Status: {course.status || 'Draft'}
                          </p>
                        </div>
                        <div className="content-course-badge">
                          <span className={`content-status-badge ${course.status === 'Published' ? 'published' : 'draft'}`}>
                            {course.status === 'Published' ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {courses.length === 0 && (
                    <div className="content-empty-placeholder">
                      <p>No courses created yet. Start by creating your first course!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="content-courses-section">
              <div className="content-section-header">
                <div className="content-section-info">
                  <h2 className="content-section-title">All Courses</h2>
                  <p className="content-section-subtitle">Manage your course content</p>
                </div>
                <div className="content-section-actions">
                  <Link 
                    to="/employee/content/new"
                    className="content-btn content-btn-primary"
                  >
                    <FiPlus />
                    Create Course
                  </Link>
                </div>
              </div>

              {courses.length === 0 ? (
                <div className="content-empty-state">
                  <div className="content-empty-icon">
                    <FiBook />
                  </div>
                  <h3 className="content-empty-title">No Courses Yet</h3>
                  <p className="content-empty-description">
                    Create your first course to start building educational content.
                  </p>
                  <Link 
                    to="/employee/content/new"
                    className="content-btn content-btn-primary"
                  >
                    <FiPlus />
                    Create Course
                  </Link>
                </div>
              ) : (
                <div className="content-courses-grid">
                  {courses.map((course) => (
                    <div key={course.id} className="content-course-card">
                      <div className="content-course-card-header">
                        <div className="content-course-main-info">
                          <div className="content-course-badge-icon">
                            {course.status === "Published" ? <FiLock /> : <FiEdit3 />}
                          </div>
                          <div className="content-course-details">
                            <h3 className="content-course-name">{course.title}</h3>
                            <p className="content-course-meta">
                              {course.status === "Published" 
                                ? "Managed by Super Admin" 
                                : "Available for editing"
                              }
                            </p>
                          </div>
                        </div>
                        <div className="content-course-status-badge">
                          <span className={`content-status-badge ${course.status === 'Published' ? 'published' : 'draft'}`}>
                            {course.status === 'Published' ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </div>

                      <div className="content-course-card-body">
                        <div className="content-course-description">
                          <p>{course.description || "No description available"}</p>
                        </div>
                      </div>

                      <div className="content-course-card-footer">
                        {course.status === "Published" ? (
                          <div className="content-course-locked">
                            <FiLock className="content-lock-icon" />
                            <span>Course is published and locked</span>
                          </div>
                        ) : (
                          <Link 
                            to={`/employee/content/${course.id}`}
                            className="content-btn content-btn-primary"
                          >
                            <FiEdit3 />
                            Edit Course
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Welcome Modal */}
      {welcome && (
        <div className="content-modal-overlay" onClick={() => setWelcome(false)}>
          <div className="content-modal" onClick={(e) => e.stopPropagation()}>
            <div className="content-modal-header">
              <h2 className="content-modal-title">Welcome, {emp.name}!</h2>
            </div>
            <div className="content-modal-body">
              <p>
                Create new courses or continue editing your drafts. 
                Published courses are managed by the Super Admin.
              </p>
            </div>
            <div className="content-modal-footer">
              <button 
                className="content-btn content-btn-success" 
                onClick={() => setWelcome(false)}
              >
                Let's get started
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
