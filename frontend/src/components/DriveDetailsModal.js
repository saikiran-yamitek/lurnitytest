import React from "react";
import {
  FiBriefcase,
  FiCalendar,
  FiMapPin,
  FiExternalLink,
  FiClock,
  FiDollarSign,
  FiX,
  FiFileText,
  FiCheckCircle,
  FiUser,
} from "react-icons/fi";
import "./DriveDetailsModal.css";

const DriveDetailsModal = ({ drive, onClose, onApply }) => {
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="modal-overlay">
      <div className="drive-modal-container">
        <div className="drive-modal-header">
          <h2>{drive.company} - {drive.role}</h2>
          <button onClick={onClose} className="modal-close-btn">
            <FiX size={22} />
          </button>
        </div>

        <div className="drive-modal-content">
          <div className="drive-modal-left">
            <div className="drive-details-grid">
              <Detail icon={<FiBriefcase />} label="Job Role" value={drive.role} />
              <Detail icon={<FiDollarSign />} label="CTC" value={drive.ctc} />
              <Detail icon={<FiMapPin />} label="Job Location" value={drive.jobLocation} />
              <Detail icon={<FiCalendar />} label="Drive Date" value={formatDate(drive.driveDate)} />
              <Detail icon={<FiClock />} label="Last Date to Apply" value={formatDate(drive.lastDateToApply)} />
              <Detail icon={<FiCheckCircle />} label="Eligibility" value={drive.eligibilityCriteria} />
            </div>

            {drive.skillsRequired && (
              <div className="skills-block">
                <h3>Skills Required</h3>
                <div className="skills-tags">
                  {drive.skillsRequired.split(',').map((skill, idx) => (
                    <span key={idx} className="skill-pill">{skill.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="description-block">
              <Section title="About the Company" content={drive.aboutCompany} />
              <Section title="Job Description" content={drive.note} />
              <Section title="Service Agreement" content={drive.serviceAgreement} />
            </div>

            <div className="external-links">
              {drive.companyWebsite && (
                <a href={drive.companyWebsite} target="_blank" rel="noreferrer">
                  <FiExternalLink /> Website
                </a>
              )}
              {drive.companyLinkedin && (
                <a href={drive.companyLinkedin} target="_blank" rel="noreferrer">
                  <FiExternalLink /> LinkedIn
                </a>
              )}
            </div>
          </div>

          <div className="drive-modal-right">
            <div className="status-block">
              <span className={`badge ${new Date(drive.lastDateToApply) < new Date() ? "expired" : "open"}`}>
                {new Date(drive.lastDateToApply) < new Date() ? "Applications Closed" : "Applications Open"}
              </span>
              <p><FiUser /> {drive.seats} seats available</p>
            </div>

            <button
              className={`primary-btn ${new Date(drive.lastDateToApply) < new Date() ? "disabled" : ""}`}
              onClick={onApply}
              disabled={new Date(drive.lastDateToApply) < new Date()}
            >
              Apply Now
            </button>

            <button className="outline-btn">
              <FiFileText /> View Application Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Detail = ({ icon, label, value }) => (
  <div className="detail-block">
    <span className="icon">{icon}</span>
    <div>
      <label>{label}</label>
      <p>{value}</p>
    </div>
  </div>
);

const Section = ({ title, content }) => (
  <>
    <h3>{title}</h3>
    <p>{content}</p>
  </>
);

export default DriveDetailsModal;
