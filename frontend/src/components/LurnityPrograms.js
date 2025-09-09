import React, { Component } from 'react';
import { FaGraduationCap, FaChevronDown, FaChevronUp, FaArrowRight, FaDownload, FaClock, FaUsers, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './LurnityPrograms.css';
import aiimage from '../assets/ai-course.jpg'
import embedimage from '../assets/embedded-course.jpg'
import iotimage from '../assets/iot-course.jpg'
import roboticscourse from '../assets/robotics-course.jpg'

class LurnityPrograms extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openCurriculum: null,
    };

    this.coursesList = [
      { 
        id: 'ai', 
        title: 'AI & Machine Learning', 
        subtitle: 'Master the future of technology',
        bullets: ['Advanced Deep Learning', 'MLOps & Production', 'Computer Vision & NLP'], 
        img: aiimage,
        duration: '6 months',
        level: 'Advanced',
        credits: 'Access to GPT-4.0 credits worth 499',
        badge: 'Bestseller',
        rating: '4.8',
        students: '12,450',
        color: 'orange'
      },
      { 
        id: 'embedded', 
        title: 'Embedded Systems', 
        subtitle: 'Build hardware-software solutions',
        bullets: ['Real-Time Operating Systems', 'Hardware-Software Integration', 'IoT Protocols'], 
        img: embedimage,
        duration: '5 months',
        level: 'Expert',
        credits: 'Learn to use ChatGPT & Power BI, & more',
        badge: 'Popular',
        rating: '4.7',
        students: '8,920',
        color: 'blue'
      },
      { 
        id: 'iot', 
        title: 'Internet of Things', 
        subtitle: 'Connect the world through IoT',
        bullets: ['Edge Computing', 'Cloud Integration', 'Security & Privacy'], 
        img: iotimage,
        duration: '4 months',
        level: 'Intermediate',
        credits: 'Learn to use GitHub Copilot, Azure & more',
        badge: 'New',
        rating: '4.6',
        students: '6,780',
        color: 'green'
      },
      { 
        id: 'robotics', 
        title: 'Robotics & Automation', 
        subtitle: 'Create intelligent autonomous systems',
        bullets: ['Autonomous Systems', 'Computer Vision', 'ROS & Control Systems'], 
        img: roboticscourse,
        duration: '6 months',
        level: 'Advanced',
        credits: 'Learn advanced robotics with ROS2 & more',
        badge: 'Featured',
        rating: '4.9',
        students: '5,340',
        color: 'purple'
      },
    ];
  }

  toggleCurriculum = (id) => {
    this.setState(({ openCurriculum }) => ({ 
      openCurriculum: openCurriculum === id ? null : id 
    }));
  }

  render() {
    const { openCurriculum } = this.state;
    const { onBookDemo } = this.props;

    return (
      <div className="lurnity-programs-wrapper">
        <section className="luxury-programs" id="programs">
          <div className="section-content">
            <div className="section-header">
              <div className="section-badge">Our Programs</div>
              <h2 className="section-title">
                <span className="gradient-text">Lurnity</span> Programs
              </h2>
              <p className="section-subtitle">
                Industry-leading certification programs designed by experts from top tech companies
              </p>
            </div>

            <div className="programs-grid-container">
              <div className="programs-grid">
                {this.coursesList.map((course, index) => (
                  <div key={course.id} className={`program-card-container ${course.color}-theme`}>
                    {course.badge && (
                      <div className={`program-badge ${course.badge.toLowerCase()}`}>
                        {course.badge}
                      </div>
                    )}
                    
                    <div className="program-card">
                      <div className="program-visual">
                        <div className="program-image">
                          <img src={course.img} alt={course.title} />
                          <div className="image-overlay"></div>
                        </div>
                        <div className="program-logo">
                          <div className="logo-icon">
                            <FaGraduationCap />
                          </div>
                          <span className="logo-text">Lurnity</span>
                        </div>
                      </div>

                      <div className="program-content">
                        <div className="program-header">
                          <div className="program-provider">Lurnity</div>
                          <div className="program-rating">
                            <FaStar className="star-icon" />
                            <span>{course.rating}</span>
                            <span className="students-count">({course.students} students)</span>
                          </div>
                        </div>

                        <h3 className="program-title">{course.title}</h3>
                        <p className="program-subtitle">{course.subtitle}</p>
                        <p className="program-credits">{course.credits}</p>

                        <div className="program-meta">
                          <div className="meta-item">
                            <FaGraduationCap className="meta-icon" />
                            <span>Certification</span>
                          </div>
                          <div className="meta-item">
                            <FaClock className="meta-icon" />
                            <span>{course.duration || '4-6 months'}</span>
                          </div>
                        </div>

                        <div className="program-skills">
                          {course.bullets.slice(0, 3).map((skill, i) => (
                            <span key={i} className="skill-tag">{skill}</span>
                          ))}
                        </div>

                        <div className="program-actions">
                          <Link to={`/course/${course.id}`} className="btn-view-program">
                            View Program
                          </Link>
                          <button 
                            className="btn-syllabus" 
                            onClick={() => this.toggleCurriculum(course.id)}
                          >
                            <FaDownload />
                            Syllabus
                          </button>
                        </div>

                        {openCurriculum === course.id && (
                          <div className="curriculum-expansion">
                            <div className="curriculum-content">
                              <h4 className="curriculum-title">Course Modules</h4>
                              <div className="curriculum-modules">
                                <div className="module-item">
                                  <div className="module-number">01</div>
                                  <div className="module-details">
                                    <h5>Foundations & Setup</h5>
                                    <p>Development environment, best practices, industry standards</p>
                                  </div>
                                </div>
                                <div className="module-item">
                                  <div className="module-number">02</div>
                                  <div className="module-details">
                                    <h5>Advanced Concepts</h5>
                                    <p>Deep dive into core technologies and system design</p>
                                  </div>
                                </div>
                                <div className="module-item">
                                  <div className="module-number">03</div>
                                  <div className="module-details">
                                    <h5>Production Projects</h5>
                                    <p>Real-world projects and deployment strategies</p>
                                  </div>
                                </div>
                              </div>
                              <button className="download-full-curriculum" onClick={onBookDemo}>
                                <FaDownload />
                                Download Complete Curriculum
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

export default LurnityPrograms;
