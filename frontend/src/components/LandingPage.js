import React, { Component } from 'react';
import { FaGraduationCap, FaLaptopCode, FaBriefcase, FaStar, FaCheckCircle, FaUsers, FaCalendarAlt, FaDownload, FaRocket, FaChalkboardTeacher, FaHandshake, FaCertificate, FaChevronDown, FaChevronUp, FaArrowRight, FaPlay, FaLinkedin, FaGithub, FaTwitter, FaInstagram, FaArrowUp, FaTrophy, FaChartLine, FaAward, FaBuilding, FaCrown, FaFire, FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaGlobe, FaShield, FaLightbulb, FaCode } from 'react-icons/fa';
import './LandingPage.css'
import { Link } from 'react-router-dom';
import Header from './Header';
import HeroSection from './HeroSection';
import FloatingActionButton from './FloatingActionButton';
import NewChatBot from './NewChatBot';
import ChatBot from './ChatBot';
import WhyChooseLurnity from './WhyChooseLurnity';
import LurnityPrograms from './LurnityPrograms';
import UpcomingMasterclasses from './UpcomingMasterclasses';
import logo from '../assets/lurnity_original.jpg'
import img1 from '../assets/img1.jpeg'
import img2 from '../assets/img2.jpeg'
import img3 from '../assets/img3.jpeg'
import DemoForm from './DemoForm'

export default class OktaInspiredLandingPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPopup: false,
      showDemoForm: false,
      showNewChatBot: false,
      showChatBot: false,
      testimonialIndex: 0,
      openFAQ: null,
      mousePosition: { x: 0, y: 0 },
      cohortCountdown: this.computeCountdown(new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 10)),
      popupHasBeenClosed: false,
      showScrollToTop: false,
      activeOutcome: null,
      isVisible: {}
    };

    this.testimonials = [
      { 
        text: 'Lurnity transformed my career trajectory — from intern to senior engineer in just 8 months with unparalleled mentorship quality.', 
        author: 'Sneha Sharma', 
        role: 'Senior Data Scientist @ Google',
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23007BFF'/%3E%3Ctext x='50' y='60' text-anchor='middle' font-family='sans-serif' font-size='30' fill='white'%3ES%3C/text%3E%3C/svg%3E"
      },
      { 
        text: 'The depth of technical mentorship and real-world project exposure exceeded every expectation. Industry-leading curriculum design.', 
        author: 'Karthik Reddy', 
        role: 'IoT Architect @ Microsoft',
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%2328A745'/%3E%3Ctext x='50' y='60' text-anchor='middle' font-family='sans-serif' font-size='30' fill='white'%3EK%3C/text%3E%3C/svg%3E"
      },
      { 
        text: 'Exceptional career guidance and interview preparation. The placement team secured an offer 40% above market rate.', 
        author: 'Priya Nair', 
        role: 'Embedded Systems Lead @ Tesla',
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23FFC107'/%3E%3Ctext x='50' y='60' text-anchor='middle' font-family='sans-serif' font-size='30' fill='white'%3EP%3C/text%3E%3C/svg%3E"
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

    this.outcomesData = [
      {
        id: 1,
        icon: FaUsers,
        number: "15,847+",
        label: "Students Transformed",
        detail: "Professionals successfully transitioned to tech roles",
        description: "From diverse backgrounds including finance, marketing, operations, and more - all now thriving in top tech companies worldwide.",
        stats: ["Healthcare → Tech: 2,340", "Finance → Tech: 3,120", "Marketing → Tech: 1,890"],
        trend: "+127% this year"
      },
      {
        id: 2,
        icon: FaRocket,
        number: "₹28.5L",
        label: "Highest Package",
        detail: "Maximum salary achieved by our graduates",
        description: "Our top performers land dream roles at FAANG companies with compensation packages that exceed industry standards.",
        stats: ["Google: ₹28.5L", "Microsoft: ₹26.2L", "Amazon: ₹24.8L"],
        trend: "↗️ 45% above market avg"
      },
      {
        id: 3,
        icon: FaTrophy,
        number: "97.2%",
        label: "Placement Success",
        detail: "Within 4 months of program completion",
        description: "Industry-leading placement rate with dedicated career support, interview coaching, and our exclusive hiring partner network.",
        stats: ["Month 1: 78%", "Month 2: 89%", "Month 3: 94%", "Month 4: 97.2%"],
        trend: "Fastest in industry"
      },
      {
        id: 4,
        icon: FaBuilding,
        number: "500+",
        label: "Hiring Partners",
        detail: "Global companies actively recruiting our graduates",
        description: "Exclusive partnerships with unicorns, Fortune 500 companies, and innovative startups across multiple industries.",
        stats: ["FAANG: 25", "Unicorns: 87", "Fortune 500: 156", "Startups: 232"],
        trend: "New partners weekly"
      }
    ];

    this.features = [
      {
        icon: FaShield,
        title: "Industry-Leading Security",
        description: "Enterprise-grade security protocols ensuring your learning data is protected"
      },
      {
        icon: FaLightbulb,
        title: "AI-Powered Learning",
        description: "Personalized learning paths adapted to your pace and learning style"
      },
      {
        icon: FaCode,
        title: "Hands-on Projects",
        description: "Real-world projects that build your portfolio and practical skills"
      }
    ];
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
    window.addEventListener('mousemove', this.handleMouseMove);
    this.testimonialTimer = setInterval(this.nextTestimonial, 8000);
    this.countdownTimer = setInterval(this.updateCountdown, 1000);
    
    // Intersection Observer for animations
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.setState(prevState => ({
              isVisible: {
                ...prevState.isVisible,
                [entry.target.id]: true
              }
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe all sections with animation
    const animatedSections = document.querySelectorAll('[data-animate]');
    animatedSections.forEach(section => {
      this.observer.observe(section);
    });
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('mousemove', this.handleMouseMove);
    clearInterval(this.testimonialTimer);
    clearInterval(this.countdownTimer);
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  handleMouseMove = (e) => {
    this.setState({
      mousePosition: { x: e.clientX, y: e.clientY }
    });
  }

  handleScroll = () => {
    const scrollTop = window.scrollY;
    const heroHeight = window.innerHeight;
    const shouldShowScrollToTop = scrollTop > heroHeight;
    
    if (scrollTop > 500 && 
        !this.state.showPopup && 
        !this.state.popupHasBeenClosed) {
      this.setState({ showPopup: true });
    }
    
    if (shouldShowScrollToTop !== this.state.showScrollToTop) {
      this.setState({ showScrollToTop: shouldShowScrollToTop });
    }
  }

  scrollToTop = () => {
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
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

  closePopup = () => this.setState({ 
    showPopup: false, 
    popupHasBeenClosed: true 
  });
  
  goLogin = () => this.props.history && this.props.history.push('/login');
  goRegister = () => this.props.history && this.props.history.push('/register');
  
  handleBookDemo = () => this.setState({ showDemoForm: true });
  handleChatWithUs = () => this.setState({ showNewChatBot: true });
  handleInteractiveDemo = () => this.setState({ showChatBot: true });
  
  closeDemoForm = () => this.setState({ showDemoForm: false });
  closeNewChatBot = () => this.setState({ showNewChatBot: false });
  closeChatBot = () => this.setState({ showChatBot: false });

  nextTestimonial = () => this.setState(({ testimonialIndex }) => ({ testimonialIndex: (testimonialIndex + 1) % this.testimonials.length }));
  prevTestimonial = () => this.setState(({ testimonialIndex }) => ({ testimonialIndex: (testimonialIndex - 1 + this.testimonials.length) % this.testimonials.length }));

  toggleFAQ = (i) => this.setState(({ openFAQ }) => ({ openFAQ: openFAQ === i ? null : i }));

  handleOutcomeHover = (id) => {
    this.setState({ activeOutcome: id });
  }

  handleOutcomeLeave = () => {
    this.setState({ activeOutcome: null });
  }

  render() {
    const { testimonialIndex, cohortCountdown, openFAQ, showScrollToTop, activeOutcome, isVisible } = this.state;

    return (
      <div className="okta-landing-page">
        <div className="okta-wrapper">
          {/* Header */}
          <Header 
            onLogin={this.goLogin}
            onRegister={this.goRegister}
          />

          {/* Hero Section */}
          <section className="okta-hero" id="hero" data-animate>
            <div className="hero-container">
              <div className="hero-content">
                <div className="hero-badge">
                  <FaGraduationCap className="badge-icon" />
                  <span>Transform Your Tech Career</span>
                </div>
                
                <h1 className="hero-title">
                  Secure Your Future in <br />
                  <span className="gradient-text">Technology</span>
                </h1>
                
                <p className="hero-description">
                  Master cutting-edge technologies with industry-leading mentorship, 
                  hands-on projects, and guaranteed placement support. Join 15,000+ 
                  professionals who've transformed their careers with Lurnity.
                </p>
                
                <div className="hero-actions">
                  <button className="btn-primary" onClick={this.handleBookDemo}>
                    <FaRocket className="btn-icon" />
                    <span>Start Your Journey</span>
                    <FaArrowRight className="arrow-icon" />
                  </button>
                  
                  <button className="btn-secondary" onClick={this.handleChatWithUs}>
                    <FaPlay className="btn-icon" />
                    <span>Watch Demo</span>
                  </button>
                </div>
                
                <div className="hero-stats">
                  <div className="stat-item">
                    <span className="stat-number">15,847+</span>
                    <span className="stat-label">Graduates</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">97.2%</span>
                    <span className="stat-label">Placement Rate</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">₹28.5L</span>
                    <span className="stat-label">Highest Package</span>
                  </div>
                </div>
              </div>
              
              <div className="hero-visual">
                <div className="hero-card">
                  <div className="card-header">
                    <div className="card-dots">
                      <span className="dot red"></span>
                      <span className="dot yellow"></span>
                      <span className="dot green"></span>
                    </div>
                    <span className="card-title">Lurnity Dashboard</span>
                  </div>
                  <div className="card-content">
                    <div className="progress-item">
                      <span>AI & Machine Learning</span>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{width: '85%'}}></div>
                      </div>
                    </div>
                    <div className="progress-item">
                      <span>Embedded Systems</span>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{width: '92%'}}></div>
                      </div>
                    </div>
                    <div className="progress-item">
                      <span>IoT Development</span>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{width: '78%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Trust Indicators */}
          <section className="trust-section" data-animate>
            <div className="section-container">
              <p className="trust-label">Trusted by professionals at</p>
              <div className="trust-logos">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png" alt="Google" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/1200px-Microsoft_logo.svg.png" alt="Microsoft" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1200px-Amazon_logo.svg.png" alt="Amazon" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1200px-Apple_logo_black.svg.png" alt="Apple" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Tesla_Motors.svg/1200px-Tesla_Motors.svg.png" alt="Tesla" />
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="features-section" id="features" data-animate>
            <div className="section-container">
              <div className="section-header">
                <h2 className="section-title">Why Choose Lurnity</h2>
                <p className="section-subtitle">
                  Experience the difference with our comprehensive approach to tech education
                </p>
              </div>
              
              <div className="features-grid">
                {this.features.map((feature, index) => (
                  <div key={index} className="feature-card">
                    <div className="feature-icon">
                      <feature.icon />
                    </div>
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-description">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Outcomes Section */}
          <section className="outcomes-section" id="outcomes" data-animate>
            <div className="section-container">
              <div className="section-header">
                <h2 className="section-title">Proven Results</h2>
                <p className="section-subtitle">
                  Our graduates consistently achieve remarkable career transformations
                </p>
              </div>
              
              <div className="outcomes-grid">
                {this.outcomesData.map((outcome, index) => (
                  <div 
                    key={outcome.id} 
                    className={`outcome-card ${activeOutcome === outcome.id ? 'active' : ''}`}
                    onMouseEnter={() => this.handleOutcomeHover(outcome.id)}
                    onMouseLeave={this.handleOutcomeLeave}
                  >
                    <div className="outcome-icon">
                      <outcome.icon />
                    </div>
                    <div className="outcome-content">
                      <div className="outcome-number">{outcome.number}</div>
                      <div className="outcome-label">{outcome.label}</div>
                      <div className="outcome-detail">{outcome.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="testimonials-section" data-animate>
            <div className="section-container">
              <div className="section-header">
                <h2 className="section-title">Success Stories</h2>
                <p className="section-subtitle">
                  Hear from our graduates who've transformed their careers
                </p>
              </div>
              
              <div className="testimonial-container">
                <div className="testimonial-card">
                  <div className="testimonial-quote">
                    <p>"{this.testimonials[testimonialIndex].text}"</p>
                  </div>
                  
                  <div className="testimonial-author">
                    <img 
                      src={this.testimonials[testimonialIndex].image} 
                      alt={this.testimonials[testimonialIndex].author}
                      className="author-image" 
                    />
                    <div className="author-details">
                      <div className="author-name">{this.testimonials[testimonialIndex].author}</div>
                      <div className="author-role">{this.testimonials[testimonialIndex].role}</div>
                    </div>
                  </div>
                </div>
                
                <div className="testimonial-controls">
                  <button className="testimonial-btn" onClick={this.prevTestimonial}>
                    <FaChevronDown style={{transform: 'rotate(90deg)'}} />
                  </button>
                  <div className="testimonial-indicators">
                    {this.testimonials.map((_, index) => (
                      <button 
                        key={index}
                        className={`indicator ${index === testimonialIndex ? 'active' : ''}`}
                        onClick={() => this.setState({testimonialIndex: index})}
                      />
                    ))}
                  </div>
                  <button className="testimonial-btn" onClick={this.nextTestimonial}>
                    <FaChevronDown style={{transform: 'rotate(-90deg)'}} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="faq-section" id="faq" data-animate>
            <div className="section-container">
              <div className="section-header">
                <h2 className="section-title">Frequently Asked Questions</h2>
                <p className="section-subtitle">
                  Everything you need to know about our programs
                </p>
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

          {/* CTA Section */}
          <section className="cta-section" data-animate>
            <div className="section-container">
              <div className="cta-content">
                <h2 className="cta-title">Ready to Transform Your Career?</h2>
                <p className="cta-description">
                  Join thousands of professionals who've successfully transitioned into tech careers
                </p>
                <button className="btn-primary large" onClick={this.handleBookDemo}>
                  <FaRocket className="btn-icon" />
                  <span>Start Your Journey Today</span>
                  <FaArrowRight className="arrow-icon" />
                </button>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="okta-footer">
            <div className="footer-container">
              <div className="footer-content">
                <div className="footer-brand">
                  <div className="brand-logo">
                    <img src={logo} alt="Lurnity" className="footer-logo" />
                    <div className="brand-info">
                      <h3 className="brand-name">LURNITY</h3>
                      <p className="brand-tagline">Transform Your Future</p>
                    </div>
                  </div>
                  
                  <p className="brand-description">
                    Empowering the next generation of tech professionals through 
                    industry-leading education and guaranteed career transformation.
                  </p>
                  
                  <div className="social-links">
                    <a href="#" className="social-link">
                      <FaLinkedin />
                    </a>
                    <a href="#" className="social-link">
                      <FaTwitter />
                    </a>
                    <a href="#" className="social-link">
                      <FaGithub />
                    </a>
                    <a href="#" className="social-link">
                      <FaInstagram />
                    </a>
                  </div>
                </div>
                
                <div className="footer-links">
                  <div className="footer-column">
                    <h4 className="footer-title">Programs</h4>
                    <ul className="footer-list">
                      <li><a href="#programs">AI & Machine Learning</a></li>
                      <li><a href="#programs">Embedded Systems</a></li>
                      <li><a href="#programs">Internet of Things</a></li>
                      <li><a href="#programs">Robotics & Automation</a></li>
                    </ul>
                  </div>
                  
                  <div className="footer-column">
                    <h4 className="footer-title">Company</h4>
                    <ul className="footer-list">
                      <li><a href="#about">About Us</a></li>
                      <li><a href="#instructors">Our Team</a></li>
                      <li><a href="#careers">Careers</a></li>
                      <li><a href="#contact">Contact</a></li>
                    </ul>
                  </div>
                  
                  <div className="footer-column">
                    <h4 className="footer-title">Resources</h4>
                    <ul className="footer-list">
                      <li><a href="#blog">Blog</a></li>
                      <li><a href="#events">Events</a></li>
                      <li><a href="#help">Help Center</a></li>
                      <li><a href="#support">Support</a></li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="footer-bottom">
                <div className="footer-bottom-content">
                  <p className="copyright">© 2025 Lurnity Technologies Pvt Ltd. All rights reserved.</p>
                  <div className="footer-legal">
                    <a href="/privacy">Privacy Policy</a>
                    <a href="/terms">Terms of Service</a>
                    <a href="/cookies">Cookie Policy</a>
                  </div>
                </div>
              </div>
            </div>
          </footer>

          {/* Floating Action Button */}
          <FloatingActionButton 
            onBookDemo={this.handleInteractiveDemo}
            onChatBot={this.handleChatWithUs}
          />

          {/* Scroll to Top Button */}
          {showScrollToTop && (
            <button 
              className="scroll-to-top"
              onClick={this.scrollToTop}
              aria-label="Scroll to top"
            >
              <FaArrowUp />
            </button>
          )}

          {/* Modals */}
          {this.state.showPopup && (
            <div className="popup-overlay">
              <div className="popup">
                <button className="popup-close" onClick={this.closePopup}>×</button>
                <div className="popup-content">
                  <h4 className="popup-title">Ready to Start?</h4>
                  <p className="popup-description">
                    Get personalized guidance from our career experts
                  </p>
                  <div className="popup-actions">
                    <button className="btn-outline" onClick={this.closePopup}>
                      Maybe Later
                    </button>
                    <button className="btn-primary" onClick={this.handleBookDemo}>
                      <FaRocket className="btn-icon" />
                      Book Free Demo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {this.state.showDemoForm && (
            <div className="modal-overlay">
              <div className="modal">
                <button className="modal-close" onClick={this.closeDemoForm}>×</button>
                <DemoForm onClose={this.closeDemoForm} />
              </div>
            </div>
          )}

          <NewChatBot 
            isOpen={this.state.showNewChatBot} 
            onClose={this.closeNewChatBot} 
          />

          <ChatBot 
            isOpen={this.state.showChatBot} 
            onClose={this.closeChatBot} 
          />
        </div>
      </div>
    );
  }
}
