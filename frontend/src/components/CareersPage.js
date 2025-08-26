import React, { useState, useEffect } from 'react';
import "./CareersPage.css"
import { 
  FaUsers, 
  FaRocket, 
  FaBriefcase, 
  FaGraduationCap, 
  FaHandshake,
  FaChevronDown,
  FaChevronUp,
  FaArrowRight,
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaInstagram,
  FaMapMarkerAlt,
  FaClock,
  FaDollarSign,
  FaCheckCircle,
  FaHeart,
  FaCoffee,
  FaTrophy,
  FaLightbulb,
  FaGlobe,
  FaShieldAlt
} from 'react-icons/fa';
const API = process.env.REACT_APP_API_URL;
const LuxuryCareersPage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [jobs, setJobs] = useState([]);
  const [openPosition, setOpenPosition] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

    useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(`${API}/api/landingpage/jobs`);
        if (!res.ok) {
          throw new Error("Failed to fetch jobs");
        }
        const data = await res.json();
        setJobs(data.filter(job => job.isActive)); // only active jobs
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    };

    fetchJobs();
  }, []);

  const togglePosition = (id) => {
    setOpenPosition(openPosition === id ? null : id);
  };

    const departments = [
    { id: "all", name: "All Positions", count: jobs.length },
    { id: "Engineering", name: "Engineering", count: jobs.filter(j => j.department === "Engineering").length },
    { id: "Content", name: "Content", count: jobs.filter(j => j.department === "Content").length },
    { id: "Design", name: "Design", count: jobs.filter(j => j.department === "Design").length },
    { id: "Business", name: "Business", count: jobs.filter(j => j.department === "Business").length },
    { id: "Marketing", name: "Marketing", count: jobs.filter(j => j.department === "Marketing").length }
  ];

  const benefits = [
    {
      icon: <FaDollarSign />,
      title: 'Competitive Compensation',
      description: 'Top-tier salaries with performance bonuses and equity options for senior roles.'
    },
    {
      icon: <FaGraduationCap />,
      title: 'Learning & Development',
      description: 'Annual learning budget, conference attendance, and access to premium courses.'
    },
    {
      icon: <FaHeart />,
      title: 'Health & Wellness',
      description: 'Comprehensive health insurance, mental health support, and wellness programs.'
    },
    {
      icon: <FaCoffee />,
      title: 'Flexible Work',
      description: 'Hybrid work model, flexible hours, and unlimited PTO policy.'
    },
    {
      icon: <FaTrophy />,
      title: 'Recognition Programs',
      description: 'Regular appreciation, spot bonuses, and annual excellence awards.'
    },
    {
      icon: <FaRocket />,
      title: 'Career Growth',
      description: 'Clear advancement paths, mentorship programs, and leadership opportunities.'
    }
  ];

  const cultureValues = [
    {
      icon: <FaLightbulb />,
      title: 'Innovation First',
      description: 'We embrace cutting-edge technologies and encourage creative problem-solving in everything we do.'
    },
    {
      icon: <FaUsers />,
      title: 'Student-Centric',
      description: 'Every decision we make is driven by what\'s best for our students\' learning journey and career success.'
    },
    {
      icon: <FaHandshake />,
      title: 'Collaborative Excellence',
      description: 'We believe in the power of teamwork and cross-functional collaboration to achieve extraordinary results.'
    },
    {
      icon: <FaShieldAlt />,
      title: 'Integrity & Trust',
      description: 'We maintain the highest standards of honesty, transparency, and ethical conduct in all our interactions.'
    }
  ];

  const teamStats = [
    { number: '150+', label: 'Team Members', icon: <FaUsers /> },
    { number: '25+', label: 'Countries', icon: <FaGlobe /> },
    { number: '4.8/5', label: 'Glassdoor Rating', icon: <FaTrophy /> },
    { number: '95%', label: 'Employee Satisfaction', icon: <FaHeart /> }
  ];

  const filteredJobs =
    selectedDepartment === "all"
      ? jobs
      : jobs.filter(job => job.department === selectedDepartment);

  

  return (
    <div className="luxury-careers-wrapper">
      {/* Luxury cursor */}
      <div 
        className="luxury-careers-cursor" 
        style={{
          left: mousePosition.x,
          top: mousePosition.y
        }}
      />

      {/* Header */}
      <header className="luxury-careers-header">
        <div className="luxury-careers-header-content">
          <div className="luxury-careers-brand">
            <div className="luxury-careers-brand-text">
              <span className="luxury-careers-brand-name">LURNITY</span>
              <span className="luxury-careers-brand-tagline">Excellence in Tech Education</span>
            </div>
          </div>

          <nav className="luxury-careers-nav">
            <a href="/" className="luxury-careers-nav-link">Home</a>
            
            <a href="/careers" className="luxury-careers-nav-link luxury-careers-active">Careers</a>
            
            
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="luxury-careers-hero">
        <div className="luxury-careers-hero-bg-elements">
          <div className="luxury-careers-floating-element luxury-careers-element-1"></div>
          <div className="luxury-careers-floating-element luxury-careers-element-2"></div>
          <div className="luxury-careers-floating-element luxury-careers-element-3"></div>
        </div>
        
        <div className="luxury-careers-hero-content">
          <div className="luxury-careers-hero-badge">
            <span className="luxury-careers-badge-icon">🚀</span>
            Join Our Mission • Shape the Future • Build Excellence
          </div>
          
          <h1 className="luxury-careers-hero-title">
            Build the <span className="luxury-careers-gradient-text">Future</span> of<br />
            <span className="luxury-careers-highlight">Tech Education</span><br />
            with Lurnity
          </h1>
          
          <p className="luxury-careers-hero-description">
            Join an lurnity team of innovators, educators, and technologists who are 
            transforming how the world learns cutting-edge technology. Build your 
            career while empowering the next generation of tech leaders.
          </p>

          <div className="luxury-careers-hero-stats">
            {teamStats.map((stat, index) => (
              <div key={index} className="luxury-careers-stat-item">
                <div className="luxury-careers-stat-icon">{stat.icon}</div>
                <div className="luxury-careers-stat-number">{stat.number}</div>
                <div className="luxury-careers-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="luxury-careers-hero-actions">
            <button className="luxury-careers-btn-primary-large" onClick={() => document.getElementById('luxury-careers-openings').scrollIntoView({behavior:'smooth'})}>
              <FaBriefcase className="luxury-careers-btn-icon" />
              View Open Positions
            </button>
            <button className="luxury-careers-btn-outline-large" onClick={() => document.getElementById('luxury-careers-culture').scrollIntoView({behavior:'smooth'})}>
              Our Culture
              <FaArrowRight className="luxury-careers-btn-icon" />
            </button>
          </div>
        </div>
      </section>

      {/* Why Lurnity Section */}
      <section className="luxury-careers-why-join">
        <div className="luxury-careers-section-content">
          <div className="luxury-careers-section-header">
            <h2 className="luxury-careers-section-title">Why Choose Lurnity?</h2>
            <p className="luxury-careers-section-subtitle">
              Experience unparalleled career growth in a luxury work environment designed for excellence
            </p>
          </div>

          <div className="luxury-careers-benefits-grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="luxury-careers-benefit-card">
                <div className="luxury-careers-benefit-icon">{benefit.icon}</div>
                <h4 className="luxury-careers-benefit-title">{benefit.title}</h4>
                <p className="luxury-careers-benefit-description">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Culture & Values */}
      <section id="luxury-careers-culture" className="luxury-careers-culture">
        <div className="luxury-careers-section-content">
          <div className="luxury-careers-section-header">
            <h2 className="luxury-careers-section-title">Our Culture & Values</h2>
            <p className="luxury-careers-section-subtitle">
              Built on a foundation of excellence, innovation, and genuine care for our team and students
            </p>
          </div>

          <div className="luxury-careers-culture-grid">
            {cultureValues.map((value, index) => (
              <div key={index} className="luxury-careers-culture-card">
                <div className="luxury-careers-culture-icon">{value.icon}</div>
                <h4 className="luxury-careers-culture-title">{value.title}</h4>
                <p className="luxury-careers-culture-description">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
        <section id="luxury-careers-openings" className="luxury-careers-positions">
      <div className="luxury-careers-section-content">
        <h2 className="luxury-careers-section-title">Open Positions</h2>

        {/* Department Filter */}
        <div className="luxury-careers-department-filter">
          {departments.map((dept) => (
            <button
              key={dept.id}
              className={`luxury-careers-filter-btn ${
                selectedDepartment === dept.id ? "luxury-careers-active" : ""
              }`}
              onClick={() => setSelectedDepartment(dept.id)}
            >
              {dept.name} ({dept.count})
            </button>
          ))}
        </div>

        {/* Jobs List */}
        <div className="luxury-careers-jobs-container">
          {filteredJobs.map((job, index) => (
            <div key={job._id} className="luxury-careers-job-card">
              {/* Job Header */}
              <div
                className="luxury-careers-job-header"
                onClick={() => togglePosition(index)}
              >
                <h4 className="luxury-careers-job-title">{job.roleName}</h4>
                <div className="luxury-careers-job-meta">
                  <span>{job.department}</span>
                  <span><FaMapMarkerAlt /> {job.location}</span>
                  <span><FaClock /> {job.type}</span>
                </div>
                <span className="luxury-careers-toggle-icon">
                  {openPosition === index ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </div>

              {/* Expanded Job Details */}
              {openPosition === index && (
  <div className="luxury-careers-job-details">
    <h5>Role Description</h5>
    <p>{job.description}</p>

    <h5>Requirements</h5>
    <ul>
      {job.requirements?.map((req, i) => (
        <li key={i}>{req}</li>
      ))}
    </ul>

    {/* Application Form */}
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const formData = {
          name: e.target.name.value,
          email: e.target.email.value,
          contactNumber: e.target.contactNumber.value,
          resumeUrl: e.target.resumeUrl.value,
        };

        const res = await fetch(`${API}/api/landingpage/${job._id}/apply`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          }
        );

        if (res.ok) {
          alert("Application submitted successfully!");
          e.target.reset();
        } else {
          alert("Failed to apply");
        }
      }}
    >
      <input type="text" name="name" placeholder="Full Name" required />
      <input type="email" name="email" placeholder="Email" required />
      <input
        type="text"
        name="contactNumber"
        placeholder="Contact Number"
        required
      />
      <input
        type="url"
        name="resumeUrl"
        placeholder="Google Drive Resume Link (open access)"
        required
      />
      <button type="submit" className="luxury-careers-btn-apply-primary">
        Submit Application
      </button>
    </form>
  </div>
)}

            </div>
          ))}

          {filteredJobs.length === 0 && (
            <p className="luxury-careers-no-jobs">No jobs available in this department.</p>
          )}
        </div>
      </div>
    </section>

      {/* Application Process */}
      <section className="luxury-careers-process">
        <div className="luxury-careers-section-content">
          <div className="luxury-careers-section-header">
            <h2 className="luxury-careers-section-title">Our Hiring Process</h2>
            <p className="luxury-careers-section-subtitle">
              A streamlined, transparent process designed to find the perfect cultural and technical fit
            </p>
          </div>

          <div className="luxury-careers-process-timeline">
            <div className="luxury-careers-process-step">
              <div className="luxury-careers-step-number">01</div>
              <div className="luxury-careers-step-content">
                <h4>Application Review</h4>
                <p>Our talent team carefully reviews your application and portfolio within 48 hours.</p>
              </div>
            </div>

            <div className="luxury-careers-process-step">
              <div className="luxury-careers-step-number">02</div>
              <div className="luxury-careers-step-content">
                <h4>Initial Screening</h4>
                <p>30-minute video call to discuss your background, interests, and mutual fit.</p>
              </div>
            </div>

            <div className="luxury-careers-process-step">
              <div className="luxury-careers-step-number">03</div>
              <div className="luxury-careers-step-content">
                <h4>Technical Assessment</h4>
                <p>Role-specific evaluation to showcase your skills and problem-solving approach.</p>
              </div>
            </div>

            <div className="luxury-careers-process-step">
              <div className="luxury-careers-step-number">04</div>
              <div className="luxury-careers-step-content">
                <h4>Team Interviews</h4>
                <p>Meet your potential teammates and hiring manager for cultural alignment discussion.</p>
              </div>
            </div>

            <div className="luxury-careers-process-step">
              <div className="luxury-careers-step-number">05</div>
              <div className="luxury-careers-step-content">
                <h4>Final Decision</h4>
                <p>We'll make our decision within 24 hours and extend an offer if you're the right fit.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      


      {/* Footer */}
      <footer className="luxury-careers-footer">
        <div className="luxury-careers-footer-content">
          <div className="luxury-careers-footer-main">
            <div className="luxury-careers-footer-brand">
              <div className="luxury-careers-brand-info">
                <div className="luxury-careers-brand-name">LURNITY</div>
                <p className="luxury-careers-brand-description">
                  Join us in transforming careers through luxury technology education and premium mentorship programs.
                </p>
              </div>
              
              <div className="luxury-careers-footer-social">
                <a href="https://www.linkedin.com/" className="luxury-careers-social-link" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
                <a href="https://twitter.com/" className="luxury-careers-social-link" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
                <a href="https://instagram.com/" className="luxury-careers-social-link" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                <a href="https://github.com/" className="luxury-careers-social-link" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
              </div>
            </div>
            
            <div className="luxury-careers-footer-links">
              <div className="luxury-careers-link-group">
                <h4 className="luxury-careers-link-title">Company</h4>
                <a href="#about" className="luxury-careers-footer-link">About Us</a>
                <a href="#careers" className="luxury-careers-footer-link">Careers</a>
                <a href="#press" className="luxury-careers-footer-link">Press</a>
                <a href="#contact" className="luxury-careers-footer-link">Contact</a>
              </div>
              
              <div className="luxury-careers-link-group">
                <h4 className="luxury-careers-link-title">Programs</h4>
                <a href="#ai" className="luxury-careers-footer-link">AI & ML</a>
                <a href="#embedded" className="luxury-careers-footer-link">Embedded Systems</a>
                <a href="#iot" className="luxury-careers-footer-link">Internet of Things</a>
                <a href="#robotics" className="luxury-careers-footer-link">Robotics</a>
              </div>
              
              <div className="luxury-careers-link-group">
                <h4 className="luxury-careers-link-title">Support</h4>
                <a href="#help" className="luxury-careers-footer-link">Help Center</a>
                <a href="#community" className="luxury-careers-footer-link">Community</a>
                <a href="#resources" className="luxury-careers-footer-link">Resources</a>
                <a href="#status" className="luxury-careers-footer-link">Status</a>
              </div>
              
              <div className="luxury-careers-link-group">
                <h4 className="luxury-careers-link-title">Legal</h4>
                <a href="#privacy" className="luxury-careers-footer-link">Privacy Policy</a>
                <a href="#terms" className="luxury-careers-footer-link">Terms of Service</a>
                <a href="#cookies" className="luxury-careers-footer-link">Cookie Policy</a>
                <a href="#security" className="luxury-careers-footer-link">Security</a>
              </div>
            </div>
          </div>
          
          <div className="luxury-careers-footer-bottom">
            <div className="luxury-careers-footer-legal">
              <span>© 2025 Lurnity. All rights reserved.</span>
              <span>Crafted with excellence in Hyderabad, India</span>
            </div>
          </div>
        </div>
      </footer>

      
    </div>
  );
};

export default LuxuryCareersPage;