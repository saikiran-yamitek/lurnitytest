import React, { useEffect, useState } from "react";
import "./TestWorkshopsPage.css";
import {
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiUser,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiTarget,
  FiAward,
  FiTrendingUp,
  FiActivity,
  FiStar,
  FiBookmark,
  FiLoader
} from "react-icons/fi";
import { FaRocket } from "react-icons/fa";

const API = process.env.REACT_APP_API_URL;

export default function TestWorkshopsPage() {
  const [workshops, setWorkshops] = useState([]);
  const [registeredIds, setRegisteredIds] = useState([]);
  const [registeredSubCourses, setRegisteredSubCourses] = useState([]);
  const [loadingIds, setLoadingIds] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${API}/api/homepage`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((u) => {
        setUser(u);

        fetch(`${API}/api/workshops`, {
          headers: { Authorization: "Bearer " + token },
        })
          .then((res) => res.json())
          .then((data) => {
            setWorkshops(data);

            // Track already registered workshops and their subCourseIdx
            const alreadyRegistered = data
              .filter((w) =>
                w.registeredStudents.some(
                  (entry) =>
                    entry.student === u.id || entry === u.id // support both formats
                )
              )
              .map((w) => ({
                id: w._id,
                subCourse: w.subCourseIdx,
              }));

            setRegisteredIds(alreadyRegistered.map((r) => r.id));
            setRegisteredSubCourses([
              ...new Set(alreadyRegistered.map((r) => r.subCourse)),
            ]);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      })
      .catch(() => setLoading(false));
  }, []);

  const handleRegister = async (id, subIdx) => {
    if (loadingIds.includes(id)) return;

    // Prevent if already registered for this subCourse
    if (registeredSubCourses.includes(subIdx)) {
      showNotification("✅ You are already registered for a workshop in this sub-course.", "warning");
      return;
    }

    setLoadingIds((prev) => [...prev, id]);

    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/workshops/${id}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ userId: user.id }),
    });

    setLoadingIds((prev) => prev.filter((item) => item !== id));

    const result = await res.json();

    if (res.ok) {
      setRegisteredIds((prev) => [...prev, id]);
      setRegisteredSubCourses((prev) => [...prev, subIdx]);

      const updated = workshops.map((w) =>
        w._id === id
          ? {
              ...w,
              registeredStudents: [...w.registeredStudents, { student: user.id }],
            }
          : w
      );
      setWorkshops(updated);
      showNotification("🎉 Successfully registered for the workshop!", "success");
    } else {
      // Show specific server response
      if (result?.error === "Already registered") {
        showNotification("✅ You are already registered for this workshop.", "info");
      } else if (result?.error === "Workshop is full") {
        showNotification("❌ Workshop is already full.", "error");
      } else {
        showNotification("❌ Registration failed due to a server error.", "error");
        console.error("Registration failed:", result);
      }
    }
  };

  const showNotification = (message, type) => {
    const notification = document.createElement('div');
    notification.className = `ltw-notification ${type}`;
    notification.innerHTML = `
      <div class="ltw-notification-glass"></div>
      <div class="ltw-notification-content">
        <div class="ltw-notification-icon">
          ${type === 'success' ? '<svg class="ltw-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>' : 
            type === 'error' ? '<svg class="ltw-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9"/><path d="15 9l-6 6"/><path d="9 9l6 6"/></svg>' : 
            type === 'warning' ? '<svg class="ltw-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 9v2l.5 3.5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg>' : 
            '<svg class="ltw-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9"/><path d="12 8v4"/><path d="12 16h.01"/></svg>'}
        </div>
        <span class="ltw-notification-text">${message}</span>
        <button class="ltw-notification-close" onclick="this.closest('.ltw-notification').remove()">
          <svg class="ltw-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="18 6L6 18"/><path d="6 6l12 12"/></svg>
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getWorkshopStatus = (workshop) => {
    const isRegistered = registeredIds.includes(workshop._id);
    const isFull = workshop.registeredStudents.length >= workshop.memberCount;
    const subCourseConflict = registeredSubCourses.includes(workshop.subCourseIdx);
    const isLoading = loadingIds.includes(workshop._id);
    
    if (isRegistered) return 'registered';
    if (isFull) return 'full';
    if (subCourseConflict) return 'conflict';
    if (isLoading) return 'loading';
    return 'available';
  };

  const getAvailableSeats = (workshop) => {
    return workshop.memberCount - workshop.registeredStudents.length;
  };

  const getSeatsPercentage = (workshop) => {
    return ((workshop.registeredStudents.length / workshop.memberCount) * 100).toFixed(0);
  };

  if (loading) {
    return (
      <div className="luxury-test-workshops-wrapper">
        <div className="ltw-background-glow"></div>
        <div className="ltw-loading-container">
          <div className="ltw-loading-spinner">
            <div className="ltw-spinner-ring"></div>
            <div className="ltw-spinner-ring"></div>
            <div className="ltw-spinner-ring"></div>
          </div>
          <div className="ltw-loading-content">
            <h3>Loading Workshops</h3>
            <p>Discovering amazing learning opportunities for you...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="luxury-test-workshops-wrapper">
      <div className="ltw-background-glow"></div>
      
      <div className="ltw-container">
        <header className="ltw-header">
          <div className="ltw-header-glass"></div>
          <div className="ltw-header-content">
            <div className="ltw-header-icon-wrapper">
              <FaRocket className="ltw-header-icon" />
              <div className="ltw-header-icon-glow"></div>
            </div>
            <div className="ltw-header-text">
              <h1 className="ltw-page-title">Explore Workshops</h1>
              <p className="ltw-page-subtitle">
                Discover hands-on learning experiences designed to enhance your skills
              </p>
            </div>
            <div className="ltw-stats">
              <div className="ltw-stat-item">
                <FiTarget className="ltw-stat-icon" />
                <div className="ltw-stat-content">
                  <span className="ltw-stat-number">{workshops.length}</span>
                  <span className="ltw-stat-label">Available</span>
                </div>
              </div>
              <div className="ltw-stat-item">
                <FiCheckCircle className="ltw-stat-icon" />
                <div className="ltw-stat-content">
                  <span className="ltw-stat-number">{registeredIds.length}</span>
                  <span className="ltw-stat-label">Registered</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="ltw-main">
          {workshops.length === 0 ? (
            <div className="ltw-empty-state">
              <div className="ltw-empty-icon-wrapper">
                <FiCalendar className="ltw-empty-icon" />
                <div className="ltw-empty-icon-glow"></div>
              </div>
              <h3 className="ltw-empty-title">No Workshops Available</h3>
              <p className="ltw-empty-description">
                There are currently no workshops scheduled. Check back soon for exciting learning opportunities!
              </p>
            </div>
          ) : (
            <div className="ltw-workshops-grid">
              {workshops.map((workshop) => {
                const status = getWorkshopStatus(workshop);
                const availableSeats = getAvailableSeats(workshop);
                const seatsPercentage = getSeatsPercentage(workshop);

                return (
                  <div key={workshop._id} className={`ltw-workshop-card ${status}`}>
                    <div className="ltw-card-glass"></div>
                    
                    <div className="ltw-card-content">
                      <div className="ltw-card-header">
                        <div className="ltw-workshop-icon-wrapper">
                          <FiBookmark className="ltw-workshop-icon" />
                          <div className="ltw-workshop-icon-glow"></div>
                        </div>
                        
                        <div className="ltw-workshop-info">
                          <h3 className="ltw-workshop-name">{workshop.labName}</h3>
                          <div className="ltw-workshop-meta">
                            <div className="ltw-meta-item">
                              <FiCalendar className="ltw-meta-icon" />
                              <span>{formatDate(workshop.time)}</span>
                            </div>
                            <div className="ltw-meta-item">
                              <FiClock className="ltw-meta-icon" />
                              <span>{formatTime(workshop.time)}</span>
                            </div>
                          </div>
                        </div>

                        <div className={`ltw-status-badge ${status}`}>
                          {status === 'registered' && <FiCheckCircle className="ltw-status-icon" />}
                          {status === 'full' && <FiXCircle className="ltw-status-icon" />}
                          {status === 'conflict' && <FiAlertCircle className="ltw-status-icon" />}
                          {status === 'loading' && <FiLoader className="ltw-status-icon spinning" />}
                          {status === 'available' && <FiStar className="ltw-status-icon" />}
                          
                          <span className="ltw-status-text">
                            {status === 'registered' && 'Registered'}
                            {status === 'full' && 'Full'}
                            {status === 'conflict' && 'Enrolled'}
                            {status === 'loading' && 'Processing'}
                            {status === 'available' && 'Available'}
                          </span>
                        </div>
                      </div>

                      <div className="ltw-workshop-details">
                        <div className="ltw-detail-item">
                          <div className="ltw-detail-icon-wrapper">
                            <FiMapPin className="ltw-detail-icon" />
                          </div>
                          <div className="ltw-detail-content">
                            <span className="ltw-detail-label">Location</span>
                            <span className="ltw-detail-value">{workshop.labAddress}</span>
                          </div>
                        </div>

                        <div className="ltw-detail-item">
                          <div className="ltw-detail-icon-wrapper">
                            <FiUser className="ltw-detail-icon" />
                          </div>
                          <div className="ltw-detail-content">
                            <span className="ltw-detail-label">Instructor</span>
                            <span className="ltw-detail-value">{workshop.inchargeId?.name || "TBA"}</span>
                          </div>
                        </div>

                        <div className="ltw-detail-item">
                          <div className="ltw-detail-icon-wrapper">
                            <FiUsers className="ltw-detail-icon" />
                          </div>
                          <div className="ltw-detail-content">
                            <span className="ltw-detail-label">Capacity</span>
                            <div className="ltw-capacity-info">
                              <span className="ltw-detail-value">
                                {availableSeats} of {workshop.memberCount} available
                              </span>
                              <div className="ltw-capacity-bar">
                                <div 
                                  className="ltw-capacity-fill"
                                  style={{ width: `${seatsPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="ltw-card-actions">
                        {status === 'registered' ? (
                          <button className="ltw-action-btn registered" disabled>
                            <FiCheckCircle className="ltw-btn-icon" />
                            <span>Successfully Registered</span>
                          </button>
                        ) : status === 'full' ? (
                          <button className="ltw-action-btn full" disabled>
                            <FiXCircle className="ltw-btn-icon" />
                            <span>Workshop Full</span>
                          </button>
                        ) : status === 'conflict' ? (
                          <button className="ltw-action-btn conflict" disabled>
                            <FiAlertCircle className="ltw-btn-icon" />
                            <span>Already Enrolled in Sub-course</span>
                          </button>
                        ) : status === 'loading' ? (
                          <button className="ltw-action-btn loading" disabled>
                            <FiLoader className="ltw-btn-icon spinning" />
                            <span>Registering...</span>
                          </button>
                        ) : (
                          <button
                            className="ltw-action-btn available"
                            onClick={() => handleRegister(workshop._id, workshop.subCourseIdx)}
                          >
                            <FaRocket className="ltw-btn-icon" />
                            <span>Register Now</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {workshops.length > 0 && (
          <footer className="ltw-footer">
            <div className="ltw-footer-glass"></div>
            <div className="ltw-footer-content">
              <div className="ltw-footer-stats">
                <div className="ltw-footer-stat">
                  <FiActivity className="ltw-footer-icon" />
                  <span>{workshops.length} total workshops</span>
                </div>
                <div className="ltw-footer-stat">
                  <FiTrendingUp className="ltw-footer-icon" />
                  <span>{registeredIds.length} registrations completed</span>
                </div>
                <div className="ltw-footer-stat">
                  <FiAward className="ltw-footer-icon" />
                  <span>Premium learning experiences</span>
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
