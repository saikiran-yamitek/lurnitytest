import React, { Component } from 'react';
import { FaArrowRight, FaPlay } from 'react-icons/fa';
import LURNITY_LANDING_PAGE_BG from '../assets/againppp.png'; // Your 1920x1200 image
import './HeroSection.css';

export default class HeroSection extends Component {
  render() {
    const { onBookDemo } = this.props;

    return (
      <div className="hero-section-wrapper">
        <section className="luxury-hero-section" id="home">
          {/* Background Image - No Overlay */}
          <div className="hero-background">
            <img 
              src={LURNITY_LANDING_PAGE_BG} 
              alt="Lurnity Background" 
              className="background-image"
              loading="eager"
              decoding="async"
            />
          </div>

          <div className="luxury-container">
            <div className="hero-layout">
              {/* Content Section - Direct on Image (Left Side) */}
              <div className="content-section">
                <h1 className="luxury-heading">
                  Unlock Your Potential with lurnity
                </h1>

                <p className="luxury-subtitle">
                  Streamlined courses for every student and branch.
                  Simplified learning that adapts to your schedule
                </p>

                <div className="cta-container">
                  <button className="btn-luxury-primary" onClick={onBookDemo}>
                    <span className="btn-text">Start Your Journey</span>
                    <div className="btn-arrow">
                      <FaArrowRight />
                    </div>
                  </button>
                  
                  <button 
                    className="btn-luxury-secondary" 
                    onClick={() => document.getElementById('programs')?.scrollIntoView({behavior:'smooth'})}
                  >
                    <div className="play-circle">
                      <FaPlay />
                    </div>
                    <span>Watch Preview</span>
                  </button>
                </div>

                
              </div>

            

            </div>
          </div>
        </section>
      </div>
    );
  }
}
