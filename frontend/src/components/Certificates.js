import React, { useEffect, useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import "./Certificates.css";
import logo from "../assets/LURNITY.jpg";
import {
  FiHome, FiAward, FiPlayCircle, FiChevronRight,
  FiUser, FiPhone, FiLogOut, FiArrowLeft, FiDownload, FiLinkedin
} from "react-icons/fi";

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
      // ✅ Fetch only this user's certificates
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
    <aside className="sidebarr">
      <div className="sidebar-top">
        <img src={logo} alt="Lurnity" className="logo" />
        <nav className="nav-list">
          <button className="nav-item" onClick={() => hist.push("/home")}> <FiHome /> <span>Home</span> </button>
          <button className="nav-item active"> <FiAward /> <span>Certificates</span> </button>
          <button className="nav-item" onClick={() => hist.push("/sandbox")}> <FiPlayCircle /> <span>CodeSandbox</span> </button>
          <button className="nav-item placeholder" />
          <button className="nav-item placeholder" />
          <button className="nav-item placeholder" />
        </nav>
      </div>

      <div
        ref={profileRef}
        className="profile-bar"
        onClick={() => setShowMenu((p) => !p)}
      >
        <span className="profile-name">{user?.name || ""}</span>
        <FiChevronRight size={18} />
      </div>

      {showMenu && (
        <div ref={menuRef} className="popup-menu">
          <ul>
            <li onClick={() => { hist.push("/profile"); setShowMenu(false); }}> <FiUser className="menu-ico" /> <span>Profile</span> </li>
            <li onClick={() => { hist.push("/contact"); setShowMenu(false); }}> <FiPhone className="menu-ico" /> <span>Contact Us</span> </li>
            <li onClick={() => { localStorage.removeItem("token"); hist.replace("/login"); }}> <FiLogOut className="menu-ico" /> <span>Log Out</span> </li>
          </ul>
        </div>
      )}
    </aside>
  );

  return (
    <div className="page-wrapper">
      <Sidebar />

      <main className="cert-main">
        <header className="cert-header">
          <h2>🎓 Your Achievements</h2>
        </header>

        {certificates.length === 0 ? (
          <p className="cert-empty">No certificates yet.</p>
        ) : (
          <div className="cert-grid">
            {certificates.map((cert) => (
              <div className="cert-card" key={cert._id}>
                <h3>{cert.subCourseTitle}</h3>
                <p><strong>Issued on:</strong> {new Date(cert.issueDate).toLocaleDateString()}</p>
                <div className="cert-actions">
                  <button className="cert-link" onClick={() => hist.push(`/certificate/view/${cert._id}`)}>View</button>
                  <button className="cert-linkedin" onClick={() => alert("Coming soon: LinkedIn integration!")}> <FiLinkedin /> Add to LinkedIn </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button className="cert-back-btn" onClick={() => hist.push("/home")}> <FiArrowLeft size={18} /> Go Back to Home </button>
      </main>
    </div>
  );
};

export default Certificates;
