import React from 'react';
import './AICourseOutcomesSection.css';
import outcomesImage from '../assets/outcomes-learning.png';

const AICourseOutcomesSection = () => {
  const bulletPoints = [
    'Understand core AI and Machine Learning concepts',

'Build and train ML and Deep Learning models',

'Work with real datasets and AI tools (TensorFlow, PyTorch, Scikit-learn)',

'Apply AI in domains like healthcare, finance, and education',

'Develop skills in NLP and computer vision',

'Learn to deploy AI models using cloud platforms',

'Understand ethics and responsible use of AI',
  ];

  return (
    <section className="outcomes-section" id="outcomes">
      <div className="outcomes-container">
        {/* LEFT: Content */}
        <div className="outcomes-content">
          <h2 className="outcomes-heading">AI Courses — Outcomes</h2>
          
          
          <p className="outcomes-subtext">
            When you enroll in this course, you'll also be enrolled in this Specialization.
          </p>

          <ul className="outcomes-list">
            {bulletPoints.map((point, index) => (
              <li key={index} className="outcomes-item">
                <span className="bullet-dot">•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT: Image */}
        <div className="outcomes-image-wrapper">
          <img 
            src={outcomesImage} 
            alt="Build your expertise" 
            className="outcomes-image"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/600x400/4A90E2/FFFFFF?text=Build+Expertise';
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default AICourseOutcomesSection;
