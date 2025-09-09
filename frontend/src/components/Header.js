import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaChevronDown, FaSearch, FaTimes, FaBars, FaBook, FaCode, FaRocket, FaMicrochip, FaWifi, FaCog, FaGraduationCap, FaUsers, FaBriefcase, FaChartLine, FaCertificate, FaLifeRing, FaQuestionCircle, FaFileAlt, FaPlay, FaVideo, FaBuilding, FaRobot, FaHandshake, FaStar } from 'react-icons/fa';
import logo from '../assets/lurnity_original.jpg';
import './Header.css';

const Header = ({ onLogin, onRegister }) => {
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('programs');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const exploreRef = useRef(null);
  const searchRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Enhanced navigation data with icons
  const navigationData = {
    programs: {
      title: 'Programs',
      icon: FaGraduationCap,
      categories: [
        {
          title: 'Artificial Intelligence',
          icon: FaRobot,
          items: [
            { name: 'AI & Machine Learning', icon: FaRobot },
            { name: 'Deep Learning Specialization', icon: FaCode },
            { name: 'Natural Language Processing', icon: FaBook },
            { name: 'Computer Vision', icon: FaVideo }
          ]
        },
        {
          title: 'Software Engineering',
          icon: FaCode,
          items: [
            { name: 'Full Stack Development', icon: FaCode },
            { name: 'Cloud Computing', icon: FaWifi },
            { name: 'DevOps & Infrastructure', icon: FaCog },
            { name: 'Microservices Architecture', icon: FaMicrochip }
          ]
        },
        {
          title: 'Hardware & IoT',
          icon: FaMicrochip,
          items: [
            { name: 'Embedded Systems', icon: FaMicrochip },
            { name: 'Internet of Things', icon: FaWifi },
            { name: 'Robotics & Automation', icon: FaRobot },
            { name: 'Hardware Design', icon: FaCog }
          ]
        },
        {
          title: 'Data Science',
          icon: FaChartLine,
          items: [
            { name: 'Data Analytics', icon: FaChartLine },
            { name: 'Business Intelligence', icon: FaBriefcase },
            { name: 'Statistical Modeling', icon: FaBook },
            { name: 'Big Data Engineering', icon: FaCode }
          ]
        }
      ]
    },
    resources: {
      title: 'Resources',
      icon: FaBook,
      categories: [
        {
          title: 'Learning Hub',
          icon: FaGraduationCap,
          items: [
            { name: 'Documentation Center', icon: FaFileAlt },
            { name: 'Video Tutorials', icon: FaPlay },
            { name: 'Interactive Labs', icon: FaCode },
            { name: 'Quick Start Guides', icon: FaBook }
          ]
        },
        {
          title: 'Developer Tools',
          icon: FaCode,
          items: [
            { name: 'SDK Downloads', icon: FaCode },
            { name: 'API References', icon: FaBook },
            { name: 'Code Examples', icon: FaFileAlt },
            { name: 'Testing Frameworks', icon: FaCog }
          ]
        },
        {
          title: 'Community',
          icon: FaUsers,
          items: [
            { name: 'Developer Forums', icon: FaUsers },
            { name: 'Discord Community', icon: FaUsers },
            { name: 'Study Groups', icon: FaGraduationCap },
            { name: 'Live Sessions', icon: FaPlay }
          ]
        },
        {
          title: 'Support',
          icon: FaLifeRing,
          items: [
            { name: 'Help Center', icon: FaQuestionCircle },
            { name: 'Technical Support', icon: FaLifeRing },
            { name: 'Contact Support', icon: FaUsers },
            { name: 'Knowledge Base', icon: FaBook }
          ]
        }
      ]
    },
    career: {
      title: 'Career Services',
      icon: FaBriefcase,
      categories: [
        {
          title: 'Job Placement',
          icon: FaBriefcase,
          items: [
            { name: 'Career Coaching', icon: FaBriefcase },
            { name: 'Interview Preparation', icon: FaUsers },
            { name: 'Resume Building', icon: FaFileAlt },
            { name: 'Salary Negotiation', icon: FaChartLine }
          ]
        },
        {
          title: 'Industry Network',
          icon: FaUsers,
          items: [
            { name: 'Partner Companies', icon: FaBuilding },
            { name: 'Hiring Partners', icon: FaBriefcase },
            { name: 'Networking Events', icon: FaUsers },
            { name: 'Industry Meetups', icon: FaPlay }
          ]
        },
        {
          title: 'Professional Growth',
          icon: FaChartLine,
          items: [
            { name: 'Certification Programs', icon: FaCertificate },
            { name: 'Leadership Training', icon: FaGraduationCap },
            { name: 'Skill Assessment', icon: FaCode },
            { name: 'Career Counseling', icon: FaUsers }
          ]
        },
        {
          title: 'Alumni Success',
          icon: FaCertificate,
          items: [
            { name: 'Alumni Directory', icon: FaUsers },
            { name: 'Success Stories', icon: FaChartLine },
            { name: 'Mentorship Program', icon: FaGraduationCap },
            { name: 'Alumni Events', icon: FaPlay }
          ]
        }
      ]
    }
  };

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
      if (exploreRef.current && !exploreRef.current.contains(event.target)) {
        setIsExploreOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
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
        setIsExploreOpen(false);
        setIsSearchOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const toggleExplore = () => {
    setIsExploreOpen(!isExploreOpen);
    setIsSearchOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    setIsExploreOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsExploreOpen(false);
    setIsSearchOpen(false);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  const handlePartnerClick = () => {
    // You can customize this handler based on your requirements
    console.log('Join as Partner clicked');
    // Example: Navigate to partner page or open modal
    // window.location.href = '/partners';
    // or call a props function: onPartnerJoin();
  };

  return (
    <div className="header-wrapper">
      <header className={`main-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-content">
          {/* Left Section */}
          <div className="header-left">
            <Link to="/" className="brand-logo">
              <img src={logo} alt="Lurnity" className="logo-image" />
              <div className="brand-text">
                <span className="brand-name">LURNITY</span>
                <span className="brand-tagline">Learn • Build • Excel</span>
              </div>
            </Link>

            {/* Explore Dropdown */}
            <div className="explore-container" ref={exploreRef}>
              <button 
                className={`explore-button ${isExploreOpen ? 'active' : ''}`}
                onClick={toggleExplore}
                aria-expanded={isExploreOpen}
              >
                <FaGraduationCap className="explore-icon" />
                <span>Explore</span>
                <FaChevronDown className={`chevron ${isExploreOpen ? 'rotated' : ''}`} />
              </button>

              {/* Mega Dropdown - 80% Width */}
              {isExploreOpen && (
                <div className="mega-dropdown">
                  <div className="dropdown-container">
                    {/* Left Sidebar */}
                    <div className="dropdown-sidebar">
                      <div className="sidebar-header">
                        <h3>Discover</h3>
                        <p>Explore our comprehensive programs</p>
                      </div>
                      
                      {Object.entries(navigationData).map(([key, category]) => {
                        const IconComponent = category.icon;
                        return (
                          <button
                            key={key}
                            className={`sidebar-item ${activeCategory === key ? 'active' : ''}`}
                            onClick={() => handleCategoryChange(key)}
                            onMouseEnter={() => handleCategoryChange(key)}
                          >
                            <IconComponent className="sidebar-icon" />
                            <div className="sidebar-text">
                              <span className="sidebar-title">{category.title}</span>
                            </div>
                            <FaChevronDown className="sidebar-arrow" />
                          </button>
                        );
                      })}
                      
                      <div className="sidebar-footer">
                        <div className="stats-card">
                          <div className="stat-item">
                            <strong>25K+</strong>
                            <span>Students</span>
                          </div>
                          <div className="stat-item">
                            <strong>4.9★</strong>
                            <span>Rating</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="dropdown-content">
                      {navigationData[activeCategory] && (
                        <div className="content-grid">
                          {navigationData[activeCategory].categories.map((category, categoryIndex) => {
                            const CategoryIcon = category.icon;
                            return (
                              <div key={categoryIndex} className="content-column">
                                <div className="column-header">
                                  <CategoryIcon className="column-icon" />
                                  <h4 className="column-title">{category.title}</h4>
                                </div>
                                <ul className="column-items">
                                  {category.items.map((item, itemIndex) => {
                                    const ItemIcon = item.icon;
                                    return (
                                      <li key={itemIndex}>
                                        <Link
                                          to={`/${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                                          className="column-link"
                                          onClick={() => setIsExploreOpen(false)}
                                        >
                                          <ItemIcon className="item-icon" />
                                          <span>{item.name}</span>
                                          <FaArrowRight className="link-arrow" />
                                        </Link>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* Bottom CTA */}
                      <div className="content-footer">
                        <div className="cta-banner">
                          <div className="cta-content">
                            <FaRocket className="cta-icon" />
                            <div className="cta-text">
                              <h4>Ready to start your journey?</h4>
                              <p>Join thousands of students transforming their careers</p>
                            </div>
                          </div>
                          <button className="cta-button" onClick={onRegister}>
                            Get Started Free
                            <FaArrowRight />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Section */}
          <nav className="header-nav">
            <div className="nav-links">
              <Link to="/careers" className="nav-link">
                <FaBriefcase />
                <span>Careers</span>
              </Link>
              
              <button className="search-button" onClick={toggleSearch}>
                <FaSearch />
              </button>
            </div>
            
            <div className="auth-buttons">
              {/* Join as Partner Button */}
              <button className="btn-partner" onClick={handlePartnerClick}>
                <FaHandshake />
                <span>Join as Partner</span>
              </button>
              
              <button className="btn-signin" onClick={onLogin}>
                Sign In
              </button>
              
              <button className="btn-signup" onClick={onRegister}>
                <span>Join Lurnity</span>
                <FaArrowRight />
              </button>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className={`mobile-toggle ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Search Overlay */}
        {isSearchOpen && (
          <div className="search-overlay" ref={searchRef}>
            <div className="search-container">
              <div className="search-box">
                <FaSearch className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search programs, resources, careers..." 
                  className="search-input"
                  autoFocus
                />
                <button className="search-close" onClick={() => setIsSearchOpen(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="search-suggestions">
                <div className="suggestion-category">
                  <h4>Popular Searches</h4>
                  <div className="suggestion-tags">
                    <span className="tag">AI & Machine Learning</span>
                    <span className="tag">Full Stack Development</span>
                    <span className="tag">Data Science</span>
                    <span className="tag">Career Services</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mobile-menu" ref={mobileMenuRef}>
            <div className="mobile-content">
              <div className="mobile-nav">
                {Object.entries(navigationData).map(([key, category]) => {
                  const IconComponent = category.icon;
                  return (
                    <div key={key} className="mobile-section">
                      <h3 className="mobile-section-title">
                        <IconComponent />
                        {category.title}
                      </h3>
                      <div className="mobile-section-content">
                        {category.categories.map((cat, catIndex) => (
                          <div key={catIndex} className="mobile-category">
                            <h4>{cat.title}</h4>
                            {cat.items.map((item, itemIndex) => (
                              <Link
                                key={itemIndex}
                                to={`/${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                                className="mobile-link"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mobile-auth">
                <button className="mobile-partner" onClick={handlePartnerClick}>
                  <FaHandshake />
                  Join as Partner
                </button>
                <button className="mobile-signin" onClick={onLogin}>
                  Sign In
                </button>
                <button className="mobile-signup" onClick={onRegister}>
                  Join Lurnity
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
};

export default Header;
