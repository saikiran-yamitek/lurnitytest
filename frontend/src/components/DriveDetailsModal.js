import React from "react";
import {
  FiBriefcase, FiCalendar, FiMapPin, FiExternalLink, FiClock,
  FiDollarSign, FiX, FiFileText, FiCheckCircle, FiUser,
  FiStar, FiAward, FiTrendingUp, FiGlobe, FiLinkedin,
  FiTarget, FiUsers, FiCpu,FiSend
} from "react-icons/fi";
import "./DriveDetailsModal.css";

const DriveDetailsModal = ({ drive, onClose, onApply }) => {
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isExpired = new Date(drive.lastDateToApply) < new Date();
  const daysLeft = Math.ceil((new Date(drive.lastDateToApply) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="luxury-drive-modal-wrapper">
      <div className="ldrive-overlay">
        <div className="ldrive-backdrop"></div>
        <div className="ldrive-container">
          
          {/* Premium Header */}
          <div className="ldrive-header">
            <div className="ldrive-header-glow"></div>
            <div className="ldrive-header-content">
              <div className="ldrive-company-brand">
                <div className="ldrive-company-icon">
                  <FiBriefcase className="ldrive-company-svg" />
                  <div className="ldrive-company-glow"></div>
                </div>
                <div className="ldrive-company-info">
                  <h2 className="ldrive-company-name">{drive.company}</h2>
                  <p className="ldrive-role-title">{drive.role}</p>
                </div>
              </div>
              
              <div className="ldrive-header-actions">
                <div className="ldrive-status-badge">
                  <div className={`ldrive-status-dot ${isExpired ? 'expired' : 'active'}`}></div>
                  <span className="ldrive-status-text">
                    {isExpired ? 'Closed' : daysLeft > 0 ? `${daysLeft} days left` : 'Last day'}
                  </span>
                </div>
                
                <button className="ldrive-close-btn" onClick={onClose} title="Close">
                  <FiX className="ldrive-close-icon" />
                </button>
              </div>
            </div>
          </div>

          <div className="ldrive-main-content">
            
            {/* Left Content */}
            <div className="ldrive-content-left">
              
              {/* Key Details Section */}
              <div className="ldrive-details-section">
                <div className="ldrive-section-header">
                  <div className="ldrive-section-icon">
                    <FiTarget />
                  </div>
                  <h3 className="ldrive-section-title">Position Details</h3>
                </div>
                
                <div className="ldrive-details-grid">
                  <DetailCard 
                    icon={<FiBriefcase />} 
                    label="Job Role" 
                    value={drive.role}
                    gradient="linear-gradient(135deg, #3b82f6, #1d4ed8)"
                  />
                  <DetailCard 
                    icon={<FiDollarSign />} 
                    label="Package (CTC)" 
                    value={drive.ctc}
                    gradient="linear-gradient(135deg, #10b981, #059669)"
                  />
                  <DetailCard 
                    icon={<FiMapPin />} 
                    label="Location" 
                    value={drive.jobLocation}
                    gradient="linear-gradient(135deg, #f59e0b, #d97706)"
                  />
                  <DetailCard 
                    icon={<FiCalendar />} 
                    label="Drive Date" 
                    value={formatDate(drive.driveDate)}
                    gradient="linear-gradient(135deg, #8b5cf6, #7c3aed)"
                  />
                  <DetailCard 
                    icon={<FiClock />} 
                    label="Application Deadline" 
                    value={formatDate(drive.lastDateToApply)}
                    gradient="linear-gradient(135deg, #ef4444, #dc2626)"
                  />
                  <DetailCard 
                    icon={<FiCheckCircle />} 
                    label="Eligibility" 
                    value={drive.eligibilityCriteria}
                    gradient="linear-gradient(135deg, #06b6d4, #0891b2)"
                  />
                </div>
              </div>

              {/* Skills Section */}
              {drive.skillsRequired && (
                <div className="ldrive-skills-section">
                  <div className="ldrive-section-header">
                    <div className="ldrive-section-icon">
                      <FiCpu />
                    </div>
                    <h3 className="ldrive-section-title">Required Skills</h3>
                  </div>
                  
                  <div className="ldrive-skills-container">
                    {drive.skillsRequired.split(',').map((skill, idx) => (
                      <div key={idx} className="ldrive-skill-tag">
                        <span className="ldrive-skill-text">{skill.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description Sections */}
              <div className="ldrive-descriptions">
                <DescriptionSection 
                  icon={<FiGlobe />}
                  title="About the Company" 
                  content={drive.aboutCompany} 
                />
                <DescriptionSection 
                  icon={<FiFileText />}
                  title="Job Description" 
                  content={drive.note} 
                />
                <DescriptionSection 
                  icon={<FiAward />}
                  title="Service Agreement" 
                  content={drive.serviceAgreement} 
                />
              </div>

              {/* External Links */}
              {(drive.companyWebsite || drive.companyLinkedin) && (
                <div className="ldrive-links-section">
                  <div className="ldrive-section-header">
                    <div className="ldrive-section-icon">
                      <FiExternalLink />
                    </div>
                    <h3 className="ldrive-section-title">Company Links</h3>
                  </div>
                  
                  <div className="ldrive-external-links">
                    {drive.companyWebsite && (
                      <a 
                        href={drive.companyWebsite} 
                        target="_blank" 
                        rel="noreferrer"
                        className="ldrive-external-link"
                      >
                        <FiGlobe className="ldrive-link-icon" />
                        <span>Visit Website</span>
                        <FiExternalLink className="ldrive-link-arrow" />
                      </a>
                    )}
                    {drive.companyLinkedin && (
                      <a 
                        href={drive.companyLinkedin} 
                        target="_blank" 
                        rel="noreferrer"
                        className="ldrive-external-link"
                      >
                        <FiLinkedin className="ldrive-link-icon" />
                        <span>LinkedIn Page</span>
                        <FiExternalLink className="ldrive-link-arrow" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="ldrive-content-right">
              
              {/* Application Status */}
              <div className="ldrive-application-card">
                <div className="ldrive-app-header">
                  <div className="ldrive-app-status">
                    <div className={`ldrive-status-indicator ${isExpired ? 'expired' : 'open'}`}>
                      <div className="ldrive-indicator-dot"></div>
                      <span className="ldrive-indicator-text">
                        {isExpired ? 'Applications Closed' : 'Applications Open'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="ldrive-seats-info">
                    <FiUsers className="ldrive-seats-icon" />
                    <span className="ldrive-seats-text">{drive.seats} positions available</span>
                  </div>
                </div>

                {!isExpired && daysLeft <= 3 && (
                  <div className="ldrive-urgency-banner">
                    <FiClock className="ldrive-urgency-icon" />
                    <span>Hurry! Only {daysLeft} day{daysLeft !== 1 ? 's' : ''} left to apply</span>
                  </div>
                )}

                <div className="ldrive-app-actions">
                  <button
                    className={`ldrive-primary-btn ${isExpired ? 'disabled' : ''}`}
                    onClick={onApply}
                    disabled={isExpired}
                  >
                    {isExpired ? (
                      <>
                        <FiX className="ldrive-btn-icon" />
                        <span>Applications Closed</span>
                      </>
                    ) : (
                      <>
                        <FiSend className="ldrive-btn-icon" />
                        <span>Apply Now</span>
                      </>
                    )}
                  </button>

                  <button className="ldrive-secondary-btn">
                    <FiFileText className="ldrive-btn-icon" />
                    <span>Preview Application</span>
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="ldrive-stats-card">
                <div className="ldrive-stats-header">
                  <FiTrendingUp className="ldrive-stats-icon" />
                  <h4 className="ldrive-stats-title">Quick Stats</h4>
                </div>
                
                <div className="ldrive-stats-list">
                  <div className="ldrive-stat-item">
                    <span className="ldrive-stat-label">Package Range</span>
                    <span className="ldrive-stat-value">{drive.ctc}</span>
                  </div>
                  <div className="ldrive-stat-item">
                    <span className="ldrive-stat-label">Openings</span>
                    <span className="ldrive-stat-value">{drive.seats} positions</span>
                  </div>
                  <div className="ldrive-stat-item">
                    <span className="ldrive-stat-label">Location</span>
                    <span className="ldrive-stat-value">{drive.jobLocation}</span>
                  </div>
                  <div className="ldrive-stat-item">
                    <span className="ldrive-stat-label">Application Status</span>
                    <span className={`ldrive-stat-value ${isExpired ? 'expired' : 'open'}`}>
                      {isExpired ? 'Closed' : 'Open'}
                    </span>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailCard = ({ icon, label, value, gradient }) => (
  <div className="ldrive-detail-card">
    <div className="ldrive-detail-icon" style={{ background: gradient }}>
      {icon}
    </div>
    <div className="ldrive-detail-content">
      <span className="ldrive-detail-label">{label}</span>
      <p className="ldrive-detail-value">{value}</p>
    </div>
  </div>
);

const DescriptionSection = ({ icon, title, content }) => (
  <div className="ldrive-description-block">
    <div className="ldrive-section-header">
      <div className="ldrive-section-icon">
        {icon}
      </div>
      <h3 className="ldrive-section-title">{title}</h3>
    </div>
    <div className="ldrive-description-content">
      <p className="ldrive-description-text">{content}</p>
    </div>
  </div>
);

export default DriveDetailsModal;
