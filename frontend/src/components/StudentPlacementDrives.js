import React, { useEffect, useState } from "react";
import DriveDetailsModal from '../components/DriveDetailsModal';
import {
  FiBriefcase, FiCalendar, FiMapPin, FiExternalLink, FiEye, FiSearch,
  FiUser, FiClock, FiDollarSign, FiFilter, FiChevronRight, FiHome,
  FiAward, FiPlayCircle, FiLogOut, FiCheckCircle,
  FiLifeBuoy, FiTool,  FiFileText, 
  FiBookmark, FiTrendingUp,  FiTarget, FiZap
} from "react-icons/fi";
import { useHistory } from "react-router-dom";
import MockInterview from './MockInterview';
import "./StudentPlacementDrives.css";


const API = process.env.REACT_APP_API_URL;

const StudentPlacementDrives = () => {
  const history = useHistory();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [scrolled, setScrolled] = useState(false);
  
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [appliedDriveIds, setAppliedDriveIds] = useState([]);
  const [isPlaced, setIsPlaced] = useState(false);
  const [placementInfo, setPlacementInfo] = useState(null);
  const [showMock, setShowMock] = useState(false);
  const [mockCompany, setMockCompany] = useState(null);

  // All your existing useEffect hooks and functions remain the same
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
                  String(s._id) === String(studentId)
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

  // All your existing handler functions remain the same
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
        alert(data.message || "Failed to apply. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
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
    <aside className="spd-sidebar">
      <div className="spd-sidebar-glass"></div>
      
      {/* Logo Section */}
      <div className="spd-sidebar-header">
        <div className="spd-logo-container">
          <img src="/lurnity_original.jpg" alt="Lurnity" className="spd-logo" />
          <div className="spd-logo-glow"></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="spd-nav">
        <div className="spd-nav-section">
          <span className="spd-nav-section-title">Learning Hub</span>
          
          <button 
            className="spd-nav-item" 
            onClick={() => history.push("/home")}
          >
            <div className="spd-nav-icon-wrapper">
              <FiHome className="spd-nav-icon" />
            </div>
            <span className="spd-nav-text">Dashboard</span>
          </button>
          
          <button 
            className="spd-nav-item" 
            onClick={() => history.push("/certificates")}
          >
            <div className="spd-nav-icon-wrapper">
              <FiAward className="spd-nav-icon" />
            </div>
            <span className="spd-nav-text">Certificates</span>
          </button>
          
          <button 
            className="spd-nav-item" 
            onClick={() => history.push("/sandbox")}
          >
            <div className="spd-nav-icon-wrapper">
              <FiPlayCircle className="spd-nav-icon" />
            </div>
            <span className="spd-nav-text">CodeSandbox</span>
          </button>
        </div>

        <div className="spd-nav-section">
          <span className="spd-nav-section-title">Career Tools</span>
          
          <button 
            className="spd-nav-item" 
            onClick={() => history.push("/home?section=labs")}
          >
            <div className="spd-nav-icon-wrapper">
              <FiTool className="spd-nav-icon" />
            </div>
            <span className="spd-nav-text">Labs</span>
          </button>
          
          <button 
            className="spd-nav-item" 
            onClick={() => history.push("/resume")}
          >
            <div className="spd-nav-icon-wrapper">
              <FiFileText className="spd-nav-icon" />
            </div>
            <span className="spd-nav-text">Resume</span>
          </button>
          
          <button className="spd-nav-item active">
            <div className="spd-nav-icon-wrapper">
              <FiBriefcase className="spd-nav-icon" />
            </div>
            <span className="spd-nav-text">Placement</span>
            <div className="spd-nav-indicator"></div>
          </button>
        </div>
      </nav>

      {/* Profile Section */}
      <div className="spd-profile-section">
        <div 
          className="spd-profile-card" 
          onClick={() => setShowMenu(!showMenu)}
        >
          <div className="spd-profile-glass"></div>
          <div className="spd-profile-content">
            <div className="spd-profile-avatar-wrapper">
              <img
                src={user?.profileImage || "/default-profile.png"}
                alt="Profile"
                className="spd-profile-avatar"
              />
            </div>
            <div className="spd-profile-info">
              <span className="spd-profile-name">{user?.name || "Student"}</span>
              <span className="spd-profile-role">Career Ready</span>
            </div>
            <FiChevronRight className="spd-profile-chevron" />
          </div>
        </div>

        {showMenu && (
          <div className="spd-profile-menu">
            <div className="spd-menu-glass"></div>
            <div className="spd-menu-content">
              <div 
                className="spd-menu-item"
                onClick={() => { history.push("/profile"); setShowMenu(false); }}
              >
                <div className="spd-menu-item-icon">
                  <FiUser />
                </div>
                <span>Edit Profile</span>
              </div>
              
              <div 
                className="spd-menu-item"
                onClick={() => { history.push("/contact"); setShowMenu(false); }}
              >
                <div className="spd-menu-item-icon">
                  <FiLifeBuoy />
                </div>
                <span>Contact Support</span>
              </div>
              
              <div 
                className="spd-menu-item logout"
                onClick={() => { localStorage.clear(); history.replace("/login"); }}
              >
                <div className="spd-menu-item-icon">
                  <FiLogOut />
                </div>
                <span>Sign Out</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );

  // Placed Success Screen
  if (isPlaced && placementInfo) {
    return (
      <div className="luxury-placement-drives-wrapper">
        <div className="spd-placed-success">
          <div className="spd-success-backdrop"></div>
          <div className="spd-success-container">
            <div className="spd-success-icon-wrapper">
              <FiCheckCircle className="spd-success-icon" />
              <div className="spd-success-icon-glow"></div>
            </div>
            <div className="spd-success-content">
              <h1 className="spd-success-title">🎉 Congratulations {user?.name || "Student"}!</h1>
              <p className="spd-success-message">
                You have been successfully placed as <strong>{placementInfo.role}</strong> at <strong>{placementInfo.company}</strong>.
              </p>
              <p className="spd-success-subtitle">Your journey to success begins now!</p>
              <a
                href={placementInfo.offerLetterURL}
                className="spd-offer-letter-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiFileText />
                <span>View Offer Letter</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="luxury-placement-drives-wrapper">
      <Sidebar />
      
      <div className="spd-main-content">
        {/* Header */}
        <header className={`spd-header ${scrolled ? "scrolled" : ""}`}>
          <div className="spd-header-glass"></div>
          <div className="spd-header-content">
            <div className="spd-header-left">
              <h1 className="spd-page-title">
                {filter === "applied" ? "My Applications" : "Placement Drives"}
              </h1>
              <p className="spd-page-subtitle">
                Your pathway to career success
              </p>
            </div>
            
            <div className="spd-header-right">
              <div className="spd-user-avatar">
                <img
                  src={user?.profileImage || "/default-profile.png"}
                  alt="Profile"
                  onClick={() => setShowMenu(!showMenu)}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="spd-content">
          {/* Toolbar */}
          <div className="spd-toolbar">
            <div className="spd-search-container">
              <div className="spd-search-wrapper">
                <FiSearch className="spd-search-icon" />
                <input
                  type="text"
                  placeholder="Search by company, role, or required skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="spd-search-input"
                />
              </div>
              
              <div className="spd-filter-badge">
                <FiFilter className="spd-filter-icon" />
                <span>Filters</span>
              </div>
            </div>

            {/* Filter Options */}
            <div className="spd-filter-options">
              <button
                className={`spd-filter-option ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                <FiTrendingUp className="spd-filter-option-icon" />
                <span>All Drives</span>
              </button>
              
              <button
                className={`spd-filter-option ${filter === "applied" ? "active" : ""}`}
                onClick={() => setFilter("applied")}
              >
                <FiBookmark className="spd-filter-option-icon" />
                <span>Applied</span>
              </button>
              
              <button
                className={`spd-filter-option ${filter === "past" ? "active" : ""}`}
                onClick={() => setFilter("past")}
              >
                <FiClock className="spd-filter-option-icon" />
                <span>Past Drives</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          {loading ? (
            <div className="spd-loading-state">
              <div className="spd-loading-spinner">
                <div className="spd-spinner-ring"></div>
                <div className="spd-spinner-ring"></div>
                <div className="spd-spinner-ring"></div>
              </div>
              <h3>Loading Career Opportunities...</h3>
              <p>Discovering the perfect roles for your skills</p>
            </div>
          ) : filteredDrives.length === 0 ? (
            <div className="spd-empty-state">
              <div className="spd-empty-icon">
                <FiBriefcase />
              </div>
              <h3>No Placement Drives Found</h3>
              <p>Try adjusting your search criteria or check back soon for new opportunities</p>
            </div>
          ) : (
            <div className="spd-drives-grid">
              {filteredDrives.map((drive) => {
                const isExpired = new Date(drive.lastDateToApply) < new Date();
                const isApplied = appliedDriveIds.includes(drive._id);
                
                return (
                  <div 
                    className={`spd-drive-card ${isExpired ? 'expired' : ''} ${isApplied ? 'applied' : ''}`} 
                    key={drive._id}
                  >
                    <div className="spd-card-glass"></div>
                    
                    {/* Applied Tag */}
                    {isApplied && (
                      <div className="spd-applied-tag">
                        <FiBookmark />
                        <span>Applied</span>
                      </div>
                    )}

                    {/* Card Header */}
                    <div className="spd-card-header">
                      <div className="spd-company-avatar">
                        <span>{drive.company[0].toUpperCase()}</span>
                        <div className="spd-company-avatar-glow"></div>
                      </div>
                      
                      <div className="spd-company-info">
                        <h3 className="spd-company-name">{drive.company}</h3>
                        <p className="spd-job-role">{drive.role}</p>
                        <div className="spd-ctc-badge">
                          <FiDollarSign className="spd-ctc-icon" />
                          <span>{drive.ctc}</span>
                        </div>
                      </div>
                      
                      <div className="spd-status-badge-wrapper">
                        {isExpired ? (
                          <span className="spd-status-badge expired">
                            <FiClock />
                            <span>Closed</span>
                          </span>
                        ) : (
                          <span className="spd-status-badge active">
                            <FiZap />
                            <span>Open</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Remarks Section for Applied Drives */}
                    {isApplied && (
                      <div className="spd-remarks-section">
                        <h4>Application Status:</h4>
                        <p>
                          {
                            drive.registered.find(s =>
                              (s.student && String(s.student._id) === String(localStorage.getItem("userId"))) ||
                              String(s._id) === String(localStorage.getItem("userId"))
                            )?.remarks || "Your application is under review. We'll update you soon!"
                          }
                        </p>
                      </div>
                    )}

                    {/* Drive Details */}
                    <div className="spd-drive-details">
                      <div className="spd-detail-item">
                        <FiMapPin className="spd-detail-icon" />
                        <span>{drive.jobLocation}</span>
                      </div>
                      <div className="spd-detail-item">
                        <FiCalendar className="spd-detail-icon" />
                        <span>Drive: {formatDate(drive.driveDate)}</span>
                      </div>
                      <div className="spd-detail-item">
                        <FiClock className="spd-detail-icon" />
                        <span>Apply by: {formatDate(drive.lastDateToApply)}</span>
                      </div>
                    </div>

                    {/* Skills Required */}
                    {drive.skillsRequired && (
                      <div className="spd-skills-section">
                        <h4>Required Skills:</h4>
                        <div className="spd-skills-container">
                          {drive.skillsRequired.split(',').map((skill, index) => (
                            <span key={index} className="spd-skill-tag">
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Card Actions */}
                    <div className="spd-card-actions">
                      <div className="spd-company-links">
                        <a 
                          href={drive.companyWebsite} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="spd-link-button"
                        >
                          <FiExternalLink />
                          <span>Website</span>
                        </a>
                        <a 
                          href={drive.companyLinkedin} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="spd-link-button"
                        >
                          <FiExternalLink />
                          <span>LinkedIn</span>
                        </a>
                      </div>
                      
                      <div className="spd-action-buttons">
                        <button 
                          className="spd-secondary-button"
                          onClick={() => handleViewDetails(drive)}
                        >
                          <FiEye />
                          <span>View Details</span>
                        </button>

                        <button 
                          className={`spd-primary-button ${
                            isExpired || isApplied ? 'disabled' : ''
                          }`}
                          disabled={isExpired || isApplied}
                          onClick={() => handleViewDetails(drive)}
                        >
                          {isExpired 
                            ? 'Applications Closed'
                            : isApplied
                              ? 'Already Applied'
                              : 'Apply Now'
                          }
                        </button>
                        
                        <button
                          className="spd-mock-button"
                          onClick={() => handleStartMock(drive.company)}
                        >
                          <FiTarget />
                          <span>Mock Interview</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
      
      {/* Modals */}
      {showDetailsModal && selectedDrive && (
        <DriveDetailsModal 
          drive={selectedDrive} 
          onClose={handleCloseModal}
          onApply={handleApply}
        />
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="spd-popup-overlay">
          <div className="spd-popup-backdrop"></div>
          <div className="spd-popup-container success">
            <div className="spd-popup-icon success">
              <FiCheckCircle />
            </div>
            <div className="spd-popup-content">
              <h3>Application Successful! 🎉</h3>
              <p>Your application has been submitted successfully. Good luck with your interview!</p>
            </div>
            <div className="spd-popup-actions">
              <button
                className="spd-popup-button"
                onClick={() => setShowSuccessPopup(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Confirm Popup */}
      {showConfirmPopup && (
        <div className="spd-popup-overlay">
          <div className="spd-popup-backdrop"></div>
          <div className="spd-popup-container warning">
            <div className="spd-popup-icon warning">
              <FiTarget />
            </div>
            <div className="spd-popup-content">
              <h3>Important Commitment Notice</h3>
              <p>Once you apply, you must attend the drive. Missing it may result in blacklisting from future placement opportunities.</p>
              <p><strong>Do you agree to proceed with this commitment?</strong></p>
            </div>
            <div className="spd-popup-actions">
              <button 
                className="spd-popup-button secondary" 
                onClick={() => confirmApplication(false)}
              >
                Cancel
              </button>
              <button 
                className="spd-popup-button primary" 
                onClick={() => confirmApplication(true)}
              >
                I Agree & Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mock Interview Modal */}
      {showMock && (
        <div className="spd-mock-overlay">
          <div className="spd-mock-container">
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
