import React from 'react';
import './AICourseCoursesSection.css';
import coursesBackground from '../assets/coursesback.png'; // ADD YOUR BACKGROUND IMAGE

const AICourseCoursesSection = () => {
  const courses = [
    {
      id: 1,
      title: "Building AI Agents and Agentic Workflows",
      provider: "IBM",
      type: "Specialization",
      badge: "Free Trial",
      imageUrl: "placeholder-course-1.jpg"
    },
    {
      id: 2,
      title: "Claude Code: Software Engineering with Generative AI Agents",
      provider: "Vanderbilt University",
      type: "Course",
      badge: "Free Trial",
      imageUrl: "placeholder-course-2.jpg"
    },
    {
      id: 3,
      title: "AWS Generative AI for Developers",
      provider: "Amazon Web Services",
      type: "Professional Certificate",
      badge: "Free Trial",
      skills: "AI skills",
      imageUrl: "placeholder-course-3.jpg"
    },
    {
      id: 4,
      title: "Machine Learning Engineering for Production",
      provider: "DeepLearning.AI",
      type: "Specialization",
      badge: "Free Trial",
      imageUrl: "placeholder-course-4.jpg"
    },
    {
      id: 5,
      title: "Deep Learning Specialization",
      provider: "DeepLearning.AI",
      type: "Specialization",
      badge: "Free Trial",
      imageUrl: "placeholder-course-5.jpg"
    },
    {
      id: 6,
      title: "Natural Language Processing",
      provider: "DeepLearning.AI",
      type: "Specialization",
      badge: "Free Trial",
      imageUrl: "placeholder-course-6.jpg"
    },
    {
      id: 7,
      title: "Computer Vision Fundamentals",
      provider: "Stanford University",
      type: "Course",
      badge: "Free Trial",
      imageUrl: "placeholder-course-7.jpg"
    },
    {
      id: 8,
      title: "AI Product Management",
      provider: "Duke University",
      type: "Specialization",
      badge: "Free Trial",
      imageUrl: "placeholder-course-8.jpg"
    }
  ];

  return (
    <section className="courses-section" id="courses">
      <div className="courses-outer-container">
        <div className="courses-header">
          <h2 className="courses-main-title">Explore AI Courses</h2>
          <p className="courses-subtitle">
            Choose from industry-leading courses to advance your AI skills
          </p>
        </div>

        {/* CARDS CONTAINER WITH BACKGROUND */}
        <div 
          className="courses-cards-container"
          style={{ backgroundImage: `url(${coursesBackground})` }}
        >
          <div className="courses-grid">
            {courses.map((course) => (
              <div key={course.id} className="course-card">
                <div className="course-card-image">
                  <img 
                    src={course.imageUrl} 
                    alt={course.title}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x250/4A90E2/FFFFFF?text=Course+Image';
                    }}
                  />
                  <div className="course-badge">{course.badge}</div>
                  {course.skills && (
                    <div className="course-skills-badge">
                      <span>✦ {course.skills}</span>
                    </div>
                  )}
                </div>

                <div className="course-card-content">
                  <div className="course-provider">
                    <div className="provider-logo-placeholder"></div>
                    <span>{course.provider}</span>
                  </div>

                  <h3 className="course-title">{course.title}</h3>

                  <div className="course-meta">
                    <span className="course-type">{course.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        
      </div>
    </section>
  );
};

export default AICourseCoursesSection;
