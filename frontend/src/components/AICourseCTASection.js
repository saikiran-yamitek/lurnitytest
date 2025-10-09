import React from 'react';
import './AICourseCTASection.css';

const AICourseCTASection = () => {
  return (
    <section className="cta-section" id="cta-section">
      {/* Animated Wave Background */}
      <div className="cta-waves">
        <div className="wave wave-1"></div>
        <div className="wave wave-2"></div>
        <div className="wave wave-3"></div>
      </div>

      <div className="cta-container">
        <div className="cta-content">
          <h2 className="cta-title">
            Ready to Transform Your Career with AI?
          </h2>
          
          <p className="cta-description">
            Join thousands of students building practical AI skills with hands-on projects and expert mentorship. Start your journey to becoming an AI professional today.
          </p>

          <div className="cta-buttons">
            <button className="cta-btn-primary">
              Enroll Now
              <span className="btn-arrow">→</span>
            </button>
            <button className="cta-btn-secondary">
              Download Curriculum
              <span className="btn-icon">↓</span>
            </button>
          </div>

          <div className="cta-trust-section">
            <div className="trust-item">
              <span className="trust-icon">✓</span>
              <span className="trust-text">7-day money-back guarantee</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">✓</span>
              <span className="trust-text">Lifetime course access</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">✓</span>
              <span className="trust-text">Industry certification</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AICourseCTASection;
