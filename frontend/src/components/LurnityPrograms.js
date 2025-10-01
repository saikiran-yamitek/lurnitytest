import React, { Component } from 'react';
import { 
  FaBrain, 
  FaMicrochip, 
  FaNetworkWired, 
  FaCloud, 
  FaVrCardboard, 
  FaRobot 
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './LurnityPrograms.css';
import aiimage from '../assets/6.png'
import embedimage from '../assets/2.png'
import iotimage from '../assets/3.png'
import cloudimage from '../assets/8.png'
import arvrimage from '../assets/1.png'
import roboticsimage from '../assets/4.png'

class LurnityPrograms extends Component {
  constructor(props) {
    super(props);
    
    this.coursesList = [
      { 
        id: 'ai', 
        title: 'AI & Machine Learning', 
        img: aiimage,
        icon: FaBrain,
        leftTitle: 'Secure all of your identities within an identity security fabric',
        leftPoints: [
          'Gain end-to-end visibility with proactive remediation.',
          'Simplify your governance and compliance requirements.'
        ],
        leftButton: 'Explore program'
      },
      { 
        id: 'embedded', 
        title: 'Embedded Systems', 
        img: embedimage,
        icon: FaMicrochip,
        leftTitle: 'Secure all of your identities within an identity security fabric',
        leftPoints: [
          'Gain end-to-end visibility with proactive remediation.',
          'Simplify your governance and compliance requirements.'
        ],
        leftButton: 'Explore program'
      },
      { 
        id: 'iot', 
        title: 'Internet of Things', 
        img: iotimage,
        icon: FaNetworkWired,
        leftTitle: 'Secure all of your identities within an identity security fabric',
        leftPoints: [
          'Gain end-to-end visibility with proactive remediation.',
          'Simplify your governance and compliance requirements.'
        ],
        leftButton: 'Explore program'
      },
      { 
        id: 'cloud', 
        title: 'Cloud Computing', 
        img: cloudimage,
        icon: FaCloud,
        leftTitle: 'Secure all of your identities within an identity security fabric',
        leftPoints: [
          'Gain end-to-end visibility with proactive remediation.',
          'Simplify your governance and compliance requirements.'
        ],
        leftButton: 'Explore program'
      },
      { 
        id: 'arvr', 
        title: 'AR/VR Development', 
        img: arvrimage,
        icon: FaVrCardboard,
        leftTitle: 'Secure all of your identities within an identity security fabric',
        leftPoints: [
          'Gain end-to-end visibility with proactive remediation.',
          'Simplify your governance and compliance requirements.'
        ],
        leftButton: 'Explore program'
      },
      { 
        id: 'robotics', 
        title: 'Robotics & Automation', 
        img: roboticsimage,
        icon: FaRobot,
        leftTitle: 'Secure all of your identities within an identity security fabric',
        leftPoints: [
          'Gain end-to-end visibility with proactive remediation.',
          'Simplify your governance and compliance requirements.'
        ],
        leftButton: 'Explore program'
      },
    ];
  }

  render() {
    return (
      <div className="lurnity-programs-three-column-wrapper">
        <div className="lurnity-three-courses-container">
          {this.coursesList.map((course, index) => {
            const IconComponent = course.icon;
            return (
              <React.Fragment key={course.id}>
                <div className="lurnity-single-course">
                  <div className="lurnity-course-header">
                    <div className="lurnity-course-logo">
                      <IconComponent />
                    </div>
                    <h2 className="lurnity-course-title">{course.title}</h2>
                  </div>
                  
                  <div className="lurnity-course-image-container">
                    <img src={course.img} alt={course.title} className="lurnity-course-image" />
                  </div>

                  <div className="lurnity-content-section">
                    <h3 className="lurnity-content-title">{course.leftTitle}</h3>
                    <ul className="lurnity-content-points">
                      {course.leftPoints.map((point, i) => (
                        <li key={i} className="lurnity-content-point">{point}</li>
                      ))}
                    </ul>
                    <button className="lurnity-action-button">{course.leftButton}</button>
                  </div>
                </div>
                {index < this.coursesList.length - 1 && (
                  <div className="lurnity-vertical-divider"></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }
}

export default LurnityPrograms;
