import React from 'react';
import './LurnityFooter.css';
import lurnityLogo from '../assets/lurnity_original.jpg';

const LurnityFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="lurnity-footer">
      <div className="footer-container">
        {/* Top Section */}
        <div className="footer-top">
          {/* Company Info */}
          <div className="footer-column footer-about">
            <img src={lurnityLogo} alt="Lurnity Logo" className="footer-logo" />
            <p className="footer-description">
              Empowering learners worldwide with cutting-edge AI and technology education. 
              Join thousands of students building their future with Lurnity.
            </p>
            <div className="footer-social">
              <a href="#linkedin" className="social-link" aria-label="LinkedIn">
                <span className="social-icon">in</span>
              </a>
              <a href="#twitter" className="social-link" aria-label="Twitter">
                <span className="social-icon">𝕏</span>
              </a>
              <a href="#facebook" className="social-link" aria-label="Facebook">
                <span className="social-icon">f</span>
              </a>
              <a href="#instagram" className="social-link" aria-label="Instagram">
                <span className="social-icon">📷</span>
              </a>
              <a href="#youtube" className="social-link" aria-label="YouTube">
                <span className="social-icon">▶</span>
              </a>
            </div>
          </div>

          {/* Courses */}
          <div className="footer-column">
            <h3 className="footer-heading">Courses</h3>
            <ul className="footer-links">
              <li><a href="#ai-course">Artificial Intelligence</a></li>
              <li><a href="#ml-course">Machine Learning</a></li>
              <li><a href="#ds-course">Data Science</a></li>
              <li><a href="#web-dev">Web Development</a></li>
              <li><a href="#cloud">Cloud Computing</a></li>
              <li><a href="#all-courses">View All Courses</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="footer-column">
            <h3 className="footer-heading">Company</h3>
            <ul className="footer-links">
              <li><a href="#about">About Us</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#instructors">Become an Instructor</a></li>
              <li><a href="#partners">Partners</a></li>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#press">Press & Media</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-column">
            <h3 className="footer-heading">Support</h3>
            <ul className="footer-links">
              <li><a href="#help">Help Center</a></li>
              <li><a href="#contact">Contact Us</a></li>
              <li><a href="#faq">FAQs</a></li>
              <li><a href="#community">Community</a></li>
              <li><a href="#feedback">Submit Feedback</a></li>
              <li><a href="#system-status">System Status</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-column footer-newsletter">
            <h3 className="footer-heading">Stay Updated</h3>
            <p className="newsletter-description">
              Subscribe to our newsletter for course updates, tips, and exclusive offers.
            </p>
            <form className="newsletter-form">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="newsletter-input"
                required
              />
              <button type="submit" className="newsletter-btn">Subscribe</button>
            </form>
            <p className="newsletter-privacy">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider"></div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <p className="footer-copyright">
              © {currentYear} Lurnity. All rights reserved.
            </p>
          </div>
          <div className="footer-bottom-right">
            <a href="#privacy" className="footer-legal-link">Privacy Policy</a>
            <span className="legal-separator">•</span>
            <a href="#terms" className="footer-legal-link">Terms of Service</a>
            <span className="legal-separator">•</span>
            <a href="#cookies" className="footer-legal-link">Cookie Policy</a>
            <span className="legal-separator">•</span>
            <a href="#accessibility" className="footer-legal-link">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LurnityFooter;
