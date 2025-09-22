import React, { useEffect, useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import {
  FiHome, FiAward, FiPlayCircle, FiChevronRight,
  FiUser, FiPhone, FiLogOut, FiArrowLeft, FiDownload, 
  FiLinkedin, FiClock, FiCalendar, FiStar, FiTrendingUp,
  FiEye
} from "react-icons/fi";
import logo from "../assets/LURNITY.jpg";
import "./Certificates.css";
const API = process.env.REACT_APP_API_URL;

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const hist = useHistory();
  const menuRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      hist.replace("/login");
      return;
    }

    setLoading(true);
    fetch(`${API}/api/user/homepage`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((user) => {
        setUser(user);
        return fetch(`${API}/api/certificates/user/${user.id}`, {
          headers: { Authorization: "Bearer " + token },
        });
      })
      .then((res) => res.json())
      .then((certs) => {
  // If backend returns { Items: [...] }, use Items; else fallback to certs array
  setCertificates(Array.isArray(certs) ? certs : certs.Items || []);
  setLoading(false);
})

      .catch((err) => {
        console.error("Failed to load certificates:", err);
        setLoading(false);
      });
  }, [hist]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) &&
          profileRef.current && !profileRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDownload = (certId, title) => {
    fetch(`${API}/api/certificates/${certId}/pdf`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    })
      .then((res) => {
        if (!res.ok) throw new Error("File not found");
        return res.blob();
      })
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${title}_Certificate.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((err) => alert("Download failed: " + err.message));
  };

  const Sidebar = () => (
    <aside className="cert-sidebar">
      <div className="cert-sidebar-backdrop"></div>
      <div className="cert-sidebar-content">
        <div className="cert-logo-section">
          <div className="cert-logo-container">
            <img src={logo} alt="Lurnity" className="cert-logo" />
            <div className="cert-logo-glow"></div>
          </div>
        </div>
        
        <nav className="cert-nav">
          <button 
            className="cert-nav-btn" 
            onClick={() => hist.push("/home")}
          >
            <div className="cert-nav-icon-wrapper">
              <FiHome className="cert-nav-icon" />
            </div>
            <span className="cert-nav-text">Dashboard</span>
            <div className="cert-nav-glow"></div>
          </button>
          
          <button className="cert-nav-btn active">
            <div className="cert-nav-icon-wrapper">
              <FiAward className="cert-nav-icon" />
            </div>
            <span className="cert-nav-text">Certificates</span>
            <div className="cert-nav-glow"></div>
          </button>
          
          <button 
            className="cert-nav-btn" 
            onClick={() => hist.push("/sandbox")}
          >
            <div className="cert-nav-icon-wrapper">
              <FiPlayCircle className="cert-nav-icon" />
            </div>
            <span className="cert-nav-text">CodeSandbox</span>
            <div className="cert-nav-glow"></div>
          </button>
        </nav>

        <div ref={profileRef} className="cert-profile-section" onClick={() => setShowMenu((p) => !p)}>
          <div className="cert-profile-container">
            <div className="cert-profile-content">
              <div className="cert-profile-avatar">
                <img
                  src={user?.profileImage || "/default-profile.png"}
                  alt="Profile"
                  className="cert-profile-image"
                />
                <div className="cert-profile-status"></div>
              </div>
              <div className="cert-profile-info">
                <span className="cert-profile-name">{user?.name || "Student"}</span>
                <span className="cert-profile-role">Premium Member</span>
              </div>
              <FiChevronRight className={`cert-profile-arrow ${showMenu ? 'rotated' : ''}`} />
            </div>
          </div>
        </div>

        {showMenu && (
          <div ref={menuRef} className="cert-profile-menu">
            <div className="cert-menu-backdrop"></div>
            <div className="cert-menu-content">
              <div className="cert-menu-item" onClick={() => { hist.push("/profile"); setShowMenu(false); }}>
                <div className="cert-menu-icon-wrapper">
                  <FiUser className="cert-menu-icon" />
                </div>
                <span>Profile Settings</span>
                <FiChevronRight className="cert-menu-arrow" />
              </div>
              <div className="cert-menu-item" onClick={() => { hist.push("/contact"); setShowMenu(false); }}>
                <div className="cert-menu-icon-wrapper">
                  <FiPhone className="cert-menu-icon" />
                </div>
                <span>Contact Support</span>
                <FiChevronRight className="cert-menu-arrow" />
              </div>
              <div className="cert-menu-divider"></div>
              <div className="cert-menu-item danger" onClick={() => { localStorage.clear(); hist.replace("/login"); }}>
                <div className="cert-menu-icon-wrapper">
                  <FiLogOut className="cert-menu-icon" />
                </div>
                <span>Sign Out</span>
                <FiChevronRight className="cert-menu-arrow" />
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );

  const StatCard = ({ icon: Icon, title, value, subtitle }) => (
    <div className="cert-stat-card">
      <div className="cert-stat-backdrop"></div>
      <div className="cert-stat-content">
        <div className="cert-stat-icon-wrapper">
          <Icon className="cert-stat-icon" />
        </div>
        <div className="cert-stat-info">
          <h3 className="cert-stat-value">{value}</h3>
          <p className="cert-stat-title">{title}</p>
          {subtitle && <span className="cert-stat-subtitle">{subtitle}</span>}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="certificates-luxury-wrapper">
        <div className="cert-loading-container">
          <div className="cert-loading-backdrop">
            <div className="cert-loading-aurora"></div>
          </div>
          <div className="cert-loading-content">
            <div className="cert-loading-spinner">
              <div className="cert-spinner-ring"></div>
              <div className="cert-spinner-ring"></div>
              <div className="cert-spinner-ring"></div>
            </div>
            <h3>Loading Your Achievements</h3>
            <p>Preparing your certificate portfolio...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="certificates-luxury-wrapper">
      <div className="cert-app-container">
        <Sidebar />
        
        <main className="cert-main-content">
          {/* Hero Header */}
          <section className="cert-hero-section">
            <div className="cert-hero-backdrop">
              <div className="cert-gradient-orb cert-orb-1"></div>
              <div className="cert-gradient-orb cert-orb-2"></div>
              <div className="cert-gradient-orb cert-orb-3"></div>
            </div>
            
            <div className="cert-hero-content">
              <div className="cert-hero-text">
                <div className="cert-hero-badge">
                  <FiAward className="cert-badge-icon" />
                  <span>Your Achievements</span>
                </div>
                <h1 className="cert-hero-title">Certificate Portfolio</h1>
                <p className="cert-hero-subtitle">
                  Showcase your skills and celebrate your learning milestones with verified certificates
                </p>
              </div>
            </div>
          </section>

          {/* Stats Overview */}
          <section className="cert-stats-section">
            <div className="cert-stats-grid">
              <StatCard 
                icon={FiAward}
                title="Total Certificates"
                value={certificates.length}
                subtitle="Earned through dedication"
              />
              <StatCard 
                icon={FiTrendingUp}
                title="Completion Rate"
                value="98%"
                subtitle="Above average performance"
              />
              <StatCard 
                icon={FiCalendar}
                title="This Month"
                value={certificates.filter(cert => {
                  const certDate = new Date(cert.issueDate);
                  const now = new Date();
                  return certDate.getMonth() === now.getMonth() && certDate.getFullYear() === now.getFullYear();
                }).length}
                subtitle="New achievements"
              />
            </div>
          </section>

          {/* Certificates Content */}
          {certificates.length === 0 ? (
            <section className="cert-empty-state">
              <div className="cert-empty-backdrop"></div>
              <div className="cert-empty-content">
                <div className="cert-empty-icon">
                  <FiAward size={64} />
                </div>
                <h2>Start Your Journey</h2>
                <p>Complete courses to earn your first certificate and showcase your achievements</p>
                <button className="cert-cta-btn" onClick={() => hist.push("/home")}>
                  <FiHome /> Explore Courses
                </button>
              </div>
            </section>
          ) : (
            <section className="cert-content-section">
              <div className="cert-section-header">
                <div className="cert-header-content">
                  <h2 className="cert-section-title">Your Certificates</h2>
                  <p className="cert-section-subtitle">
                    {certificates.length} achievement{certificates.length !== 1 ? 's' : ''} unlocked
                  </p>
                </div>
              </div>
              
              <div className="cert-grid">
                {certificates.map((cert) => (
                  <div className="cert-card" key={cert.id}>
                    <div className="cert-card-backdrop"></div>
                    <div className="cert-card-header">
                      <div className="cert-card-badge">
                        <FiAward className="cert-card-badge-icon" />
                      </div>
                      <div className="cert-card-status">
                        <span className="cert-status-indicator"></span>
                        <span className="cert-status-text">Verified</span>
                      </div>
                    </div>
                    
                    <div className="cert-card-content">
                      <h3 className="cert-card-title">{cert.subCourseTitle}</h3>
                      <div className="cert-card-meta">
                        <div className="cert-meta-item">
                          <FiCalendar className="cert-meta-icon" />
                          <span>Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="cert-meta-item">
                          <FiClock className="cert-meta-icon" />
                          <span>Lifetime Valid</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="cert-card-actions">
                      <button 
                        className="cert-action-btn primary"
                        onClick={() => hist.push(`/certificate/view/${cert.id}`)}
                      >
                        <FiEye className="cert-btn-icon" />
                        <span>View</span>
                      </button>
                      <button 
                        className="cert-action-btn secondary"
                        onClick={() => handleDownload(cert.id, cert.subCourseTitle)}
                      >
                        <FiDownload className="cert-btn-icon" />
                        <span>Download</span>
                      </button>
                      <button 
                        className="cert-action-btn tertiary"
                        onClick={() => alert("Coming soon: LinkedIn integration!")}
                      >
                        <FiLinkedin className="cert-btn-icon" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Back Button */}
          <div className="cert-back-section">
            <button 
              className="cert-back-btn"
              onClick={() => hist.push("/home")}
            >
              <FiArrowLeft className="cert-back-icon" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Certificates;
