import React from 'react';
import './AICourseCareerSection.css';

const AICourseCareerSection = () => {
  const careers = [
    {
      id: 1,
      title: 'Machine Learning Engineer',
      description: 'Design, develop, and deploy scalable ML models into production systems. Work with data pipelines, model optimization, and MLOps practices.',
      salary: '₹8-15 LPA',
      salaryRange: '8-15 LPA',
      experience: '0-3 years',
      skills: ['Python', 'TensorFlow', 'MLOps', 'Docker'],
      demand: 'High'
    },
    {
      id: 2,
      title: 'AI Research Scientist',
      description: 'Conduct cutting-edge research in AI/ML, develop novel algorithms, and publish findings in top-tier conferences and journals.',
      salary: '₹10-20 LPA',
      salaryRange: '10-20 LPA',
      experience: '1-4 years',
      skills: ['Research', 'Deep Learning', 'Publications', 'PyTorch'],
      demand: 'Very High'
    },
    {
      id: 3,
      title: 'Data Scientist',
      description: 'Extract actionable insights from complex datasets using ML, statistical analysis, and data visualization techniques.',
      salary: '₹7-14 LPA',
      salaryRange: '7-14 LPA',
      experience: '0-3 years',
      skills: ['Statistics', 'ML', 'Data Analysis', 'SQL'],
      demand: 'High'
    },
    {
      id: 4,
      title: 'Computer Vision Engineer',
      description: 'Build and optimize image and video analysis systems using deep learning for applications in healthcare, automotive, and surveillance.',
      salary: '₹9-16 LPA',
      salaryRange: '9-16 LPA',
      experience: '1-3 years',
      skills: ['OpenCV', 'CNNs', 'Image Processing', 'YOLO'],
      demand: 'Very High'
    },
    {
      id: 5,
      title: 'NLP Engineer',
      description: 'Develop language models, chatbots, sentiment analysis tools, and text generation systems using transformer architectures.',
      salary: '₹8-15 LPA',
      salaryRange: '8-15 LPA',
      experience: '0-3 years',
      skills: ['NLP', 'Transformers', 'LLMs', 'BERT'],
      demand: 'High'
    },
    {
      id: 6,
      title: 'AI Solutions Architect',
      description: 'Design end-to-end AI systems architecture for enterprise applications, ensuring scalability, security, and performance.',
      salary: '₹12-22 LPA',
      salaryRange: '12-22 LPA',
      experience: '3-6 years',
      skills: ['System Design', 'Cloud', 'Architecture', 'AWS'],
      demand: 'Very High'
    }
  ];

  return (
    <section className="career-section" id="career">
      <div className="career-container">
        {/* Header */}
        <div className="career-header">
          <span className="career-label">Career Opportunities</span>
          <h2 className="career-main-title">Launch Your AI Career</h2>
          <p className="career-subtitle">
            Graduate with industry-ready skills for high-demand AI roles. Our alumni work at top tech companies worldwide.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="career-stats">
          <div className="stat-item">
            <span className="stat-number">5000+</span>
            <span className="stat-label">Successful Alumni</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">92%</span>
            <span className="stat-label">Job Placement Rate</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">₹12.5L</span>
            <span className="stat-label">Average Package</span>
          </div>
        </div>

        {/* Career Cards Grid */}
        <div className="career-grid">
          {careers.map((career) => (
            <div key={career.id} className="career-role-card">
              {/* Demand Badge */}
              <div className="career-demand-badge" data-demand={career.demand}>
                {career.demand} Demand
              </div>

              {/* Card Header */}
              <div className="career-role-header">
                <h3 className="career-role-title">{career.title}</h3>
              </div>

              {/* Experience & Salary */}
              <div className="career-meta">
                <div className="career-experience">
                  <span className="meta-icon">💼</span>
                  <span className="meta-text">{career.experience}</span>
                </div>
                <div className="career-salary">
                  <span className="meta-icon">💰</span>
                  <span className="meta-text">₹{career.salaryRange}</span>
                </div>
              </div>

              {/* Description */}
              <p className="career-role-description">{career.description}</p>

              {/* Skills Tags */}
              <div className="career-skills-section">
                <span className="skills-label">Key Skills:</span>
                <div className="career-skills-tags">
                  {career.skills.map((skill, index) => (
                    <span key={index} className="career-skill-tag">{skill}</span>
                  ))}
                </div>
              </div>

              {/* Explore Button */}
              <button className="career-explore-role-btn">
                Explore Role <span className="arrow">→</span>
              </button>
            </div>
          ))}
        </div>

       
      </div>
    </section>
  );
};

export default AICourseCareerSection;
