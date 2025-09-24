import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaPaperPlane, FaTimes, FaRobot, FaUser, FaSun, FaMoon, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress, FaMicrophone, FaStop, FaCheckCircle, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Country, State, City } from 'country-state-city';
import './NewChatBot.css';

const API = process.env.REACT_APP_API_URL;

const NewChatBot = ({ isOpen, onClose }) => {
  // AI Chat Mode States
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: '👋 Hi there! I\'m your intelligent AI assistant powered by Google Gemini. I\'m here to help you learn about Lurnity\'s programs, career opportunities, and answer any questions you might have. What would you like to know?',
      timestamp: new Date(),
      id: Date.now()
    }
  ]);
  
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [userScrolled, setUserScrolled] = useState(false);

  // Demo Form Mode States
  const [isFormMode, setIsFormMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [userInput, setUserInput] = useState('');
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

  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const genAI = useRef(null);
  const model = useRef(null);
  const recognition = useRef(null);
  const messagesEndRef = useRef(null);

  // Demo Form Chat Steps
  const chatSteps = [
    {
      message: "Great! Let's get you registered for an exclusive demo session! 🎓 I'll need a few details from you.",
      delay: 1000
    },
    {
      message: "First, what's your full name?",
      field: 'name',
      delay: 1500
    },
    {
      message: "Nice to meet you, {{name}}! 😊 What's your email address so we can send you the demo details?",
      field: 'email',
      delay: 1000,
      validation: 'email'
    },
    {
      message: "Perfect! What's your 10-digit phone number?",
      field: 'phone',
      delay: 1000,
      validation: 'phone'
    },
    {
      message: "Great! What's your current education level?",
      field: 'education',
      options: ['High School', 'Diploma', "Bachelor's Degree", "Master's Degree", 'PhD', 'Other'],
      delay: 1000
    },
    {
      message: "Excellent! What's your current field of study? (e.g., Computer Science, Engineering)",
      field: 'currentEducation',
      delay: 1000
    },
    {
      message: "Which state are you from in India?",
      field: 'state',
      dynamicOptions: 'states',
      delay: 1000
    },
    {
      message: "And which city in {{state}}?",
      field: 'city',
      dynamicOptions: 'cities',
      delay: 1000
    },
    {
      message: "Finally, what's the name of your college or university?",
      field: 'college',
      delay: 1000
    },
    {
      message: "Perfect! 🚀 Let me book your exclusive demo session now...",
      delay: 1500,
      action: 'submit'
    },
    {
      message: "🎉 Congratulations {{name}}! Your demo has been successfully booked. Our premium career advisor will contact you within 24 hours!",
      delay: 2000,
      final: true
    }
  ];

  // Load states and cities
  useEffect(() => {
    const indianStates = State.getStatesOfCountry("IN");
    setStates(indianStates);
  }, []);

  useEffect(() => {
    if (formData.state && states.length > 0) {
      const selectedState = states.find((s) => s.name === formData.state);
      if (selectedState) {
        const stateCities = City.getCitiesOfState("IN", selectedState.isoCode);
        setCities(stateCities);
      }
    } else {
      setCities([]);
    }
  }, [formData.state, states]);

  // Initialize Gemini AI
  useEffect(() => {
    const initializeGemini = async () => {
      try {
        const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
        if (!API_KEY) {
          console.error('Gemini API key not found. Please add REACT_APP_GEMINI_API_KEY to your .env file');
          return;
        }

        genAI.current = new GoogleGenerativeAI(API_KEY);
        model.current = genAI.current.getGenerativeModel({
          model: "gemini-pro",
          generationConfig: {
            temperature: 0.8,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 1024,
          },
        });

        console.log('✅ Gemini AI initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize Gemini AI:', error);
      }
    };

    initializeGemini();
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (isFormMode) {
          setUserInput(transcript);
        } else {
          setCurrentMessage(transcript);
        }
        setIsListening(false);
      };

      recognition.current.onerror = () => setIsListening(false);
      recognition.current.onend = () => setIsListening(false);
    }
  }, [isFormMode]);

  // Auto-scroll management
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current && !userScrolled) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
    if (messagesEndRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [userScrolled]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    
    const container = messagesContainerRef.current;
    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
    setUserScrolled(!isAtBottom);
  }, []);

  // Focus input when chatbot opens
  useEffect(() => {
    if (isOpen && inputRef.current && !isMinimized) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [isOpen, isMinimized, isFormMode]);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (!isSoundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.1);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Audio not supported');
    }
  }, [isSoundEnabled]);

  // Company context for intelligent responses (without pricing details)
  const getCompanyContext = () => {
    return `
You are an intelligent AI assistant for Lurnity Technologies, a premium technology education platform. You should provide helpful, accurate, and engaging responses about our company and programs, but NEVER reveal specific pricing details.

ABOUT LURNITY:
- Premium tech education platform focused on career transformation
- Founded to bridge the gap between industry needs and talent
- Located in Hyderabad, Telangana, India
- Mission: Transform careers through world-class tech education

OUR PROGRAMS (NO PRICING DETAILS):
• AI & Machine Learning (6-8 months)
  - Deep learning, neural networks, computer vision, NLP
  - Hands-on projects with real datasets
  - Industry mentorship from ex-FAANG engineers

• Full Stack Development (6 months)
  - React, Node.js, databases, cloud deployment
  - Build 5+ production-ready projects
  - Modern development practices

• Embedded Systems (7 months)
  - IoT devices, microcontrollers, hardware integration
  - Arduino, Raspberry Pi, sensor programming
  - Hardware kits provided

• Data Science (6 months)
  - Analytics, visualization, machine learning
  - Python, R, SQL, Tableau, Power BI
  - Business case studies

• DevOps & Cloud (5 months)
  - AWS, Docker, Kubernetes, CI/CD pipelines
  - Infrastructure as code
  - Cloud architecture

OUTSTANDING RESULTS:
- 15,847+ successful career transformations
- 97.2% placement rate within 4 months
- ₹28.5L highest package (Google placement)
- ₹8-15 LPA average salary range
- 500+ hiring partners (FAANG, unicorns, Fortune 500)
- 4.94★ rating from 12,000+ verified graduates
- 340% average salary increase within 2 years

UNIQUE FEATURES:
- Live classes with industry veterans (Ex-Google, Microsoft, Amazon)
- 1-on-1 weekly mentorship sessions
- 24/7 doubt resolution support
- Hardware kits for relevant programs
- Career coaching and interview preparation
- Direct company referrals and placement support

ADMISSION PROCESS:
1. Book a demo session to learn more
2. Speak with our career counselors
3. Get personalized program recommendations
4. Complete the enrollment process

IMPORTANT GUIDELINES:
- NEVER mention specific program fees or pricing
- When asked about costs, fees, or pricing, always guide them to book a demo or speak with counselors
- If they want to join, register, enroll, or get pricing details, switch them to the demo booking flow
- Be encouraging about career transformation opportunities
- Highlight our success stories and unique features

CONTACT INFORMATION:
- Email: admissions@lurnity.com
- Phone: +91 98765 43210
- Hours: Monday-Saturday, 9 AM - 8 PM IST

RESPOND AS:
- A knowledgeable, friendly, and enthusiastic education consultant
- Use conversational tone with appropriate emojis
- Provide specific, accurate information (except pricing)
- Ask follow-up questions to better assist students
- Always guide toward demo booking for detailed discussions
- Be encouraging and supportive of career change goals

If the user expresses interest in joining, enrolling, getting pricing details, or wants to register, immediately switch to demo booking mode by responding with the trigger phrase.
`;
  };

  // Detect if user wants to join/register
  const checkForJoinIntent = (message) => {
    const joinKeywords = [
      'join', 'enroll', 'register', 'signup', 'sign up', 'admission',
      'apply', 'fee', 'fees', 'cost', 'price', 'pricing', 'payment',
      'how much', 'demo', 'trial', 'book', 'interested', 'want to join',
      'get started', 'start course', 'begin program'
    ];

    const lowerMessage = message.toLowerCase();
    return joinKeywords.some(keyword => lowerMessage.includes(keyword));
  };

  // Get intelligent response from Gemini
  const getGeminiResponse = async (userMessage) => {
    if (!model.current) {
      throw new Error('Gemini AI not initialized. Please refresh and try again.');
    }

    try {
      // Check if user wants to join first
      if (checkForJoinIntent(userMessage)) {
        // Switch to form mode
        setTimeout(() => {
          switchToFormMode();
        }, 1000);
        
        return "That's fantastic! I'd love to help you get started with Lurnity. Let me connect you with our demo booking system to get you all the details including program information, pricing, and next steps. One moment please... 🚀";
      }

      // Prepare conversation context
      const contextMessages = conversationHistory.slice(-6).map(msg => 
        `${msg.role}: ${msg.content}`
      ).join('\n');

      const fullPrompt = `
${getCompanyContext()}

CONVERSATION HISTORY:
${contextMessages}

CURRENT USER MESSAGE: ${userMessage}

Please provide a helpful, informative, and engaging response as Lurnity's AI assistant. Remember to NEVER mention specific pricing details. If asked about costs or fees, guide them to book a demo session instead.
`;

      const result = await model.current.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  };

  // Switch to form mode
  const switchToFormMode = () => {
  setIsFormMode(true);
  setMessages([]);
  setCurrentStep(0);

  // Start the demo form flow
  setTimeout(() => {
    addBotMessage(chatSteps[0].message, chatSteps[0].delay);
    // ✅ Do NOT increment currentStep here
  }, 500);
};


  // Switch back to AI mode
  const switchToAIMode = () => {
    setIsFormMode(false);
    setMessages([
      {
        type: 'bot',
        text: '👋 Welcome back! I\'m here to help you with any questions about Lurnity. What would you like to know?',
        timestamp: new Date(),
        id: Date.now()
      }
    ]);
    setConversationHistory([]);
    
    // Reset form data
    setCurrentStep(0);
    setFormData({
      name: '',
      email: '',
      phone: '',
      education: '',
      currentEducation: '',
      state: '',
      city: '',
      college: ''
    });
    setUserInput('');
    setShowSuccess(false);
    setIsSubmitting(false);
    setIsTyping(false);
  };

  // AI Chat Functions
  const handleInputChange = (e) => {
    if (isFormMode) {
      setUserInput(e.target.value);
    } else {
      setCurrentMessage(e.target.value);
      
      // Auto-resize textarea
      const textarea = e.target;
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isFormMode) {
        handleUserSubmit();
      } else {
        sendMessage();
      }
    }
  };

  const sendMessage = async () => {
    const message = currentMessage.trim();
    if (!message || isLoading) return;

    const userMessage = {
      type: 'user',
      text: message,
      timestamp: new Date(),
      id: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setConversationHistory(prev => [...prev, { role: 'user', content: message }]);
    setCurrentMessage('');
    setIsLoading(true);
    setUserScrolled(false);

    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    try {
      const aiResponse = await getGeminiResponse(message);
      
      const botMessage = {
        type: 'bot',
        text: aiResponse,
        timestamp: new Date(),
        id: Date.now() + 1
      };

      setMessages(prev => [...prev, botMessage]);
      setConversationHistory(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      playNotificationSound();
    } catch (error) {
      const errorMessage = {
        type: 'bot',
        text: '⚠️ I apologize, but I\'m experiencing some technical difficulties right now. Please try again in a moment, or feel free to contact our admissions team directly:\n\n📧 **Email:** admissions@lurnity.com\n📞 **Phone:** +91 98765 43210\n🕒 **Hours:** Mon-Sat, 9 AM - 8 PM',
        timestamp: new Date(),
        id: Date.now() + 1
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Demo Form Functions
  const addBotMessage = (message, delay = 0) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'bot',
        text: message.replace('{{name}}', formData.name).replace('{{state}}', formData.state),
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, delay);
  };

  const addUserMessage = (message) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      text: message,
      timestamp: new Date()
    }]);
  };

  const validateInput = (value, type) => {
    switch (type) {
      case 'email':
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(value);
      case 'phone':
        const phonePattern = /^\d{10}$/;
        return phonePattern.test(value);
      default:
        return true;
    }
  };

  const handleUserSubmit = async () => {
    if (!userInput.trim()) return;

    const currentStepData = chatSteps[currentStep];
    if (!currentStepData) return;

    // Validation
    if (currentStepData.validation) {
      if (!validateInput(userInput, currentStepData.validation)) {
        let errorMessage = '';
        if (currentStepData.validation === 'email') {
          errorMessage = "Please enter a valid email address (e.g., name@example.com)";
        } else if (currentStepData.validation === 'phone') {
          errorMessage = "Please enter exactly 10 digits for your phone number";
        }
        
        addBotMessage(errorMessage, 500);
        setUserInput('');
        return;
      }
    }

    addUserMessage(userInput);

    // Update form data
    if (currentStepData.field) {
      setFormData(prev => ({
        ...prev,
        [currentStepData.field]: userInput
      }));
    }

    setUserInput('');

    // Handle submission step
    if (currentStepData.action === 'submit') {
      await submitForm();
      return;
    }

    // Move to next step
    
    const nextStep = currentStep + 1;
if (nextStep < chatSteps.length) {
  setTimeout(() => {
    addBotMessage(chatSteps[nextStep].message, chatSteps[nextStep].delay);
    setCurrentStep(nextStep); // ✅ Correct
  }, 800);
}

  };

  const handleOptionClick = (option) => {
    setUserInput(option);
    setTimeout(handleUserSubmit, 100);
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API}/api/demos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to book demo');
      }

      setTimeout(() => {
        addBotMessage(chatSteps[chatSteps.length - 1].message, 1000);
        setShowSuccess(true);
        setTimeout(() => {
          onClose();
        }, 4000);
      }, 1000);

    } catch (error) {
      addBotMessage(`Sorry, there was an error booking your demo: ${error.message}. Please try again or contact support.`, 1000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentOptions = () => {
    const currentStepData = chatSteps[currentStep];
    
    if (currentStepData?.options) {
      return currentStepData.options;
    }
    
    if (currentStepData?.dynamicOptions === 'states') {
      return states.map(state => state.name).slice(0, 10);
    }
    
    if (currentStepData?.dynamicOptions === 'cities') {
      return cities.map(city => city.name).slice(0, 8);
    }
    
    return null;
  };

  // Handle quick actions
  const handleQuickAction = (action) => {
    if (isFormMode) return;
    
    const quickMessages = {
      programs: "Tell me about your programs and courses in detail",
      placements: "How good is your placement support and success rate?",
      why: "Why should I choose Lurnity over other platforms?",
      apply: "I want to join Lurnity and get started"
    };

    setCurrentMessage(quickMessages[action]);
    setTimeout(() => sendMessage(), 100);
  };

  // Voice recognition
  const toggleVoiceRecognition = () => {
    if (!recognition.current) return;

    if (isListening) {
      recognition.current.stop();
      setIsListening(false);
    } else {
      recognition.current.start();
      setIsListening(true);
    }
  };

  // Format message text
  const formatMessage = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <strong key={i} className="highlight">{line.slice(2, -2)}</strong>;
      }
      if (line.startsWith('• ') || line.startsWith('✅ ') || line.startsWith('📊 ') || line.startsWith('🎯 ')) {
        return <div key={i} className="list-item">{line}</div>;
      }
      if (line.trim() === '') {
        return <br key={i} />;
      }
      return <div key={i}>{line}</div>;
    });
  };

  // Toggle controls
  const toggleMinimize = () => setIsMinimized(!isMinimized);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const toggleSound = () => setIsSoundEnabled(!isSoundEnabled);
  const toggleExpand = () => setIsExpanded(!isExpanded);

  if (!isOpen) return null;

  return (
    <div className={`lurnity-chatbot-overlay ${isDarkMode ? 'dark-mode' : ''} ${isExpanded ? 'expanded' : ''}`}>
      <div className={`lurnity-chatbot-container ${isMinimized ? 'minimized' : ''} ${isFormMode ? 'form-mode' : ''}`}>
        {/* Enhanced Header */}
        <div className="chatbot-header">
          <div className="header-left">
            <div className="bot-avatar-wrapper">
              <div className="bot-avatar">
                <FaRobot />
                <div className="ai-pulse"></div>
              </div>
              <div className="bot-status">
                <h4>{isFormMode ? 'Demo Registration' : 'Lurnity AI Assistant'}</h4>
                <span className="status-indicator">
                  <div className="status-dot"></div>
                  {isFormMode ? 'Registration Mode' : 'Powered by Gemini'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="header-controls">
            {isFormMode && (
              <button 
                className="control-btn back-btn" 
                onClick={switchToAIMode}
                title="Back to AI Chat"
              >
                <FaArrowLeft />
              </button>
            )}
            <button 
              className="control-btn" 
              onClick={toggleSound}
              title={isSoundEnabled ? 'Mute sounds' : 'Enable sounds'}
            >
              {isSoundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
            </button>
            <button 
              className="control-btn" 
              onClick={toggleDarkMode}
              title={isDarkMode ? 'Light mode' : 'Dark mode'}
            >
              {isDarkMode ? <FaSun /> : <FaMoon />}
            </button>
            {!isFormMode && (
              <button 
                className="control-btn" 
                onClick={toggleExpand}
                title={isExpanded ? 'Normal size' : 'Expand'}
              >
                {isExpanded ? <FaCompress /> : <FaExpand />}
              </button>
            )}
            <button 
              className="control-btn" 
              onClick={toggleMinimize}
              title={isMinimized ? 'Maximize' : 'Minimize'}
            >
              {isMinimized ? '□' : '_'}
            </button>
            <button 
              className="control-btn close-btn" 
              onClick={onClose}
              title="Close chat"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages Container */}
            <div 
              className="messages-container"
              ref={messagesContainerRef}
              onScroll={!isFormMode ? handleScroll : undefined}
            >
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.type}`}>
                  <div className="message-avatar">
                    {message.type === 'bot' ? (
                      <div className="avatar bot-avatar-small">
                        <FaRobot />
                      </div>
                    ) : (
                      <div className="avatar user-avatar-small">
                        <FaUser />
                      </div>
                    )}
                  </div>
                  <div className="message-bubble">
                    <div className="message-content">
                      {formatMessage(message.text)}
                    </div>
                    <div className="message-time">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {/* AI Mode Loading */}
              {!isFormMode && isLoading && (
                <div className="message bot">
                  <div className="message-avatar">
                    <div className="avatar bot-avatar-small">
                      <FaRobot />
                    </div>
                  </div>
                  <div className="message-bubble">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <div className="ai-thinking">AI is thinking...</div>
                  </div>
                </div>
              )}

              {/* Form Mode Typing */}
              {isFormMode && isTyping && (
                <div className="message bot">
                  <div className="message-avatar">
                    <div className="avatar bot-avatar-small">
                      <FaRobot />
                    </div>
                  </div>
                  <div className="message-bubble">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submitting Indicator */}
              {isFormMode && isSubmitting && (
                <div className="message bot">
                  <div className="message-avatar">
                    <div className="avatar bot-avatar-small">
                      <FaSpinner className="spinning" />
                    </div>
                  </div>
                  <div className="message-bubble submitting-indicator">
                    <FaSpinner className="spinning" />
                    Booking your exclusive demo session...
                  </div>
                </div>
              )}

              {/* Success Indicator */}
              {isFormMode && showSuccess && (
                <div className="success-celebration">
                  <div className="success-icon">
                    <FaCheckCircle />
                  </div>
                  <div className="success-text">Demo Booked Successfully! 🎉</div>
                </div>
              )}

              {/* Scroll to bottom button */}
              {!isFormMode && userScrolled && (
                <button 
                  className="scroll-bottom-btn"
                  onClick={() => {
                    setUserScrolled(false);
                    scrollToBottom();
                  }}
                >
                  ↓ New messages
                </button>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* AI Mode Quick Actions */}
            {!isFormMode && (
              <div className="quick-actions-container">
                <div className="quick-actions">
                  <button 
                    className="quick-action-btn"
                    onClick={() => handleQuickAction('programs')}
                  >
                    🎓 Programs
                  </button>
                  <button 
                    className="quick-action-btn"
                    onClick={() => handleQuickAction('placements')}
                  >
                    🚀 Placements
                  </button>
                  <button 
                    className="quick-action-btn"
                    onClick={() => handleQuickAction('why')}
                  >
                    ❓ Why Lurnity
                  </button>
                  <button 
                    className="quick-action-btn demo-btn"
                    onClick={() => handleQuickAction('apply')}
                  >
                    📝 Join Now
                  </button>
                </div>
              </div>
            )}

            {/* Form Mode Options */}
            {isFormMode && getCurrentOptions() && (
              <div className="form-options-container">
                <div className="form-options">
                  {getCurrentOptions().map((option, index) => (
                    <button
                      key={index}
                      className="option-button"
                      onClick={() => handleOptionClick(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {(chatSteps[currentStep]?.dynamicOptions || chatSteps[currentStep]?.field === 'state' || chatSteps[currentStep]?.field === 'city') && (
                  <div className="form-input-section">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Or type your answer here..."
                      disabled={isTyping || isSubmitting}
                    />
                    <button
                      className="send-button"
                      onClick={handleUserSubmit}
                      disabled={!userInput.trim() || isTyping || isSubmitting}
                    >
                      <FaPaperPlane />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Input Area */}
            <div className="input-area">
              <div className="input-container">
                <div className="input-wrapper">
                  {!isFormMode || !getCurrentOptions() ? (
                    <>
                      <textarea
                        ref={inputRef}
                        value={isFormMode ? userInput : currentMessage}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder={isFormMode ? "Type your answer here..." : "Ask me anything about Lurnity programs, careers, or admissions..."}
                        disabled={isLoading || (isFormMode && (isTyping || isSubmitting || currentStep >= chatSteps.length))}
                        rows={1}
                        maxLength={isFormMode ? 200 : 1000}
                      />
                      
                      {!isFormMode && recognition.current && (
                        <button 
                          className={`voice-btn ${isListening ? 'listening' : ''}`}
                          onClick={toggleVoiceRecognition}
                          title={isListening ? 'Stop listening' : 'Voice input'}
                        >
                          {isListening ? <FaStop /> : <FaMicrophone />}
                        </button>
                      )}
                      
                      <button 
                        className={`send-btn ${(isFormMode ? userInput.trim() : currentMessage.trim()) ? 'active' : ''}`}
                        onClick={isFormMode ? handleUserSubmit : sendMessage}
                        disabled={(isFormMode ? !userInput.trim() : !currentMessage.trim()) || isLoading || (isFormMode && (isTyping || isSubmitting))}
                        title="Send message (Enter)"
                      >
                        <FaPaperPlane />
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
              
              <div className="input-footer">
                <span className="char-counter">
                  {isFormMode ? `${userInput.length}/200` : `${currentMessage.length}/1000`}
                </span>
                <span className="powered-by">
                  {isFormMode ? 'Interactive Demo Booking' : 'Powered by Google Gemini AI'}
                </span>
              </div>
            </div>

            {/* Form Progress */}
            {isFormMode && (
              <div className="form-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(currentStep / chatSteps.length) * 100}%` }}
                  />
                </div>
                <div className="progress-text">
                  Step {Math.min(currentStep, chatSteps.length - 2)} of {chatSteps.length - 2}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NewChatBot;
