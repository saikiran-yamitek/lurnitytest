import React, { Component } from 'react';
import { FaGraduationCap, FaLaptopCode, FaBriefcase, FaStar, FaCheckCircle, FaUsers, FaCalendarAlt, FaDownload, FaRocket, FaChalkboardTeacher, FaHandshake, FaCertificate, FaChevronDown, FaChevronUp, FaArrowRight, FaPlay, FaLinkedin, FaGithub, FaTwitter, FaInstagram, FaArrowUp, FaTrophy, FaChartLine, FaAward, FaBuilding, FaCrown, FaFire, FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaGlobe } from 'react-icons/fa';
import './LandingPage.css'
import { Link } from 'react-router-dom';
import Header from './Header';
import HeroSection from './HeroSection';
import FloatingActionButton from './FloatingActionButton';
import NewChatBot from './NewChatBot';  // Gemini AI chatbot (side popup)
import ChatBot from './ChatBot';        // Interactive demo form chatbot
import WhyChooseLurnity from './WhyChooseLurnity';
import LurnityPrograms from './LurnityPrograms';
import UpcomingMasterclasses from './UpcomingMasterclasses';
import logo from '../assets/lurnity_original.jpg'
import img1 from '../assets/img1.jpeg'
import img2 from '../assets/img2.jpeg'
import img3 from '../assets/img3.jpeg'
import DemoForm from './DemoForm'

export default class LuxuryLandingPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPopup: false,
      showDemoForm: false,
      showNewChatBot: false,    // For Gemini AI chatbot (Chat with us)
      showChatBot: false,       // For interactive demo form chatbot (Book Demo)
      testimonialIndex: 0,
      openFAQ: null,
      mousePosition: { x: 0, y: 0 },
      cohortCountdown: this.computeCountdown(new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 10)),
      popupHasBeenClosed: false,
      showScrollToTop: false,
      activeOutcome: null
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

    // Enhanced outcomes data
    this.outcomesData = [
      {
        id: 1,
        icon: FaUsers,
        number: "15,847+",
        label: "Career Transformations",
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
      },
      {
        id: 5,
        icon: FaChartLine,
        number: "340%",
        label: "Average Salary Jump",
        detail: "Career growth within first 2 years",
        description: "Our graduates don't just get jobs - they build remarkable careers with rapid promotions and significant salary increases.",
        stats: ["6 months: +45%", "1 year: +120%", "2 years: +340%"],
        trend: "Exponential growth"
      },
      {
        id: 6,
        icon: FaCrown,
        number: "4.94★",
        label: "Excellence Rating",
        detail: "Rated by 12,000+ verified graduates",
        description: "Consistently rated as the premier technology education platform with unmatched student satisfaction and outcomes.",
        stats: ["Teaching: 4.9★", "Support: 4.95★", "Outcomes: 4.98★"],
        trend: "Industry's highest"
      }
    ];
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
    window.addEventListener('mousemove', this.handleMouseMove);
    this.testimonialTimer = setInterval(this.nextTestimonial, 8000);
    this.countdownTimer = setInterval(this.updateCountdown, 1000);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('mousemove', this.handleMouseMove);
    clearInterval(this.testimonialTimer);
    clearInterval(this.countdownTimer);
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
  
  // Handler for regular demo booking (opens DemoForm)
  handleBookDemo = () => this.setState({ showDemoForm: true });
  
  // Handler for "Chat with us" (opens NewChatBot - Gemini AI)
  handleChatWithUs = () => this.setState({ showNewChatBot: true });
  
  // Handler for "Book Demo" from floating button (opens ChatBot - Interactive Form)
  handleInteractiveDemo = () => this.setState({ showChatBot: true });
  
  // Close handlers
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
    const { testimonialIndex, cohortCountdown, openFAQ, mousePosition, showScrollToTop, activeOutcome } = this.state;

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

          <Header 
            onLogin={this.goLogin}
            onRegister={this.goRegister}
          />

          <HeroSection 
            onBookDemo={this.handleBookDemo}
            cohortCountdown={cohortCountdown}
          />

          {/* Enhanced Recognition Section with Scrolling Partners */}
          <section className="luxury-recognition">
            <div className="recognition-content">
              <div className="recognition-label">Trusted Partnerships</div>
              <h3 className="partnership-title">
                <a 
                  href="https://www.coursera.org/about/partners" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="partnership-link"
                >
                  We collaborate with 350+ leading universities and companies
                </a>
              </h3>
              
              <div className="partners-scroll-container">
                <div className="partners-scroll-track">
                  {/* Company logos with duplicates for seamless scrolling */}
                  <div className="partner-logo-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png" alt="Google" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/1200px-Microsoft_logo.svg.png" alt="Microsoft" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1200px-Amazon_logo.svg.png" alt="Amazon" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1200px-Apple_logo_black.svg.png" alt="Apple" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Tesla_Motors.svg/1200px-Tesla_Motors.svg.png" alt="Tesla" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/1200px-Netflix_2015_logo.svg.png" alt="Netflix" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Uber_logo_2018.svg/1200px-Uber_logo_2018.svg.png" alt="Uber" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Airbnb_Logo_Bélo.svg/1200px-Airbnb_Logo_Bélo.svg.png" alt="Airbnb" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://logo.svgcdn.com/d/salesforce-original.png" alt="Salesforce" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://logos-world.net/wp-content/uploads/2020/09/IBM-Logo.png" alt="IBM" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://logos-world.net/wp-content/uploads/2020/09/Oracle-Logo.png" alt="Oracle" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Shopify_logo_2018.svg/1200px-Shopify_logo_2018.svg.png" alt="Shopify" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Zoom_Communications_Logo.svg/1200px-Zoom_Communications_Logo.svg.png" alt="Zoom" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/1200px-Stripe_Logo%2C_revised_2016.svg.png" alt="Stripe" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Notion-logo.svg/1200px-Notion-logo.svg.png" alt="Notion" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/OpenAI_Logo.svg/1200px-OpenAI_Logo.svg.png" alt="OpenAI" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://cdn.worldvectorlogo.com/logos/adobe-1.svg" alt="Adobe" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://cdn.worldvectorlogo.com/logos/nvidia.svg" alt="NVIDIA" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Intel_logo_%282006-2020%29.svg/1200px-Intel_logo_%282006-2020%29.svg.png" alt="Intel" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Cisco_logo.svg/1200px-Cisco_logo.svg.png" alt="Cisco" />
                  </div>

                  {/* Duplicate set for seamless scrolling */}
                  <div className="partner-logo-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png" alt="Google" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/1200px-Microsoft_logo.svg.png" alt="Microsoft" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1200px-Amazon_logo.svg.png" alt="Amazon" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1200px-Apple_logo_black.svg.png" alt="Apple" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Tesla_Motors.svg/1200px-Tesla_Motors.svg.png" alt="Tesla" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/1200px-Netflix_2015_logo.svg.png" alt="Netflix" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Uber_logo_2018.svg/1200px-Uber_logo_2018.svg.png" alt="Uber" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Airbnb_Logo_Bélo.svg/1200px-Airbnb_Logo_Bélo.svg.png" alt="Airbnb" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://logo.svgcdn.com/d/salesforce-original.png" alt="Salesforce" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://logos-world.net/wp-content/uploads/2020/09/IBM-Logo.png" alt="IBM" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://logos-world.net/wp-content/uploads/2020/09/Oracle-Logo.png" alt="Oracle" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Shopify_logo_2018.svg/1200px-Shopify_logo_2018.svg.png" alt="Shopify" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Zoom_Communications_Logo.svg/1200px-Zoom_Communications_Logo.svg.png" alt="Zoom" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/1200px-Stripe_Logo%2C_revised_2016.svg.png" alt="Stripe" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Notion-logo.svg/1200px-Notion-logo.svg.png" alt="Notion" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/OpenAI_Logo.svg/1200px-OpenAI_Logo.svg.png" alt="OpenAI" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://cdn.worldvectorlogo.com/logos/adobe-1.svg" alt="Adobe" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://cdn.worldvectorlogo.com/logos/nvidia.svg" alt="NVIDIA" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Intel_logo_%282006-2020%29.svg/1200px-Intel_logo_%282006-2020%29.svg.png" alt="Intel" />
                  </div>
                  <div className="partner-logo-item">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Cisco_logo.svg/1200px-Cisco_logo.svg.png" alt="Cisco" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Why Choose Luxury Component */}
          <WhyChooseLurnity onBookDemo={this.handleBookDemo} />

          {/* Premium Programs Component */}
          <LurnityPrograms onBookDemo={this.handleBookDemo} />

          {/* LIGHT THEME Career Outcomes Section */}
          <section className="luxury-outcomes-light" id="outcomes">
            <div className="outcomes-background-light">
              <div className="bg-pattern-light"></div>
              <div className="floating-elements-light">
                <div className="float-element-light element-1"></div>
                <div className="float-element-light element-2"></div>
                <div className="float-element-light element-3"></div>
              </div>
            </div>

            <div className="section-content-full">
              <div className="outcomes-header-light">
                <div className="section-badge-light">Our Impact</div>
                <h2 className="section-title-light">
                  Exceptional <span className="gradient-text-orange">Career Outcomes</span>
                </h2>
                <p className="section-subtitle-light">
                  Our graduates consistently achieve remarkable career transformations and join the world's most innovative companies
                </p>
              </div>
              
              <div className="outcomes-grid-light">
                {this.outcomesData.map((outcome, index) => (
                  <div 
                    key={outcome.id} 
                    className={`outcome-card-light ${activeOutcome === outcome.id ? 'active' : ''}`}
                    onMouseEnter={() => this.handleOutcomeHover(outcome.id)}
                    onMouseLeave={this.handleOutcomeLeave}
                  >
                    <div className="card-background-light"></div>
                    <div className="card-border-light"></div>
                    
                    <div className="outcome-icon-wrapper-light">
                      <div className="outcome-icon-light">
                        <outcome.icon />
                      </div>
                      <div className="icon-shadow-light"></div>
                    </div>
                    
                    <div className="outcome-content-light">
                      <div className="outcome-number-light">{outcome.number}</div>
                      <div className="outcome-label-light">{outcome.label}</div>
                      <div className="outcome-detail-light">{outcome.detail}</div>
                      
                      <div className="outcome-trend-light">
                        <FaFire className="trend-icon-light" />
                        <span>{outcome.trend}</span>
                      </div>
                    </div>

                    <div className="outcome-expansion-light">
                      <p className="outcome-description-light">{outcome.description}</p>
                      <div className="outcome-stats-light">
                        {outcome.stats.map((stat, i) => (
                          <div key={i} className="stat-item-light">
                            <span className="stat-bullet-light">•</span>
                            <span className="stat-text-light">{stat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="outcomes-cta-light">
                <div className="cta-content-light">
                  <h3 className="cta-title-light">Ready to Join Our Success Stories?</h3>
                  <p className="cta-subtitle-light">Transform your career with industry-leading outcomes</p>
                  <button className="btn-outcomes-cta-light" onClick={this.handleBookDemo}>
                    <FaRocket className="btn-icon" />
                    <span>Start Your Journey</span>
                    <FaArrowRight className="arrow-icon" />
                  </button>
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

          {/* Upcoming Masterclasses Component */}
          <UpcomingMasterclasses onBookDemo={this.handleBookDemo} />

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
                  <button className="btn-newsletter" onClick={this.handleBookDemo}>
                    <span>Join Lurnity Community</span>
                    <FaArrowRight className="btn-icon" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* REDESIGNED Premium Footer */}
          <footer className="premium-footer">
            <div className="footer-background">
              <div className="footer-pattern"></div>
            </div>
            
            <div className="footer-content-full">
              {/* Main Footer Content */}
              <div className="footer-main-section">
                <div className="footer-left">
                  <div className="footer-brand-section">
                    <div className="brand-logo-wrapper">
                      <img src={logo} alt="Lurnity" className="footer-logo" />
                      <div className="brand-info">
                        <h3 className="brand-name">LURNITY</h3>
                        <p className="brand-tagline">Transform Your Future</p>
                      </div>
                    </div>
                    
                    <p className="brand-description">
                      Empowering the next generation of tech professionals through industry-leading education, 
                      personalized mentorship, and guaranteed career transformation.
                    </p>
                    
                    <div className="footer-stats">
                      <div className="footer-stat">
                        <span className="stat-number">15,847+</span>
                        <span className="stat-label">Alumni</span>
                      </div>
                      <div className="footer-stat">
                        <span className="stat-number">97.2%</span>
                        <span className="stat-label">Placement</span>
                      </div>
                      <div className="footer-stat">
                        <span className="stat-number">500+</span>
                        <span className="stat-label">Partners</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="footer-right">
                  <div className="footer-links-grid">
                    <div className="footer-column">
                      <h4 className="footer-column-title">Programs</h4>
                      <div className="footer-links">
                        <a href="#programs" className="footer-link">
                          <FaRocket className="link-icon" />
                          <span>AI & Machine Learning</span>
                        </a>
                        <a href="#programs" className="footer-link">
                          <FaLaptopCode className="link-icon" />
                          <span>Embedded Systems</span>
                        </a>
                        <a href="#programs" className="footer-link">
                          <FaGlobe className="link-icon" />
                          <span>Internet of Things</span>
                        </a>
                        <a href="#programs" className="footer-link">
                          <FaCrown className="link-icon" />
                          <span>Robotics & Automation</span>
                        </a>
                      </div>
                    </div>
                    
                    <div className="footer-column">
                      <h4 className="footer-column-title">Company</h4>
                      <div className="footer-links">
                        <a href="#about" className="footer-link">
                          <FaUsers className="link-icon" />
                          <span>About Lurnity</span>
                        </a>
                        <a href="#mentors" className="footer-link">
                          <FaChalkboardTeacher className="link-icon" />
                          <span>Expert Mentors</span>
                        </a>
                        <a href="#outcomes" className="footer-link">
                          <FaTrophy className="link-icon" />
                          <span>Success Stories</span>
                        </a>
                        <a href="/careers" className="footer-link">
                          <FaBriefcase className="link-icon" />
                          <span>Join Our Team</span>
                        </a>
                      </div>
                    </div>
                    
                    <div className="footer-column">
                      <h4 className="footer-column-title">Resources</h4>
                      <div className="footer-links">
                        <a href="#blog" className="footer-link">
                          <FaPlay className="link-icon" />
                          <span>Learning Hub</span>
                        </a>
                        <a href="#events" className="footer-link">
                          <FaCalendarAlt className="link-icon" />
                          <span>Live Events</span>
                        </a>
                        <a href="#faq" className="footer-link">
                          <FaCheckCircle className="link-icon" />
                          <span>Help Center</span>
                        </a>
                        <a href="#support" className="footer-link">
                          <FaHandshake className="link-icon" />
                          <span>Student Support</span>
                        </a>
                      </div>
                    </div>
                    
                    <div className="footer-column">
                      <h4 className="footer-column-title">Connect</h4>
                      <div className="contact-info">
                        <div className="contact-item">
                          <FaMapMarkerAlt className="contact-icon" />
                          <div className="contact-details">
                            <span className="contact-label">Headquarters</span>
                            <span className="contact-value">Hyderabad, Telangana, India</span>
                          </div>
                        </div>
                        <div className="contact-item">
                          <FaEnvelope className="contact-icon" />
                          <div className="contact-details">
                            <span className="contact-label">Email</span>
                            <span className="contact-value">admissions@lurnity.com</span>
                          </div>
                        </div>
                        <div className="contact-item">
                          <FaPhoneAlt className="contact-icon" />
                          <div className="contact-details">
                            <span className="contact-label">Phone</span>
                            <span className="contact-value">+91 98765 43210</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Social Media Section */}
              <div className="footer-social-section">
                <div className="social-content">
                  <h4 className="social-title">Follow Our Journey</h4>
                  <div className="social-links">
                    <a href="https://www.linkedin.com/" className="social-link linkedin" target="_blank" rel="noopener noreferrer">
                      <FaLinkedin />
                      <span>LinkedIn</span>
                    </a>
                    <a href="https://twitter.com/" className="social-link twitter" target="_blank" rel="noopener noreferrer">
                      <FaTwitter />
                      <span>Twitter</span>
                    </a>
                    <a href="https://instagram.com/" className="social-link instagram" target="_blank" rel="noopener noreferrer">
                      <FaInstagram />
                      <span>Instagram</span>
                    </a>
                    <a href="https://github.com/" className="social-link github" target="_blank" rel="noopener noreferrer">
                      <FaGithub />
                      <span>GitHub</span>
                    </a>
                  </div>
                </div>
                
                <div className="newsletter-signup">
                  <h4 className="newsletter-signup-title">Stay Updated</h4>
                  <div className="newsletter-form-footer">
                    <input 
                      type="email" 
                      placeholder="Enter your email"
                      className="newsletter-input-footer"
                    />
                    <button className="btn-newsletter-footer" onClick={this.handleBookDemo}>
                      <span>Subscribe</span>
                      <FaArrowRight />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Bottom Footer */}
              <div className="footer-bottom">
                <div className="footer-bottom-content">
                  <div className="copyright">
                    <span>© 2025 Lurnity Technologies Pvt Ltd. All rights reserved.</span>
                  </div>
                  <div className="footer-legal-links">
                    <a href="/privacy" className="legal-link">Privacy Policy</a>
                    <a href="/terms" className="legal-link">Terms of Service</a>
                    <a href="/cookies" className="legal-link">Cookie Policy</a>
                    <a href="/security" className="legal-link">Security</a>
                  </div>
                </div>
              </div>
            </div>
          </footer>

          {/* Updated Floating Action Button with separate handlers */}
          <FloatingActionButton 
            onBookDemo={this.handleInteractiveDemo}  // Interactive demo form chatbot
            onChatBot={this.handleChatWithUs}        // Gemini AI chatbot
          />

          {/* Custom Scroll to Top Button */}
          {showScrollToTop && (
            <button 
              className="scroll-to-top-btn"
              onClick={this.scrollToTop}
              aria-label="Scroll to top"
            >
              <FaArrowUp className="scroll-to-top-icon" />
            </button>
          )}

          {/* Luxury Popup */}
          {this.state.showPopup && (
            <div className="luxury-popup-overlay">
              <div className="luxury-popup">
                <button className="popup-close-luxury" onClick={this.closePopup}>
                  <span>×</span>
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
                    <button className="btn-popup-premium" onClick={this.handleBookDemo}>
                      <FaRocket className="btn-icon" />
                      Book Now - Free
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Demo Form Modal - Traditional form */}
          {this.state.showDemoForm && (
            <div className="demo-modal-overlay">
              <div className="demo-modal">
                <button className="modal-close" onClick={this.closeDemoForm}>×</button>
                <DemoForm onClose={this.closeDemoForm} />
              </div>
            </div>
          )}

          {/* Gemini AI Chatbot - Side popup for "Chat with us" */}
          <NewChatBot 
            isOpen={this.state.showNewChatBot} 
            onClose={this.closeNewChatBot} 
          />

          {/* Interactive Demo Form Chatbot - Overlay for "Book Demo" */}
          <ChatBot 
            isOpen={this.state.showChatBot} 
            onClose={this.closeChatBot} 
          />
        </div>
      </div>
    );
  }
}
