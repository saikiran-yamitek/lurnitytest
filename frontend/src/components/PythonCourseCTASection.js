import React from 'react';
import './PythonCourseCTASection.css';

const PythonCourseCTASection = () => {
  return (
    <section className="python-cta-section" id="python-cta-section">
      {/* Animated Wave Background */}
      <div className="python-cta-waves">
        <div className="python-wave python-wave-1"></div>
        <div className="python-wave python-wave-2"></div>
        <div className="python-wave python-wave-3"></div>
      </div>

      <div className="python-cta-container">
        <div className="python-cta-content">
          <h2 className="python-cta-title">
            Ready to Master Python Programming?
          </h2>
          
          <p className="python-cta-description">
            Join 8,000+ developers who've transformed their careers with our comprehensive Python course. 
            Build real-world projects, master modern frameworks, and become job-ready in 30 weeks.
          </p>

          <div className="python-cta-buttons">
            <button className="python-cta-btn-primary">
              Start Learning Python
              <span className="python-btn-arrow">→</span>
            </button>
            <button className="python-cta-btn-secondary">
              Download Syllabus
              <span className="python-btn-icon">↓</span>
            </button>
          </div>

          <div className="python-cta-trust-section">
            <div className="python-trust-item">
              <span className="python-trust-icon">✓</span>
              <span className="python-trust-text">30-day money-back guarantee</span>
            </div>
            <div className="python-trust-item">
              <span className="python-trust-icon">✓</span>
              <span className="python-trust-text">Lifetime course access</span>
            </div>
            <div className="python-trust-item">
              <span className="python-trust-icon">✓</span>
              <span className="python-trust-text">Industry certification</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PythonCourseCTASection;
