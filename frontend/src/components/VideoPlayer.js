import React, { useEffect, useState } from "react";
import { useParams, useHistory, Link } from "react-router-dom";
import "./VideoPlayer.css";
import AskDoubtModal from "../components/AskDoubtModal";

import logo from "../assets/LURNITY.jpg";
import { 
  FiPlayCircle, 
  FiChevronLeft, 
  FiCode, 
  FiHome,
  FiUser,
  FiHelpCircle,
  FiMessageSquare,
  FiStar,
  FiCheckCircle,
  FiX,
  
  FiBookmark,
  FiThumbsUp
} from "react-icons/fi";
import { TbLayoutSidebarLeftCollapse, TbLayoutSidebarLeftExpand } from "react-icons/tb";


const API = process.env.REACT_APP_API_URL;

const idOf = (cId, sIdx, vIdx) => `${cId}|${sIdx}|${vIdx}`;

export default function VideoPlayer() {
  const { courseId, subIdx, vidIdx } = useParams();
  const sIdx = Number(subIdx), vIdx = Number(vidIdx);
  const history = useHistory();

  const [course, setCourse] = useState(null);
  const [err, setErr] = useState(null);
  const [showList, setShow] = useState(true);
  const [geminiKey, setGeminiKey] = useState(null);
  const [showDoubtModal, setShowDoubtModal] = useState(false);
  const [pauseTimer, setPauseTimer] = useState(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isVideoBookmarked, setIsVideoBookmarked] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetch(`${API}/api/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(r => r.json())
      .then(setCourse)
      .catch(e => setErr(e.message));

    if (userId) {
      fetch(`${API}/api/gemini/get-key`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      })
        .then(res => res.json())
        .then(data => {
          if (data.geminiApiKey) {
            setGeminiKey(data.geminiApiKey);
          }
        })
        .catch(() => {});
    }
  }, [courseId, userId]);

  const submitFeedback = async () => {
    if (!rating || !feedbackText.trim()) {
      alert("Please provide both rating and feedback.");
      return;
    }

    try {
      await fetch(`${API}/api/feedback/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          courseId,
          subIndex: sIdx,
          videoIndex: vIdx,
          rating,
          comment: feedbackText.trim()
        })
      });
      alert("Feedback submitted successfully!");
      setRating(0);
      setFeedbackText("");
      setShowFeedbackModal(false);
    } catch (err) {
      alert("Failed to submit feedback.");
    }
  };

  const markWatched = async () => {
    const videoId = idOf(courseId, sIdx, vIdx);
    try {
      await fetch(`${API}/api/progress/watch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ videoId })
      });
    } catch (e) {
      console.warn("progress save failed:", e);
    }

    try {
      const list = await (await fetch(`${API}/api/progress`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })).json();
      localStorage.setItem("watched_sync", JSON.stringify(list));
    } catch {}
  };

  const askDoubt = () => {
    if (!geminiKey) {
      setShowKeyModal(true);
    } else {
      setShowDoubtModal(true);
    }
  };

  const saveGeminiKey = () => {
    if (!newKey.trim()) return;
    fetch(`${API}/api/user/save-key`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, geminiApiKey: newKey.trim() })
    })
      .then(res => res.json())
      .then(() => {
        setGeminiKey(newKey.trim());
        setShowKeyModal(false);
        setShowDoubtModal(true);
        setNewKey("");
      })
      .catch(() => alert("Failed to save API key. Try again."));
  };

  const handlePause = () => {
    const timer = setTimeout(() => {
      askDoubt();
    }, 15000);
    setPauseTimer(timer);
  };

  const handlePlay = () => {
    if (pauseTimer) {
      clearTimeout(pauseTimer);
      setPauseTimer(null);
    }
  };

  const handleVideoProgress = (e) => {
    const progress = (e.target.currentTime / e.target.duration) * 100;
    setVideoProgress(progress || 0);
  };

  const toggleBookmark = async () => {
    // Implement bookmark functionality
    setIsVideoBookmarked(!isVideoBookmarked);
  };

  if (err) return (
    <div className="videoplayer-luxury-wrapper">
      <div className="vp-error-container">
        <div className="vp-error-backdrop"></div>
        <div className="vp-error-content">
          <div className="vp-error-icon">
            <FiX />
          </div>
          <h2>Unable to Load Video</h2>
          <p>{err}</p>
          <button className="vp-btn-primary" onClick={() => history.push("/home")}>
            <FiHome />
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
  
  if (!course) return (
    <div className="videoplayer-luxury-wrapper">
      <div className="vp-loading-container">
        <div className="vp-loading-backdrop">
          <div className="vp-loading-aurora"></div>
        </div>
        <div className="vp-loading-content">
          <div className="vp-loading-spinner">
            <div className="vp-spinner-ring"></div>
            <div className="vp-spinner-ring"></div>
            <div className="vp-spinner-ring"></div>
          </div>
          <h3>Preparing Your Learning Experience</h3>
          <p>Setting up your premium video player...</p>
        </div>
      </div>
    </div>
  );

  const sub = course.subCourses[sIdx];
  const vid = sub.videos[vIdx];

  const play = (i) => history.replace(`/watch/${courseId}/${sIdx}/${i}`);

  return (
    <div className="videoplayer-luxury-wrapper">
      <div className="vp-app-container">
        {/* Premium Header */}
        <header className="vp-header">
          <div className="vp-header-shimmer"></div>
          <div className="vp-header-content">
            <div className="vp-header-left">
              <div className="vp-logo-container">
                <img
                  src={logo}
                  alt="Lurnity"
                  className="vp-logo"
                  onClick={() => history.push("/home")}
                />
                <div className="vp-logo-glow"></div>
              </div>
            </div>
            
            <nav className="vp-header-nav">
              <Link to="/home" className="vp-nav-link">
                <div className="vp-nav-icon-wrapper">
                  <FiHome className="vp-nav-icon" />
                </div>
                <span>Dashboard</span>
              </Link>
              <Link to="/sandbox" className="vp-nav-link">
                <div className="vp-nav-icon-wrapper">
                  <FiCode className="vp-nav-icon" />
                </div>
                <span>CodeSandbox</span>
              </Link>
              <div className="vp-user-profile">
                <div className="vp-profile-avatar">
                  <FiUser className="vp-user-icon" />
                </div>
                <span className="vp-user-name">{localStorage.getItem("userName") || "Student"}</span>
              </div>
            </nav>
          </div>
        </header>

        <div className="vp-body">
          {/* Premium Sidebar */}
          {showList ? (
            <aside className="vp-sidebar">
              <div className="vp-sidebar-backdrop"></div>
              <div className="vp-sidebar-content">
                <div className="vp-sidebar-header">
                  <button className="vp-back-btn" onClick={() => history.push("/home")}>
                    <FiChevronLeft className="vp-back-icon" />
                    <span>Back to Course</span>
                  </button>
                  <h3 className="vp-sidebar-title">Course Content</h3>
                  <button className="vp-collapse-btn" onClick={() => setShow(false)}>
                    <TbLayoutSidebarLeftCollapse />
                  </button>
                </div>
                
                <div className="vp-playlist-container">
                  <div className="vp-playlist-scroll">
                    {sub.videos.map((v, i) => (
                      <div
                        key={i}
                        className={`vp-playlist-item ${i === vIdx ? 'active' : ''} ${i < vIdx ? 'completed' : ''}`}
                        onClick={() => play(i)}
                      >
                        <div className="vp-item-backdrop"></div>
                        <div className="vp-item-icon">
                          {i < vIdx ? <FiCheckCircle /> : <FiPlayCircle />}
                        </div>
                        <div className="vp-item-content">
                          <h4 className="vp-item-title">{v.title}</h4>
                          <span className="vp-item-meta">Video {i + 1}</span>
                        </div>
                        {i === vIdx && (
                          <div className="vp-progress-indicator">
                            <div className="vp-progress-ring">
                              <div 
                                className="vp-progress-fill" 
                                style={{ 
                                  background: `conic-gradient(#d4af37 ${videoProgress}%, transparent ${videoProgress}%)` 
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          ) : (
            <button className="vp-expand-btn" onClick={() => setShow(true)}>
              <TbLayoutSidebarLeftExpand />
              <div className="vp-expand-pulse"></div>
            </button>
          )}

          {/* Premium Player Area */}
          <main className={`vp-player ${!showList ? 'full-width' : ''}`}>
            <div className="vp-player-container">
              {/* Video Header */}
              <div className="vp-video-header">
                <div className="vp-video-info">
                  <div className="vp-video-badge">
                    <FiPlayCircle className="vp-badge-icon" />
                    <span>Video Lesson</span>
                  </div>
                  <h1 className="vp-video-title">{vid.title}</h1>
                  <div className="vp-video-meta">
                    <span className="vp-video-number">Lesson {vIdx + 1} of {sub.videos.length}</span>
                    <span className="vp-video-separator">•</span>
                    <span className="vp-video-course">{course.title}</span>
                  </div>
                </div>
                
                <div className="vp-video-actions">
                  <button 
                    className={`vp-action-btn ${isVideoBookmarked ? 'active' : ''}`}
                    onClick={toggleBookmark}
                    title="Bookmark this video"
                  >
                    <FiBookmark />
                  </button>
                </div>
              </div>
              
              {/* Premium Video Container */}
              <div className="vp-video-container">
                <div className="vp-video-backdrop"></div>
                <video
                  src={vid.url}
                  controls
                  className="vp-luxury-video"
                  onEnded={markWatched}
                  onPause={handlePause}
                  onPlay={handlePlay}
                  onTimeUpdate={handleVideoProgress}
                />
                <div className="vp-video-overlay">
                  <div className="vp-video-gradient"></div>
                </div>
              </div>

              {/* Premium Action Buttons */}
              <div className="vp-action-section">
                <div className="vp-action-grid">
                  <button className="vp-btn-primary large" onClick={askDoubt}>
                    <FiHelpCircle className="vp-btn-icon" />
                    <div className="vp-btn-content">
                      <span className="vp-btn-title">Ask AI Assistant</span>
                      <span className="vp-btn-subtitle">Get instant help</span>
                    </div>
                  </button>
                  
                  <button className="vp-btn-secondary large" onClick={() => setShowFeedbackModal(true)}>
                    <FiMessageSquare className="vp-btn-icon" />
                    <div className="vp-btn-content">
                      <span className="vp-btn-title">Share Feedback</span>
                      <span className="vp-btn-subtitle">Help us improve</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="vp-navigation-section">
                <div className="vp-nav-controls">
                  {vIdx > 0 && (
                    <button 
                      className="vp-nav-btn previous"
                      onClick={() => play(vIdx - 1)}
                    >
                      <FiChevronLeft className="vp-nav-btn-icon" />
                      <div className="vp-nav-btn-content">
                        <span className="vp-nav-btn-label">Previous</span>
                        <span className="vp-nav-btn-title">{sub.videos[vIdx - 1]?.title}</span>
                      </div>
                    </button>
                  )}
                  
                  {vIdx < sub.videos.length - 1 && (
                    <button 
                      className="vp-nav-btn next"
                      onClick={() => play(vIdx + 1)}
                    >
                      <div className="vp-nav-btn-content">
                        <span className="vp-nav-btn-label">Next</span>
                        <span className="vp-nav-btn-title">{sub.videos[vIdx + 1]?.title}</span>
                      </div>
                      <FiChevronLeft className="vp-nav-btn-icon next" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Premium Modals */}
        {showDoubtModal && (
          <AskDoubtModal
            geminiKey={geminiKey}
            onClose={() => setShowDoubtModal(false)}
          />
        )}

        {showKeyModal && (
          <div className="vp-modal-overlay">
            <div className="vp-modal-backdrop" onClick={() => setShowKeyModal(false)}></div>
            <div className="vp-luxury-modal">
              <div className="vp-modal-header">
                <div className="vp-modal-icon">
                  <FiHelpCircle />
                </div>
                <h2>🚀 Unlock AI-Powered Learning</h2>
                <p>Enter your Gemini API key to access our intelligent doubt-solving assistant</p>
              </div>
              
              <div className="vp-modal-body">
                <div className="vp-input-group">
                  <label className="vp-input-label">Gemini API Key</label>
                  <input
                    className="vp-luxury-input"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="Paste your API key here..."
                    type="password"
                  />
                </div>
              </div>
              
              <div className="vp-modal-actions">
                <button onClick={() => setShowKeyModal(false)} className="vp-btn-secondary">
                  Cancel
                </button>
                <button onClick={saveGeminiKey} className="vp-btn-primary">
                  Save & Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Premium Feedback Modal */}
        {showFeedbackModal && (
          <div className="vp-feedback-modal-overlay">
            <div className="vp-feedback-modal-backdrop" onClick={() => setShowFeedbackModal(false)}></div>
            <div className="vp-luxury-feedback-modal">
              <div className="vp-feedback-header">
                <div className="vp-feedback-icon">
                  <FiThumbsUp />
                </div>
                <h2>Share Your Learning Experience</h2>
                <button 
                  className="vp-feedback-close"
                  onClick={() => setShowFeedbackModal(false)}
                >
                  <FiX />
                </button>
              </div>
              
              <div className="vp-feedback-body">
                <p className="vp-feedback-subtitle">Help us create better learning experiences for everyone</p>
                
                <div className="vp-feedback-form">
                  <div className="vp-rating-section">
                    <label className="vp-rating-label">How would you rate this video?</label>
                    <div className="vp-star-container">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          className={`vp-star-btn ${rating >= star ? 'active' : ''}`}
                          onClick={() => setRating(star)}
                        >
                          <FiStar className="vp-star" />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="vp-comment-section">
                    <label className="vp-comment-label">Share your thoughts and suggestions</label>
                    <textarea
                      className="vp-luxury-textarea"
                      placeholder="What did you like about this video? How could we make it better?"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      rows="4"
                    />
                  </div>
                </div>
              </div>
              
              <div className="vp-feedback-footer">
                <button 
                  className="vp-btn-secondary"
                  onClick={() => setShowFeedbackModal(false)}
                >
                  Maybe Later
                </button>
                <button 
                  className="vp-btn-primary"
                  onClick={submitFeedback}
                >
                  <FiThumbsUp />
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
