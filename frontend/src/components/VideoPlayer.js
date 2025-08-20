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
  FiX
} from "react-icons/fi";
import { TbLayoutSidebarLeftCollapse, TbLayoutSidebarLeftExpand } from "react-icons/tb";

const API = "http://localhost:7700";
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
    fetch(`${API}/api/gemini/save-key`, {
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

  if (err) return (
    <div className="video-player-wrapper">
      <div className="modern-error">
        <div className="error-content">
          <h2>Something went wrong</h2>
          <p>{err}</p>
        </div>
      </div>
    </div>
  );
  
  if (!course) return (
    <div className="video-player-wrapper">
      <div className="modern-loading">
        <div className="loading-spinner"></div>
        <span>Loading your content...</span>
      </div>
    </div>
  );

  const sub = course.subCourses[sIdx];
  const vid = sub.videos[vIdx];

  const play = (i) => history.replace(`/watch/${courseId}/${sIdx}/${i}`);

  return (
    <div className="video-player-wrapper">
      <div className="modern-vp-root">
        {/* Modern Header */}
        <header className="modern-vp-header">
          <div className="header-glow"></div>
          <div className="header-content">
            <div className="header-left">
              <div className="logo-container">
                <img
                  src={logo}
                  alt="Lurnity"
                  className="modern-vp-logo"
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
                <span>{localStorage.getItem("userName") || "User"}</span>
              </div>
            </nav>
          </div>
        </header>

        <div className="modern-vp-body">
          {/* Modern Sidebar */}
          {showList ? (
            <aside className="modern-vp-playlist">
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
                    <div
                      key={i}
                      className={`playlist-item ${i === vIdx ? 'active' : ''}`}
                      onClick={() => play(i)}
                    >
                      <div className="item-icon">
                        <FiPlayCircle />
                      </div>
                      <span className="item-title">{v.title}</span>
                      {i < vIdx && <FiCheckCircle className="completed-icon" />}
                      <div className="item-glow"></div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          ) : (
            <button className="modern-expand-btn" onClick={() => setShow(true)}>
              <TbLayoutSidebarLeftExpand />
              <div className="expand-glow"></div>
            </button>
          )}

          {/* Modern Player Area */}
          <main className={`modern-vp-player ${!showList ? 'full-width' : ''}`}>
            <div className="player-content">
              <div className="video-header">
                <h1 className="video-title">{vid.title}</h1>
                <div className="video-meta">
                  <span className="video-number">Video {vIdx + 1} of {sub.videos.length}</span>
                </div>
              </div>
              
              <div className="video-container">
                <video
                  src={vid.url}
                  controls
                  className="modern-video"
                  onEnded={markWatched}
                  onPause={handlePause}
                  onPlay={handlePlay}
                />
                <div className="video-overlay"></div>
              </div>

              <div className="action-buttons">
                <button className="action-btn primary" onClick={askDoubt}>
                  <FiHelpCircle className="btn-icon" />
                  <span>Ask a Doubt</span>
                  <div className="btn-glow"></div>
                </button>
                
                <button className="action-btn secondary" onClick={() => setShowFeedbackModal(true)}>
                  <FiMessageSquare className="btn-icon" />
                  <span>Give Feedback</span>
                  <div className="btn-glow"></div>
                </button>
              </div>
            </div>
          </main>
        </div>

        {/* Modern Modals */}
        {showDoubtModal && (
          <AskDoubtModal
            geminiKey={geminiKey}
            onClose={() => setShowDoubtModal(false)}
          />
        )}

        {showKeyModal && (
          <div className="modern-modal-overlay">
            <div className="modal-backdrop" onClick={() => setShowKeyModal(false)}></div>
            <div className="modern-modal">
              <div className="modal-glow"></div>
              <div className="modal-content">
                <h2>🚀 Ready to Learn Smarter?</h2>
                <p>Enter your Gemini API key to unlock AI-powered doubt solving!</p>
                
                <div className="input-group">
                  <input
                    className="modern-input"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="Paste your Gemini API key here..."
                  />
                </div>
                
                <div className="modal-buttons">
                  <button onClick={saveGeminiKey} className="btn-primary">
                    <span>Save & Continue</span>
                    <div className="btn-glow"></div>
                  </button>
                  <button onClick={() => setShowKeyModal(false)} className="btn-secondary">
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NEW FEEDBACK MODAL WITH UNIQUE CLASS NAMES */}
        {showFeedbackModal && (
          <div className="feedback-popup-overlay">
            <div className="feedback-popup-backdrop" onClick={() => setShowFeedbackModal(false)}></div>
            <div className="feedback-popup-container">
              <div className="feedback-popup-glow"></div>
              
              <div className="feedback-popup-header">
                <h2 className="feedback-popup-title">🎯 Share Your Feedback</h2>
                <button 
                  className="feedback-popup-close"
                  onClick={() => setShowFeedbackModal(false)}
                >
                  <FiX />
                </button>
              </div>
              
              <div className="feedback-popup-body">
                <p className="feedback-popup-subtitle">Help us improve your learning experience</p>
                
                <div className="feedback-popup-form">
                  <div className="feedback-rating-container">
                    <label className="feedback-rating-label">How would you rate this video?</label>
                    <div className="feedback-star-container">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          className={`feedback-star ${rating >= star ? 'feedback-star-active' : ''}`}
                          onClick={() => setRating(star)}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="feedback-comment-container">
                    <label className="feedback-comment-label">Your thoughts and suggestions</label>
                    <textarea
                      className="feedback-textarea"
                      placeholder="Share your experience with this video. What did you like? What could be improved?"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      rows="4"
                    />
                  </div>
                </div>
              </div>
              
              <div className="feedback-popup-footer">
                <button 
                  className="feedback-submit-btn"
                  onClick={submitFeedback}
                >
                  <span>Submit Feedback</span>
                </button>
                <button 
                  className="feedback-cancel-btn"
                  onClick={() => setShowFeedbackModal(false)}
                >
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}