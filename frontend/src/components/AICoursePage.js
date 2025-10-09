import React from 'react';
import './AICoursePage.css';
import robotHand from '../assets/ai-robot-hand.png';
import lurnityLogo from '../assets/lurnity_original.jpg';
import AICourseAboutSection from './AICourseAboutSection'; 
import AICourseCoursesSection from './AICourseCoursesSection';
import AICourseOutcomesSection from './AICourseOutcomesSection';
import AICourseCareerSection from './AICourseCareerSection';
import AICourseCTASection from './AICourseCTASection';
import LurnityFooter from './LurnityFooter';


const AICoursePage = () => {
  return (
    <div className="ai-course-page">
      {/* Navigation Header */}
      <header className="course-header">
        <div className="logo-section">
          <img src={lurnityLogo} alt="Lurnity Logo" className="brand-logo" />
        </div>
        
        <nav className="main-navigation">
          <div className="nav-pill">
            <a href="#home" className="nav-link active">HOME</a>
            <a href="#courses" className="nav-link">COURSES</a>
            <a href="#about" className="nav-link">ABOUT</a>
            <a href="#outcomes" className="nav-link">OUTCOMES</a>
          </div>
        </nav>

        <button className="menu-toggle">
          <span className="menu-icon"></span>
          <span className="menu-icon"></span>
          <span className="menu-icon"></span>
        </button>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content-wrapper"> {/* ← ONLY CHANGE: ADDED WRAPPER */}
          <div className="hero-main-grid">
            {/* Left Column */}
            <div className="hero-left-column">
              <div className="hero-text-block">
                <h2 className="hero-subtitle">Your Journey Begins with</h2>
                <h1 className="hero-title">Artificial Intelligence</h1>
              </div>
            </div>

            {/* Center Column - Robot */}
            <div className="hero-center-column">
              <img 
                src={robotHand} 
                alt="AI Robot Hand" 
                className="hero-robot-image"
              />
            </div>

            {/* Right Column - Arrow */}
            <div className="hero-right-column">
              <button className="next-arrow-button">
                <span className="arrow-symbol">›</span>
              </button>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="hero-bottom-grid">
            {/* Description Text */}
            <div className="hero-description-box">
              <p className="hero-description">
                No prior experience needed. Lurnity's AI course takes you from Python basics to advanced machine learning. Build a portfolio of 10+ projects, earn industry-recognized certification, and join our community of 5,000+ successful AI professionals.
              </p>
            </div>
          </div>
        </div> {/* ← END WRAPPER */}
      </section>

      {/* Course Overview Section */}
      <AICourseCoursesSection />

      <AICourseAboutSection />

      <AICourseOutcomesSection />

      {/* Learning Path Section */}
      

      {/* Skills & Tools Section */}
      

      {/* Career Outcomes Section */}
      <AICourseCareerSection />

      {/* CTA Section */}
      <AICourseCTASection />
      <LurnityFooter />
    </div>
  );
};

export default AICoursePage;
