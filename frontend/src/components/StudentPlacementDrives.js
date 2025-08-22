import React, { useEffect, useState } from "react";
import DriveDetailsModal from '../components/DriveDetailsModal';
import {
  FiBriefcase,
  FiCalendar,
  FiMapPin,
  FiExternalLink,
  FiEye,
  FiSearch,
  FiUser,
  FiClock,
  FiDollarSign,
  FiFilter,
  FiChevronRight,
  FiHome,
  FiAward,
  FiPlayCircle,
  FiLogOut,
  FiCheckCircle,
  FiHelpCircle,
  FiLifeBuoy,
  FiTool,
  FiRefreshCw,
  FiLock,
  FiFileText
} from "react-icons/fi";
import { useHistory } from "react-router-dom";
import MockInterview from './MockInterview';
import "./StudentPlacementDrives.css";

const API = "http://localhost:7700";

const StudentPlacementDrives = () => {
  const history = useHistory();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [selectedSection, setSelectedSection] = useState("placement");
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [appliedDriveIds, setAppliedDriveIds] = useState([]);
  const [isPlaced, setIsPlaced] = useState(false);
const [placementInfo, setPlacementInfo] = useState(null); // for showing offer letter
const [showMock, setShowMock] = useState(false);
const [mockCompany, setMockCompany] = useState(null);




  useEffect(() => {




    const fetchUser = async () => {
        
  try {
    const res = await fetch(`${API}/api/homepage`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") }
    });
    const data = await res.json();
    setUser(data);

    const studentId = localStorage.getItem("userId");
    
        

    if (studentId) {
      const res2 = await fetch(`${API}/api/placements`);
      const drivesData = await res2.json();
      console.log("Drives fetched:", drivesData);


      const applied = [];
      let foundPlacement = null;

      for (const drive of drivesData) {
        
        for (const student of drive.registered) {
  if (
    student.student && 
    String(student.student._id) === String(studentId) &&
    String(student.status).toUpperCase() === "PLACED"
  ) {
    foundPlacement = {
      company: drive.company,
      role: drive.role,
      offerLetterURL: student.offerLetterURL
    };
    break;
  }
}


        if (
  drive.registered.some(
    s =>
      (s.student && String(s.student._id) === String(studentId)) ||
      String(s._id) === String(studentId) // fallback in case the student object is flat
  )
) {
  applied.push(drive._id);
}

      }
      

      if (foundPlacement) {
        setIsPlaced(true);
        setPlacementInfo(foundPlacement);
      }

      setAppliedDriveIds(applied);
    }
  } catch (err) {
    console.error("Error fetching user or drives", err);
  }
  
};



    fetchUser();
  }, []);

  

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchDrives = async () => {
      try {
        const res = await fetch(`${API}/api/placements`);
        const data = await res.json();
        setDrives(data);
      } catch (err) {
        console.error("Error fetching drives", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDrives();
  }, []);

  const handleViewDetails = (drive) => {
    setSelectedDrive(drive);
    setShowDetailsModal(true);
  };

  const handleStartMock = (company) => {
  setMockCompany(company);
  setShowMock(true);
};

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedDrive(null);
  };

  const handleApply = async () => {
    setShowDetailsModal(false);
    setShowConfirmPopup(true);
  };

  const confirmApplication = async (confirmed) => {
    setShowConfirmPopup(false);
    
    if (!confirmed) {
      setShowDetailsModal(true);
      return;
    }

    const studentId = localStorage.getItem("userId");


    if (!studentId) {
      // Show error popup instead of alert
      setShowConfirmPopup(true);
      return;
    }

    try {
      const res = await fetch(`${API}/api/placements/register/${selectedDrive._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ studentId })
      });

      const data = await res.json();
      if (res.ok) {
        setAppliedDriveIds(prev => [...prev, selectedDrive._id]); 
  setShowSuccessPopup(true);
} else {
  alert(data.message || "Failed to apply. Please try again."); // or handle error popup
}
    } catch (err) {
      console.error("Registration error:", err);
      // Show error popup
      setShowConfirmPopup(true);
    }
  };

  const filteredDrives = drives.filter((drive) => {
    const isPastDrive = new Date(drive.lastDateToApply) <= new Date();
    const matchesFilter =
  (filter === "all" && !isPastDrive) ||
  (filter === "applied" && appliedDriveIds.includes(drive._id)) ||
  (filter === "past" && isPastDrive);


    const matchesSearch =
      drive.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drive.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drive.skillsRequired.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const Sidebar = () => (
    <aside className="sidebar">
      <div className="sidebar-top">
        <img src="/LURNITY.jpg" alt="Lurnity" className="logo" />
        <nav className="nav-list">
          <button className={`nav-item ${selectedSection === "home" ? "active" : ""}`} onClick={() => history.push("/home")}>
            <FiHome /><span>Home</span>
          </button>
          <button className="nav-item" onClick={() => history.push("/certificates")}>
            <FiAward /><span>Certificates</span>
          </button>
          <button className="nav-item" onClick={() => history.push("/sandbox")}>
            <FiPlayCircle /><span>CodeSandbox</span>
          </button>
          <button className={`nav-item ${selectedSection === "labs" ? "active" : ""}`} onClick={() => history.push("/home?section=labs")}>
            <FiTool /><span>Registered Labs</span>
          </button>
          <button className="nav-item" onClick={() => history.push("/resume")}>
            <FiFileText /><span>Resume</span>
          </button>
          <button className={`nav-item active`}>
            <FiBriefcase /><span>Placement</span>
          </button>
        </nav>
      </div>

      <div className="profile-bar" onClick={() => setShowMenu(!showMenu)}>
        <div className="profile-info">
          <img
            src={user?.profileImage || "/default-profile.png"}
            alt="Profile"
            className="profile-avatar"
          />
          <span className="profile-name">{user?.name || "User"}</span>
        </div>
        <FiChevronRight size={18} />
      </div>

      {showMenu && (
        <div className="popup-menu">
          <ul>
            <li onClick={() => { history.push("/profile"); setShowMenu(false); }}>
              <FiUser className="menu-ico" /><span>Profile</span>
            </li>
            <li onClick={() => { history.push("/contact"); setShowMenu(false); }}>
              <FiLifeBuoy className="menu-ico" /><span>Contact Us</span>
            </li>
            <li onClick={() => { localStorage.clear(); history.replace("/login"); }}>
              <FiLogOut className="menu-ico" /><span>Log Out</span>
            </li>
          </ul>
        </div>
      )}
    </aside>
  );


  
 if (isPlaced && placementInfo) {
  return (
    <div className="placed-success-container">
      <div className="cheer-box">
        <h2>🎉 Congratulations {user?.name || "Student"}!</h2>
        <p>You have been placed as <strong>{placementInfo.role}</strong> at <strong>{placementInfo.company}</strong>.</p>
        <p>Your offer letter:</p>
        <a
          href={placementInfo.offerLetterURL}
          className="btn btn-success mt-3"
          target="_blank"
          rel="noopener noreferrer"
        >
          View Offer Letter
        </a>
      </div>
    </div>
  );
}

  return (
    <div className="app-container">
        
      <Sidebar />
      
      <div className="main-content">
        <header className={`app-header ${scrolled ? "scrolled" : ""}`}>
          <div className="header-content">
            <h1 className="page-title">
  {filter === "applied" ? "Applied Drives" : "Placement Drives"}
</h1>

            <div className="user-avatar">
              <img
                src={user?.profileImage || "/default-profile.png"}
                alt="Profile"
                onClick={() => setShowMenu(!showMenu)}
              />
            </div>
          </div>
        </header>

        <main className="content-area">
          <div className="toolbar">
            <div className="search-filter-container">
              <div className="search-wrapper">
                <input
                  type="text"
                  placeholder="Search drives by company, role or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <div className="filter-toggle">
                  <FiFilter size={16} />
                  <span>Filter</span>
                </div>
              </div>

              <div className="filter-options">
                <button
                  className={`filter-option ${filter === "all" ? "active" : ""}`}
                  onClick={() => setFilter("all")}
                >
                  All Drives
                </button>
                <button
  className={`filter-option ${filter === "applied" ? "active" : ""}`}
  onClick={() => setFilter("applied")}
>
  Applied Drives
</button>

                <button
                  className={`filter-option ${filter === "past" ? "active" : ""}`}
                  onClick={() => setFilter("past")}
                >
                  Past Drives
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading opportunities...</p>
            </div>
          ) : filteredDrives.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FiBriefcase size={48} />
              </div>
              <h3>No placement drives found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="drives-grid">
              {filteredDrives.map((drive) => (
                <div 
                  className={`drive-card ${new Date(drive.lastDateToApply) < new Date() ? 'expired' : ''}`} 
                  key={drive._id}
                >
                  {appliedDriveIds.includes(drive._id) && (
  <div className="applied-tag">Applied</div>
)}

                  <div className="drive-header">
                    <div className="company-avatar">
                      {drive.company[0].toUpperCase()}
                    </div>
                    <div className="company-info">
                      <h3>{drive.company}</h3>
                      <p className="job-role">{drive.role}</p>
                      <div className="ctc-badge">
                        <FiDollarSign size={14} />
                        <span>{drive.ctc}</span>
                      </div>
                    </div>
                    {new Date(drive.lastDateToApply) < new Date() ? (
                      <span className="status-badge expired">Closed</span>
                    ) : (
                      <span className="status-badge active">Open</span>
                    )}
                  </div>
                  {appliedDriveIds.includes(drive._id) && (
  <div className="remarks-section">
    <h4>Remarks:</h4>
    <p>
      {
        drive.registered.find(s =>
          (s.student && String(s.student._id) === String(localStorage.getItem("userId"))) ||
          String(s._id) === String(localStorage.getItem("userId"))
        )?.remarks || "No remarks given yet."
      }
    </p>
  </div>
)}


                  <div className="drive-details">
                    <div className="detail-item">
                      <FiMapPin className="detail-icon" />
                      <span>{drive.jobLocation}</span>
                    </div>
                    <div className="detail-item">
                      <FiCalendar className="detail-icon" />
                      <span>Drive: {formatDate(drive.driveDate)}</span>
                    </div>
                    <div className="detail-item">
                      <FiClock className="detail-icon" />
                      <span>Apply by: {formatDate(drive.lastDateToApply)}</span>
                    </div>
                  </div>

                  {drive.skillsRequired && (
                    <div className="skills-list">
                      <h4>Skills Required:</h4>
                      <div className="skills-container">
                        {drive.skillsRequired.split(',').map((skill, index) => (
                          <span key={index} className="skill-tag">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="drive-actions">
                    <div className="company-links">
                      <a href={drive.companyWebsite} target="_blank" rel="noopener noreferrer" className="link-button">
                        <FiExternalLink /> Website
                      </a>
                      <a href={drive.companyLinkedin} target="_blank" rel="noopener noreferrer" className="link-button">
                        <FiExternalLink /> LinkedIn
                      </a>
                    </div>
                    <div className="action-buttons">
  <button 
    className="secondary-button"
    onClick={() => handleViewDetails(drive)}
  >
    <FiEye /> View Details
  </button>

  <button 
    className={`primary-button ${
      new Date(drive.lastDateToApply) < new Date() || appliedDriveIds.includes(drive._id)
        ? 'disabled' : ''
    }`}
    disabled={
      new Date(drive.lastDateToApply) < new Date() || appliedDriveIds.includes(drive._id)
    }
    onClick={() => handleViewDetails(drive)}
  >
    {
      new Date(drive.lastDateToApply) < new Date()
        ? 'Applications Closed'
        : appliedDriveIds.includes(drive._id)
          ? 'Already Applied'
          : 'Apply Now'
    }
  </button>
  <button
  className="secondary-button"
  onClick={() => handleStartMock(drive.company)}
>
  🎮 Mock Interview
</button>
</div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      
      {showDetailsModal && selectedDrive && (
        <DriveDetailsModal 
          drive={selectedDrive} 
          onClose={handleCloseModal}
          onApply={handleApply}
        />
      )}

        {showSuccessPopup && (
  <div className="popup-overlay">
    <div className="popup-card">
      <h3>✅ Application Successful</h3>
      <p>You have successfully applied for the drive.</p>
      <div className="popup-actions">
        <button
          className="primary-button"
          onClick={() => setShowSuccessPopup(false)}
          style={{ padding: '8px 16px' }}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
      
      {showConfirmPopup && (
        <div className="popup-overlay">
          <div className="popup-card">
            <h3>⚠️ Important Notice</h3>
            <p>Once you apply, you must attend the drive. If you miss it, you may be blacklisted from further placements.</p>
            <p>Do you agree to continue?</p>
            <div className="popup-actions">
              <button 
                className="secondary-button" 
                onClick={() => confirmApplication(false)}
                style={{ padding: '8px 16px' }}
              >
                Cancel
              </button>
              <button 
                className="primary-button" 
                onClick={() => confirmApplication(true)}
                style={{ padding: '8px 16px' }}
              >
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}

      {showMock && (
  <div className="popup-overlay" style={{ zIndex: 9999 }}>
    <div className="popup-card" style={{ width: '95%', maxWidth: '1100px', padding: 0 }}>
      <MockInterview
        companyName={mockCompany}
        user={user}
        skills={user?.currentExpertise?.knownSkills || []}
        onExit={() => { setShowMock(false); setMockCompany(null); }}
      />
    </div>
  </div>
)}

    </div>
  );
};

export default StudentPlacementDrives;