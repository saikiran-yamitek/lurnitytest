import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FiPlay, FiPause, FiRefreshCw, FiHeart, FiZap, FiClock, FiFlag, 
  FiShield, FiArrowLeft, FiTarget, FiTrendingUp, FiStar, FiCheck,
  FiX, FiEye,  FiSkipForward, FiBrain, FiAward,
  FiMaximize2, FiMinimize2
} from 'react-icons/fi';
import { FaLightbulb ,FaBrain} from "react-icons/fa";
import "./MockInterview.css";

const API = process.env.REACT_APP_API_URL;

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const DIFFICULTY_POINTS = { easy: 5, medium: 10, hard: 20 };

export default function MockInterview({ companyName, user, onExit, skills = [] }) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true);
  
  // limits
  const [revealCount, setRevealCount] = useState(0);
  const [usedSkip, setUsedSkip] = useState(0);
  const [usedHint, setUsedHint] = useState(0);
  const [hintMessage, setHintMessage] = useState("");

  const [setUsed5050] = useState(false);
  const [reducedOptions, setReducedOptions] = useState(null);

  const timerRef = useRef(null);
  const modalRef = useRef(null);
  const current = questions[idx];

  // Prevent background scroll and handle fullscreen - IMPROVED VERSION
  useEffect(() => {
    // Store original body overflow
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalScrollX = window.scrollX;
    const originalScrollY = window.scrollY;
    
    // Prevent background scroll when modal is opened
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.top = `-${originalScrollY}px`;
    document.body.style.left = `-${originalScrollX}px`;
    
    // Add class to prevent pull-to-refresh on mobile
    document.documentElement.style.overscrollBehavior = 'none';
    document.body.style.overscrollBehavior = 'none';

    // IMPROVED: Only prevent scroll events that happen outside the modal
    const preventBackgroundScroll = (e) => {
      // Check if the event target is inside our modal
      const modalElement = modalRef.current;
      if (modalElement && modalElement.contains(e.target)) {
        // Allow scrolling inside the modal
        return;
      }
      
      // Prevent scrolling outside the modal
      e.preventDefault();
      e.stopPropagation();
    };

    const preventBackgroundKeyScroll = (e) => {
      // Check if the event target is inside our modal
      const modalElement = modalRef.current;
      if (modalElement && modalElement.contains(e.target)) {
        // Allow keyboard navigation inside the modal
        return;
      }
      
      // Prevent arrow keys, page up/down, space, home, end from scrolling background
      if ([32, 33, 34, 35, 36, 37, 38, 39, 40].includes(e.keyCode)) {
        e.preventDefault();
      }
    };

    // Add event listeners to prevent background scrolling only
    document.addEventListener('wheel', preventBackgroundScroll, { passive: false });
    document.addEventListener('touchmove', preventBackgroundScroll, { passive: false });
    document.addEventListener('keydown', preventBackgroundKeyScroll);

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.documentElement.style.overscrollBehavior = '';
      document.body.style.overscrollBehavior = '';
      
      // Restore scroll position
      window.scrollTo(originalScrollX, originalScrollY);
      
      document.removeEventListener('wheel', preventBackgroundScroll);
      document.removeEventListener('touchmove', preventBackgroundScroll);
      document.removeEventListener('keydown', preventBackgroundKeyScroll);
    };
  }, []);

  // Handle exit with cleanup
  const handleExit = () => {
    // Cleanup will happen in useEffect return function
    onExit && onExit();
  };

  // All your existing useEffect hooks and functions remain the same
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const userRes = await fetch(`${API}/api/user/homepage`, {
          headers: { Authorization: "Bearer " + token }
        });
        const userData = await userRes.json();
        const geminiApiKey = userData?.geminiApiKey || user?.geminiApiKey;

        if (!geminiApiKey) {
          setLoading(false);
          return;
        }
        const payload = {
          companyName,
          skills: userData?.currentExpertise?.knownSkills?.length ? userData.currentExpertise.knownSkills : skills,
          userName: userData?.name || 'Candidate',
          geminiApiKey
        };
        const res = await fetch(`${API}/api/gemini/mock-questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) {
          setLoading(false);
          return;
        }
        if (active) setQuestions(data.questions || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false };
  }, [companyName, skills, user]);

  useEffect(() => {
    if (loading || !current || revealed || isPaused) return;
    timerRef.current && clearInterval(timerRef.current);
    setTimeLeft(45);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleReveal(false, true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => timerRef.current && clearInterval(timerRef.current);
  }, [idx, loading, isPaused, current]);

  const handleSelectOption = (opt) => {
    if (revealed) return;
    setSelected(opt);
  };

  const handleReveal = (manual = true, timeOut = false) => {
    if (!current || revealed || revealCount >= 3) return;

    const isMCQ = Array.isArray(current.options) && current.options.length > 0;
    let isCorrect = false;
    if (isMCQ) {
      isCorrect = selected && current.answer && selected.trim() === current.answer.trim();
    } else {
      isCorrect = !timeOut && manual && !!current.answer;
    }

    if (isCorrect && manual && revealCount < 3) {
      const base = DIFFICULTY_POINTS[current.difficulty] || 10;
      const streakBonus = clamp(streak * 2, 0, 10);
      setScore((s) => s + base + streakBonus);
      setStreak((k) => k + 1);
    } else {
      setStreak(0);
      setLives((l) => clamp(l - 1, 0, 3));
    }

    setRevealCount(r => r + 1);
    setRevealed(true);
    timerRef.current && clearInterval(timerRef.current);
  };

  const nextQuestion = () => {
    setSelected(null);
    setRevealed(false);
    setReducedOptions(null);
    setHintMessage("");
    if (idx < questions.length - 1) {
      setIdx((i) => i + 1);
    } else {
      alert(`Interview complete! Score: ${score}`);
      handleExit();
    }
  };

  const applySkip = () => {
    if (usedSkip >= 2) return;
    setUsedSkip(x => x + 1);
    setSelected(null);
    setRevealed(false);
    setReducedOptions(null);
    setHintMessage("");
    if (idx < questions.length - 1) {
      setIdx(i => i + 1);
    } else {
      alert(`Interview complete! Score: ${score}`);
      handleExit();
    }
  };

  const applyHint = () => {
    if (usedHint >= 2) return;
    setUsedHint(x => x + 1);
    setHintMessage(current?.rationale ? current.rationale.slice(0, 160) + "..." : "No hint available.");
  };

  const visibleOptions = useMemo(() => {
    if (!current?.options) return null;
    if (reducedOptions) return reducedOptions;
    return current.options;
  }, [current, reducedOptions]);

  const restart = () => {
    setIdx(0); setSelected(null); setRevealed(false); setScore(0);
    setStreak(0); setLives(3); setTimeLeft(45); setIsPaused(false);
    setUsed5050(false); setUsedSkip(0); setUsedHint(0); setHintMessage("");
    setRevealCount(0);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // All your existing helper functions remain the same
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'easy';
      case 'medium': return 'medium';
      case 'hard': return 'hard';
      default: return 'medium';
    }
  };

  const getTimerColor = () => {
    if (timeLeft > 30) return 'safe';
    if (timeLeft > 10) return 'warning';
    return 'danger';
  };

  const getProgressPercentage = () => {
    return ((idx + 1) / questions.length) * 100;
  };

  if (loading) {
    return (
      <div className="luxury-mock-interview-wrapper fullscreen" ref={modalRef}>
        <div className="lmi-fullscreen-overlay"></div>
        <div className="lmi-loading-container">
          <div className="lmi-loading-spinner">
            <div className="lmi-spinner-ring"></div>
            <div className="lmi-spinner-ring"></div>
            <div className="lmi-spinner-ring"></div>
          </div>
          <div className="lmi-loading-content">
            <h3>Preparing Your Interview Experience</h3>
            <p>Generating premium questions tailored for {companyName}...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="luxury-mock-interview-wrapper fullscreen" ref={modalRef}>
        <div className="lmi-fullscreen-overlay"></div>
        <div className="lmi-error-container">
          <div className="lmi-error-icon">
            <FaBrain />
          </div>
          <h3>No Questions Available</h3>
          <p>Unable to generate questions for this interview session.</p>
          <button className="lmi-exit-button" onClick={handleExit}>
            <FiArrowLeft />
            <span>Return to Placement</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`luxury-mock-interview-wrapper ${isFullscreen ? 'fullscreen' : 'windowed'}`} ref={modalRef}>
      <div className="lmi-fullscreen-overlay"></div>
      
      <div className="lmi-container">
        <div className="lmi-background-glow"></div>
        
        {/* Header */}
        <div className="lmi-header">
          <div className="lmi-header-glass"></div>
          <div className="lmi-header-content">
            <div className="lmi-header-left">
              <button className="lmi-exit-btn" onClick={handleExit}>
                <FiArrowLeft />
              </button>
              <div className="lmi-company-info">
                <h2 className="lmi-company-name">{companyName}</h2>
                <p className="lmi-interview-type">Mock Interview Session</p>
              </div>
            </div>
            
            <div className="lmi-header-right">
              <button className="lmi-fullscreen-toggle" onClick={toggleFullscreen}>
                {isFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
              </button>
              
              <div className="lmi-header-stats">
                <div className={`lmi-stat-item timer ${getTimerColor()}`}>
                  <FiClock className="lmi-stat-icon" />
                  <span className="lmi-stat-value">{timeLeft}s</span>
                </div>
                <div className="lmi-stat-item streak">
                  <FiZap className="lmi-stat-icon" />
                  <span className="lmi-stat-value">{streak}</span>
                </div>
                <div className="lmi-stat-item lives">
                  <FiHeart className="lmi-stat-icon" />
                  <span className="lmi-stat-value">{lives}</span>
                </div>
                <div className="lmi-stat-item score">
                  <FiShield className="lmi-stat-icon" />
                  <span className="lmi-stat-value">{score}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="lmi-content-scroll">
          {/* Progress Section */}
          <div className="lmi-progress-section">
            <div className="lmi-progress-header">
              <span className="lmi-question-counter">
                Question {idx + 1} of {questions.length}
              </span>
              <div className={`lmi-difficulty-badge ${getDifficultyColor(current.difficulty)}`}>
                <FiTarget className="lmi-difficulty-icon" />
                <span>{current.difficulty || 'Medium'}</span>
              </div>
            </div>
            
            <div className="lmi-progress-bar-container">
              <div className="lmi-progress-bar">
                <div 
                  className="lmi-progress-fill" 
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
              <span className="lmi-progress-percent">{Math.round(getProgressPercentage())}%</span>
            </div>
          </div>

          {/* Question Section */}
          <div className="lmi-question-section">
            <div className="lmi-question-card">
              <div className="lmi-question-glass"></div>
              <div className="lmi-question-content">
                <div className="lmi-question-header">
                  <div className="lmi-question-icon-wrapper">
                    <FaBrain className="lmi-question-icon" />
                  </div>
                  <div className="lmi-question-meta">
                    <span className="lmi-question-type">
                      {current.type || 'Multiple Choice Question'}
                    </span>
                  </div>
                </div>
                
                <h3 className="lmi-question-text">{current.question}</h3>
              </div>
            </div>
          </div>

          {/* Answer Section */}
          <div className="lmi-answer-section">
            {visibleOptions ? (
              <div className="lmi-options-grid">
                {visibleOptions.map((opt, optIdx) => {
                  const isCorrect = revealed && current.answer && opt.trim() === current.answer.trim();
                  const isSelected = selected === opt;
                  const isWrong = revealed && isSelected && !isCorrect;
                  
                  return (
                    <button 
                      key={optIdx} 
                      className={`lmi-option ${isSelected ? 'selected' : ''} ${
                        revealed ? (isCorrect ? 'correct' : isWrong ? 'wrong' : '') : ''
                      }`}
                      onClick={() => handleSelectOption(opt)} 
                      disabled={revealed}
                    >
                      <div className="lmi-option-glass"></div>
                      <div className="lmi-option-content">
                        <div className="lmi-option-indicator">
                          {revealed && isCorrect && <FiCheck />}
                          {revealed && isWrong && <FiX />}
                          {!revealed && isSelected && <FiTarget />}
                        </div>
                        <span className="lmi-option-text">{opt}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="lmi-text-answer">
                <div className="lmi-textarea-wrapper">
                  <textarea 
                    className="lmi-textarea" 
                    disabled={revealed}
                    placeholder="Type your detailed answer here. Explain your reasoning and approach..."
                    onChange={(e) => setSelected(e.target.value)}
                    value={selected || ''}
                  />
                  <div className="lmi-textarea-footer">
                    <span className="lmi-char-count">{(selected || '').length}/500</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Hint Section */}
          {hintMessage && (
            <div className="lmi-hint-section">
              <div className="lmi-hint-card">
                <div className="lmi-hint-glass"></div>
                <div className="lmi-hint-content">
                  <div className="lmi-hint-header">
                    <FaLightbulb className="lmi-hint-icon" />
                    <span className="lmi-hint-title">Hint</span>
                  </div>
                  <p className="lmi-hint-message">{hintMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Answer Explanation */}
          {revealed && (
            <div className="lmi-explanation-section">
              <div className="lmi-explanation-card">
                <div className="lmi-explanation-glass"></div>
                <div className="lmi-explanation-content">
                  <div className="lmi-explanation-header">
                    <div className="lmi-answer-badge">
                      <FiCheck className="lmi-answer-icon" />
                      <span>Correct Answer</span>
                    </div>
                  </div>
                  
                  <div className="lmi-answer-content">
                    <p className="lmi-correct-answer">
                      <strong>Answer:</strong> {current.answer || "No answer provided"}
                    </p>
                    {current.rationale && (
                      <div className="lmi-rationale">
                        <h4>Explanation:</h4>
                        <p>{current.rationale}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="lmi-actions-section">
            <div className="lmi-actions-primary">
              <button 
                className={`lmi-action-btn pause ${isPaused ? 'resumed' : ''}`}
                onClick={() => setIsPaused(p => !p)}
              >
                {isPaused ? <FiPlay /> : <FiPause />}
                <span>{isPaused ? "Resume" : "Pause"}</span>
              </button>
              
              <button 
                className="lmi-action-btn reveal"
                onClick={() => handleReveal(true)} 
                disabled={revealed || revealCount >= 3}
              >
                <FiEye />
                <span>Reveal ({3 - revealCount} left)</span>
              </button>
              
              <button 
                className="lmi-action-btn next primary"
                onClick={nextQuestion} 
                disabled={!revealed}
              >
                <FiSkipForward />
                <span>Next Question</span>
              </button>
            </div>
            
            <div className="lmi-actions-secondary">
              <button 
                className="lmi-action-btn skip"
                onClick={applySkip} 
                disabled={usedSkip >= 2}
              >
                <FiFlag />
                <span>Skip ({2 - usedSkip} left)</span>
              </button>
              
              <button 
                className="lmi-action-btn hint"
                onClick={applyHint} 
                disabled={usedHint >= 2}
              >
                <FaLightbulb />
                <span>Hint ({2 - usedHint} left)</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="lmi-footer">
            <div className="lmi-footer-content">
              <button className="lmi-footer-btn secondary" onClick={restart}>
                <FiRefreshCw />
                <span>Restart Interview</span>
              </button>
              
              <div className="lmi-footer-stats">
                <div className="lmi-footer-stat">
                  <FiTrendingUp className="lmi-footer-stat-icon" />
                  <span>Score: {score}</span>
                </div>
                <div className="lmi-footer-stat">
                  <FiAward className="lmi-footer-stat-icon" />
                  <span>Streak: {streak}</span>
                </div>
              </div>
              
              <button className="lmi-footer-btn primary" onClick={handleExit}>
                <FiArrowLeft />
                <span>Exit Interview</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
