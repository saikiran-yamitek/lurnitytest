import React, { useEffect, useState, useRef } from "react";
import { useParams, useHistory, Link } from "react-router-dom";
import "./PracticePage.css";

import logo from "../assets/LURNITY.jpg";
import { 
  FiPlayCircle, 
  FiChevronLeft, 
  FiCode, 
  FiHome,
  FiUser,
  FiClock,
  FiCheckCircle,
  FiAward,
  FiTarget,
  FiRefreshCw,
  FiEye,
  FiMaximize,
  FiShield,
  FiX,
  FiStar,
  FiTrendingUp,
  FiActivity,
  FiLock,
  FiAlertTriangle,
  FiBookmark,
  FiChevronRight
} from "react-icons/fi";
import { TbLayoutSidebarLeftCollapse, TbLayoutSidebarLeftExpand } from "react-icons/tb";

const API = process.env.REACT_APP_API_URL;

export default function PracticePage() {
  const { courseId, subIdx, vidIdx } = useParams();
  const sIdx = Number(subIdx), vIdx = Number(vidIdx);
  const history = useHistory();

  const [course, setCourse] = useState(null);
  const [err, setErr] = useState(null);
  const [showList, setShow] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showAnswers, setShowAnswers] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [violations, setViolations] = useState([]);
  const [secureMode, setSecureMode] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  
  const practiceRef = useRef(null);
  const saveQuestionBtnRef = useRef(null);
  const violationCountRef = useRef(0);

  // All your existing useEffect hooks remain the same
  useEffect(() => {
    // Fetch course data
    fetch(`${API}/api/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(r => r.json())
      .then(setCourse)
      .catch(e => setErr(e.message));

    // Fetch user data
    fetch(`${API}/api/user/homepage`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(r => r.json())
      .then(setUser)
      .catch(e => console.error("Error fetching user:", e));
  }, [courseId]);

  useEffect(() => {
  const userId = JSON.parse(localStorage.getItem("userId"));
  const token = localStorage.getItem("token");

  fetch(`${API}/api/user/${userId}/practiceHistory`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ courseId, subIdx: sIdx, vidIdx: vIdx })
  })
    .then(r => r.json())
    .then(setAttempts)
    .catch(e => console.error("Failed to fetch attempts:", e));
}, [courseId, sIdx, vIdx]);


  // Security and fullscreen event listeners (same as original)
  useEffect(() => {
    if (secureMode) {
      const handleClick = (e) => {
        if (saveQuestionBtnRef.current && saveQuestionBtnRef.current.contains(e.target)) {
          return;
        }
      };

      const preventRightClick = (e) => {
        if (saveQuestionBtnRef.current && saveQuestionBtnRef.current.contains(e.target)) {
          return;
        }
        e.preventDefault();
        recordViolation('Right-click attempted');
        return false;
      };

      const preventKeyboardShortcuts = (e) => {
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
          (e.ctrlKey && (e.key === 'u' || e.key === 'U')) ||
          (e.ctrlKey && (e.key === 'a' || e.key === 'A')) ||
          (e.ctrlKey && (e.key === 's' || e.key === 'S')) ||
          (e.ctrlKey && (e.key === 'p' || e.key === 'P')) ||
          e.key === 'PrintScreen'
        ) {
          e.preventDefault();
          recordViolation(`Prohibited key combination: ${e.key}`);
          return false;
        }
      };

      const preventSelection = (e) => {
        if (saveQuestionBtnRef.current && saveQuestionBtnRef.current.contains(e.target)) {
          return;
        }
        e.preventDefault();
        return false;
      };

      const handleFullscreenChange = () => {
        const isCurrentlyFullscreen = !!(
          document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.mozFullScreenElement ||
          document.msFullscreenElement
        );
        
        setIsFullScreen(isCurrentlyFullscreen);
        
        if (!isCurrentlyFullscreen && quizStarted && !quizCompleted) {
          recordViolation('Exited fullscreen during quiz');
          if (violationCountRef.current >= 2) {
            handleQuizSubmit();
            showViolationAlert('Quiz submitted due to multiple security violations!');
          } else {
            showViolationAlert('Exiting fullscreen is not allowed during quiz!');
            setTimeout(() => enterFullScreen(), 1000);
          }
        }
      };

      const handleVisibilityChange = () => {
        if (document.hidden && quizStarted && !quizCompleted) {
          recordViolation('Tab switched or window minimized');
          if (violationCountRef.current >= 2) {
            handleQuizSubmit();
            showViolationAlert('Quiz submitted due to multiple security violations!');
          }
        }
      };

      const handleWindowBlur = () => {
        if (quizStarted && !quizCompleted) {
          recordViolation('Window lost focus');
          if (violationCountRef.current >= 2) {
            handleQuizSubmit();
            showViolationAlert('Quiz submitted due to multiple security violations!');
          }
        }
      };

      const preventCopyPaste = (e) => {
        if (saveQuestionBtnRef.current && saveQuestionBtnRef.current.contains(e.target)) {
          return;
        }
        if (e.type === 'copy' || e.type === 'cut' || e.type === 'paste' || e.type === 'dragstart') {
          e.preventDefault();
          recordViolation(`${e.type} attempted`);
        }
      };

      // Add event listeners
      document.addEventListener('click', handleClick);
      document.addEventListener('contextmenu', preventRightClick);
      document.addEventListener('keydown', preventKeyboardShortcuts);
      document.addEventListener('selectstart', preventSelection);
      document.addEventListener('dragstart', preventCopyPaste);
      document.addEventListener('copy', preventCopyPaste);
      document.addEventListener('cut', preventCopyPaste);
      document.addEventListener('paste', preventCopyPaste);
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('mozfullscreenchange', handleFullscreenChange);
      document.addEventListener('MSFullscreenChange', handleFullscreenChange);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('blur', handleWindowBlur);

      // Developer tools detection
      let devtools = { open: false, orientation: null };
      const threshold = 160;
      
      const devToolsInterval = setInterval(() => {
        if (
          window.outerHeight - window.innerHeight > threshold ||
          window.outerWidth - window.innerWidth > threshold
        ) {
          if (!devtools.open) {
            devtools.open = true;
            recordViolation('Developer tools opened');
            if (violationCountRef.current >= 2) {
              handleQuizSubmit();
              showViolationAlert('Quiz submitted due to multiple security violations!');
            }
          }
        } else {
          devtools.open = false;
        }
      }, 500);

      const beforeUnloadHandler = (e) => {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your progress will be lost.';
        return 'Are you sure you want to leave? Your progress will be lost.';
      };

      window.addEventListener('beforeunload', beforeUnloadHandler);

      return () => {
        // Cleanup event listeners
        document.removeEventListener('click', handleClick);
        document.removeEventListener('contextmenu', preventRightClick);
        document.removeEventListener('keydown', preventKeyboardShortcuts);
        document.removeEventListener('selectstart', preventSelection);
        document.removeEventListener('dragstart', preventCopyPaste);
        document.removeEventListener('copy', preventCopyPaste);
        document.removeEventListener('cut', preventCopyPaste);
        document.removeEventListener('paste', preventCopyPaste);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
        document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleWindowBlur);
        window.removeEventListener('beforeunload', beforeUnloadHandler);
        clearInterval(devToolsInterval);
      };
    }
  }, [secureMode, quizStarted, quizCompleted]);

  // Timer effect (same as original)
  useEffect(() => {
    let interval;
    if (timerActive && timeRemaining > 0 && !quizCompleted) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleQuizSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining, quizCompleted]);

  // All your existing functions remain the same
  const recordViolation = (violationType) => {
    const violation = {
      type: violationType,
      timestamp: new Date().toISOString(),
      questionIndex: currentQuestionIndex
    };
    
    setViolations(prev => [...prev, violation]);
    violationCountRef.current += 1;
    
    console.warn('Security violation:', violation);
  };

  const showViolationAlert = (message) => {
    const popup = document.createElement('div');
    popup.className = 'luxury-violation-popup';
    popup.innerHTML = `
      <div class="lvp-backdrop"></div>
      <div class="lvp-container">
        <div class="lvp-glass"></div>
        <div class="lvp-content">
          <div class="lvp-icon-wrapper">
            <div class="lvp-icon-glow"></div>
            <svg class="lvp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 9v2l.5 3.5M12 17h.01"></path>
              <circle cx="12" cy="12" r="9"></circle>
            </svg>
          </div>
          <h3 class="lvp-title">Security Violation Warning</h3>
          <p class="lvp-message">${message}</p>
          <button class="lvp-button" onclick="this.closest('.luxury-violation-popup').remove()">
            <span>Understood</span>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(popup);
    
    setTimeout(() => {
      if (popup.parentNode) {
        popup.remove();
      }
    }, 5000);
  };

  const enterFullScreen = async () => {
    try {
      const element = practiceRef.current;
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }
      setIsFullScreen(true);
    } catch (error) {
      console.error('Error entering fullscreen:', error);
      showViolationAlert('Fullscreen mode is required for the practice session. Please allow fullscreen access.');
    }
  };

  const exitFullScreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
      setIsFullScreen(false);
    } catch (error) {
      console.error('Error exiting fullscreen:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const generateQuestions = async () => {
    if (!user?.geminiApiKey) {
      showViolationAlert("Gemini API key not found. Please add your API key in your profile settings.");
      return;
    }

    if (!course?.subCourses?.[sIdx]?.videos?.[vIdx]?.transcript) {
      showViolationAlert("No transcript available for this video. Cannot generate questions.");
      return;
    }

    await enterFullScreen();
    
    setLoading(true);
    const transcript = course.subCourses[sIdx].videos[vIdx].transcript;
    
    const prompt = `Based on the following video transcript, generate exactly 10 multiple choice questions. Each question should have 4 options (A, B, C, D) with only one correct answer. Make the questions test understanding of key concepts from the transcript. Format your response as a valid JSON array with this structure:

[
  {
    "question": "Question text here?",
    "options": {
      "A": "Option A text",
      "B": "Option B text", 
      "C": "Option C text",
      "D": "Option D text"
    },
    "correctAnswer": "A"
  }
]

Transcript: ${transcript}`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': user.geminiApiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to generate questions');
      }

      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!generatedText) {
        throw new Error('No content generated');
      }

      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }

      const parsedQuestions = JSON.parse(jsonMatch[0]);
      
      if (!Array.isArray(parsedQuestions) || parsedQuestions.length !== 10) {
        throw new Error('Invalid questions format or count');
      }

      setQuestions(parsedQuestions);
      setQuizStarted(true);
      setSecureMode(true);
      setTimerActive(true);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setShowAnswers({});
      setViolations([]);
      violationCountRef.current = 0;
      setShow(false);
      
    } catch (error) {
      console.error('Error generating questions:', error);
      showViolationAlert(`Failed to generate questions: ${error.message}`);
      exitFullScreen();
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, selectedAnswer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: selectedAnswer
    }));
  };

  const handleShowAnswer = (questionIndex) => {
    setShowAnswers(prev => ({
      ...prev,
      [questionIndex]: true
    }));
  };

  const calculateScore = () => {
    let totalScore = 0;
    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const correctAnswer = question.correctAnswer;
      const showedAnswer = showAnswers[index] || false;
      
      if (userAnswer === correctAnswer) {
        totalScore += showedAnswer ? 5 : 10;
      } else if (userAnswer && userAnswer !== correctAnswer) {
        totalScore -= 5;
      }
    });
    return Math.max(0, totalScore);
  };

  const savePracticeResult = async (finalScore) => {
  try {
    const user = JSON.parse(localStorage.getItem("userId"));
    

    const correctCount = Object.keys(answers).filter(i => answers[i] === questions[i]?.correctAnswer).length;
    const wrongCount = Object.keys(answers).filter(i => answers[i] && answers[i] !== questions[i]?.correctAnswer).length;
    const timeSpent = 300 - timeRemaining;

    const response = await fetch(`${API}/api/user/${user}/practiceResult`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        courseId,
        subIdx: sIdx,
        vidIdx: vIdx,
        score: finalScore,
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        wrongAnswers: wrongCount,
        timeSpent,
        violations,
        violationCount: violationCountRef.current,
        completedAt: new Date().toISOString()
      })
    });

    if (!response.ok) throw new Error('Failed to save practice result');
    const result = await response.json();
    console.log('✅ Practice result saved:', result);
  } catch (error) {
    console.error('❌ Failed to save practice result:', error);
  }
};


  const handleQuizSubmit = async () => {
    setTimerActive(false);
    setQuizCompleted(true);
    setSecureMode(false);
    const finalScore = calculateScore();
    setScore(finalScore);
    
    await savePracticeResult(finalScore);
    await exitFullScreen();
    setShow(true);
  };

  const resetQuiz = async () => {
    setQuestions([]);
    setQuizStarted(false);
    setQuizCompleted(false);
    setSecureMode(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowAnswers({});
    setScore(0);
    setTimeRemaining(300);
    setTimerActive(false);
    setViolations([]);
    violationCountRef.current = 0;
    setShow(true);
    await exitFullScreen();
  };

  const handleSaveQuestion = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    try {
      const response = await fetch(`${API}/api/save-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          question: currentQuestion.question,
          correctOption: currentQuestion.correctAnswer,
          options: currentQuestion.options
        })
      });

      if (!response.ok) throw new Error('Failed to save question');
      
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving question:', error);
      showViolationAlert('Failed to save question');
    }
  };

  if (err) return (
    <div className="luxury-practice-wrapper">
      <div className="lpp-error-container">
        <div className="lpp-error-icon">
          <FiX />
        </div>
        <h2>Something went wrong</h2>
        <p>{err}</p>
      </div>
    </div>
  );
  
  if (!course || !user) return (
    <div className="luxury-practice-wrapper">
      <div className="lpp-loading-container">
        <div className="lpp-loading-spinner">
          <div className="lpp-spinner-ring"></div>
          <div className="lpp-spinner-ring"></div>
          <div class="lpp-spinner-ring"></div>
        </div>
        <span>Loading practice session...</span>
      </div>
    </div>
  );

  const sub = course.subCourses[sIdx];
  const vid = sub.videos[vIdx];
  
  const getScoreRange = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
  };

  return (
    <div className={`luxury-practice-wrapper ${secureMode ? 'secure-mode' : ''}`} ref={practiceRef}>
      <div className="lpp-background-glow"></div>
      
      {/* Security Indicator */}
      {secureMode && (
        <div className="lpp-security-indicator">
          <div className="lpp-security-glass"></div>
          <div className="lpp-security-content">
            <FiShield className="lpp-security-icon" />
            <span>Secure Mode Active</span>
            {violations.length > 0 && (
              <span className="lpp-violation-count">
                Violations: {violations.length}
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Save Success Popup */}
      {showSaveSuccess && (
        <div className="lpp-save-success-popup">
          <div className="lpp-success-glass"></div>
          <div className="lpp-success-content">
            <FiCheckCircle className="lpp-success-icon" />
            <p>Question saved successfully!</p>
          </div>
        </div>
      )}

      {/* Header */}
      {!secureMode && (
        <header className="lpp-header">
          <div className="lpp-header-glass"></div>
          <div className="lpp-header-content">
            <div className="lpp-header-left">
              <div className="lpp-logo-container">
                <img
                  src={logo}
                  alt="Lurnity"
                  className="lpp-logo"
                  onClick={() => history.push("/home")}
                />
                <div className="lpp-logo-glow"></div>
              </div>
            </div>
            
            <nav className="lpp-header-nav">
              <Link to="/home" className="lpp-nav-link">
                <FiHome className="lpp-nav-icon" />
                <span>Home</span>
              </Link>
              <Link to="/sandbox" className="lpp-nav-link">
                <FiCode className="lpp-nav-icon" />
                <span>CodeSandbox</span>
              </Link>
              <div className="lpp-user-profile">
                <FiUser className="lpp-user-icon" />
                <span>{user?.name || "User"}</span>
              </div>
            </nav>
          </div>
        </header>
      )}

      <div className="lpp-body">
        {/* Sidebar */}
        {showList && !secureMode ? (
          <aside className="lpp-sidebar">
            <div className="lpp-sidebar-glass"></div>
            <div className="lpp-sidebar-content">
              <div className="lpp-sidebar-header">
                <button className="lpp-back-btn" onClick={() => history.push("/home")}>
                  <FiChevronLeft />
                  <span>Back</span>
                </button>
                <h3 className="lpp-sidebar-title">Course Contents</h3>
                <button className="lpp-collapse-btn" onClick={() => setShow(false)}>
                  <TbLayoutSidebarLeftCollapse />
                </button>
              </div>
              
              <div className="lpp-sidebar-scroll">
                {sub.videos.map((v, i) => (
                  <div key={i} className="lpp-playlist-group">
                    <div
                      className={`lpp-playlist-item ${i === vIdx ? 'active' : ''}`}
                      onClick={() => history.push(`/watch/${courseId}/${sIdx}/${i}`)}
                    >
                      <div class="lpp-item-glass"></div>
                      <div className="lpp-item-icon">
                        <FiPlayCircle />
                      </div>
                      <span className="lpp-item-title">{v.title}</span>
                    </div>
                    
                    <div
                      className={`lpp-playlist-item practice ${i === vIdx ? 'active' : ''}`}
                      onClick={() => history.push(`/practice/${courseId}/${sIdx}/${i}`)}
                    >
                      <div className="lpp-item-glass"></div>
                      <div className="lpp-item-icon">
                        <FiTarget />
                      </div>
                      <span className="lpp-item-title">Practice: {v.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        ) : (
          !secureMode && (
            <button className="lpp-expand-btn" onClick={() => setShow(true)}>
              <TbLayoutSidebarLeftExpand />
              <div className="lpp-expand-glow"></div>
            </button>
          )
        )}

        {/* Main Content */}
        <main className={`lpp-main ${!showList || secureMode ? 'full-width' : ''}`}>
          <div className="lpp-content">
            
            {!quizStarted && !quizCompleted && (
              <div className="lpp-intro">
                <div className="lpp-intro-header">
                  <h1 className="lpp-page-title">Practice Quiz: {vid.title}</h1>
                  <p className="lpp-page-subtitle">Test your understanding with AI-generated questions</p>
                </div>
                
                <div className="lpp-instructions-card">
                  <div className="lpp-card-glass"></div>
                  <div className="lpp-card-content">
                    <h2 className="lpp-instructions-title">📋 Instructions</h2>
                    
                    <div className="lpp-security-warning">
                      <div className="lpp-warning-icon-wrapper">
                        <FiShield className="lpp-warning-icon" />
                        <div className="lpp-warning-icon-glow"></div>
                      </div>
                      <div className="lpp-warning-content">
                        <h3>🔒 Secure Mode Notice</h3>
                        <p>This quiz will run in secure mode with the following restrictions:</p>
                        <ul>
                          <li>Fullscreen mode will be automatically activated</li>
                          <li>No tab switching or window minimizing allowed</li>
                          <li>Right-click and keyboard shortcuts disabled</li>
                          <li>Screenshot and screen recording prevention</li>
                          <li>Maximum 3 security violations allowed</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="lpp-instructions-grid">
                      <div className="lpp-instruction-item">
                        <div className="lpp-instruction-icon-wrapper">
                          <div className="lpp-instruction-icon">🔢</div>
                        </div>
                        <div className="lpp-instruction-content">
                          <h3>Number of Questions</h3>
                          <p>10 MCQs</p>
                        </div>
                      </div>
                      
                      <div className="lpp-instruction-item">
                        <div className="lpp-instruction-icon-wrapper">
                          <div className="lpp-instruction-icon">📝</div>
                        </div>
                        <div className="lpp-instruction-content">
                          <h3>Question Type</h3>
                          <p>Multiple Choice Questions</p>
                        </div>
                      </div>
                      
                      <div className="lpp-instruction-item">
                        <div className="lpp-instruction-icon-wrapper">
                          <div className="lpp-instruction-icon">✅</div>
                        </div>
                        <div className="lpp-instruction-content">
                          <h3>Correct Answer</h3>
                          <p>+10 marks each</p>
                        </div>
                      </div>
                      
                      <div className="lpp-instruction-item">
                        <div className="lpp-instruction-icon-wrapper">
                          <div className="lpp-instruction-icon">👁️</div>
                        </div>
                        <div className="lpp-instruction-content">
                          <h3>Show Answer</h3>
                          <p>+5 marks (5 marks deducted)</p>
                        </div>
                      </div>
                      
                      <div className="lpp-instruction-item">
                        <div className="lpp-instruction-icon-wrapper">
                          <div className="lpp-instruction-icon">❌</div>
                        </div>
                        <div className="lpp-instruction-content">
                          <h3>Wrong Answer</h3>
                          <p>-5 marks penalty</p>
                        </div>
                      </div>
                      
                      <div className="lpp-instruction-item">
                        <div className="lpp-instruction-icon-wrapper">
                          <div className="lpp-instruction-icon">⏰</div>
                        </div>
                        <div className="lpp-instruction-content">
                          <h3>Time Limit</h3>
                          <p>5 minutes only</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="lpp-additional-info">
                      <FiStar className="lpp-info-icon" />
                      <p><strong>Note:</strong> Questions are generated based on the video content and will not repeat. No negative marking for unattempted questions.</p>
                    </div>
                  </div>
                </div>
                
                <button 
                  className="lpp-start-btn"
                  onClick={generateQuestions}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="lpp-btn-spinner"></div>
                      <span>Generating Questions...</span>
                    </>
                  ) : (
                    <>
                      <FiMaximize className="lpp-btn-icon" />
                      <span>Start Secure Practice</span>
                    </>
                  )}
                  <div className="lpp-btn-glow"></div>
                </button>
                
                {attempts.length > 0 ? (
                  <div className="lpp-attempt-history">
                    <h3 className="lpp-history-title">🕓 Previous Attempts</h3>
                    <div className="lpp-history-grid">
                      {attempts.map((attempt, index) => (
                        <div 
                          key={index} 
                          className={`lpp-attempt-card ${getScoreRange(attempt.score)}`}
                        >
                          <div className="lpp-attempt-glass"></div>
                          <div className="lpp-attempt-content">
                            <div className="lpp-attempt-header">
                              <div className="lpp-attempt-number">
                                <FiTarget />
                                <strong>Attempt {index + 1}</strong>
                              </div>
                              <span className="lpp-attempt-date">
                                {new Date(attempt.completedAt).toLocaleString()}
                              </span>
                            </div>
                            <div className="lpp-attempt-details">
                              <div className="lpp-detail-item score">
                                <span className="lpp-detail-label">Score:</span>
                                <span className="lpp-detail-value">{attempt.score}/100</span>
                              </div>
                              <div className="lpp-detail-item">
                                <span className="lpp-detail-label">Time:</span>
                                <span className="lpp-detail-value">
                                  {Math.floor(attempt.timeSpent / 60)}m {attempt.timeSpent % 60}s
                                </span>
                              </div>
                              <div className="lpp-detail-item">
                                <span className="lpp-detail-label">Correct:</span>
                                <span className="lpp-detail-value correct">{attempt.correctAnswers}</span>
                              </div>
                              <div className="lpp-detail-item">
                                <span className="lpp-detail-label">Wrong:</span>
                                <span className="lpp-detail-value wrong">{attempt.wrongAnswers}</span>
                              </div>
                              <div className="lpp-detail-item">
                                <span className="lpp-detail-label">Unanswered:</span>
                                <span className="lpp-detail-value">
                                  {attempt.totalQuestions - (attempt.correctAnswers + attempt.wrongAnswers)}
                                </span>
                              </div>
                              {attempt.violationCount > 0 && (
                                <div className="lpp-detail-item violation">
                                  <span className="lpp-detail-label">Violations:</span>
                                  <span className="lpp-detail-value violation">{attempt.violationCount}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="lpp-no-attempts">
                    <div className="lpp-no-attempts-content">
                      <div className="lpp-no-attempts-icon">📊</div>
                      <h3>No Previous Attempts</h3>
                      <p>This will be your first practice session for this video.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {quizStarted && !quizCompleted && questions.length > 0 && (
              <div className="lpp-quiz-container">
                <div className="lpp-quiz-header">
                  <div className="lpp-quiz-progress">
                    <span className="lpp-question-counter">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    <div className="lpp-progress-bar">
                      <div 
                        className="lpp-progress-fill"
                        style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className={`lpp-quiz-timer ${timeRemaining <= 30 ? 'urgent' : ''}`}>
                    <FiClock className="lpp-timer-icon" />
                    <span className="lpp-timer-text">{formatTime(timeRemaining)}</span>
                  </div>
                </div>
                
                <div className="lpp-question-card">
                  <div className="lpp-question-glass"></div>
                  <div className="lpp-question-content">
                    <h3 className="lpp-question-text">
                      {questions[currentQuestionIndex]?.question}
                    </h3>
                    
                    <div className="lpp-options-grid">
                      {Object.entries(questions[currentQuestionIndex]?.options || {}).map(([key, value]) => (
                        <button
                          key={key}
                          className={`lpp-option ${answers[currentQuestionIndex] === key ? 'selected' : ''} ${
                            showAnswers[currentQuestionIndex] && questions[currentQuestionIndex].correctAnswer === key ? 'correct' : ''
                          } ${
                            showAnswers[currentQuestionIndex] && answers[currentQuestionIndex] === key && questions[currentQuestionIndex].correctAnswer !== key ? 'incorrect' : ''
                          }`}
                          onClick={() => handleAnswerSelect(currentQuestionIndex, key)}
                          disabled={showAnswers[currentQuestionIndex]}
                        >
                          <div className="lpp-option-glass"></div>
                          <div className="lpp-option-content">
                            <div className="lpp-option-key">
                              <span>{key}</span>
                            </div>
                            <span className="lpp-option-text">{value}</span>
                            <div className="lpp-option-indicator">
                              {showAnswers[currentQuestionIndex] && questions[currentQuestionIndex].correctAnswer === key && <FiCheckCircle />}
                              {showAnswers[currentQuestionIndex] && answers[currentQuestionIndex] === key && questions[currentQuestionIndex].correctAnswer !== key && <FiX />}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    <div className="lpp-question-actions">
                      {!showAnswers[currentQuestionIndex] && (
                        <button
                          className="lpp-show-answer-btn"
                          onClick={() => handleShowAnswer(currentQuestionIndex)}
                        >
                          <FiEye className="lpp-btn-icon" />
                          <span>Show Answer (-5 marks)</span>
                        </button>
                      )}
                      
                      <button
                        ref={saveQuestionBtnRef}
                        className="lpp-save-question-btn"
                        onClick={handleSaveQuestion}
                      >
                        <FiBookmark className="lpp-btn-icon" />
                        <span>Save Question</span>
                      </button>
                      
                      {showAnswers[currentQuestionIndex] && (
                        <div className="lpp-answer-revealed">
                          <FiCheckCircle className="lpp-reveal-icon" />
                          <span>Correct answer: {questions[currentQuestionIndex].correctAnswer}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="lpp-navigation">
                  <button
                    className="lpp-nav-btn secondary"
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                  >
                    <FiChevronLeft />
                    <span>Previous</span>
                  </button>
                  
                  {currentQuestionIndex < questions.length - 1 ? (
                    <button
                      className="lpp-nav-btn primary"
                      onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                    >
                      <span>Next</span>
                      <FiChevronRight />
                    </button>
                  ) : (
                    <button
                      className="lpp-submit-btn"
                      onClick={handleQuizSubmit}
                    >
                      <FiCheckCircle className="lpp-btn-icon" />
                      <span>Submit Quiz</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {quizCompleted && (
              <div className="lpp-results-container">
                <div className="lpp-results-card">
                  <div className="lpp-results-glass"></div>
                  <div className="lpp-results-content">
                    <div className="lpp-results-header">
                      <div className="lpp-results-icon-wrapper">
                        <FiAward className="lpp-results-icon" />
                        <div className="lpp-results-icon-glow"></div>
                      </div>
                      <h2 className="lpp-results-title">Quiz Completed!</h2>
                      <p className="lpp-results-subtitle">Here's how you performed</p>
                    </div>
                    
                    <div className="lpp-score-display">
                      <div className={`lpp-score-circle ${getScoreRange(score)}`}>
                        <div className="lpp-score-glow"></div>
                        <div className="lpp-score-content">
                          <span className="lpp-score-number">{score}</span>
                          <span className="lpp-score-total">/ 100</span>
                        </div>
                      </div>
                      <div className="lpp-score-percentage">
                        {Math.round((score / 100) * 100)}%
                      </div>
                    </div>
                    
                    <div className="lpp-results-breakdown">
                      <div className="lpp-breakdown-item">
                        <FiCheckCircle className="lpp-breakdown-icon correct" />
                        <div className="lpp-breakdown-content">
                          <span className="lpp-breakdown-label">Correct Answers</span>
                          <span className="lpp-breakdown-value">
                            {Object.keys(answers).filter(i => answers[i] === questions[i]?.correctAnswer).length}
                          </span>
                        </div>
                      </div>
                      
                      <div className="lpp-breakdown-item">
                        <FiX className="lpp-breakdown-icon wrong" />
                        <div className="lpp-breakdown-content">
                          <span className="lpp-breakdown-label">Wrong Answers</span>
                          <span className="lpp-breakdown-value">
                            {Object.keys(answers).filter(i => answers[i] && answers[i] !== questions[i]?.correctAnswer).length}
                          </span>
                        </div>
                      </div>
                      
                      <div className="lpp-breakdown-item">
                        <FiClock className="lpp-breakdown-icon" />
                        <div className="lpp-breakdown-content">
                          <span className="lpp-breakdown-label">Unattempted</span>
                          <span className="lpp-breakdown-value">
                            {questions.length - Object.keys(answers).length}
                          </span>
                        </div>
                      </div>
                      
                      <div className="lpp-breakdown-item">
                        <FiEye className="lpp-breakdown-icon" />
                        <div className="lpp-breakdown-content">
                          <span className="lpp-breakdown-label">Answers Revealed</span>
                          <span className="lpp-breakdown-value">
                            {Object.keys(showAnswers).length}
                          </span>
                        </div>
                      </div>
                      
                      {violations.length > 0 && (
                        <div className="lpp-breakdown-item violation">
                          <FiShield className="lpp-breakdown-icon violation" />
                          <div className="lpp-breakdown-content">
                            <span className="lpp-breakdown-label">Security Violations</span>
                            <span className="lpp-breakdown-value">
                              {violations.length}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {violations.length > 0 && (
                      <div className="lpp-violations-summary">
                        <h4>Security Violations Detected:</h4>
                        <div className="lpp-violations-list">
                          {violations.map((violation, index) => (
                            <div key={index} className="lpp-violation-item">
                              <FiAlertTriangle className="lpp-violation-icon" />
                              <div className="lpp-violation-details">
                                <span className="lpp-violation-type">{violation.type}</span>
                                <span className="lpp-violation-time">
                                  {new Date(violation.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="lpp-results-actions">
                      <button className="lpp-action-btn secondary" onClick={resetQuiz}>
                        <FiRefreshCw className="lpp-btn-icon" />
                        <span>Try Again</span>
                      </button>
                      <button 
                        className="lpp-action-btn primary"
                        onClick={() => history.push(`/watch/${courseId}/${sIdx}/${vIdx}`)}
                      >
                        <FiPlayCircle className="lpp-btn-icon" />
                        <span>Watch Video</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
