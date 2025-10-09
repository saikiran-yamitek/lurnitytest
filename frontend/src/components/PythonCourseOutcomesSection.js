import React from 'react';
import './PythonCourseOutcomesSection.css';
import outcomesImage from '../assets/outcomes-learning.png';

const PythonCourseOutcomesSection = () => {
  const bulletPoints = [
    'Master Python fundamentals: variables, data types, control flow, and functions',
    
    'Build complex applications using Object-Oriented Programming principles',
    
    'Work with popular Python libraries: NumPy, Pandas, and Matplotlib',
    
    'Develop full-stack web applications using Django and Flask frameworks',
    
    'Integrate databases (SQL and MongoDB) into Python applications',
    
    'Create RESTful APIs for modern web services',
    
    'Handle file operations, exceptions, and debugging efficiently',
    
    'Complete a capstone project demonstrating real-world Python skills'
  ];

  return (
    <section className="python-outcomes-section" id="python-outcomes">
      <div className="python-outcomes-container">
        {/* LEFT: Content */}
        <div className="python-outcomes-content">
          <h2 className="python-outcomes-heading">Python Course — Learning Outcomes</h2>
          
          <p className="python-outcomes-subtext">
            By completing this comprehensive Python course, you'll gain practical skills needed for professional software development.
          </p>

          <ul className="python-outcomes-list">
            {bulletPoints.map((point, index) => (
              <li key={index} className="python-outcomes-item">
                <span className="python-bullet-dot">•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT: Image */}
        <div className="python-outcomes-image-wrapper">
          <img 
            src={outcomesImage} 
            alt="Python Learning Outcomes" 
            className="python-outcomes-image"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/600x400/192540/FFFFFF?text=Python+Mastery';
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default PythonCourseOutcomesSection;
