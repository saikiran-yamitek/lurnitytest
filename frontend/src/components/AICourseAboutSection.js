import React, { useState } from 'react';
import './AICourseAboutSection.css';
import robotHand from '../assets/aboutairobotichand.png';

const AICourseAboutSection = () => {
  const [showAllSkills, setShowAllSkills] = useState(true);

  const allSkills = [
    'OpenAI',
    'Supervised Learning',
    'Emerging Technologies',
    'Applied Machine Learning',
    'Business Ethics',
    'Machine Learning',
    'Technology Strategies',
    'Data Ethics',
    'Artificial Intelligence and Machine Learning (AI/ML)',
    'Artificial Intelligence',
    'Deep Learning',
    'Business Intelligence',
    'Anthropic Claude',
    'Generative AI',
    'Responsible AI',
    'Human Machine Interfaces'
  ];

  const limitedSkills = allSkills.slice(0, 8); // Show first 8 skills when collapsed

  const displayedSkills = showAllSkills ? allSkills : limitedSkills;

  const toggleSkills = () => {
    setShowAllSkills(!showAllSkills);
  };

  return (
    <section className="about-section" id="about">
      <div className="about-container">
        <div className="about-three-column-grid">
          
          {/* LEFT COLUMN - Course Description */}
          <div className="about-left-content">
            <h2 className="about-section-heading">About this program</h2>
            <p className="about-text">
              This comprehensive AI course is designed to take you from fundamentals to advanced applications. 
              Master machine learning, deep learning, and neural networks through hands-on projects and real-world case studies.
            </p>
            
            <div className="about-highlights">
              <div className="highlight-item">
                <span className="highlight-bullet">✓</span>
                <span>Industry-recognized certification</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-bullet">✓</span>
                <span>10+ hands-on projects</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-bullet">✓</span>
                <span>Expert instructor support</span>
              </div>
            </div>
          </div>

          {/* CENTER COLUMN - Robot Image */}
          <div className="about-center-content">
            <img 
              src={robotHand} 
              alt="AI Learning" 
              className="about-robot-image"
            />
          </div>

          {/* RIGHT COLUMN - Course Features */}
          <div className="about-right-content">
            <h2 className="about-section-heading">Course Features</h2>
            <p className="about-text">
              Build expertise in AI technologies that are revolutionizing industries worldwide. 
              Learn from experts with 10+ years of experience at top tech companies.
            </p>
            
            <div className="about-highlights">
              <div className="highlight-item">
                <span className="highlight-bullet">✓</span>
                <span>100% online, learn anywhere</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-bullet">✓</span>
                <span>Flexible schedule options</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-bullet">✓</span>
                <span>Real-world case studies</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-bullet">✓</span>
                <span>Career development support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Skills You'll Gain Section */}
        

        {/* Bottom CTA */}
        <div className="about-cta-wrapper">
          <button className="about-enroll-button">Enroll Now</button>
          
        </div>
      </div>
    </section>
  );
};

export default AICourseAboutSection;
