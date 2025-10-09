import React from 'react';
import './PythonCoursePage.css';
import PythonCourseCoursesSection from './PythonCourseCoursesSection.js'
import PythonCourseAboutSection from './PythonCourseAboutSection.js'
import PythonCourseOutcomesSection from './PythonCourseOutcomesSection.js'
import PythonCourseCareerSection from './PythonCourseCareerSection.js'
import PythonCourseCTASection from './PythonCourseCTASection.js'
import pythonLogo from '../assets/python-logo.png';
import lurnityLogo from '../assets/lurnity_original.jpg';
import LurnityFooter from './LurnityFooter';

const PythonCoursePage = () => {
  return (
    <div className="python-course-page">
      <div className="python-wrapper">
        {/* Navigation Header */}
        <header className="python-header">
          <div className="python-logo-section">
            <img src={lurnityLogo} alt="Lurnity Logo" className="python-brand-logo" />
          </div>
          
          <nav className="python-navigation">
            <div className="python-nav-pill">
              <a href="#python-home" className="python-nav-link active">HOME</a>
              <a href="#python-courses" className="python-nav-link">COURSES</a>
              <a href="#python-about" className="python-nav-link">ABOUT</a>
              <a href="#python-outcomes" className="python-nav-link">OUTCOMES</a>
            </div>
          </nav>

          <button className="python-menu-toggle">
            <span className="python-menu-icon"></span>
            <span className="python-menu-icon"></span>
            <span className="python-menu-icon"></span>
          </button>
        </header>

        {/* Hero Section */}
        <section className="python-hero-section" id="python-home">
          <div className="python-hero-wrapper">
            <div className="python-hero-grid">
              {/* Left Column */}
              <div className="python-hero-left">
                <div className="python-hero-text">
                  <h2 className="python-hero-subtitle">Master Programming with</h2>
                  <h1 className="python-hero-title">Python Development</h1>
                </div>
              </div>

              {/* Center Column - Python Logo */}
              <div className="python-hero-center">
                <img 
                  src={pythonLogo} 
                  alt="Python Logo" 
                  className="python-hero-image"
                />
              </div>

              {/* Right Column - Arrow */}
              <div className="python-hero-right">
                <button className="python-arrow-button">
                  <span className="python-arrow-symbol">›</span>
                </button>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="python-hero-bottom">
              <div className="python-description-box">
                <p className="python-description">
                  Start your programming journey with Python, the world's most popular language. From basics to advanced applications, build real-world projects, master data structures, and join our community of 8,000+ successful Python developers.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      <PythonCourseCoursesSection/>
      <PythonCourseAboutSection/>
      <PythonCourseOutcomesSection/>
      <PythonCourseCareerSection/>
      <PythonCourseCTASection/>

      {/* Footer */}
      <LurnityFooter />
    </div>
  );
};

export default PythonCoursePage;
