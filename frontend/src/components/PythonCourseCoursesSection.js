import React from 'react';
import './PythonCourseCoursesSection.css';
import coursesBackground from '../assets/coursesback.png';

const PythonCourseCoursesSection = () => {
  const courseModules = [
    {
      id: 1,
      title: "Python Fundamentals",
      duration: "4 weeks",
      skills: ["Variables", "Data Types", "Operators", "Control Flow"],
      level: "Beginner"
    },
    {
      id: 2,
      title: "Data Structures",
      duration: "3 weeks",
      skills: ["Lists", "Tuples", "Dictionaries", "Sets"],
      level: "Beginner"
    },
    {
      id: 3,
      title: "Functions & OOP",
      duration: "4 weeks",
      skills: ["Functions", "Classes", "Objects", "Inheritance"],
      level: "Intermediate"
    },
    {
      id: 4,
      title: "File Handling & Exceptions",
      duration: "2 weeks",
      skills: ["File I/O", "Error Handling", "Debugging"],
      level: "Intermediate"
    },
    {
      id: 5,
      title: "Python Libraries",
      duration: "3 weeks",
      skills: ["NumPy", "Pandas", "Matplotlib"],
      level: "Intermediate"
    },
    {
      id: 6,
      title: "Web Development",
      duration: "4 weeks",
      skills: ["Flask", "Django", "REST APIs"],
      level: "Advanced"
    },
    {
      id: 7,
      title: "Database Integration",
      duration: "3 weeks",
      skills: ["SQL", "MongoDB", "SQLAlchemy"],
      level: "Advanced"
    },
    {
      id: 8,
      title: "Capstone Project",
      duration: "4 weeks",
      skills: ["Real-world Application", "Full Stack Development"],
      level: "Advanced"
    }
  ];

  return (
    <div className="python-courses-wrapper">
      <section className="python-courses-section" id="python-courses">
        <div className="python-courses-outer-container">
          <div className="python-courses-header">
            <h2 className="python-courses-main-title">Complete Python Programming Course</h2>
            <p className="python-courses-subtitle">
              Master Python from fundamentals to advanced applications in 8 comprehensive modules
            </p>
          </div>

          {/* Course Overview Card */}
          <div className="python-course-overview">
            <div className="python-overview-content">
              <div className="python-overview-stats">
                <div className="python-stat-item">
                  <span className="python-stat-number">30 weeks</span>
                  <span className="python-stat-label">Duration</span>
                </div>
                <div className="python-stat-divider"></div>
                <div className="python-stat-item">
                  <span className="python-stat-number">8 modules</span>
                  <span className="python-stat-label">Comprehensive</span>
                </div>
                <div className="python-stat-divider"></div>
                <div className="python-stat-item">
                  <span className="python-stat-number">20+ projects</span>
                  <span className="python-stat-label">Hands-on</span>
                </div>
                <div className="python-stat-divider"></div>
                <div className="python-stat-item">
                  <span className="python-stat-number">Certificate</span>
                  <span className="python-stat-label">Industry Recognized</span>
                </div>
              </div>
            </div>
          </div>

          {/* MODULES CONTAINER WITH BACKGROUND */}
          <div 
            className="python-modules-container"
            style={{ backgroundImage: `url(${coursesBackground})` }}
          >
            <div className="python-modules-grid">
              {courseModules.map((module) => (
                <div key={module.id} className="python-module-card">
                  <div className="python-module-header">
                    <h3 className="python-module-title">{module.title}</h3>
                    <span className={`python-level-badge ${module.level.toLowerCase()}`}>
                      {module.level}
                    </span>
                  </div>

                  <div className="python-module-content">
                    <div className="python-skills-section">
                      <span className="python-skills-label">You'll Learn:</span>
                      <div className="python-skills-tags">
                        {module.skills.map((skill, index) => (
                          <span key={index} className="python-skill-tag">{skill}</span>
                        ))}
                      </div>
                    </div>

                    <div className="python-module-footer">
                      <div className="python-duration">
                        <span className="python-duration-icon">⏱</span>
                        <span>{module.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="python-courses-cta">
            <button className="python-enroll-btn">Enroll in Full Course</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PythonCourseCoursesSection;
