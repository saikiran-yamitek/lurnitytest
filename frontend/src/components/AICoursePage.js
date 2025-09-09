import React, { useState, useEffect } from 'react';
import { 
  FaArrowLeft, FaStar, FaUsers, FaTrophy, FaChartLine, FaClock, 
  FaCode, FaUserGraduate, FaPlay, FaRocket, FaCheckCircle, 
  FaBrain, FaRobot, FaDatabase, FaCloud, FaLinkedin, FaQuoteLeft,
  FaArrowRight, FaShieldAlt, FaTimes, FaGraduationCap, FaChevronDown,
  FaChevronUp, FaDownload, FaChevronLeft, FaChevronRight, FaFire,
  FaLightbulb, FaMagic, FaBolt, FaHeart, FaGem, FaInfinity
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import DemoForm from './DemoForm';
import './AICoursePage.css';

// Import your existing images
import aiCourseHero from '../assets/ai-course.jpg';
import aiProjectDemo from '../assets/hero-learning.jpg';
import mentorAI1 from '../assets/img1.jpeg';
import mentorAI2 from '../assets/img2.jpeg';
import mentorAI3 from '../assets/img3.jpeg';
import logo from '../assets/lurnity_original.jpg';

const AICoursePage = () => {
  const [activeModule, setActiveModule] = useState(0);
  const [selectedProject, setSelectedProject] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [showDemoForm, setShowDemoForm] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Course data with motivational content
  const courseData = {
    title: "AI & Machine Learning Mastery",
    subtitle: "Transform Your Future. Master AI. Lead Innovation.",
    description: "Don't just learn AI—become an AI innovator. Join thousands who've transformed their careers with cutting-edge machine learning skills. From neural networks to production deployment, build the future of technology and secure your place in the AI revolution.",
    duration: "6 months",
    rating: 4.9,
    students: 2000,
    placement: 98,
    salary: "₹20-50L",
    projects: 15,
    motivationalQuote: "Your AI journey starts with a single step. Take it today."
  };

  const timelineModules = [
    {
      title: "AI Foundations & Python Mastery",
      duration: "4 weeks",
      description: "Build your AI foundation with Python mastery and mathematical concepts",
      topics: ["Python for AI", "Mathematics for ML", "Statistics & Probability", "Data Structures", "Algorithm Optimization"],
      projects: ["Data Analysis Dashboard", "Statistical Modeling Tool"],
      milestone: "Foundation Expert",
      color: "#ff6b6b"
    },
    {
      title: "Machine Learning Algorithms",
      duration: "6 weeks", 
      description: "Master core ML algorithms and implement real-world solutions",
      topics: ["Supervised Learning", "Unsupervised Learning", "Reinforcement Learning", "Feature Engineering", "Model Selection"],
      projects: ["Predictive Analytics System", "Recommendation Engine", "Fraud Detection Model"],
      milestone: "ML Specialist",
      color: "#4ecdc4"
    },
    {
      title: "Deep Learning & Neural Networks",
      duration: "8 weeks",
      description: "Dive deep into neural networks and advanced deep learning",
      topics: ["Neural Network Architecture", "CNN & RNN", "LSTM & GRU", "Transfer Learning", "Model Optimization"],
      projects: ["Image Classification System", "Natural Language Processor", "Time Series Predictor"],
      milestone: "Deep Learning Pro",
      color: "#45b7d1"
    },
    {
      title: "Computer Vision & NLP",
      duration: "6 weeks",
      description: "Become an expert in computer vision and natural language processing",
      topics: ["Image Processing", "Object Detection", "Text Processing", "Sentiment Analysis", "Language Models"],
      projects: ["Real-time Object Tracker", "Chatbot with NLP", "Document Analyzer"],
      milestone: "Vision & Language Expert",
      color: "#f9ca24"
    },
    {
      title: "Generative AI & LLMs",
      duration: "4 weeks",
      description: "Master the latest in generative AI and large language models",
      topics: ["Transformer Architecture", "GPT Models", "Fine-tuning", "Prompt Engineering", "AI Ethics"],
      projects: ["Custom AI Assistant", "Content Generation Tool", "Code Generation System"],
      milestone: "Generative AI Master",
      color: "#6c5ce7"
    },
    {
      title: "MLOps & Production Deployment",
      duration: "4 weeks",
      description: "Deploy and scale AI models in production environments",
      topics: ["Model Deployment", "CI/CD for ML", "Monitoring & Maintenance", "Scaling ML Systems", "Cloud Platforms"],
      projects: ["Production ML Pipeline", "Real-time AI Service", "Scalable AI Platform"],
      milestone: "Production Ready",
      color: "#fd79a8"
    }
  ];

  const projects = [
    {
      title: "AI-Powered E-commerce Recommendation System",
      description: "Build a sophisticated recommendation engine that revolutionizes online shopping experiences and drives massive conversion growth.",
      tech: ["Python", "TensorFlow", "AWS", "Redis", "MongoDB"],
      impact: "Increased client sales by 35%",
      image: aiProjectDemo,
      liveDemo: true
    },
    {
      title: "Computer Vision Security System", 
      description: "Develop real-time facial recognition and anomaly detection that's deployed in 50+ locations worldwide.",
      tech: ["OpenCV", "PyTorch", "Docker", "Kubernetes", "NVIDIA"],
      impact: "Protecting 50+ locations globally",
      image: aiProjectDemo,
      liveDemo: true
    },
    {
      title: "Natural Language Processing Chatbot",
      description: "Create an intelligent customer service bot that understands emotions and context, saving companies millions.",
      tech: ["NLTK", "Transformers", "Flask", "MongoDB", "Dialogflow"],
      impact: "Reduced support costs by 60%",
      image: aiProjectDemo,
      liveDemo: true
    }
  ];

  const mentors = [
    {
      name: "Dr. Priya Sharma",
      title: "Former Google AI Research Scientist",
      experience: "12+ years",
      expertise: "Deep Learning Pioneer",
      achievements: "50+ research papers, 10+ patents, Led breakthrough AI research",
      image: mentorAI1,
      linkedin: "#",
      quote: "AI is not about replacing humans—it's about amplifying human potential."
    },
    {
      name: "Rajesh Kumar",
      title: "Principal ML Engineer at Microsoft",
      experience: "15+ years", 
      expertise: "Production ML Systems",
      achievements: "Built systems serving 100M+ users, Led ML infrastructure at scale",
      image: mentorAI2,
      linkedin: "#",
      quote: "The future belongs to those who can deploy AI at scale."
    },
    {
      name: "Dr. Anita Patel",
      title: "AI Director at Amazon",
      experience: "10+ years",
      expertise: "Generative AI & LLMs",
      achievements: "Led Alexa ML team, 30+ patents, Pioneered conversational AI",
      image: mentorAI3,
      linkedin: "#",
      quote: "Generative AI is the new electricity—it will transform everything."
    }
  ];

  const testimonials = [
    {
      name: "Arjun Singh",
      role: "Senior ML Engineer at Google",
      company: "Google",
      text: "Lurnity didn't just teach me AI—it transformed my entire mindset. I went from dreaming about working at Google to actually building AI systems that millions use daily. The hands-on approach and world-class mentorship made the impossible possible.",
      salary: "₹45L",
      previousRole: "Software Developer",
      careerJump: "400% salary increase"
    },
    {
      name: "Sneha Reddy", 
      role: "AI Research Scientist at Microsoft",
      company: "Microsoft",
      text: "This course is pure magic. In 6 months, I went from basic programming to leading AI research at Microsoft. The curriculum is cutting-edge, the mentors are legends, and the results speak for themselves. My life completely changed.",
      salary: "₹42L",
      previousRole: "Data Analyst",
      careerJump: "350% salary increase"
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    
    const testimonialTimer = setInterval(() => {
      setTestimonialIndex(prev => (prev + 1) % testimonials.length);
    }, 6000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(testimonialTimer);
    };
  }, [testimonials.length]);

  return (
    <div className="ai-course-motivational">
      {/* Motivational Header */}
      <header className={`course-header-motivational ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-container-motivational">
          <Link to="/" className="brand-link-motivational">
            <FaArrowLeft className="back-icon-motivational" />
            <img src={logo} alt="Lurnity" className="brand-logo-motivational" />
            <span className="brand-text-motivational">Back to Home</span>
          </Link>
          
          <nav className="main-nav-motivational">
            <a href="#overview" className="nav-link-motivational">Journey</a>
            <a href="#curriculum" className="nav-link-motivational">Roadmap</a>
            <a href="#projects" className="nav-link-motivational">Projects</a>
            <a href="#mentors" className="nav-link-motivational">Mentors</a>
          </nav>
          
          <div className="header-actions-motivational">
            <button 
              className="demo-button-motivational"
              onClick={() => setShowDemoForm(true)}
            >
              <FaPlay />
              Book Demo
            </button>
            <button 
              className="enroll-button-motivational"
              onClick={() => setShowEnrollForm(true)}
            >
              <FaRocket />
              Start Journey
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section - Full Width & Motivational */}
      <section className="hero-section-motivational" id="overview">
        <div className="hero-background-motivational">
          <div className="floating-elements-motivational">
            <div className="floating-element brain"><FaBrain /></div>
            <div className="floating-element rocket"><FaRocket /></div>
            <div className="floating-element star"><FaStar /></div>
            <div className="floating-element bolt"><FaBolt /></div>
          </div>
        </div>
        
        <div className="hero-container-motivational">
          <div className="hero-content-motivational">
            <div className="hero-text-motivational">
              <div className="motivational-badge">
                <FaFire className="badge-fire" />
                <span>Join 2000+ AI Success Stories</span>
              </div>
              
              <h1 className="course-title-motivational">
                {courseData.title}
                <span className="title-spark">✨</span>
              </h1>
              <h2 className="course-subtitle-motivational">{courseData.subtitle}</h2>
              <p className="course-description-motivational">{courseData.description}</p>

              <div className="motivational-quote">
                <FaQuoteLeft className="quote-icon" />
                <p>{courseData.motivationalQuote}</p>
              </div>

              <div className="course-stats-motivational">
                <div className="stat-card-motivational">
                  <div className="stat-icon-motivational star">
                    <FaStar />
                  </div>
                  <div className="stat-content-motivational">
                    <span className="stat-value-motivational">{courseData.rating}</span>
                    <span className="stat-label-motivational">Student Rating</span>
                  </div>
                </div>
                
                <div className="stat-card-motivational">
                  <div className="stat-icon-motivational users">
                    <FaUsers />
                  </div>
                  <div className="stat-content-motivational">
                    <span className="stat-value-motivational">{courseData.students}+</span>
                    <span className="stat-label-motivational">Success Stories</span>
                  </div>
                </div>
                
                <div className="stat-card-motivational">
                  <div className="stat-icon-motivational trophy">
                    <FaTrophy />
                  </div>
                  <div className="stat-content-motivational">
                    <span className="stat-value-motivational">{courseData.placement}%</span>
                    <span className="stat-label-motivational">Placement Support</span>
                  </div>
                </div>
                
                <div className="stat-card-motivational">
                  <div className="stat-icon-motivational chart">
                    <FaChartLine />
                  </div>
                  <div className="stat-content-motivational">
                    <span className="stat-value-motivational">{courseData.salary}</span>
                    <span className="stat-label-motivational">Salary Range</span>
                  </div>
                </div>
              </div>

              <div className="hero-actions-motivational">
                <button 
                  className="primary-cta-motivational"
                  onClick={() => setShowEnrollForm(true)}
                >
                  <FaRocket />
                  <span>Transform Your Career Now</span>
                  <div className="button-glow"></div>
                </button>
                <button 
                  className="secondary-cta-motivational"
                  onClick={() => setShowDemoForm(true)}
                >
                  <FaPlay />
                  <span>Book Your Demo</span>
                </button>
              </div>
            </div>

            <div className="hero-visual-motivational">
              <div className="hero-image-container-motivational">
                <img src={aiCourseHero} alt="AI Success Journey" className="hero-image-motivational" />
                <div className="image-overlay-motivational">
                  <div className="success-badges">
                    <div className="success-badge">
                      <FaClock />
                      <span>{courseData.duration} Journey</span>
                    </div>
                    <div className="success-badge">
                      <FaCode />
                      <span>{courseData.projects} Live Projects</span>
                    </div>
                    <div className="success-badge">
                      <FaUserGraduate />
                      <span>Expert Mentorship</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="achievement-stats">
                <div className="achievement-item">
                  <FaInfinity className="achievement-icon" />
                  <span>Lifetime Support</span>
                </div>
                <div className="achievement-item">
                  <FaGem className="achievement-icon" />
                  <span>Premium Community</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Motivational */}
      <section className="features-section-motivational">
        <div className="features-container-motivational">
          <div className="features-grid-motivational">
            <div className="feature-card-motivational">
              <div className="feature-icon-container-motivational brain">
                <FaBrain />
              </div>
              <h3>Master Advanced AI</h3>
              <p>Build cutting-edge AI systems that millions will use. From neural networks to production deployment.</p>
              <div className="feature-highlight">Industry Leading</div>
            </div>
            
            <div className="feature-card-motivational featured">
              <div className="feature-badge-motivational">Most Popular</div>
              <div className="feature-icon-container-motivational robot">
                <FaRobot />
              </div>
              <h3>Real-World Impact</h3>
              <p>Your projects will be deployed and used by millions. Make a real difference in the world.</p>
              <div className="feature-highlight">Life Changing</div>
            </div>
            
            <div className="feature-card-motivational">
              <div className="feature-icon-container-motivational database">
                <FaDatabase />
              </div>
              <h3>Big Data Mastery</h3>
              <p>Handle petabyte-scale datasets and build systems that process millions of transactions.</p>
              <div className="feature-highlight">Enterprise Scale</div>
            </div>
            
            <div className="feature-card-motivational">
              <div className="feature-icon-container-motivational cloud">
                <FaCloud />
              </div>
              <h3>Cloud Deployment</h3>
              <p>Deploy on AWS, Azure, and GCP. Build auto-scaling systems that handle global traffic.</p>
              <div className="feature-highlight">Production Ready</div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Curriculum Section */}
      <section className="timeline-curriculum-motivational" id="curriculum">
        <div className="timeline-container-motivational">
          <div className="timeline-header-motivational">
            <h2>Your AI Mastery Timeline</h2>
            <p>Follow this proven roadmap to become an AI expert. Each milestone brings you closer to your dream career.</p>
          </div>

          <div className="timeline-wrapper-motivational">
            <div className="timeline-line"></div>
            
            {timelineModules.map((module, index) => (
              <div 
                key={index} 
                className={`timeline-item-motivational ${activeModule === index ? 'active' : ''}`}
                onClick={() => setActiveModule(index)}
              >
                <div className="timeline-marker" style={{backgroundColor: module.color}}>
                  <span>{index + 1}</span>
                </div>
                
                <div className="timeline-content">
                  <div className="timeline-card">
                    <div className="timeline-card-header">
                      <h3>{module.title}</h3>
                      <div className="timeline-meta">
                        <span className="duration">{module.duration}</span>
                        <span className="milestone" style={{color: module.color}}>
                          {module.milestone}
                        </span>
                      </div>
                    </div>
                    
                    <p className="timeline-description">{module.description}</p>
                    
                    {activeModule === index && (
                      <div className="timeline-details">
                        <div className="timeline-topics">
                          <h4>What You'll Master:</h4>
                          <div className="topics-list-motivational">
                            {module.topics.map((topic, topicIndex) => (
                              <div key={topicIndex} className="topic-item-motivational">
                                <FaCheckCircle style={{color: module.color}} />
                                <span>{topic}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="timeline-projects">
                          <h4>Projects You'll Build:</h4>
                          <div className="projects-list-motivational">
                            {module.projects.map((project, projectIndex) => (
                              <div key={projectIndex} className="project-item-motivational">
                                <FaRocket style={{color: module.color}} />
                                <span>{project}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="timeline-cta">
            <h3>Ready to Start Your Journey?</h3>
            <button 
              className="timeline-cta-button"
              onClick={() => setShowDemoForm(true)}
            >
              <FaPlay />
              Book Your Demo Now
            </button>
          </div>
        </div>
      </section>

      {/* Projects Section - Motivational */}
      <section className="projects-showcase-motivational" id="projects">
        <div className="projects-container-motivational">
          <div className="projects-header-motivational">
            <h2>Build Projects That Change Lives</h2>
            <p>These aren't just assignments—they're real systems that solve real problems and impact millions of users.</p>
          </div>

          <div className="projects-tabs-motivational">
            {projects.map((project, index) => (
              <button
                key={index}
                className={`project-tab-motivational ${selectedProject === index ? 'active' : ''}`}
                onClick={() => setSelectedProject(index)}
              >
                <FaLightbulb />
                {project.title}
              </button>
            ))}
          </div>

          <div className="project-display-motivational">
            <div className="project-visual">
              <img src={projects[selectedProject].image} alt="Project Preview" />
              <div className="project-overlay">
                <div className="live-demo-badge">
                  <FaPlay />
                  <span>Live Demo Available</span>
                </div>
              </div>
            </div>
            
            <div className="project-info-motivational">
              <h3>{projects[selectedProject].title}</h3>
              <p>{projects[selectedProject].description}</p>
              
              <div className="project-impact-motivational">
                <div className="impact-badge">
                  <FaFire />
                  <span>Real Impact: {projects[selectedProject].impact}</span>
                </div>
              </div>
              
              <div className="tech-stack-motivational">
                <h4>Technologies You'll Master:</h4>
                <div className="tech-tags-motivational">
                  {projects[selectedProject].tech.map((tech, index) => (
                    <span key={index} className="tech-tag-motivational">{tech}</span>
                  ))}
                </div>
              </div>

              <div className="project-actions-motivational">
                <button className="action-btn-motivational primary">
                  <FaRocket />
                  Start Building
                </button>
                <button className="action-btn-motivational secondary">
                  <FaPlay />
                  View Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mentors Section - Inspirational */}
      <section className="mentors-section-motivational" id="mentors">
        <div className="mentors-container-motivational">
          <div className="mentors-header-motivational">
            <h2>Learn from AI Legends</h2>
            <p>Get mentored by the minds behind the AI systems you use every day. They've built the future—now they'll help you join them.</p>
          </div>

          <div className="mentors-grid-motivational">
            {mentors.map((mentor, index) => (
              <div key={index} className="mentor-card-motivational">
                <div className="mentor-image-motivational">
                  <img src={mentor.image} alt={mentor.name} />
                  <div className="mentor-overlay-motivational">
                    <a href={mentor.linkedin} className="linkedin-link-motivational">
                      <FaLinkedin />
                    </a>
                  </div>
                </div>
                
                <div className="mentor-info-motivational">
                  <h3>{mentor.name}</h3>
                  <p className="mentor-title-motivational">{mentor.title}</p>
                  <div className="mentor-expertise">{mentor.expertise}</div>
                  
                  <div className="mentor-quote-motivational">
                    <FaQuoteLeft />
                    <p>"{mentor.quote}"</p>
                  </div>
                  
                  <div className="mentor-achievements-motivational">
                    <p>{mentor.achievements}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories - Emotional */}
      <section className="testimonials-section-motivational">
        <div className="testimonials-container-motivational">
          <div className="testimonials-header-motivational">
            <h2>Life-Changing Success Stories</h2>
            <p>These aren't just career changes—they're complete life transformations. Your story could be next.</p>
          </div>

          <div className="testimonial-showcase-motivational">
            <div className="testimonial-card-motivational">
              <div className="testimonial-header-motivational">
                <div className="career-jump">
                  <span className="jump-text">Career Jump:</span>
                  <span className="jump-value">{testimonials[testimonialIndex].careerJump}</span>
                </div>
              </div>
              
              <div className="testimonial-content-motivational">
                <FaQuoteLeft className="quote-icon-motivational" />
                <p>"{testimonials[testimonialIndex].text}"</p>
              </div>
              
              <div className="testimonial-author-motivational">
                <div className="author-info-motivational">
                  <h4>{testimonials[testimonialIndex].name}</h4>
                  <p>{testimonials[testimonialIndex].role}</p>
                  <span>{testimonials[testimonialIndex].company}</span>
                </div>
                <div className="salary-transformation">
                  <div className="transformation-arrow">
                    <span>{testimonials[testimonialIndex].previousRole}</span>
                    <FaArrowRight />
                    <span className="new-salary">{testimonials[testimonialIndex].salary}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="testimonial-controls-motivational">
              <button onClick={() => setTestimonialIndex(prev => (prev - 1 + testimonials.length) % testimonials.length)}>
                <FaChevronLeft />
              </button>
              <div className="testimonial-dots-motivational">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`dot-motivational ${testimonialIndex === index ? 'active' : ''}`}
                    onClick={() => setTestimonialIndex(index)}
                  />
                ))}
              </div>
              <button onClick={() => setTestimonialIndex(prev => (prev + 1) % testimonials.length)}>
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Powerful & Emotional */}
      <section className="final-cta-motivational">
        <div className="cta-background">
          <div className="cta-particles">
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
          </div>
        </div>
        
        <div className="cta-container-motivational">
          <div className="cta-content-motivational">
            <h2>Your AI Future Starts Now</h2>
            <p>Stop dreaming. Start building. Join thousands who've transformed their lives with AI mastery.</p>
            
            <div className="cta-urgency">
              <FaFire />
              <span>Limited seats available - Next cohort starts soon</span>
            </div>
            
            <div className="cta-actions-motivational">
              <button 
                className="cta-primary-motivational"
                onClick={() => setShowEnrollForm(true)}
              >
                <FaRocket />
                Transform Your Life Now
                <div className="button-pulse"></div>
              </button>
              
              <button 
                className="cta-secondary-motivational"
                onClick={() => setShowDemoForm(true)}
              >
                <FaPlay />
                Book Your Demo First
              </button>
            </div>
            
            <div className="cta-guarantee-motivational">
              <FaShieldAlt />
              <span>100% Placement Support • Lifetime Access • Success Guaranteed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Form Modal */}
      {showDemoForm && (
        <div className="modal-overlay-motivational" onClick={() => setShowDemoForm(false)}>
          <div className="modal-content-motivational" onClick={e => e.stopPropagation()}>
            <button 
              className="modal-close-motivational" 
              onClick={() => setShowDemoForm(false)}
            >
              <FaTimes />
            </button>
            <DemoForm onClose={() => setShowDemoForm(false)} />
          </div>
        </div>
      )}

      {/* Enrollment Modal */}
      {showEnrollForm && (
        <div className="modal-overlay-motivational" onClick={() => setShowEnrollForm(false)}>
          <div className="modal-content-motivational" onClick={e => e.stopPropagation()}>
            <button 
              className="modal-close-motivational" 
              onClick={() => setShowEnrollForm(false)}
            >
              <FaTimes />
            </button>
            
            <div className="enrollment-form-motivational">
              <div className="form-header-motivational">
                <FaGraduationCap className="form-icon-motivational" />
                <h3>Start Your AI Journey</h3>
                <p>Join thousands who've transformed their careers with AI mastery</p>
              </div>
              
              <form className="form-motivational">
                <div className="form-row">
                  <div className="form-group-motivational">
                    <label>Full Name</label>
                    <input type="text" placeholder="Enter your name" />
                  </div>
                  <div className="form-group-motivational">
                    <label>Email</label>
                    <input type="email" placeholder="Enter your email" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group-motivational">
                    <label>Phone</label>
                    <input type="tel" placeholder="Enter your phone" />
                  </div>
                  <div className="form-group-motivational">
                    <label>Experience Level</label>
                    <select>
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="submit-button-motivational">
                  <FaRocket />
                  Start My Transformation
                  <div className="submit-glow"></div>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICoursePage;
