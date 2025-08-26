import React, { useState } from "react";
import { createTicket } from "../services/ticketApi";
import { 
  FiX, FiSend, FiLifeBuoy, FiUser, FiTag, FiAlertTriangle,
  FiFileText, FiPaperclip, FiLoader, FiCheckCircle, FiStar,
  FiClock, FiZap
} from "react-icons/fi";
import './HelpTicketForm.css';

export default function HelpTicketForm({ user, onClose }) {
  const [form, setForm] = useState({
    category: "Technical issue",
    priority: "Low",
    subject: "",
    description: "",
    attachment: "",
    deviceInfo: navigator.userAgent
  });
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const uid = user?._id || user?.id;

  const handle = k => e => setForm({ ...form, [k]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    await createTicket({
      ...form,
      userId: uid,
      userEmail: user.email
    });
    setShowSuccess(true);
    setSaving(false);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 3000);
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'Low': return <FiClock />;
      case 'Medium': return <FiZap />;
      case 'High': return <FiAlertTriangle />;
      default: return <FiClock />;
    }
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Technical issue': return <FiFileText />;
      case 'Payment related': return <FiStar />;
      case 'Login': return <FiUser />;
      case 'Bug report': return <FiAlertTriangle />;
      case 'Feedback': return <FiStar />;
      default: return <FiLifeBuoy />;
    }
  };

  return (
    <div className="luxury-ticket-form-wrapper">
      <div className="ltf-overlay" onClick={onClose}>
        <div className="ltf-backdrop-blur"></div>
        <div className="ltf-container" onClick={e => e.stopPropagation()}>
          
          {/* Header Section */}
          <div className="ltf-header">
            <div className="ltf-header-glow"></div>
            <div className="ltf-header-content">
              <div className="ltf-brand-section">
                <div className="ltf-brand-icon">
                  <FiLifeBuoy className="ltf-brand-svg" />
                  <div className="ltf-brand-glow"></div>
                </div>
                <div className="ltf-brand-content">
                  <h2 className="ltf-title">Support Ticket</h2>
                  <p className="ltf-subtitle">We're here to help you succeed</p>
                </div>
              </div>
              
              <button className="ltf-close-btn" onClick={onClose} title="Close">
                <FiX className="ltf-close-icon" />
              </button>
            </div>
          </div>

          {/* Form Section */}
          <div className="ltf-form-section">
            <form onSubmit={submit} className="ltf-form">
              
              {/* Category & Priority Row */}
              <div className="ltf-form-row">
                <div className="ltf-form-group">
                  <label className="ltf-form-label">
                    <FiTag className="ltf-label-icon" />
                    <span>Category</span>
                  </label>
                  <div className="ltf-select-wrapper">
                    <div className="ltf-select-icon">
                      {getCategoryIcon(form.category)}
                    </div>
                    <select 
                      className="ltf-select" 
                      value={form.category} 
                      onChange={handle("category")}
                    >
                      <option value="Technical issue">Technical Issue</option>
                      <option value="Payment related">Payment Related</option>
                      <option value="Login">Login Problem</option>
                      <option value="Bug report">Bug Report</option>
                      <option value="Feedback">Feedback</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="ltf-form-group">
                  <label className="ltf-form-label">
                    <FiAlertTriangle className="ltf-label-icon" />
                    <span>Priority</span>
                  </label>
                  <div className="ltf-select-wrapper">
                    <div className="ltf-select-icon">
                      {getPriorityIcon(form.priority)}
                    </div>
                    <select 
                      className="ltf-select" 
                      value={form.priority} 
                      onChange={handle("priority")}
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Subject Field */}
              <div className="ltf-form-group">
                <label className="ltf-form-label">
                  <FiFileText className="ltf-label-icon" />
                  <span>Subject *</span>
                </label>
                <div className="ltf-input-wrapper">
                  <input
                    className="ltf-input"
                    placeholder="Brief title describing your issue"
                    value={form.subject}
                    onChange={handle("subject")}
                    required
                  />
                </div>
              </div>

              {/* Description Field */}
              <div className="ltf-form-group">
                <label className="ltf-form-label">
                  <FiFileText className="ltf-label-icon" />
                  <span>Description *</span>
                </label>
                <div className="ltf-textarea-wrapper">
                  <textarea
                    className="ltf-textarea"
                    rows="5"
                    placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable..."
                    value={form.description}
                    onChange={handle("description")}
                    required
                  />
                  <div className="ltf-textarea-footer">
                    <span className="ltf-char-count">{form.description.length}/1000</span>
                  </div>
                </div>
              </div>

              {/* Attachment Field */}
              <div className="ltf-form-group">
                <label className="ltf-form-label">
                  <FiPaperclip className="ltf-label-icon" />
                  <span>Attachment URL <span className="ltf-optional">(optional)</span></span>
                </label>
                <div className="ltf-input-wrapper">
                  <input
                    className="ltf-input"
                    placeholder="Paste a link to screenshot or file (Google Drive, Dropbox, etc.)"
                    value={form.attachment}
                    onChange={handle("attachment")}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="ltf-actions">
                <button 
                  type="submit" 
                  className="ltf-submit-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <FiLoader className="ltf-submit-icon loading" />
                      <span>Submitting Ticket...</span>
                    </>
                  ) : (
                    <>
                      <FiSend className="ltf-submit-icon" />
                      <span>Submit Support Ticket</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Footer */}
          <div className="ltf-footer">
            <div className="ltf-footer-content">
              <div className="ltf-footer-info">
                <span className="ltf-footer-text">Average response time: </span>
                <span className="ltf-footer-highlight">2-4 hours</span>
              </div>
              <div className="ltf-footer-badge">
                <FiLifeBuoy className="ltf-footer-icon" />
                <span>Premium Support</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="ltf-success-overlay">
          <div className="ltf-success-backdrop"></div>
          <div className="ltf-success-container">
            <div className="ltf-success-icon-wrapper">
              <FiCheckCircle className="ltf-success-icon" />
              <div className="ltf-success-icon-glow"></div>
            </div>
            <div className="ltf-success-content">
              <h3 className="ltf-success-title">🎉 Ticket Submitted Successfully!</h3>
              <p className="ltf-success-message">
                Your support ticket has been created and our expert team is already on it. 
                You'll receive updates via email shortly.
              </p>
              <div className="ltf-success-details">
                <div className="ltf-success-item">
                  <FiUser className="ltf-success-detail-icon" />
                  <span>Assigned to our premium support team</span>
                </div>
                <div className="ltf-success-item">
                  <FiClock className="ltf-success-detail-icon" />
                  <span>Expected response: 2-4 hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
