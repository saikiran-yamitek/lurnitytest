import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaSearch, FaTimes, FaBars } from 'react-icons/fa';
import logo from '../assets/lurnity_original.jpg';
import './Header.css';

const Header = ({ onLogin, onRegister }) => {
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);
  const [isLearningOpen, setIsLearningOpen] = useState(false);
  const [isDevelopersOpen, setIsDevelopersOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProductsOpen(false);
        setIsSolutionsOpen(false);
        setIsLearningOpen(false);
        setIsDevelopersOpen(false);
        setIsCompanyOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsProductsOpen(false);
        setIsSolutionsOpen(false);
        setIsLearningOpen(false);
        setIsDevelopersOpen(false);
        setIsCompanyOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const toggleDropdown = (dropdown) => {
    setIsProductsOpen(dropdown === 'products' ? !isProductsOpen : false);
    setIsSolutionsOpen(dropdown === 'solutions' ? !isSolutionsOpen : false);
    setIsLearningOpen(dropdown === 'learning' ? !isLearningOpen : false);
    setIsDevelopersOpen(dropdown === 'developers' ? !isDevelopersOpen : false);
    setIsCompanyOpen(dropdown === 'company' ? !isCompanyOpen : false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="okta-header-wrapper">
      <header className={`okta-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="okta-header-container">
          {/* Main Navigation Container */}
          <div className="okta-header-layout">
            {/* Left Navigation Bar */}
            <nav className="okta-nav-bar">
              {/* Brand Logo */}
              <Link to="/" className="okta-brand">
                <img src={logo} alt="Lurnity" className="okta-logo" />
              </Link>

              {/* Main Navigation */}
              <div className="okta-nav-menu" ref={dropdownRef}>
                <button 
                  className={`okta-nav-item ${isProductsOpen ? 'active' : ''}`}
                  onClick={() => toggleDropdown('products')}
                >
                  Products
                </button>

                <button 
                  className={`okta-nav-item ${isSolutionsOpen ? 'active' : ''}`}
                  onClick={() => toggleDropdown('solutions')}
                >
                  Solutions
                </button>

                <button 
                  className={`okta-nav-item ${isLearningOpen ? 'active' : ''}`}
                  onClick={() => toggleDropdown('learning')}
                >
                  Learning & Support
                </button>

                <button 
                  className={`okta-nav-item ${isDevelopersOpen ? 'active' : ''}`}
                  onClick={() => toggleDropdown('developers')}
                >
                  Developers
                </button>

                <button 
                  className={`okta-nav-item ${isCompanyOpen ? 'active' : ''}`}
                  onClick={() => toggleDropdown('company')}
                >
                  Company
                </button>
              </div>

              {/* Mobile Menu Toggle */}
              <button 
                className={`okta-mobile-toggle ${isMobileMenuOpen ? 'active' : ''}`}
                onClick={toggleMobileMenu}
              >
                {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
              </button>
            </nav>

            {/* Right Actions Container - Separate Oval */}
            <div className="okta-actions-container">
              <button className="okta-btn-secondary" onClick={onLogin}>
                contact us
              </button>
              <button className="okta-btn-primary" onClick={onRegister}>
                Register
              </button>
            </div>
          </div>

          {/* Dropdown Menus */}
          {isProductsOpen && (
            <div className="okta-dropdown">
              <div className="okta-dropdown-content">
                <div className="okta-dropdown-section">
                  <h3>Learning Management</h3>
                  <ul>
                    <li><Link to="/courses">Course Management</Link></li>
                    <li><Link to="/assessments">Assessments & Quizzes</Link></li>
                    <li><Link to="/certifications">Certifications</Link></li>
                    <li><Link to="/analytics">Learning Analytics</Link></li>
                  </ul>
                </div>
                <div className="okta-dropdown-section">
                  <h3>Student Experience</h3>
                  <ul>
                    <li><Link to="/dashboard">Student Dashboard</Link></li>
                    <li><Link to="/progress">Progress Tracking</Link></li>
                    <li><Link to="/collaboration">Collaboration Tools</Link></li>
                    <li><Link to="/mobile">Mobile Learning</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {isSolutionsOpen && (
            <div className="okta-dropdown">
              <div className="okta-dropdown-content">
                <div className="okta-dropdown-section">
                  <h3>By Industry</h3>
                  <ul>
                    <li><Link to="/education">Education</Link></li>
                    <li><Link to="/corporate">Corporate Training</Link></li>
                    <li><Link to="/healthcare">Healthcare</Link></li>
                    <li><Link to="/technology">Technology</Link></li>
                  </ul>
                </div>
                <div className="okta-dropdown-section">
                  <h3>By Use Case</h3>
                  <ul>
                    <li><Link to="/onboarding">Employee Onboarding</Link></li>
                    <li><Link to="/compliance">Compliance Training</Link></li>
                    <li><Link to="/skills">Skills Development</Link></li>
                    <li><Link to="/certification">Professional Certification</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {isLearningOpen && (
            <div className="okta-dropdown">
              <div className="okta-dropdown-content">
                <div className="okta-dropdown-section">
                  <h3>Resources</h3>
                  <ul>
                    <li><Link to="/documentation">Documentation</Link></li>
                    <li><Link to="/tutorials">Video Tutorials</Link></li>
                    <li><Link to="/webinars">Webinars</Link></li>
                    <li><Link to="/blog">Blog</Link></li>
                  </ul>
                </div>
                <div className="okta-dropdown-section">
                  <h3>Support</h3>
                  <ul>
                    <li><Link to="/help">Help Center</Link></li>
                    <li><Link to="/community">Community Forum</Link></li>
                    <li><Link to="/contact">Contact Support</Link></li>
                    <li><Link to="/status">System Status</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {isDevelopersOpen && (
            <div className="okta-dropdown">
              <div className="okta-dropdown-content">
                <div className="okta-dropdown-section">
                  <h3>APIs & SDKs</h3>
                  <ul>
                    <li><Link to="/api">REST API</Link></li>
                    <li><Link to="/sdk">JavaScript SDK</Link></li>
                    <li><Link to="/webhooks">Webhooks</Link></li>
                    <li><Link to="/integrations">Integrations</Link></li>
                  </ul>
                </div>
                <div className="okta-dropdown-section">
                  <h3>Developer Tools</h3>
                  <ul>
                    <li><Link to="/playground">API Playground</Link></li>
                    <li><Link to="/samples">Code Samples</Link></li>
                    <li><Link to="/postman">Postman Collection</Link></li>
                    <li><Link to="/cli">CLI Tools</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {isCompanyOpen && (
            <div className="okta-dropdown">
              <div className="okta-dropdown-content">
                <div className="okta-dropdown-section">
                  <h3>About</h3>
                  <ul>
                    <li><Link to="/about">About Lurnity</Link></li>
                    <li><Link to="/team">Our Team</Link></li>
                    <li><Link to="/careers">Careers</Link></li>
                    <li><Link to="/press">Press & Media</Link></li>
                  </ul>
                </div>
                <div className="okta-dropdown-section">
                  <h3>Connect</h3>
                  <ul>
                    <li><Link to="/partners">Partners</Link></li>
                    <li><Link to="/events">Events</Link></li>
                    <li><Link to="/newsletter">Newsletter</Link></li>
                    <li><Link to="/social">Social Media</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="okta-mobile-menu" ref={mobileMenuRef}>
              <div className="okta-mobile-content">
                <div className="okta-mobile-nav">
                  <Link to="/products" className="okta-mobile-link">Products</Link>
                  <Link to="/solutions" className="okta-mobile-link">Solutions</Link>
                  <Link to="/learning" className="okta-mobile-link">Learning & Support</Link>
                  <Link to="/developers" className="okta-mobile-link">Developers</Link>
                  <Link to="/company" className="okta-mobile-link">Company</Link>
                </div>
                <div className="okta-mobile-actions">
                  <button className="okta-mobile-btn-secondary" onClick={onLogin}>
                    Login
                  </button>
                  <button className="okta-mobile-btn-primary" onClick={onRegister}>
                    Register
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
    </div>
  );
};

export default Header;
