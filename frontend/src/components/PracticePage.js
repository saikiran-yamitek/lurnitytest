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
  FiX,
  FiAward,
  FiTarget,
  FiRefreshCw,
  FiEye,
  FiEyeOff,
  FiMaximize,
  FiShield
} from "react-icons/fi";
import { TbLayoutSidebarLeftCollapse, TbLayoutSidebarLeftExpand } from "react-icons/tb";

const API = "http://localhost:7700";

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

  useEffect(() => {
    // Fetch course data
    fetch(`${API}/api/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(r => r.json())
      .then(setCourse)
      .catch(e => setErr(e.message));

    // Fetch user data
    fetch(`${API}/api/homepage`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(r => r.json())
      .then(setUser)
      .catch(e => console.error("Error fetching user:", e));
  }, [courseId]);

  useEffect(() => {
    fetch(`${API}/api/history?courseId=${courseId}&subIdx=${sIdx}&vidIdx=${vIdx}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(r => r.json())
      .then(setAttempts)
      .catch(e => console.error("Failed to fetch attempts:", e));
  }, [courseId, sIdx, vIdx]);

  // Security and fullscreen event listeners
  useEffect(() => {
    if (secureMode) {
      // Track clicks to exclude save question button
      const handleClick = (e) => {
        if (saveQuestionBtnRef.current && saveQuestionBtnRef.current.contains(e.target)) {
          return; // Skip violation recording for save question button
        }
      };

      // Prevent right-click context menu
      const preventRightClick = (e) => {
        if (saveQuestionBtnRef.current && saveQuestionBtnRef.current.contains(e.target)) {
          return; // Allow right-click on save question button
        }
        e.preventDefault();
        recordViolation('Right-click attempted');
        return false;
      };

      // Prevent keyboard shortcuts
      const preventKeyboardShortcuts = (e) => {
        // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+Shift+C, Ctrl+A, Ctrl+S, Ctrl+P
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

      // Prevent text selection
      const preventSelection = (e) => {
        if (saveQuestionBtnRef.current && saveQuestionBtnRef.current.contains(e.target)) {
          return; // Allow selection on save question button
        }
        e.preventDefault();
        return false;
      };

      // Detect fullscreen exit
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
          // Force submit quiz after 3 violations
          if (violationCountRef.current >= 2) {
            handleQuizSubmit();
            alert('Quiz submitted due to multiple security violations!');
          } else {
            // Show popup instead of alert
            const popup = document.createElement('div');
            popup.className = 'violation-popup';
            popup.innerHTML = `
              <div class="popup-content">
                <FiShield className="popup-icon" />
                <h3>Warning</h3>
                <p>Exiting fullscreen is not allowed during quiz!</p>
                <button class="popup-ok-btn">OK</button>
              </div>
            `;
            document.body.appendChild(popup);
            
            const okBtn = popup.querySelector('.popup-ok-btn');
            okBtn.onclick = () => {
              document.body.removeChild(popup);
              enterFullScreen();
            };
          }
        }
      };

      // Detect tab switch/window blur
      const handleVisibilityChange = () => {
        if (document.hidden && quizStarted && !quizCompleted) {
          recordViolation('Tab switched or window minimized');
          if (violationCountRef.current >= 2) {
            handleQuizSubmit();
            alert('Quiz submitted due to multiple security violations!');
          }
        }
      };

      // Detect window blur
      const handleWindowBlur = () => {
        if (quizStarted && !quizCompleted) {
          recordViolation('Window lost focus');
          if (violationCountRef.current >= 2) {
            handleQuizSubmit();
            alert('Quiz submitted due to multiple security violations!');
          }
        }
      };

      // Prevent copy/paste/drag
      const preventCopyPaste = (e) => {
        if (saveQuestionBtnRef.current && saveQuestionBtnRef.current.contains(e.target)) {
          return; // Allow copy/paste on save question button
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

      // Disable developer tools detection (basic)
      let devtools = { open: false, orientation: null };
      const threshold = 160;
      
      setInterval(() => {
        if (
          window.outerHeight - window.innerHeight > threshold ||
          window.outerWidth - window.innerWidth > threshold
        ) {
          if (!devtools.open) {
            devtools.open = true;
            recordViolation('Developer tools opened');
            if (violationCountRef.current >= 2) {
              handleQuizSubmit();
              alert('Quiz submitted due to multiple security violations!');
            }
          }
        } else {
          devtools.open = false;
        }
      }, 500);

      // Prevent page refresh/navigation
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
      };
    }
  }, [secureMode, quizStarted, quizCompleted]);

  // Timer effect
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
      alert('Fullscreen mode is required for the practice session. Please allow fullscreen access.');
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
      alert("Gemini API key not found. Please add your API key in your profile settings.");
      return;
    }

    if (!course?.subCourses?.[sIdx]?.videos?.[vIdx]?.transcript) {
      alert("No transcript available for this video. Cannot generate questions.");
      return;
    }

    // Enter fullscreen before starting
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

      // Extract JSON from the response (remove any markdown formatting)
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
      setShow(false); // Hide sidebar during quiz
      
    } catch (error) {
      console.error('Error generating questions:', error);
      alert(`Failed to generate questions: ${error.message}`);
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
      const correctCount = Object.keys(answers).filter(i => answers[i] === questions[i]?.correctAnswer).length;
      const wrongCount = Object.keys(answers).filter(i => answers[i] && answers[i] !== questions[i]?.correctAnswer).length;
      const timeSpent = 300 - timeRemaining;

      const response = await fetch(`${API}/api/results`, {
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
          violations: violations,
          violationCount: violationCountRef.current
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save practice result');
      }

      const result = await response.json();
      console.log('Practice result saved:', result);
    } catch (error) {
      console.error('Failed to save practice result:', error);
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
    setShow(true); // Show sidebar again
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
    setTimeRemaining(300); // Reset to 5 minutes
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
      const popup = document.createElement('div');
      popup.className = 'violation-popup';
      popup.innerHTML = `
        <div class="popup-content">
          <FiX className="popup-icon error" />
          <h3>Error</h3>
          <p>Failed to save question</p>
          <button class="popup-ok-btn">OK</button>
        </div>
      `;
      document.body.appendChild(popup);
      
      const okBtn = popup.querySelector('.popup-ok-btn');
      okBtn.onclick = () => {
        document.body.removeChild(popup);
      };
    }
  };

  if (err) return (
    <div className="practice-wrapper">
      <div className="modern-error">
        <div className="error-content">
          <h2>Something went wrong</h2>
          <p>{err}</p>
        </div>
      </div>
    </div>
  );
  
  if (!course || !user) return (
    <div className="practice-wrapper">
      <div className="modern-loading">
        <div className="loading-spinner"></div>
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
    <div className={`practice-wrapper ${secureMode ? 'secure-mode' : ''}`} ref={practiceRef}>
      <div className="modern-practice-root">
        {/* Security Indicator */}
        {secureMode && (
          <div className="security-indicator">
            <FiShield className="security-icon" />
            <span>Secure Mode Active</span>
            {violations.length > 0 && (
              <span className="violation-count">
                Violations: {violations.length}
              </span>
            )}
          </div>
        )}
        
        {/* Save Success Popup */}
        {showSaveSuccess && (
          <div className="save-success-popup">
            <div className="popup-content">
              <FiCheckCircle className="popup-icon success" />
              <p>Question saved successfully!</p>
            </div>
          </div>
        )}

        {/* Modern Header */}
        {!secureMode && (
          <header className="modern-practice-header">
            <div className="header-glow"></div>
            <div className="header-content">
              <div className="header-left">
                <div className="logo-container">
                  <img
                    src={logo}
                    alt="Lurnity"
                    className="modern-practice-logo"
                    onClick={() => history.push("/home")}
                  />
                  <div className="logo-shine"></div>
                </div>
              </div>
              
              <nav className="header-nav">
                <Link to="/home" className="nav-link">
                  <FiHome className="nav-icon" />
                  <span>Home</span>
                </Link>
                <Link to="/sandbox" className="nav-link">
                  <FiCode className="nav-icon" />
                  <span>CodeSandbox</span>
                </Link>
                <div className="user-profile">
                  <FiUser className="user-icon" />
                  <span>{user?.name || "User"}</span>
                </div>
              </nav>
            </div>
          </header>
        )}

        <div className="modern-practice-body">
          {/* Modern Sidebar */}
          {showList && !secureMode ? (
            <aside className="modern-practice-playlist">
              <div className="sidebar-glow"></div>
              <div className="playlist-content">
                <div className="playlist-header">
                  <button className="back-btn" onClick={() => history.push("/home")}>
                    <FiChevronLeft />
                    <span>Back</span>
                  </button>
                  <h3 className="playlist-title">Course Contents</h3>
                  <button className="collapse-btn" onClick={() => setShow(false)}>
                    <TbLayoutSidebarLeftCollapse />
                  </button>
                </div>
                
                <div className="playlist-scroll">
                  {sub.videos.map((v, i) => (
                    <div key={i} className="playlist-item-group">
                      <div
                        className={`playlist-item ${i === vIdx ? 'active' : ''}`}
                        onClick={() => history.push(`/watch/${courseId}/${sIdx}/${i}`)}
                      >
                        <div className="item-icon">
                          <FiPlayCircle />
                        </div>
                        <span className="item-title">{v.title}</span>
                        <div className="item-glow"></div>
                      </div>
                      
                      <div
                        className={`playlist-item practice-item ${i === vIdx ? 'active' : ''}`}
                        onClick={() => history.push(`/practice/${courseId}/${sIdx}/${i}`)}
                      >
                        <div className="item-icon">
                          <FiTarget />
                        </div>
                        <span className="item-title">Practice: {v.title}</span>
                        <div className="item-glow"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          ) : (
            !secureMode && (
              <button className="modern-expand-btn" onClick={() => setShow(true)}>
                <TbLayoutSidebarLeftExpand />
                <div className="expand-glow"></div>
              </button>
            )
          )}

          {/* Modern Practice Area */}
          <main className={`modern-practice-main ${!showList || secureMode ? 'full-width' : ''}`}>
            <div className="practice-content">
              
              {!quizStarted && !quizCompleted && (
                <div className="practice-intro">
                  <div className="intro-header">
                    <h1 className="practice-title">Practice Quiz: {vid.title}</h1>
                    <p className="practice-subtitle">Test your understanding with AI-generated questions</p>
                  </div>
                  
                  <div className="instructions-card">
                    <div className="card-glow"></div>
                    <h2 className="instructions-title">📋 Instructions</h2>
                    
                    <div className="security-warning">
                      <FiShield className="warning-icon" />
                      <div className="warning-content">
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
                    
                    <div className="instructions-grid">
                      <div className="instruction-item">
                        <div className="instruction-icon">🔢</div>
                        <div className="instruction-content">
                          <h3>Number of Questions</h3>
                          <p>10 MCQs</p>
                        </div>
                      </div>
                      
                      <div className="instruction-item">
                        <div className="instruction-icon">📝</div>
                        <div className="instruction-content">
                          <h3>Question Type</h3>
                          <p>Multiple Choice Questions</p>
                        </div>
                      </div>
                      
                      <div className="instruction-item">
                        <div className="instruction-icon">✅</div>
                        <div className="instruction-content">
                          <h3>Correct Answer</h3>
                          <p>+10 marks each</p>
                        </div>
                      </div>
                      
                      <div className="instruction-item">
                        <div className="instruction-icon">👁️</div>
                        <div className="instruction-content">
                          <h3>Show Answer</h3>
                          <p>+5 marks (5 marks deducted)</p>
                        </div>
                      </div>
                      
                      <div className="instruction-item">
                        <div className="instruction-icon">❌</div>
                        <div className="instruction-content">
                          <h3>Wrong Answer</h3>
                          <p>-5 marks penalty</p>
                        </div>
                      </div>
                      
                      <div className="instruction-item">
                        <div className="instruction-icon">⏰</div>
                        <div className="instruction-content">
                          <h3>Time Limit</h3>
                          <p>5 minutes only</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="additional-info">
                      <p>💡 <strong>Note:</strong> Questions are generated based on the video content and will not repeat. No negative marking for unattempted questions.</p>
                    </div>
                  </div>
                  
                  <button 
                    className="start-practice-btn"
                    onClick={generateQuestions}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="btn-spinner"></div>
                        <span>Generating Questions...</span>
                      </>
                    ) : (
                      <>
                        <FiMaximize className="btn-icon" />
                        <span>Start Secure Practice</span>
                      </>
                    )}
                    <div className="btn-glow"></div>
                  </button>
                  
                  {attempts.length > 0 ? (
                    <div className="attempt-history">
                      <h3 className="attempt-history-title">🕓 Previous Attempts</h3>
                      <div className="attempt-history-list">
                        {attempts.map((attempt, index) => (
                          <div 
                            key={index} 
                            className="attempt-card" 
                            data-score-range={getScoreRange(attempt.score)}
                          >
                            <div className="attempt-header">
                              <strong>Attempt {index + 1}</strong>
                              <span>{new Date(attempt.completedAt).toLocaleString()}</span>
                            </div>
                            <div className="attempt-details">
                              <p>
                                <strong>Score:</strong> 
                                <span>{attempt.score}/100</span>
                              </p>
                              <p>
                                <strong>Time Spent:</strong> 
                                <span>{Math.floor(attempt.timeSpent / 60)}m {attempt.timeSpent % 60}s</span>
                              </p>
                              <p>
                                <strong>Correct:</strong> 
                                <span>{attempt.correctAnswers}</span>
                              </p>
                              <p>
                                <strong>Wrong:</strong> 
                                <span>{attempt.wrongAnswers}</span>
                              </p>
                              <p>
                                <strong>Unanswered:</strong> 
                                <span>{attempt.totalQuestions - (attempt.correctAnswers + attempt.wrongAnswers)}</span>
                              </p>
                              {attempt.violationCount > 0 && (
                                <p>
                                  <strong>Violations:</strong> 
                                  <span className="violation-badge">{attempt.violationCount}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="attempt-history">
                      <div className="no-attempts">
                        <div className="no-attempts-icon">📊</div>
                        <h3>No Previous Attempts</h3>
                        <p>This will be your first practice session for this video.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {quizStarted && !quizCompleted && questions.length > 0 && (
                <div className="quiz-container secure-quiz">
                  <div className="quiz-header">
                    <div className="quiz-progress">
                      <span className="question-counter">
                        Question {currentQuestionIndex + 1} of {questions.length}
                      </span>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="quiz-timer urgent">
                      <FiClock className="timer-icon" />
                      <span className="timer-text">{formatTime(timeRemaining)}</span>
                    </div>
                  </div>
                  
                  <div className="question-card">
                    <div className="card-glow"></div>
                    <h3 className="question-text">
                      {questions[currentQuestionIndex]?.question}
                    </h3>
                    
                    <div className="options-grid">
                      {Object.entries(questions[currentQuestionIndex]?.options || {}).map(([key, value]) => (
                        <button
                          key={key}
                          className={`option-btn ${answers[currentQuestionIndex] === key ? 'selected' : ''} ${
                            showAnswers[currentQuestionIndex] && questions[currentQuestionIndex].correctAnswer === key ? 'correct' : ''
                          } ${
                            showAnswers[currentQuestionIndex] && answers[currentQuestionIndex] === key && questions[currentQuestionIndex].correctAnswer !== key ? 'incorrect' : ''
                          }`}
                          onClick={() => handleAnswerSelect(currentQuestionIndex, key)}
                          disabled={showAnswers[currentQuestionIndex]}
                        >
                          <span className="option-key">{key}</span>
                          <span className="option-text">{value}</span>
                        </button>
                      ))}
                    </div>
                    
                    <div className="question-actions">
                      {!showAnswers[currentQuestionIndex] && (
                        <button
                          className="show-answer-btn"
                          onClick={() => handleShowAnswer(currentQuestionIndex)}
                        >
                          <FiEye className="btn-icon" />
                          <span>Show Answer (-5 marks)</span>
                        </button>
                      )}
                      
                      <button
                        ref={saveQuestionBtnRef}
                        className="save-question-btn"
                        onClick={handleSaveQuestion}
                      >
                        Save Question
                      </button>
                      
                      {showAnswers[currentQuestionIndex] && (
                        <div className="answer-revealed">
                          <FiCheckCircle className="reveal-icon" />
                          <span>Correct answer: {questions[currentQuestionIndex].correctAnswer}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="navigation-controls">
                    <button
                      className="nav-btn"
                      onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                      disabled={currentQuestionIndex === 0}
                    >
                      <FiChevronLeft />
                      Previous
                    </button>
                    
                    {currentQuestionIndex < questions.length - 1 ? (
                      <button
                        className="nav-btn primary"
                        onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                      >
                        Next
                        <FiChevronLeft style={{ transform: 'rotate(180deg)' }} />
                      </button>
                    ) : (
                      <button
                        className="submit-btn"
                        onClick={handleQuizSubmit}
                      >
                        <FiCheckCircle className="btn-icon" />
                        Submit Quiz
                      </button>
                    )}
                  </div>
                </div>
              )}

              {quizCompleted && (
                <div className="results-container">
                  <div className="results-card">
                    <div className="card-glow"></div>
                    <div className="results-header">
                      <FiAward className="results-icon" />
                      <h2 className="results-title">Quiz Completed!</h2>
                      <p className="results-subtitle">Here's how you performed</p>
                    </div>
                    
                    <div className="score-display">
                      <div className="score-circle">
                        <span className="score-number">{score}</span>
                        <span className="score-total">/ 100</span>
                      </div>
                      <div className="score-percentage">
                        {Math.round((score / 100) * 100)}%
                      </div>
                    </div>
                    
                    <div className="results-breakdown">
                      <div className="breakdown-item">
                        <span className="breakdown-label">Correct Answers</span>
                        <span className="breakdown-value">
                          {Object.keys(answers).filter(i => answers[i] === questions[i]?.correctAnswer).length}
                        </span>
                      </div>
                      <div className="breakdown-item">
                        <span className="breakdown-label">Wrong Answers</span>
                        <span className="breakdown-value">
                          {Object.keys(answers).filter(i => answers[i] && answers[i] !== questions[i]?.correctAnswer).length}
                        </span>
                      </div>
                      <div className="breakdown-item">
                        <span className="breakdown-label">Unattempted</span>
                        <span className="breakdown-value">
                          {questions.length - Object.keys(answers).length}
                        </span>
                      </div>
                      <div className="breakdown-item">
                        <span className="breakdown-label">Answers Revealed</span>
                        <span className="breakdown-value">
                          {Object.keys(showAnswers).length}
                        </span>
                      </div>
                      {violations.length > 0 && (
                        <div className="breakdown-item violation-item">
                          <span className="breakdown-label">Security Violations</span>
                          <span className="breakdown-value violation-count">
                            {violations.length}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {violations.length > 0 && (
                      <div className="violations-summary">
                        <h4>Security Violations Detected:</h4>
                        <ul>
                          {violations.map((violation, index) => (
                            <li key={index}>
                              <span className="violation-type">{violation.type}</span>
                              <span className="violation-time">
                                {new Date(violation.timestamp).toLocaleTimeString()}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="results-actions">
                      <button className="action-btn secondary" onClick={resetQuiz}>
                        <FiRefreshCw className="btn-icon" />
                        <span>Try Again</span>
                      </button>
                      <button 
                        className="action-btn primary"
                        onClick={() => history.push(`/watch/${courseId}/${sIdx}/${vIdx}`)}
                      >
                        <FiPlayCircle className="btn-icon" />
                        <span>Watch Video</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}