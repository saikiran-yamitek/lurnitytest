import React, { Component } from 'react';
import { FaArrowRight, FaPlay } from 'react-icons/fa';
import girlhero from '../assets/girlhero.jpg'
import './HeroSection.css';

export default class HeroSection extends Component {
  render() {
    const { onBookDemo } = this.props;

    return (
      <div className="hero-section-wrapper">
        <section className="luxury-hero-section" id="home">
          {/* Luxury Background Elements */}
          <div className="luxury-background">
            <div className="gradient-orb orb-1"></div>
            <div className="gradient-orb orb-2"></div>
            <div className="geometric-pattern"></div>
          </div>

          <div className="luxury-container">
            <div className="hero-layout">
              {/* Premium Content Section - LEFT END */}
              <div className="content-section">
                <h1 className="luxury-heading">
                  Learn Skills that will take you
                  <br />
                 places.
                </h1>

                <p className="luxury-subtitle">
                  Master cutting-edge technologies with world-class mentors. 
                  Transform your career with skills that matter.
                </p>

                <div className="cta-container">
                  <button className="btn-luxury-primary" onClick={onBookDemo}>
                    <span className="btn-text">Start Your Journey</span>
                    <div className="btn-arrow">
                      <FaArrowRight />
                    </div>
                  </button>
                  
                  <button className="btn-luxury-secondary" onClick={() => document.getElementById('programs')?.scrollIntoView({behavior:'smooth'})}>
                    <div className="play-circle">
                      <FaPlay />
                    </div>
                    <span>Watch Preview</span>
                  </button>
                </div>

                <div className="elite-partners">
                  <div className="partners-label">Trusted by industry leaders</div>
                  <div className="partners-grid">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png" 
                      alt="Google" 
                      className="partner-logo" 
                    />
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1200px-Amazon_logo.svg.png" 
                      alt="Amazon" 
                      className="partner-logo" 
                    />
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/1200px-Meta_Platforms_Inc._logo.svg.png" 
                      alt="Meta" 
                      className="partner-logo" 
                    />
                  </div>
                </div>
              </div>

              {/* Premium Visual Section - RIGHT END */}
              <div className="visual-section">
                <div className="image-showcase">
                  <div className="luxury-frame">
                    <img src={girlhero} alt="Professional learner" className="showcase-image" />
                    <div className="frame-glow"></div>
                  </div>

                  {/* Premium Floating Elements */}
                  <div className="floating-insights">
                    <div className="insight-card card-success">
                      <div className="card-header">
                        <div className="card-icon success">✓</div>
                        <div className="card-content">
                          <div className="card-title">Course Mastered</div>
                          <div className="card-meta">Advanced AI & ML</div>
                        </div>
                      </div>
                      <div className="progress-indicator">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{width: '100%'}}></div>
                        </div>
                      </div>
                    </div>

                    <div className="insight-card card-learning">
                      <div className="card-header">
                        <div className="card-icon learning">📚</div>
                        <div className="card-content">
                          <div className="card-title">Active Learning</div>
                          <div className="card-meta">React Mastery</div>
                        </div>
                      </div>
                      <div className="learning-stats">
                        <span className="stat">12h completed</span>
                      </div>
                    </div>

                    <div className="insight-card card-achievement">
                      <div className="card-header">
                        <div className="card-icon achievement">🏆</div>
                        <div className="card-content">
                          <div className="card-title">Achievement</div>
                          <div className="card-meta">Top 5% Performer</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}
