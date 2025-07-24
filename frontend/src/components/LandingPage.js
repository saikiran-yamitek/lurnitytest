import React, { Component } from 'react';
import './LandingPage.css';
import DemoForm from './DemoForm'; // 🔁 New component for booking

import heroImg from '../assets/landing.avif';
import embedImg from '../assets/embedImg.jpeg';
import dataImg from '../assets/dataImg.jpeg';
import iotImg from '../assets/iotImg.jpeg';
import roboImg from '../assets/roboImg.jpeg';

export default class LandingPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPopup: false,
      showDemoForm: false,
    };
  }

  componentDidMount() {
    window.addEventListener('scroll', this.checkScrollPopup);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.checkScrollPopup);
  }

  checkScrollPopup = () => {
    const scrollTop = window.scrollY;
    if (scrollTop > 300 && !this.state.showPopup) {
      this.setState({ showPopup: true });
    }
  };

  closePopup = () => {
    this.setState({ showPopup: false });
  };

  goLogin = () => this.props.history.push('/login');
  goRegister = () => this.props.history.push('/register');
  bookDemo = () => this.setState({ showDemoForm: true });
  closeDemoForm = () => this.setState({ showDemoForm: false });

  render() {
    return (
      <div className="lp-wrapper">
        {/* Header */}
        <header className="lp-header">
          <div className="lp-logo">
            <span className="lp-accent">LUR</span>NITY
          </div>
          <nav>
            <a href="/">Home</a>
            <a href="#courses">Courses</a>
            <a href="#about">About</a>
            <button onClick={this.goLogin}>Log In</button>
          </nav>
        </header>

        {/* Hero */}
        <section className="lp-hero">
          <div className="hero-text">
            <h1>Learn Smarter<br />with Lurnity</h1>
            <p>Personalized learning powered by industry experts and IIT mentors.</p>
            <button className="btn-red" onClick={this.bookDemo}>Book Free Demo</button>
          </div>
          <img src={heroImg} alt="Student with laptop" />
        </section>

        {/* Why Lurnity */}
        <section className="lp-why" id="about">
          <h2>Why Choose <span className="lp-accent">Lurnity</span>?</h2>
          <div className="why-row">
            <div className="why-card">
              <span className="why-icon">🎓</span>
              <h4>Expert Mentors</h4>
              <p>Learn from IIT alumni with real‑world experience.</p>
            </div>
            <div className="why-card">
              <span className="why-icon">⚙️</span>
              <h4>Hands‑On Projects</h4>
              <p>Build a strong portfolio that lands interviews.</p>
            </div>
            <div className="why-card">
              <span className="why-icon">💼</span>
              <h4>Placement Assistance</h4>
              <p>Exclusive hiring partners & career guidance.</p>
            </div>
          </div>
        </section>

        {/* Courses */}
        <section className="lp-courses" id="courses">
          <h2>Our Courses</h2>
          <div className="course-grid">
            {[{ img: embedImg, title: 'Embedded Systems' },
              { img: dataImg, title: 'Data Analytics' },
              { img: roboImg, title: 'Robotics' },
              { img: iotImg, title: 'IoT' }
            ].map(c => (
              <div className="course-card" key={c.title}>
                <img src={c.img} alt={c.title} />
                <div className="course-label">{c.title}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="lp-testimonials">
          <h2>What Our Students Say</h2>
          <div className="test-row">
            <blockquote>
              “Lurnity helped me land my dream job with their project‑based approach!”
              <cite>— Sneha, Data Analyst</cite>
            </blockquote>
            <blockquote>
              “Mentorship from IIT alumni was a game‑changer for my career.”
              <cite>— Karthik, IoT Engineer</cite>
            </blockquote>
          </div>
        </section>

        {/* Footer */}
        <footer className="lp-footer">
          <div>
            <h3>Contact Us</h3>
            <p>Email: support@lurnity.com</p>
            <p>Phone: +91 98765 43210</p>
            <p>Address: Tech Park, Hyderabad</p>
          </div>
          <p className="copy">© 2025 Lurnity. All rights reserved.</p>
        </footer>

        {/* Scroll Popup */}
        {this.state.showPopup && (
          <div className="demo-popup">
            <div className="popup-content">
              <span className="popup-close" onClick={this.closePopup}>×</span>
              <h4>Book a Free Demo Now!</h4>
              <p>Join Lurnity and get personalized learning with IIT mentors.</p>
              <button className="btn-red" onClick={this.bookDemo}>Book Now</button>
            </div>
          </div>
        )}

        {/* Demo Form Modal */}
        {this.state.showDemoForm && <DemoForm onClose={this.closeDemoForm} />}
      </div>
    );
  }
}