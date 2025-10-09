import React from 'react';
import './PythonCourseCareerSection.css';

const PythonCourseCareerSection = () => {
  const careers = [
    {
      id: 1,
      title: 'Python Developer',
      description: 'Build and maintain Python applications, write clean code, develop APIs, and work with databases. Essential role in modern software development.',
      salary: '₹5-12 LPA',
      salaryRange: '5-12 LPA',
      experience: '0-3 years',
      skills: ['Python', 'Django', 'Flask', 'REST API'],
      demand: 'Very High'
    },
    {
      id: 2,
      title: 'Full Stack Python Developer',
      description: 'Develop complete web applications using Python frameworks for backend and modern JavaScript frameworks for frontend.',
      salary: '₹7-15 LPA',
      salaryRange: '7-15 LPA',
      experience: '1-4 years',
      skills: ['Django', 'Flask', 'React', 'PostgreSQL'],
      demand: 'Very High'
    },
    {
      id: 3,
      title: 'Data Analyst',
      description: 'Analyze datasets using Python libraries, create visualizations, generate reports, and provide data-driven insights for business decisions.',
      salary: '₹4-10 LPA',
      salaryRange: '4-10 LPA',
      experience: '0-2 years',
      skills: ['Pandas', 'NumPy', 'Matplotlib', 'SQL'],
      demand: 'High'
    },
    {
      id: 4,
      title: 'Backend Developer',
      description: 'Design and implement server-side logic, develop RESTful APIs, manage databases, and ensure application performance and scalability.',
      salary: '₹6-14 LPA',
      salaryRange: '6-14 LPA',
      experience: '1-3 years',
      skills: ['Python', 'REST API', 'MongoDB', 'Redis'],
      demand: 'Very High'
    },
    {
      id: 5,
      title: 'DevOps Engineer',
      description: 'Automate deployment processes, manage cloud infrastructure, write Python scripts for automation, and ensure system reliability.',
      salary: '₹7-16 LPA',
      salaryRange: '7-16 LPA',
      experience: '2-4 years',
      skills: ['Python', 'Docker', 'AWS', 'Jenkins'],
      demand: 'High'
    },
    {
      id: 6,
      title: 'Software Engineer',
      description: 'Design, develop, and test software applications using Python. Work on complex problems and collaborate with cross-functional teams.',
      salary: '₹6-15 LPA',
      salaryRange: '6-15 LPA',
      experience: '0-3 years',
      skills: ['Python', 'OOP', 'Git', 'Testing'],
      demand: 'Very High'
    }
  ];

  return (
    <section className="python-career-section" id="python-career">
      <div className="python-career-container">
        {/* Header */}
        <div className="python-career-header">
          <span className="python-career-label">Career Opportunities</span>
          <h2 className="python-career-main-title">Launch Your Python Career</h2>
          <p className="python-career-subtitle">
            Master Python and unlock diverse career paths in web development, data analysis, automation, and more.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="python-career-stats">
          <div className="python-stat-item">
            <span className="python-stat-number">8000+</span>
            <span className="python-stat-label">Successful Developers</span>
          </div>
          <div className="python-stat-divider"></div>
          <div className="python-stat-item">
            <span className="python-stat-number">88%</span>
            <span className="python-stat-label">Job Placement Rate</span>
          </div>
          <div className="python-stat-divider"></div>
          <div className="python-stat-item">
            <span className="python-stat-number">₹9.8L</span>
            <span className="python-stat-label">Average Package</span>
          </div>
        </div>

        {/* Career Cards Grid */}
        <div className="python-career-grid">
          {careers.map((career) => (
            <div key={career.id} className="python-career-role-card">
              {/* Demand Badge */}
              <div className="python-career-demand-badge" data-demand={career.demand}>
                {career.demand} Demand
              </div>

              {/* Card Header */}
              <div className="python-career-role-header">
                <h3 className="python-career-role-title">{career.title}</h3>
              </div>

              {/* Experience & Salary */}
              <div className="python-career-meta">
                <div className="python-career-experience">
                  <span className="python-meta-icon">💼</span>
                  <span className="python-meta-text">{career.experience}</span>
                </div>
                <div className="python-career-salary">
                  <span className="python-meta-icon">💰</span>
                  <span className="python-meta-text">₹{career.salaryRange}</span>
                </div>
              </div>

              {/* Description */}
              <p className="python-career-role-description">{career.description}</p>

              {/* Skills Tags */}
              <div className="python-career-skills-section">
                <span className="python-skills-label">Key Skills:</span>
                <div className="python-career-skills-tags">
                  {career.skills.map((skill, index) => (
                    <span key={index} className="python-career-skill-tag">{skill}</span>
                  ))}
                </div>
              </div>

              {/* Explore Button */}
              <button className="python-career-explore-role-btn">
                Explore Role <span className="python-arrow">→</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PythonCourseCareerSection;
