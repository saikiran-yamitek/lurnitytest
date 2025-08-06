import React, { useEffect, useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import {
  FiHome, FiAward, FiPlayCircle, FiChevronRight,
  FiUser, FiPhone, FiLogOut, FiArrowLeft, FiDownload, FiLinkedin
} from "react-icons/fi";
import logo from "../assets/LURNITY.jpg";

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const hist = useHistory();
  const menuRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      hist.replace("/login");
      return;
    }

    fetch("http://localhost:7700/api/homepage", {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((user) => {
        setUser(user);
        return fetch(`http://localhost:7700/api/certificates/user/${user.id}`, {
          headers: { Authorization: "Bearer " + token },
        });
      })
      .then((res) => res.json())
      .then(setCertificates)
      .catch((err) => console.error("Failed to load certificates:", err));
  }, [hist]);

  const handleDownload = (certId, title) => {
    fetch(`http://localhost:7700/api/certificates/${certId}/pdf`, {
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
    <aside className="modern-sidebar">
      <div className="sidebar-glow"></div>
      <div className="sidebar-content">
        <div className="logo-section">
          <div className="logo-container">
            <img src={logo} alt="Lurnity" className="modern-logo" />
            <div className="logo-shine"></div>
          </div>
        </div>
        
        <nav className="modern-nav">
          <button 
            className="nav-btn" 
            onClick={() => hist.push("/home")}
          >
            <div className="nav-icon"><FiHome /></div>
            <span>Home</span>
            <div className="nav-glow"></div>
          </button>
          
          <button className="nav-btn active">
            <div className="nav-icon"><FiAward /></div>
            <span>Certificates</span>
            <div className="nav-glow"></div>
          </button>
          
          <button 
            className="nav-btn" 
            onClick={() => hist.push("/sandbox")}
          >
            <div className="nav-icon"><FiPlayCircle /></div>
            <span>CodeSandbox</span>
            <div className="nav-glow"></div>
          </button>
          
          
        </nav>

        <div ref={profileRef} className="profile-section" onClick={() => setShowMenu((p) => !p)}>
          <div className="profile-glass">
            <div className="profile-content">
              <img
                src={user?.profileImage || "/default-profile.png"}
                alt="Profile"
                className="profile-image"
              />
              <div className="profile-text">
                <span className="profile-name">{user?.name || ""}</span>
                <span className="profile-status">Online</span>
              </div>
              <FiChevronRight className="profile-arrow" />
            </div>
          </div>
        </div>

        {showMenu && (
          <div ref={menuRef} className="glass-menu">
            <div className="menu-backdrop"></div>
            <ul>
              <li onClick={() => { hist.push("/profile"); setShowMenu(false); }}>
                <FiUser className="menu-icon" />
                <span>Profile</span>
              </li>
              <li onClick={() => { hist.push("/contact"); setShowMenu(false); }}>
                <FiPhone className="menu-icon" />
                <span>Contact Us</span>
              </li>
              <li onClick={() => { localStorage.clear(); hist.replace("/login"); }}>
                <FiLogOut className="menu-icon" />
                <span>Log Out</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <header className="hero-banner">
          <div className="hero-background">
            <div className="gradient-orb orb-1"></div>
            <div className="gradient-orb orb-2"></div>
            <div className="gradient-orb orb-3"></div>
          </div>
          
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">Your Certificates</h1>
              <p className="hero-subtitle">Celebrate your achievements and showcase your skills</p>
            </div>
          </div>
        </header>

        {certificates.length === 0 ? (
          <div className="empty-state">
            <FiAward size={48} />
            <p>No certificates yet. Complete courses to earn certificates!</p>
          </div>
        ) : (
          <section className="course-card">
            <div className="card-glow"></div>
            <div className="card-header">
              <h3 className="card-title">Your Achievements</h3>
            </div>
            
            <div className="card-content">
              <div className="cert-grid">
                {certificates.map((cert) => (
                  <div className="cert-item" key={cert._id}>
                    <h4>{cert.subCourseTitle}</h4>
                    <p className="cert-meta">
                      <span>Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>
                    </p>
                    <div className="cert-actions">
                      <button 
                        className="cert-btn view-btn"
                        onClick={() => hist.push(`/certificate/view/${cert._id}`)}
                      >
                        View Certificate
                      </button>
                      <button 
                        className="cert-btn download-btn"
                        onClick={() => handleDownload(cert._id, cert.subCourseTitle)}
                      >
                        <FiDownload /> Download
                      </button>
                      <button 
                        className="cert-btn linkedin-btn"
                        onClick={() => alert("Coming soon: LinkedIn integration!")}
                      >
                        <FiLinkedin /> Share
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <button 
          className="back-btn"
          onClick={() => hist.push("/home")}
        >
          <FiArrowLeft /> Back to Home
        </button>
      </main>
    </div>
  );
};

export default Certificates;