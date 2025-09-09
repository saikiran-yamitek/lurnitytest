import React, { useRef, useEffect } from 'react';
import { FaChalkboardTeacher, FaLaptopCode, FaHandshake, FaCertificate } from 'react-icons/fa';
import './WhyChooseLurnity.css';

const WhyChooseLurnity = ({ onBookDemo }) => {
  const timelineRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.3 }
    );

    const timelineItems = timelineRef.current?.querySelectorAll('.timeline-card-item');
    timelineItems?.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  const timelineSteps = [
    {
      id: 1,
      phase: "FOUNDATION PHASE (2 MONTHS)",
      title: "Elite Mentorship Program",
      description: "Personal guidance from industry leaders at FAANG companies with weekly one-on-one sessions and career acceleration.",
      icon: FaChalkboardTeacher,
      position: "top-left"
    },
    {
      id: 2,
      phase: "DEVELOPMENT PHASE (3 MONTHS)",
      title: "Production-Grade Projects",
      description: "Build enterprise-level systems deployed to millions of users with real business impact and cloud deployment.",
      icon: FaLaptopCode,
      position: "bottom-left"
    },
    {
      id: 3,
      phase: "PLACEMENT PHASE (1 MONTH)",
      title: "Guaranteed Job Placement",
      description: "Exclusive partnerships with 300+ companies and dedicated career support until you land your dream role.",
      icon: FaHandshake,
      position: "top-right"
    },
    {
      id: 4,
      phase: "GROWTH PHASE (LIFETIME)",
      title: "Continuous Excellence",
      description: "Blockchain certificates, alumni network access, and lifetime learning resources for career advancement.",
      icon: FaCertificate,
      position: "bottom-right"
    }
  ];

  return (
    <div className="why-choose-lurnity-wrapper">
      <section className="luxury-why-timeline">
        <div className="section-content">
          <div className="section-header">
            <div className="section-badge">Why Choose Us</div>
            <h2 className="section-title">
              Your Journey to <span className="gradient-text">Success</span>
            </h2>
            <p className="section-subtitle">
              Experience a structured path to excellence with our proven methodology
            </p>
          </div>

          <div className="timeline-container" ref={timelineRef}>
            {/* Curved SVG Path */}
            <svg className="timeline-curve" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="dotGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FFA500" />
                  <stop offset="50%" stopColor="#FF8C00" />
                  <stop offset="100%" stopColor="#FFA500" />
                </linearGradient>
              </defs>
              <path
                d="M 150 80 Q 400 200 650 80 Q 400 300 150 220 Q 400 400 650 320 Q 400 500 150 420"
                stroke="url(#dotGradient)"
                strokeWidth="3"
                fill="none"
                strokeDasharray="8,12"
                className="animated-path"
              />
              
              {/* Timeline Dots */}
              <circle cx="150" cy="80" r="8" fill="#FFA500" className="timeline-dot-svg" />
              <circle cx="150" cy="220" r="8" fill="#FFA500" className="timeline-dot-svg" />
              <circle cx="650" cy="80" r="8" fill="#FFA500" className="timeline-dot-svg" />
              <circle cx="650" cy="320" r="8" fill="#FFA500" className="timeline-dot-svg" />
            </svg>

            <div className="timeline-grid">
              {timelineSteps.map((step, index) => (
                <div key={step.id} className={`timeline-card-item ${step.position} delay-${index}`}>
                  <div className="timeline-card">
                    <div className="card-header">
                      <div className="timeline-icon">
                        <step.icon />
                      </div>
                      <div className="step-number">{step.id}</div>
                    </div>
                    
                    <div className="card-content">
                      <div className="timeline-phase">{step.phase}</div>
                      <h4 className="timeline-title">{step.title}</h4>
                      <p className="timeline-description">{step.description}</p>
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
};

export default WhyChooseLurnity;
