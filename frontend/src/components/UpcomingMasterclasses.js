import React, { Component } from 'react';
import { FaCalendarAlt, FaClock, FaUser, FaArrowRight, FaBuilding, FaPlay, FaStar, FaUsers, FaGraduationCap, FaCheckCircle, FaRocket, FaMapMarkerAlt, FaVideo, FaMicrophone, FaChalkboardTeacher,FaCertificate } from 'react-icons/fa';
import './UpcomingMasterclasses.css';
const API_BASE = process.env.REACT_APP_API_URL;
class UpcomingMasterclasses extends Component {
  constructor(props) {
    super(props);
    this.state = {
      masterclasses: [],
      loading: true,
      error: null,
      activeIndex: 0,
    };
  }

  componentDidMount() {
    this.fetchMasterclasses();
    this.startAutoSlide();
  }

  componentWillUnmount() {
    if (this.slideTimer) clearInterval(this.slideTimer);
  }

  startAutoSlide = () => {
    this.slideTimer = setInterval(() => {
      this.setState(prevState => ({
        activeIndex: (prevState.activeIndex + 1) % Math.max(prevState.masterclasses.length, 1)
      }));
    }, 6000);
  };

  fetchMasterclasses = () => {
    fetch(`${API_BASE}/api/landingpage/cohorts`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch masterclasses");
        return res.json();
      })
      .then(data => this.setState({ 
        masterclasses: this.transformCohortData(data), 
        loading: false 
      }))
      .catch(err => this.setState({ 
        error: err.message, 
        loading: false 
      }));
  };

  transformCohortData = (cohorts) => {
    const themes = [
      { bg: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)', accent: '#FFA500' },
      { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', accent: '#667eea' },
      { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', accent: '#4facfe' },
      { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', accent: '#43e97b' },
      { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', accent: '#fa709a' },
    ];

    return cohorts.map((cohort, index) => ({
      id: cohort.id,
      title: cohort.title,
      subtitle: cohort.tagline || 'Master cutting-edge skills with industry experts',
      date: this.formatDate(cohort.startDate),
      time: cohort.time || '7:00 PM IST',
      instructor: cohort.speakerName || 'Industry Expert',
      company: cohort.speakerCompany || 'Tech Giant',
      duration: cohort.duration || '90 minutes',
      attendees: cohort.seatsLeft || 0,
      rating: cohort.rating || 4.8,
      topics: cohort.whatYouWillLearn || ['Advanced concepts', 'Real-world applications', 'Best practices'],
      theme: themes[index % themes.length],
      isLive: cohort.badgeType === 'Live',
      isFeatured: index === 0,
      level: cohort.level || 'Intermediate',
    }));
  };

  formatDate = (dateStr) => {
    if (!dateStr) return 'Coming Soon';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  handleNavigation = (index) => {
    this.setState({ activeIndex: index });
    if (this.slideTimer) {
      clearInterval(this.slideTimer);
      this.startAutoSlide();
    }
  };

  renderLoadingState = () => (
    <div className="loading-state">
      <div className="loading-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      <h3>Loading exclusive masterclasses...</h3>
      <p>Preparing world-class learning experiences</p>
    </div>
  );

  renderErrorState = () => (
    <div className="error-state">
      <div className="error-icon">⚠️</div>
      <h3>Unable to load masterclasses</h3>
      <p>Please check your connection and try again</p>
      <button className="btn-retry" onClick={() => window.location.reload()}>
        <FaRocket />
        Retry
      </button>
    </div>
  );

  renderEmptyState = () => (
    <div className="empty-state">
      <div className="empty-icon">🎯</div>
      <h3>New masterclasses coming soon</h3>
      <p>Be the first to know when we launch our next session</p>
      <button className="btn-notify" onClick={this.props.onBookDemo}>
        <FaCheckCircle />
        Get Notified
      </button>
    </div>
  );

  render() {
    const { masterclasses, loading, error, activeIndex } = this.state;
    const { onBookDemo } = this.props;
    const activeMasterclass = masterclasses[activeIndex];

    return (
      <div className="masterclasses-wrapper">
        <section className="masterclasses-section">
          <div className="masterclasses-container">
            
            {/* Section Header */}
            <div className="section-header">
              <div className="header-badge">
                <FaVideo className="badge-icon" />
                <span>Live Learning</span>
              </div>
              <h2 className="section-title">
                Join <span className="highlight-text">Free Masterclasses</span>
                <br />by Industry Leaders
              </h2>
              <p className="section-description">
                Learn from experts at Google, Microsoft, Amazon and other top tech companies. 
                Get insights, network with peers, and accelerate your career growth.
              </p>
              
              <div className="header-stats">
                <div className="stat-item">
                  <div className="stat-number">25K+</div>
                  <div className="stat-label">Alumni</div>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <div className="stat-number">4.9★</div>
                  <div className="stat-label">Rating</div>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <div className="stat-number">100%</div>
                  <div className="stat-label">Free</div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="content-area">
              {loading && this.renderLoadingState()}
              {error && this.renderErrorState()}
              {!loading && !error && masterclasses.length === 0 && this.renderEmptyState()}

              {!loading && !error && masterclasses.length > 0 && (
                <>
                  {/* Featured Masterclass */}
                  {activeMasterclass && (
                    <div className="featured-masterclass">
                      <div className="masterclass-card">
                        
                        {/* Hero Section */}
                        <div 
                          className="card-hero"
                          style={{ background: activeMasterclass.theme.bg }}
                        >
                          <div className="hero-overlay"></div>
                          <div className="hero-content">
                            <div className="hero-badges">
                              {activeMasterclass.isLive && (
                                <span className="badge live-badge">
                                  <div className="live-dot"></div>
                                  LIVE
                                </span>
                              )}
                              {activeMasterclass.isFeatured && (
                                <span className="badge featured-badge">
                                  <FaStar />
                                  FEATURED
                                </span>
                              )}
                              <span className="badge free-badge">
                                <FaCheckCircle />
                                FREE
                              </span>
                            </div>
                            
                            <div className="hero-main">
                              <h3 className="masterclass-title">{activeMasterclass.title}</h3>
                              <p className="masterclass-subtitle">{activeMasterclass.subtitle}</p>
                              
                              <div className="quick-info">
                                <div className="info-item">
                                  <FaCalendarAlt />
                                  <span>{activeMasterclass.date}</span>
                                </div>
                                <div className="info-item">
                                  <FaClock />
                                  <span>{activeMasterclass.time}</span>
                                </div>
                                <div className="info-item">
                                  <FaUsers />
                                  <span>{activeMasterclass.duration}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="play-button">
                            <FaPlay />
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="card-content">
                          <div className="content-left">
                            
                            {/* Instructor Info */}
                            <div className="instructor-section">
                              <div className="instructor-header">
                                <div className="instructor-avatar">
                                  <FaChalkboardTeacher />
                                </div>
                                <div className="instructor-info">
                                  <h4 className="instructor-name">{activeMasterclass.instructor}</h4>
                                  <p className="instructor-company">
                                    <FaBuilding />
                                    {activeMasterclass.company}
                                  </p>
                                  <div className="instructor-rating">
                                    <FaStar />
                                    <span>{activeMasterclass.rating}</span>
                                    <span className="rating-text">Expert Rating</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Learning Outcomes */}
                            <div className="learning-section">
                              <h5 className="section-subtitle">
                                <FaGraduationCap />
                                What You'll Learn
                              </h5>
                              <div className="learning-list">
                                {activeMasterclass.topics.map((topic, i) => (
                                  <div key={i} className="learning-item">
                                    <FaCheckCircle className="check-icon" />
                                    <span>{topic}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Level Badge */}
                            <div className="level-section">
                              <span className="level-label">Difficulty Level:</span>
                              <span className={`level-badge level-${activeMasterclass.level.toLowerCase()}`}>
                                {activeMasterclass.level}
                              </span>
                            </div>
                          </div>

                          <div className="content-right">
                            <div className="registration-panel">
                              <div className="price-section">
                                <div className="price-tag">
                                  <span className="price-free">FREE</span>
                                  <span className="price-original">Worth ₹2,999</span>
                                </div>
                              </div>

                              <button 
                                className="btn-register"
                                onClick={onBookDemo}
                              >
                                <FaRocket />
                                <span>Reserve Your Seat</span>
                              </button>

                              <div className="registration-benefits">
                                <div className="benefit-item">
                                  <FaVideo />
                                  <span>Live Interactive Session</span>
                                </div>
                                <div className="benefit-item">
                                  <FaCertificate />
                                  <span>Certificate of Attendance</span>
                                </div>
                                <div className="benefit-item">
                                  <FaUsers />
                                  <span>Networking Opportunities</span>
                                </div>
                              </div>

                              {activeMasterclass.attendees && activeMasterclass.attendees < 100 && (
                                <div className="urgency-alert">
                                  <div className="alert-text">
                                    ⚡ Only {activeMasterclass.attendees} seats remaining!
                                  </div>
                                  <div className="progress-bar">
                                    <div 
                                      className="progress-fill"
                                      style={{ width: `${Math.max(20, (activeMasterclass.attendees / 100) * 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="navigation-section">
                    <div className="nav-controls">
                      <button 
                        className="nav-btn nav-prev"
                        onClick={() => this.handleNavigation(Math.max(0, activeIndex - 1))}
                        disabled={activeIndex === 0}
                      >
                        <FaArrowRight style={{ transform: 'rotate(180deg)' }} />
                        Previous
                      </button>
                      
                      <div className="nav-dots">
                        {masterclasses.map((_, index) => (
                          <button
                            key={index}
                            className={`nav-dot ${index === activeIndex ? 'active' : ''}`}
                            onClick={() => this.handleNavigation(index)}
                          />
                        ))}
                      </div>
                      
                      <button 
                        className="nav-btn nav-next"
                        onClick={() => this.handleNavigation(Math.min(masterclasses.length - 1, activeIndex + 1))}
                        disabled={activeIndex === masterclasses.length - 1}
                      >
                        Next
                        <FaArrowRight />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Bottom CTA */}
            <div className="bottom-cta">
              <div className="cta-card">
                <div className="cta-icon">
                  <FaMicrophone />
                </div>
                <div className="cta-content">
                  <h3>Ready to share your expertise?</h3>
                  <p>Join our community of industry leaders and inspire the next generation of tech professionals</p>
                  <div className="cta-stats">
                    <div className="cta-stat">
                      <strong>$75K+</strong>
                      <span>Average instructor earnings</span>
                    </div>
                    <div className="cta-stat">
                      <strong>2M+</strong>
                      <span>Global student reach</span>
                    </div>
                  </div>
                  <button className="btn-become-instructor" onClick={onBookDemo}>
                    <FaChalkboardTeacher />
                    Become an Instructor
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>
    );
  }
}

export default UpcomingMasterclasses;
