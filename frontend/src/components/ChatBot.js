// src/components/ChatBot.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  FaTimes,
  FaPaperPlane,
  FaRobot,
  FaCheckCircle,
  FaSpinner,
  FaChevronDown,
  FaUser,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { State, City } from 'country-state-city';
import './ChatBot.css';

const API = process.env.REACT_APP_API_URL;

const ChatBot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    education: '',
    currentEducation: '',
    state: '',
    city: '',
    college: ''
  });

  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const messagesEndRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Load all Indian states once
  useEffect(() => {
    const indianStates = State.getStatesOfCountry('IN') || [];
    setStates(indianStates);
  }, []);

  // Load cities when a state is selected
  useEffect(() => {
    if (formData.state) {
      const selectedState = states.find(s => s.name === formData.state);
      if (selectedState) {
        const stateCities = City.getCitiesOfState('IN', selectedState.isoCode) || [];
        setCities(stateCities);
      } else {
        setCities([]);
      }
    } else {
      setCities([]);
    }
  }, [formData.state, states]);

  const chatSteps = [
    { message: "👋 Hi! I'm your Lurnity assistant. Let's book your demo session!", delay: 600 },
    { message: "What's your full name?", field: 'name', delay: 800 },
    { message: "Great to meet you! What's your email address?", field: 'email', validation: 'email', delay: 700 },
    { message: "Perfect! What's your 10-digit phone number?", field: 'phone', validation: 'phone', delay: 600 },
    { message: "What's your education level?", field: 'education', options: ['High School', 'Diploma', "Bachelor's Degree", "Master's Degree", 'PhD', 'Other'], delay: 600 },
    { message: "What's your field of study (e.g., Computer Science)?", field: 'currentEducation', delay: 600 },
    { message: "Which state are you from?", field: 'state', type: 'dropdown', options: 'states', delay: 600 },
    { message: "Which city?", field: 'city', type: 'dropdown', options: 'cities', delay: 600 },
    { message: "What's your college/university?", field: 'college', delay: 600 },
    { message: "🚀 Booking your demo session...", delay: 800, action: 'submit' },
    { message: "🎉 Success! We'll contact you within 24 hours!", delay: 1000, final: true }
  ];

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages, isTyping, isSubmitting]);

  const formatMsg = (msg) =>
    msg.replaceAll('{{name}}', formData.name || '').replaceAll('{{state}}', formData.state || '');

  const addBotMessage = (message, delay = 0) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + Math.random(),
        text: formatMsg(message),
        sender: 'bot',
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, delay);
  };

  const addUserMessage = (message) => {
    setMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    }]);
  };

  useEffect(() => {
    if (isOpen) {
      if (messages.length === 0) {
        addBotMessage(chatSteps[0].message, chatSteps[0].delay);
        setTimeout(() => {
          addBotMessage(chatSteps[1].message, chatSteps[1].delay || 0);
          setCurrentStep(1);
          setTimeout(() => inputRef.current?.focus(), 200);
        }, (chatSteps[0].delay || 0) + 450);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const validateInput = (value, type) => {
    if (!value) return false;
    switch (type) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
      case 'phone':
        return /^\d{10}$/.test(value.trim());
      default:
        return value.trim().length > 0;
    }
  };

  const updateFormField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getOptionsForStep = () => {
    const step = chatSteps[currentStep];
    if (!step) return [];
    if (step.options === 'states') return states.map(s => s.name);
    if (step.options === 'cities') return cities.map(c => c.name);
    if (step.options) return step.options;
    return [];
  };

  const moveToNextStep = (fromStep) => {
    const next = fromStep + 1;
    if (next >= chatSteps.length) return;

    const nextStepObj = chatSteps[next];
    addBotMessage(nextStepObj.message, nextStepObj.delay || 0);
    setCurrentStep(next);

    if (nextStepObj.action === 'submit') {
      setTimeout(() => {
        submitForm();
      }, (nextStepObj.delay || 0) + 600);
    } else {
      setTimeout(() => {
        if (nextStepObj.type === 'dropdown') {
          setSelectedValue('');
        } else {
          inputRef.current?.focus();
        }
      }, 300);
    }
  };

  const handleDropdownSelect = (option) => {
    addUserMessage(option);
    const step = chatSteps[currentStep];
    
    if (step?.field) {
      updateFormField(step.field, option);
      if (step.field === 'state') {
        updateFormField('city', '');
      }
    }

    setSelectedValue(option);
    setIsDropdownOpen(false);
    moveToNextStep(currentStep);
  };

  const handleUserSubmit = (explicitValue = null) => {
    const value = (explicitValue ?? userInput).trim();
    if (!value) return;

    const step = chatSteps[currentStep];
    if (!step) return;

    if (step.validation && !validateInput(value, step.validation)) {
      const err = step.validation === 'email'
        ? 'Please enter a valid email address (e.g., name@example.com)'
        : 'Please enter a valid 10-digit phone number';
      addBotMessage(err, 400);
      setUserInput('');
      return;
    }

    addUserMessage(value);
    if (step.field) {
      updateFormField(step.field, value);
    }

    setUserInput('');
    
    if (step.action === 'submit') {
      submitForm();
      return;
    }

    moveToNextStep(currentStep);
  };

  const handleQuickReply = (option) => {
    handleDropdownSelect(option);
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        name: (formData.name || '').trim(),
        email: (formData.email || '').trim(),
        phone: (formData.phone || '').trim(),
        education: formData.education,
        currentEducation: formData.currentEducation,
        state: formData.state,
        city: formData.city,
        college: formData.college
      };

      const res = await fetch(`${API}/api/demos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to book demo');

      addBotMessage(chatSteps[chatSteps.length - 1].message, 800);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        onClose?.();
      }, 3500);
    } catch (err) {
      addBotMessage(`Sorry, there was an error booking your demo: ${err.message}. Please try again.`, 700);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserSubmit();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isDropdownOpen]);

  if (!isOpen) return null;

  const step = chatSteps[currentStep];
  const progressPct = Math.min((Math.max(currentStep, 1) / (chatSteps.length - 2)) * 100, 100);
  const isDropdownStep = step?.type === 'dropdown';

  return (
    <div className="modern-chatbot-overlay">
      <div className="modern-chatbot">
        {/* Header */}
        <div className="chatbot-header-modern">
          <div className="header-content">
            <div className="bot-avatar-modern"><FaRobot /></div>
            <div className="header-text">
              <h3>Lurnity Assistant</h3>
              <span className="status-text">{isSubmitting ? 'Processing...' : 'Online'}</span>
            </div>
          </div>
          <button className="close-btn-modern" onClick={onClose}><FaTimes /></button>
        </div>

        {/* Messages */}
        <div className="messages-area-modern">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-modern ${msg.sender === 'bot' ? 'bot' : 'user'}`}>
              <div className="message-avatar-modern">
                {msg.sender === 'bot' ? <FaRobot /> : <FaUser />}
              </div>
              <div className="message-bubble-modern">
                <div className="message-text">{msg.text}</div>
                <div className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message-modern bot typing">
              <div className="message-avatar-modern"><FaRobot /></div>
              <div className="message-bubble-modern">
                <div className="typing-animation"><span></span><span></span><span></span></div>
              </div>
            </div>
          )}

          {isSubmitting && (
            <div className="message-modern bot processing">
              <div className="message-avatar-modern"><FaSpinner className="spinner" /></div>
              <div className="message-bubble-modern processing">
                <FaSpinner className="spinner" /> Processing your request...
              </div>
            </div>
          )}

          {showSuccess && (
            <div className="success-message-modern">
              <FaCheckCircle /> <span>Demo booked successfully! 🎉</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="input-area-modern">
          {/* Quick replies for fixed options */}
          {step?.options && !isDropdownStep && (
            <div className="quick-replies">
              {step.options.map((opt, i) => (
                <button key={i} className="quick-reply-btn" onClick={() => handleQuickReply(opt)}>
                  {opt}
                </button>
              ))}
            </div>
          )}

          <div className="input-container-modern" ref={dropdownRef}>
            {isDropdownStep ? (
              /* Custom Dropdown for States/Cities */
              <div className="dropdown-wrapper">
                <div
                  className={`dropdown-selector ${isDropdownOpen ? 'open' : ''}`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className="dropdown-text">
                    {selectedValue || `Select ${step.field === 'state' ? 'State' : 'City'}...`}
                  </span>
                  <FaChevronDown className={`dropdown-icon ${isDropdownOpen ? 'rotate' : ''}`} />
                </div>
                
                {isDropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-menu-header">
                      <span className="dropdown-menu-title">
                        Select {step.field === 'state' ? 'State' : 'City'}
                      </span>
                      <span className="dropdown-count">
                        {getOptionsForStep().length} options
                      </span>
                    </div>
                    <div className="dropdown-menu-list">
                      {getOptionsForStep().map((option, idx) => (
                        <div
                          key={idx}
                          className="dropdown-menu-item"
                          onClick={() => handleDropdownSelect(option)}
                        >
                          <FaMapMarkerAlt className="dropdown-item-icon" />
                          <span className="dropdown-item-text">{option}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Regular Input Field */
              <div className="input-field-wrapper">
                <input
                  ref={inputRef}
                  type={step?.validation === 'email' ? 'email' : 'text'}
                  value={userInput}
                  onChange={(e) => {
  setUserInput(e.target.value);
  if (step?.field) {
    setFormData(prev => ({ ...prev, [step.field]: e.target.value }));
  }
}}

                  onKeyDown={handleKeyDown}
                  placeholder="Type your answer..."
                  disabled={isTyping || isSubmitting}
                  className="modern-input"
                />
                <button
                  className="send-btn-modern"
                  onClick={() => handleUserSubmit()}
                  disabled={!userInput.trim() || isTyping || isSubmitting}
                >
                  <FaPaperPlane />
                </button>
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="progress-container">
            <div className="progress-bar-modern">
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="progress-text">Step {Math.min(currentStep, chatSteps.length - 2)} of {chatSteps.length - 2}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
