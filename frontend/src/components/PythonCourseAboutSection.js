import React, { useState } from 'react';
import './PythonCourseAboutSection.css';
import pythonAboutImage from '../assets/python-about-image.png';

const PythonCourseAboutSection = () => {
  const [showAllSkills, setShowAllSkills] = useState(false);

  const allSkills = [
    'Python Programming',
    'Data Structures',
    'Object-Oriented Programming',
    'Web Development',
    'Django Framework',
    'Flask',
    'NumPy',
    'Pandas',
    'Database Integration',
    'API Development',
    'File Handling',
    'Error Handling',
    'SQL & MongoDB',
    'Data Visualization',
    'Testing & Debugging',
    'Git & Version Control'
  ];

  const limitedSkills = allSkills.slice(0, 8);
  const displayedSkills = showAllSkills ? allSkills : limitedSkills;

  const toggleSkills = () => {
    setShowAllSkills(!showAllSkills);
  };

  return (
    <section className="python-about-section" id="python-about">
      <div className="python-about-container">
        <div className="python-about-three-column-grid">
          
          {/* LEFT COLUMN - Course Description */}
          <div className="python-about-left-content">
            <h2 className="python-about-section-heading">About This Course</h2>
            <p className="python-about-text">
              Master Python programming from fundamentals to advanced applications. This comprehensive course covers everything from basic syntax to web development, data analysis, and database integration through 8 structured modules.
            </p>
            
            <div className="python-about-highlights">
              <div className="python-highlight-item">
                <span className="python-highlight-bullet">✓</span>
                <span>30 weeks comprehensive training</span>
              </div>
              <div className="python-highlight-item">
                <span className="python-highlight-bullet">✓</span>
                <span>20+ hands-on projects</span>
              </div>
              <div className="python-highlight-item">
                <span className="python-highlight-bullet">✓</span>
                <span>Industry certification</span>
              </div>
            </div>
          </div>

          {/* CENTER COLUMN - Python Image */}
          <div className="python-about-center-content">
            <img 
              src={pythonAboutImage} 
              alt="Python Programming" 
              className="python-about-robot-image"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

          {/* RIGHT COLUMN - Course Features */}
          <div className="python-about-right-content">
            <h2 className="python-about-section-heading">What You'll Learn</h2>
            <p className="python-about-text">
              Build production-ready Python applications with modern frameworks and libraries. Learn industry best practices and real-world development workflows used by professional developers.
            </p>
            
            <div className="python-about-highlights">
              <div className="python-highlight-item">
                <span className="python-highlight-bullet">✓</span>
                <span>Complete web applications</span>
              </div>
              <div className="python-highlight-item">
                <span className="python-highlight-bullet">✓</span>
                <span>Data analysis & visualization</span>
              </div>
              <div className="python-highlight-item">
                <span className="python-highlight-bullet">✓</span>
                <span>Database integration</span>
              </div>
              <div className="python-highlight-item">
                <span className="python-highlight-bullet">✓</span>
                <span>RESTful API development</span>
              </div>
            </div>
          </div>
        </div>

        {/* Skills You'll Gain Section */}
        <div className="python-skills-section">
          <h3 className="python-skills-title">Skills You'll Master</h3>
          <div className="python-skills-tags-container">
            {displayedSkills.map((skill, index) => (
              <span key={index} className="python-skill-tag">{skill}</span>
            ))}
            <button className="python-view-more-skills" onClick={toggleSkills}>
              {showAllSkills ? 'Show Less ▲' : `View ${allSkills.length - limitedSkills.length} More ▼`}
            </button>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="python-about-cta-wrapper">
          <button className="python-about-enroll-button">Start Learning Python</button>
          <button className="python-about-curriculum-button">View Curriculum</button>
        </div>
      </div>
    </section>
  );
};

export default PythonCourseAboutSection;
