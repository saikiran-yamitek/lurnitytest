import React, { useState } from 'react';
import { FaPlay, FaCalendarCheck, FaComments, FaTimes } from 'react-icons/fa';
import './FloatingActionButton.css';

const FloatingActionButton = ({ onBookDemo, onChatBot }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleBookDemo = () => {
    onBookDemo();
    setIsOpen(false);
  };

  const handleChatBot = () => {
    onChatBot();
    setIsOpen(false);
  };

  return (
    <div className={`floating-action-container ${isOpen ? 'expanded' : ''}`}>
      {/* Options Menu */}
      {isOpen && (
        <div className="floating-options-menu">
          <div className="floating-option" onClick={handleBookDemo}>
            <div className="option-content">
              <span className="option-label">Book Demo</span>
              <div className="option-icon">
                <FaCalendarCheck />
              </div>
            </div>
          </div>
          
          <div className="floating-option" onClick={handleChatBot}>
            <div className="option-content">
              <span className="option-label">Chat with us</span>
              <div className="option-icon">
                <FaComments />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Toggle Button */}
      <button 
        className={`floating-main-btn ${isOpen ? 'open' : ''}`}
        onClick={handleToggle}
        aria-label={isOpen ? "Close options" : "Open options"}
      >
        <div className={`btn-icon ${isOpen ? 'rotated' : ''}`}>
          {isOpen ? <FaTimes /> : <FaPlay />}
        </div>
      </button>
    </div>
  );
};

export default FloatingActionButton;
