import React, { Component } from 'react';
import { FaGraduationCap, FaLaptopCode, FaBriefcase, FaStar, FaCheckCircle, FaUsers, FaCalendarAlt, FaDownload, FaRocket, FaChalkboardTeacher, FaHandshake, FaCertificate, FaChevronDown, FaChevronUp, FaArrowRight, FaPlay, FaLinkedin, FaGithub, FaTwitter, FaInstagram } from 'react-icons/fa';
import './LandingPage.css'
import { Link } from 'react-router-dom';
import aiimage from '../assets/ai-course.jpg'
import embedimage from '../assets/embedded-course.jpg'
import iotimage from '../assets/iot-course.jpg'
import roboticscourse from '../assets/robotics-course.jpg'
import  logo from '../assets/lurnity_original.jpg'
import heroImg from '../assets/hero-learning.jpg'
import img1 from '../assets/img1.jpeg'
import img2 from '../assets/img2.jpeg'
import img3 from '../assets/img3.jpeg'
import DemoForm from './DemoForm'
import recognitionlogo from '../assets/nasscomlogo.png'
import Alumniimage from '../assets/Alumniimage.avif'




export default class LuxuryLandingPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPopup: false,
      showDemoForm: false,
      testimonialIndex: 0,
      openCurriculum: null,
      cohorts: [], 
      loadingCohorts: true,
  cohortError: null,
      openFAQ: null,
      mousePosition: { x: 0, y: 0 },
      cohortCountdown: this.computeCountdown(new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 10)),
      popupHasBeenClosed: false // Add this flag
    };

    this.testimonials = [
      { 
        text: 'Lurnity transformed my career trajectory — from intern to senior engineer in 8 months with unprecedented mentorship quality.', 
        author: 'Sneha Sharma', 
        role: 'Senior Data Scientist @ Google',
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23ff6b6b'/%3E%3Ctext x='50' y='60' text-anchor='middle' font-family='sans-serif' font-size='30' fill='white'%3ES%3C/text%3E%3C/svg%3E"
      },
      { 
        text: 'The depth of technical mentorship and real-world project exposure exceeded every expectation. Industry-leading curriculum.', 
        author: 'Karthik Reddy', 
        role: 'IoT Architect @ Microsoft',
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%234ecdc4'/%3E%3Ctext x='50' y='60' text-anchor='middle' font-family='sans-serif' font-size='30' fill='white'%3EK%3C/text%3E%3C/svg%3E"
      },
      { 
        text: 'Exceptional career guidance and interview preparation. The placement team negotiated an offer 40% above market rate.', 
        author: 'Priya Nair', 
        role: 'Embedded Systems Lead @ Tesla',
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23a8e6cf'/%3E%3Ctext x='50' y='60' text-anchor='middle' font-family='sans-serif' font-size='30' fill='white'%3EP%3C/text%3E%3C/svg%3E"
      },
    ];

    this.coursesList = [
      { 
        id: 'ai', 
        title: 'AI & Machine Learning', 
        bullets: ['Advanced Deep Learning', 'MLOps & Production', 'Computer Vision & NLP'], 
        img: aiimage,
        duration: '6 months',
        level: 'Advanced'
      },
      { 
        id: 'embedded', 
        title: 'Embedded Systems', 
        bullets: ['Real-Time Operating Systems', 'Hardware-Software Integration', 'IoT Protocols'], 
        img: embedimage,
        duration: '5 months',
        level: 'Expert'
      },
      { 
        id: 'iot', 
        title: 'Internet of Things', 
        bullets: ['Edge Computing', 'Cloud Integration', 'Security & Privacy'], 
        img: iotimage,
        level: 'Intermediate'
      },
      { 
        id: 'robotics', 
        title: 'Robotics & Automation', 
        bullets: ['Autonomous Systems', 'Computer Vision', 'ROS & Control Systems'], 
        img: roboticscourse,
        duration: '6 months',
        level: 'Advanced'
      },
    ];

    this.instructors = [
      { 
        name: 'Dr. Rajesh Kumar', 
        title: 'Chief Technology Officer', 
        bio: 'Former IIT Delhi professor with 15+ years in embedded systems. Led R&D teams at Intel and Qualcomm.', 
        img: img1,
        linkedin: '#' 
      },
      { 
        name: 'Sridhar', 
        title: 'AI Research Director', 
        bio: 'PhD from Stanford, published 50+ papers in ML/CV. Former principal scientist at Google DeepMind.', 
        img: img2,
        linkedin: '#' 
      },
      { 
        name: 'Sandeep Rajan', 
        title: 'IoT Solutions Architect', 
        bio: 'Built scalable IoT platforms serving 10M+ devices. Former VP Engineering at Cisco IoT division.', 
        img: img3,
        linkedin: '#' 
      },
    ];

    this.faqs = [
      { q: 'What makes Lurnity different from other tech education platforms?', a: 'Our curriculum is designed by industry veterans from top-tier companies. We focus on real-world projects, personalized mentorship, and guaranteed placement support with our network of 200+ hiring partners.' },
      { q: 'What hardware and software will I need for the programs?', a: 'We provide comprehensive hardware kits for Embedded/IoT programs. All software tools are included, with cloud-based development environments available for remote learning.' },
      { q: 'What is your placement success rate and average salary outcomes?', a: 'We maintain a 92% placement rate within 6 months of graduation, with average salary packages ranging from ₹8-15 LPA depending on the program and prior experience.' },
      { q: 'Can I switch between programs or get refunds?', a: 'Yes, we offer program switching within the first 4 weeks and full refunds within 15 days of enrollment. Our success team works closely with you to ensure the right fit.' },
    ];

    this.events = [
      { title: 'Masterclass: Future of AI in Product Development', date: 'September 15, 2025', speaker: 'Dr. Ananya Sridhar', cta: 'Reserve Seat' },
      { title: 'Career Fair: Connect with Top Tech Companies', date: 'September 28, 2025', speaker: 'Industry Partners', cta: 'Register Now' },
    ];
  }

  componentDidMount() {
    window.addEventListener('scroll', this.checkScrollPopup);
    window.addEventListener('mousemove', this.handleMouseMove);
    this.testimonialTimer = setInterval(this.nextTestimonial, 8000);
    this.countdownTimer = setInterval(this.updateCountdown, 1000);
    fetch("/api/landingpage/cohorts")
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch cohorts");
      return res.json();
    })
    .then(data => this.setState({ cohorts: data, loadingCohorts: false }))
    .catch(err => this.setState({ cohortError: err.message, loadingCohorts: false }));
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.checkScrollPopup);
    window.removeEventListener('mousemove', this.handleMouseMove);
    clearInterval(this.testimonialTimer);
    clearInterval(this.countdownTimer);
  }

  handleMouseMove = (e) => {
    this.setState({
      mousePosition: { x: e.clientX, y: e.clientY }
    });
  }

  computeCountdown = (futureDate) => {
    const now = new Date();
    const diff = Math.max(0, futureDate - now);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    return { days, hours, mins, secs };
  }

  updateCountdown = () => {
    const future = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 10);
    this.setState({ cohortCountdown: this.computeCountdown(future) });
  }

  checkScrollPopup = () => {
  const scrollTop = window.scrollY;
  if (scrollTop > 500 && 
      !this.state.showPopup && 
      !this.state.popupHasBeenClosed) {
    this.setState({ showPopup: true });
  }
}

  closePopup = () => this.setState({ 
  showPopup: false, 
  popupHasBeenClosed: true 
});
  goLogin = () => this.props.history && this.props.history.push('/login');
  goRegister = () => this.props.history && this.props.history.push('/register');
  bookDemo = () => this.setState({ showDemoForm: true });
closeDemoForm = () => this.setState({ showDemoForm: false });

  nextTestimonial = () => this.setState(({ testimonialIndex }) => ({ testimonialIndex: (testimonialIndex + 1) % this.testimonials.length }));
  prevTestimonial = () => this.setState(({ testimonialIndex }) => ({ testimonialIndex: (testimonialIndex - 1 + this.testimonials.length) % this.testimonials.length }));

  toggleCurriculum = (id) => this.setState(({ openCurriculum }) => ({ openCurriculum: openCurriculum === id ? null : id }));
  toggleFAQ = (i) => this.setState(({ openFAQ }) => ({ openFAQ: openFAQ === i ? null : i }));

  renderCohortsSection() {
  const { cohorts, loadingCohorts, cohortError } = this.state;

  if (loadingCohorts) {
    return (
      <section className="luxury-cohorts">
        <div className="section-content">
          <div className="section-header">
            <h2 className="section-title">Upcoming Lurnity Cohorts</h2>
            <p className="section-subtitle">
              Limited seats available for our exclusive programs
            </p>
          </div>
          <div className="loading-state">
            <div className="luxury-spinner"></div>
            <p className="loading-text">Loading exclusive cohorts...</p>
          </div>
        </div>
      </section>
    );
  }

  if (cohortError) {
    return (
      <section className="luxury-cohorts">
        <div className="section-content">
          <div className="section-header">
            <h2 className="section-title">Upcoming Lurnity Cohorts</h2>
            <p className="section-subtitle">
              Limited seats available for our exclusive programs
            </p>
          </div>
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <p className="error-text">Unable to load cohort information</p>
            <p className="error-subtitle">Please try refreshing the page or contact support</p>
            <button className="btn-retry" onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!cohorts.length) {
    return (
      <section className="luxury-cohorts">
        <div className="section-content">
          <div className="section-header">
            <h2 className="section-title">Upcoming Lurnity Cohorts</h2>
            <p className="section-subtitle">
              Limited seats available for our exclusive programs
            </p>
          </div>
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <p className="empty-text">No cohorts available right now</p>
            <p className="empty-subtitle">New exclusive cohorts launching soon. Join our waitlist to be notified first.</p>
            <button className="btn-waitlist" onClick={this.bookDemo}>
              Join Waitlist
            </button>
          </div>
        </div>
      </section>
    );
  }

  const formatDate = (dateStr) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  return (
    <section className="luxury-cohorts">
      <div className="section-content">
        <div className="section-header">
          <h2 className="section-title">Upcoming Lurnity Cohorts</h2>
          <p className="section-subtitle">
            Limited seats available for our exclusive programs
          </p>
        </div>

        <div className="cohorts-grid">
          {cohorts.map((cohort, index) => (
            <div
              key={index}
              className={`cohort-card ${cohort.badgeType.toLowerCase()}`}
            >
              <div className="cohort-header">
                <div className="cohort-date">{formatDate(cohort.startDate)}</div>
                <div className={`cohort-badge ${cohort.badgeType.toLowerCase()}`}>
                  {cohort.badgeType}
                </div>
              </div>
              
              <h4 className="cohort-title">{cohort.title}</h4>
              
              <div className="cohort-details">
                <div className="detail-item">
                  <span className="detail-label">Duration:</span>
                  <span className="detail-value">{cohort.duration}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Seats left:</span>
                  <span
                    className={`detail-value ${
                      cohort.seatsLeft <= 5 ? "exclusive" : ""
                    }`}
                  >
                    {cohort.seatsLeft} {cohort.seatsLeft <= 5 ? "only" : ""}
                  </span>
                </div>
              </div>
              
              <button
                className="btn-primary-program"
                onClick={this.bookDemo}
              >
                <span>Apply Now</span>
                <FaArrowRight className="btn-icon" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}



  render() {
    const { testimonialIndex, cohortCountdown, openCurriculum, openFAQ, mousePosition } = this.state;

    return (
      <div className="luxury-landing-page">
      <div className="luxury-wrapper">
        {/* Luxury cursor */}
        <div 
          className="luxury-cursor" 
          style={{
            left: mousePosition.x,
            top: mousePosition.y
          }}
        />

        {/* Premium enrollment bar */}
        

        {/* Luxury Header */}
        <header className="luxury-header">
          <div className="header-content">
            <div className="luxury-brand">
              <img src={logo} alt="Lurnity" className="luxury-logo" />
              <div className="brand-text">
                <span className="brand-name">LURNITY</span>
                <span className="brand-tagline">Excellence in Tech Education</span>
              </div>
            </div>

            <nav className="luxury-nav">
              <a href="#home" className="nav-link">Home</a>
              <a href="#programs" className="nav-link">Programs</a>
              <a href="#outcomes" className="nav-link">Outcomes</a>
              <a href="#pricing" className="nav-link">Investment</a>
              <Link to="/careers" className="nav-link">Careers</Link>
              
              <div className="nav-actions">
                <button className="btn-ghost-luxury" onClick={this.goLogin}>Sign In</button>
                <button className="btn-premium" onClick={this.goRegister}>
                  <span>Join Lurnity</span>
                  <FaArrowRight className="btn-icon" />
                </button>
              </div>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="luxury-hero" id="home">
          <div className="hero-bg-elements">
            <div className="floating-element element-1"></div>
            <div className="floating-element element-2"></div>
            <div className="floating-element element-3"></div>
          </div>
          
          <div className="hero-content">
            <div className="hero-left">
              <div className="hero-badge">
                <span className="badge-icon">✨</span>
                Industry-Leading • Project-First • Career-Focused
              </div>
              
              <h1 className="hero-titlee">
                Master <span className="gradient-text">Next-Generation</span><br />
                Technologies with<br />
                <span className="luxury-highlight">Lurnity Mentorship</span>
              </h1>
              
              <p className="hero-description">
                Join an exclusive community of ambitious technologists. Learn from industry veterans, 
                build production-grade projects, and accelerate your career with personalized guidance 
                from top-tier companies.
              </p>

              <div className="hero-stats">
                <div className="stat-item">
                  <div className="stat-number">2,500+</div>
                  <div className="stat-label">Lurnity Graduates</div>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <div className="stat-number">₹12.8L</div>
                  <div className="stat-label">Average Package</div>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <div className="stat-number">96%</div>
                  <div className="stat-label">Placement Rate</div>
                </div>
              </div>

              <div className="hero-actions">
                <button className="btn-primary-large" onClick={this.bookDemo}>
                  <FaPlay className="btn-icon" />
                  Book Demo
                </button>
                <button className="btn-outline-large" onClick={() => document.getElementById('programs').scrollIntoView({behavior:'smooth'})}>
                  Explore Programs
                  <FaArrowRight className="btn-icon" />
                </button>
              </div>

              <div className="hero-trust">
  <div className="trust-label">Trusted by alumni from</div>
  <div className="trust-logos">
    <img src={Alumniimage} alt="Alumni logos" className="trust-logo-img" />
  </div>
</div>

            </div>

            <div className="hero-right">
              <div className="hero-visual">
                <div className="glass-card">
                  <img src={heroImg} alt="Future Technology" className="hero-image" />
                  <div className="glass-overlay">
                    <div className="countdown-display">
                      <div className="countdown-label">Next Lurnity Cohort</div>
                      <div className="countdown-time">
                        <span className="time-unit">{cohortCountdown.days}<small>d</small></span>
                        <span className="time-separator">:</span>
                        <span className="time-unit">{cohortCountdown.hours}<small>h</small></span>
                        <span className="time-separator">:</span>
                        <span className="time-unit">{cohortCountdown.mins}<small>m</small></span>
                      </div>
                      <button className="btn-glass" onClick={this.bookDemo}>
                        Reserve Lurnity Spot
                      </button>
                    </div>
                  </div>
                </div>
                <div className="hero-accent">
                  <div className="accent-text">Watch live project demos & mentorship sessions</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Luxury Recognition */}
        <section className="luxury-recognition">
  <div className="recognition-content">
    <div className="recognition-label">Recognized By</div>
    <div className="recognition-grid">
      <img src={recognitionlogo} alt="Recognitions" className="recognition-logo" />
    </div>
  </div>
</section>

        {/* Why Choose Luxury */}
        <section className="luxury-why">
          <div className="section-content">
            <div className="section-header">
              <h2 className="section-title">
                Why Choose <span className="gradient-text">Lurnity</span>?
              </h2>
              <p className="section-subtitle">
                Experience unparalleled excellence in technology education with our premium approach
              </p>
            </div>

            <div className="luxury-features">
              <div className="feature-card premium-card">
                <div className="feature-icon gold">
                  <FaChalkboardTeacher />
                </div>
                <h4 className="feature-title">Lurnity Mentorship Program</h4>
                <p className="feature-description">
                  Personal guidance from industry leaders at Google, Microsoft, Tesla. 
                  Weekly one-on-one sessions with dedicated career acceleration.
                </p>
                <div className="feature-stats">
                  <span>1:4 Mentor Ratio</span>
                  <span>15+ Years Avg. Experience</span>
                </div>
              </div>

              <div className="feature-card dark-premium">
                <div className="feature-icon silver">
                  <FaLaptopCode />
                </div>
                <h4 className="feature-title">Production-Grade Projects</h4>
                <p className="feature-description">
                  Build scalable systems deployed to millions of users. 
                  Full-stack development with real-world business impact.
                </p>
                <div className="feature-stats">
                  <span>5+ Portfolio Projects</span>
                  <span>Live Deployments</span>
                </div>
              </div>

              <div className="feature-card gradient-card">
                <div className="feature-icon platinum">
                  <FaHandshake />
                </div>
                <h4 className="feature-title">100% Placement assisstance</h4>
                <p className="feature-description">
                  Exclusive hiring partnerships with 200+ premium companies. 
                  Dedicated career support until you land your dream role.
                </p>
                <div className="feature-stats">
                  <span>96% Success Rate</span>
                  <span>₹25L Max Package</span>
                </div>
              </div>

              <div className="feature-card luxury-card">
                <div className="feature-icon diamond">
                  <FaCertificate />
                </div>
                <h4 className="feature-title">Industry Recognition</h4>
                <p className="feature-description">
                  Blockchain-verified certificates recognized by top employers. 
                  Lifetime access to alumni network and exclusive job portal.
                </p>
                <div className="feature-stats">
                  <span>Blockchain Verified</span>
                  <span>10,000+ Alumni Network</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Premium Programs */}
        <section className="luxury-programs" id="programs">
          <div className="section-content">
            <div className="section-header">
              <h2 className="section-title">Lurnity Programs</h2>
              <p className="section-subtitle">
                Curated curricula designed by industry experts for maximum career impact
              </p>
            </div>

            <div className="programs-grid">
              {this.coursesList.map((course, index) => (
                <div key={course.id} className={`program-card ${index % 2 === 0 ? 'premium-variant' : 'dark-variant'}`}>
                  <div className="program-image">
                    <img src={course.img} alt={course.title} />
                    <div className="program-badge">
                      <span className="badge-level">{course.level}</span>
                      <span className="badge-duration">{course.duration}</span>
                    </div>
                  </div>
                  
                  <div className="program-content">
                    <div className="program-header">
                      <div className="program-icon">
                        <FaGraduationCap />
                      </div>
                      <h4 className="program-title">{course.title}</h4>
                    </div>
                    
                    <div className="program-skills">
                      {course.bullets.map((skill, i) => (
                        <span key={i} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                    
                    <div className="program-actions">
                      <button 
                        className="btn-outline-program" 
                        onClick={() => this.toggleCurriculum(course.id)}
                      >
                        View Curriculum
                        {openCurriculum === course.id ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                      <button className="btn-primary-program" onClick={this.bookDemo}>
                        Join Lurnity Cohort
                        <FaArrowRight />
                      </button>
                    </div>

                    {openCurriculum === course.id && (
                      <div className="curriculum-expansion">
                        <div className="curriculum-content">
                          <div className="curriculum-modules">
                            <div className="module-item">
                              <div className="module-number">01</div>
                              <div className="module-details">
                                <h5>Foundations & Industry Setup</h5>
                                <p>Development environment, best practices, industry standards</p>
                              </div>
                            </div>
                            <div className="module-item">
                              <div className="module-number">02</div>
                              <div className="module-details">
                                <h5>Advanced Concepts & Architecture</h5>
                                <p>Deep dive into core technologies, system design principles</p>
                              </div>
                            </div>
                            <div className="module-item">
                              <div className="module-number">03</div>
                              <div className="module-details">
                                <h5>Production Deployment & Portfolio</h5>
                                <p>Real-world projects, deployment, performance optimization</p>
                              </div>
                            </div>
                          </div>
                          <button className="download-curriculum">
                            <FaDownload />
                            Download Complete Syllabus
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Elite Mentors */}
        

        {/* Luxury Outcomes */}
        <section className="luxury-outcomes" id="outcomes">
          <div className="section-content">
            <div className="outcomes-header">
              <h2 className="section-title">Exceptional Career Outcomes</h2>
              <p className="section-subtitle">Our graduates consistently achieve remarkable career transformations</p>
            </div>
            
            <div className="outcomes-grid">
              <div className="outcome-card premium">
                <div className="outcome-icon">
                  <FaUsers />
                </div>
                <div className="outcome-number">2,847</div>
                <div className="outcome-label">Success Stories</div>
                <div className="outcome-detail">Placed in top-tier companies globally</div>
              </div>
              
              <div className="outcome-card gold">
                <div className="outcome-icon">
                  <FaRocket />
                </div>
                <div className="outcome-number">₹18.5L</div>
                <div className="outcome-label">Average CTC</div>
                <div className="outcome-detail">40% higher than industry average</div>
              </div>
              
              <div className="outcome-card platinum">
                <div className="outcome-icon">
                  <FaBriefcase />
                </div>
                <div className="outcome-number">96%</div>
                <div className="outcome-label">Placement Rate</div>
                <div className="outcome-detail">Within 6 months of graduation</div>
              </div>
              
              <div className="outcome-card diamond">
                <div className="outcome-icon">
                  <FaStar />
                </div>
                <div className="outcome-number">4.9/5</div>
                <div className="outcome-label">Student Rating</div>
                <div className="outcome-detail">Consistently rated excellence</div>
              </div>
            </div>
          </div>
        </section>

        {/* Premium Testimonials */}
        <section className="luxury-testimonials">
          <div className="section-content">
            <div className="section-header">
              <h2 className="section-title">Success Stories</h2>
              <p className="section-subtitle">Hear from our Lurnity graduates who've transformed their careers</p>
            </div>
            
            <div className="testimonial-slider">
              <button className="testimonial-nav prev" onClick={this.prevTestimonial}>
                <FaChevronDown style={{transform: 'rotate(90deg)'}} />
              </button>
              
              <div className="testimonial-content">
                <div className="testimonial-card">
                  <div className="testimonial-quote">
                    <div className="quote-mark">"</div>
                    <p className="quote-text">{this.testimonials[testimonialIndex].text}</p>
                  </div>
                  
                  <div className="testimonial-author">
                    <img src={this.testimonials[testimonialIndex].image} alt="Graduate" className="author-image" />
                    <div className="author-details">
                      <div className="author-name">{this.testimonials[testimonialIndex].author}</div>
                      <div className="author-role">{this.testimonials[testimonialIndex].role}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <button className="testimonial-nav next" onClick={this.nextTestimonial}>
                <FaChevronDown style={{transform: 'rotate(-90deg)'}} />
              </button>
            </div>
            
            <div className="testimonial-indicators">
              {this.testimonials.map((_, index) => (
                <button 
                  key={index}
                  className={`indicator ${index === testimonialIndex ? 'active' : ''}`}
                  onClick={() => this.setState({testimonialIndex: index})}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Elite Cohorts */}
        {this.renderCohortsSection()}

        {/* Luxury Pricing */}
        <section className="luxury-pricing" id="pricing">
          <div className="section-content">
            <div className="section-header">
              <h2 className="section-title">Investment in Your Future</h2>
              <p className="section-subtitle">Premium programs with flexible payment options and guaranteed ROI</p>
            </div>
            
            <div className="pricing-grid">
              
              
              <div className="pricing-card premium popular">
                <div className="popular-badge">Most Popular</div>
                <div className="pricing-header">
                  <h4 className="pricing-tier">Lurnity</h4>
                  <div className="pricing-value">₹2,49,999</div>
                  <div className="pricing-period">Premium Experience</div>
                </div>
                
                <div className="pricing-features">
                  <div className="feature-item">
                    <FaCheckCircle className="feature-check gold" />
                    <span>6-month premium program</span>
                  </div>
                  <div className="feature-item">
                    <FaCheckCircle className="feature-check gold" />
                    <span>1:4 mentor-to-student ratio</span>
                  </div>
                  <div className="feature-item">
                    <FaCheckCircle className="feature-check gold" />
                    <span>5 enterprise-level projects</span>
                  </div>
                  <div className="feature-item">
                    <FaCheckCircle className="feature-check gold" />
                    <span>Guaranteed placement support</span>
                  </div>
                  <div className="feature-item">
                    <FaCheckCircle className="feature-check gold" />
                    <span>1:1 weekly mentorship</span>
                  </div>
                  <div className="feature-item">
                    <FaCheckCircle className="feature-check gold" />
                    <span>Lifetime alumni network access</span>
                  </div>
                </div>
                
                <div className="pricing-actions">
                  <button className="btn-pricing-outline-gold">Scholarship Available</button>
                  <button className="btn-pricing-premium" onClick={this.bookDemo}>
                    Join Lurnity Program
                  </button>
                </div>
              </div>
              
              
            </div>
          </div>
        </section>

        {/* Luxury Events */}
        <section className="luxury-events">
          <div className="section-content">
            <div className="section-header">
              <h2 className="section-title">Exclusive Events</h2>
              <p className="section-subtitle">Join our premium community events and networking sessions</p>
            </div>
            
            <div className="events-grid">
              {this.events.map((event, index) => (
                <div key={index} className="event-card">
                  <div className="event-header">
                    <div className="event-date">
                      <FaCalendarAlt className="date-icon" />
                      {event.date}
                    </div>
                    <div className="event-type">Masterclass</div>
                  </div>
                  
                  <div className="event-content">
                    <h4 className="event-title">{event.title}</h4>
                    <div className="event-speaker">
                      <span className="speaker-label">Speaker:</span>
                      <span className="speaker-name">{event.speaker}</span>
                    </div>
                  </div>
                  
                  <button className="btn-event" onClick={this.bookDemo}>
                    {event.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Luxury FAQ */}
        <section className="luxury-faq" id="faq">
          <div className="section-content">
            <div className="section-header">
              <h2 className="section-title">Frequently Asked Questions</h2>
              <p className="section-subtitle">Everything you need to know about our premium programs</p>
            </div>
            
            <div className="faq-container">
              {this.faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className={`faq-item ${openFAQ === index ? 'expanded' : ''}`}
                  onClick={() => this.toggleFAQ(index)}
                >
                  <div className="faq-question">
                    <span className="question-text">{faq.q}</span>
                    <div className="question-icon">
                      {openFAQ === index ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                  </div>
                  
                  {openFAQ === index && (
                    <div className="faq-answer">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Premium Partners */}
        {/* Premium Partners */}
<section className="luxury-partners">
  <div className="section-content">
    <div className="section-header">
      <h2 className="section-title">Hiring Partner Network</h2>
      <p className="section-subtitle">Exclusive partnerships with the world's leading technology companies</p>
    </div>
    
    <div className="partners-showcase">
      <div className="partner-tier tier-1">
        <div className="tier-label">Premier Partners</div>
        <div className="partner-logos">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png" 
            alt="Google" 
            className="partner-logo premier" 
          />
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/1200px-Microsoft_logo.svg.png" 
            alt="Microsoft" 
            className="partner-logo premier" 
          />
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1200px-Amazon_logo.svg.png" 
            alt="Amazon" 
            className="partner-logo premier" 
          />
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1200px-Apple_logo_black.svg.png" 
            alt="Apple" 
            className="partner-logo premier" 
          />
        </div>
      </div>
      
      <div className="partner-tier tier-2">
        <div className="tier-label">Lurnity Partners</div>
        <div className="partner-logos">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Tesla_Motors.svg/1200px-Tesla_Motors.svg.png" 
            alt="Tesla" 
            className="partner-logo elite" 
          />
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/1200px-Netflix_2015_logo.svg.png" 
            alt="Netflix" 
            className="partner-logo elite" 
          />
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Airbnb_Logo_B%C3%A9lo.svg/1200px-Airbnb_Logo_B%C3%A9lo.svg.png" 
            alt="Airbnb" 
            className="partner-logo elite" 
          />
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Uber_logo_2018.svg/1200px-Uber_logo_2018.svg.png" 
            alt="Uber" 
            className="partner-logo elite" 
          />
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/OpenAI_Logo.svg/1200px-OpenAI_Logo.svg.png" 
            alt="OpenAI" 
            className="partner-logo elite" 
          />
        </div>
      </div>
      
      <div className="partner-tier tier-3">
        <div className="tier-label">Growth Partners</div>
        <div className="partner-logos">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/1200px-Stripe_Logo%2C_revised_2016.svg.png" 
            alt="Stripe" 
            className="partner-logo growth" 
          />
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Notion-logo.svg/1200px-Notion-logo.svg.png" 
            alt="Notion" 
            className="partner-logo growth" 
          />
          
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Shopify_logo_2018.svg/1200px-Shopify_logo_2018.svg.png" 
            alt="Shopify" 
            className="partner-logo growth" 
          />
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Zoom_Communications_Logo.svg/1200px-Zoom_Communications_Logo.svg.png" 
            alt="Zoom" 
            className="partner-logo growth" 
          />
        </div>
      </div>
    </div>
  </div>
</section>

        {/* Luxury Newsletter */}
        <section className="luxury-newsletter">
          <div className="newsletter-content">
            <div className="newsletter-left">
              <h3 className="newsletter-title">Join Our Lurnity Community</h3>
              <p className="newsletter-description">
                Get exclusive access to industry insights, career opportunities, 
                and premium resources from our expert network.
              </p>
              
              <div className="newsletter-features">
                <div className="newsletter-feature">
                  <FaRocket className="feature-icon" />
                  <span>Weekly industry insights</span>
                </div>
                <div className="newsletter-feature">
                  <FaBriefcase className="feature-icon" />
                  <span>Exclusive job opportunities</span>
                </div>
                <div className="newsletter-feature">
                  <FaGraduationCap className="feature-icon" />
                  <span>Premium learning resources</span>
                </div>
              </div>
            </div>
            
            <div className="newsletter-right">
              <div className="newsletter-form">
                <input 
                  type="email" 
                  placeholder="Enter your email address"
                  className="newsletter-input"
                />
                <button className="btn-newsletter" onClick={this.bookDemo}>
                  <span>Join Lurnity Community</span>
                  <FaArrowRight className="btn-icon" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Luxury Footer */}
        <footer className="luxury-footer">
          <div className="footer-content">
            <div className="footer-main">
              <div className="footer-brand">
                <img src={logo} alt="Lurnity" className="footer-logo" />
                <div className="brand-info">
                  <div className="brand-name">LURNITY</div>
                  <p className="brand-description">
                    Transforming careers through Lurnity technology education and premium mentorship programs.
                  </p>
                </div>
                
                <div className="footer-social">
  <a href="https://www.linkedin.com/" className="social-link" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
  <a href="https://twitter.com/" className="social-link" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
  <a href="https://instagram.com/" className="social-link" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
  <a href="https://github.com/" className="social-link" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
</div>
              </div>
              
              <div className="footer-links">
                <div className="link-group">
                  <h4 className="link-title">Programs</h4>
                  <a href="#programs" className="footer-link">AI & Machine Learning</a>
                  <a href="#programs" className="footer-link">Embedded Systems</a>
                  <a href="#programs" className="footer-link">Internet of Things</a>
                  <a href="#programs" className="footer-link">Robotics & Automation</a>
                </div>
                
                <div className="link-group">
                  <h4 className="link-title">Company</h4>
                  <a href="#about" className="footer-link">About Us</a>
                  <a href="#mentors" className="footer-link">Our Mentors</a>
                  <a href="#outcomes" className="footer-link">Success Stories</a>
                  <a href="/careers" className="footer-link">Careers</a>
                </div>
                
                <div className="link-group">
                  <h4 className="link-title">Support</h4>
                  <a href="#faq" className="footer-link">FAQ</a>
                  <a href="#" className="footer-link">Contact Support</a>
                  <a href="#" className="footer-link">Student Portal</a>
                  
                </div>
                
                <div className="link-group">
                  <h4 className="link-title">Contact</h4>
                  <div className="contact-info">
                    <p className="contact-item">
                      <strong>Email:</strong><br />
                      admissions@lurnity.com
                    </p>
                    <p className="contact-item">
                      <strong>Phone:</strong><br />
                      +91 98765 43210
                    </p>
                    <p className="contact-item">
                      <strong>Address:</strong><br />
                      Hyderabad, Telangana, India
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="footer-bottom">
              <div className="footer-legal">
                <span>© 2025 Lurnity. All rights reserved.</span>
                <div className="legal-links">
                  <a href="#" className="legal-link">Privacy Policy</a>
                  <a href="#" className="legal-link">Terms of Service</a>
                  <a href="#" className="legal-link">Cookie Policy</a>
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* Premium Floating Elements */}
        <button className="floating-demo-luxury" onClick={this.bookDemo}>
          <FaPlay className="floating-icon" />
          <span className="floating-text">Book Demo</span>
        </button>

        {/* Luxury Popup */}
        {this.state.showPopup && (
          <div className="luxury-popup-overlay">
            <div className="luxury-popup">
              <button className="popup-close-luxury" onClick={this.closePopup}>
                <span>✕</span>
              </button>
              
              <div className="popup-content-luxury">
                <div className="popup-header">
                  <h4 className="popup-title">Book Your Demo</h4>
                  <p className="popup-subtitle">
                    Get personalized portfolio feedback and career guidance from our industry experts
                  </p>
                </div>
                
                <div className="popup-features">
                  <div className="popup-feature">
                    <FaCheckCircle className="feature-check-popup" />
                    <span>30-minute personalized session</span>
                  </div>
                  <div className="popup-feature">
                    <FaCheckCircle className="feature-check-popup" />
                    <span>Portfolio review & feedback</span>
                  </div>
                  <div className="popup-feature">
                    <FaCheckCircle className="feature-check-popup" />
                    <span>Career roadmap discussion</span>
                  </div>
                </div>
                
                <div className="popup-actions">
                  <button className="btn-popup-outline" onClick={this.closePopup}>
                    Maybe Later
                  </button>
                  <button className="btn-popup-premium" onClick={this.bookDemo}>
                    <FaRocket className="btn-icon" />
                    Book Now - Free
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Demo Form Modal would go here */}
        {/* Demo Form Modal would go here */}
{this.state.showDemoForm && (
  <div className="demo-modal-overlay">
    <div className="demo-modal">
      <button className="modal-close" onClick={this.closeDemoForm}>✕</button>
      <DemoForm onClose={this.closeDemoForm} />
    </div>
  </div>
)}
      </div>
      </div>
    );
  }
}