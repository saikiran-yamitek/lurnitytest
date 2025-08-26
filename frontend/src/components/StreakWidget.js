import React, { useEffect, useState } from "react";
import { 
  FiZap, FiCalendar, FiTrendingUp, FiStar, FiTarget, 
  FiActivity, FiAward,  
} from "react-icons/fi";
import { FaFire } from "react-icons/fa";
import './StreakWidget.css'

export default function StreakWidget({ watched }) {
  const [streak, setStreak] = useState({
    current: 0,
    lastWatched: null,
    max: 0
  });

  useEffect(() => {
    if (watched.length === 0) return;

    const stored = JSON.parse(localStorage.getItem("userStreak")) || {
      current: 0,
      lastWatched: null,
      max: 0
    };

    const today = new Date().toDateString();
    const lastWatchedDate = stored.lastWatched;

    if (lastWatchedDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toDateString();

      let updatedStreak;
      if (lastWatchedDate === yesterdayString) {
        updatedStreak = stored.current + 1;
      } else {
        updatedStreak = 1;
      }

      const newMax = Math.max(stored.max, updatedStreak);

      const newData = {
        current: updatedStreak,
        lastWatched: today,
        max: newMax
      };

      setStreak(newData);
      localStorage.setItem("userStreak", JSON.stringify(newData));
    } else {
      setStreak(stored);
    }
  }, [watched]);

  const getStreakEmoji = (days) => {
    if (days === 0) return "🌱";
    if (days < 7) return "🔥";
    if (days < 30) return "⚡";
    if (days < 100) return "🚀";
    return "👑";
  };

  const getStreakIcon = (days) => {
    if (days === 0) return FiStar;
    if (days < 7) return FaFire;
    if (days < 30) return FiZap;
    if (days < 100) return FiTarget;
    return FiAward;
  };

  const getStreakTitle = (days) => {
    if (days === 0) return "Getting Started";
    if (days < 7) return "Building Momentum";
    if (days < 30) return "On Fire!";
    if (days < 100) return "Unstoppable";
    return "Legendary";
  };

  const getMotivationalMessage = (days) => {
    if (days === 0) return "Start your learning journey!";
    if (days < 7) return "Great progress! Keep it up!";
    if (days < 30) return "You're on a roll! Amazing work!";
    if (days < 100) return "Incredible dedication! You're a superstar!";
    return "You're a true learning champion!";
  };

  const StreakIcon = getStreakIcon(streak.current);

  return (
    <div className="luxury-streak-widget-wrapper">
      <div className="lsw-container">
        <div className="lsw-background-glow"></div>
        
        {/* Header */}
        <div className="lsw-header">
          <div className="lsw-header-icon-wrapper">
            <StreakIcon className="lsw-header-icon" />
            <div className="lsw-header-icon-glow"></div>
          </div>
          <div className="lsw-header-content">
            <h3 className="lsw-header-title">Learning Streak</h3>
            <p className="lsw-header-subtitle">{getStreakTitle(streak.current)}</p>
          </div>
        </div>

        {/* Main Streak Card */}
        <div className="lsw-streak-card">
          <div className="lsw-streak-glass"></div>
          
          <div className="lsw-streak-content">
            <div className="lsw-streak-main">
              <div className="lsw-streak-visual">
                <div className="lsw-streak-emoji-wrapper">
                  <span className="lsw-streak-emoji">{getStreakEmoji(streak.current)}</span>
                  <div className="lsw-emoji-glow"></div>
                </div>
                
                <div className="lsw-progress-ring-wrapper">
                  <svg viewBox="0 0 100 100" className="lsw-progress-ring">
                    <circle
                      className="lsw-progress-track"
                      cx="50"
                      cy="50"
                      r="45"
                    />
                    <circle
                      className="lsw-progress-bar"
                      cx="50"
                      cy="50"
                      r="45"
                      strokeDasharray={`${Math.min(streak.current * 5, 283)} 283`}
                    />
                  </svg>
                  <div className="lsw-progress-content">
                    <span className="lsw-progress-number">{streak.current}</span>
                  </div>
                </div>
              </div>
              
              <div className="lsw-streak-info">
                <div className="lsw-streak-number-section">
                  <div className="lsw-streak-count">
                    <span className="lsw-count-number">{streak.current}</span>
                    <span className="lsw-count-label">Day{streak.current !== 1 ? 's' : ''}</span>
                  </div>
                  <p className="lsw-motivational-message">
                    {getMotivationalMessage(streak.current)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="lsw-stats-grid">
          <div className="lsw-stat-card best-streak">
            <div className="lsw-stat-glass"></div>
            <div className="lsw-stat-content">
              <div className="lsw-stat-icon-wrapper">
                <FiTrendingUp className="lsw-stat-icon" />
              </div>
              <div className="lsw-stat-info">
                <span className="lsw-stat-number">{streak.max}</span>
                <span className="lsw-stat-label">Best Streak</span>
              </div>
            </div>
          </div>
          
          <div className="lsw-stat-card total-activities">
            <div className="lsw-stat-glass"></div>
            <div className="lsw-stat-content">
              <div className="lsw-stat-icon-wrapper">
                <FiActivity className="lsw-stat-icon" />
              </div>
              <div className="lsw-stat-info">
                <span className="lsw-stat-number">{watched.length}</span>
                <span className="lsw-stat-label">Activities</span>
              </div>
            </div>
          </div>
        </div>

        {/* Achievement Badge */}
        {streak.current >= 7 && (
          <div className="lsw-achievement-badge">
            <div className="lsw-achievement-glass"></div>
            <div className="lsw-achievement-content">
              <FiAward className="lsw-achievement-icon" />
              <div className="lsw-achievement-text">
                <span className="lsw-achievement-title">Achievement Unlocked!</span>
                <span className="lsw-achievement-desc">
                  {streak.current >= 100 ? "Legendary Learner" :
                   streak.current >= 30 ? "Learning Machine" :
                   "Consistent Learner"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Message */}
        <div className="lsw-footer">
          <div className="lsw-footer-content">
            <FiCalendar className="lsw-footer-icon" />
            <span className="lsw-footer-text">
              Keep learning daily to maintain your streak!
            </span>
          </div>
        </div>
      </div>

      {/* SVG Gradient Definitions */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <linearGradient id="lswStreakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4af37" />
            <stop offset="50%" stopColor="#e6c547" />
            <stop offset="100%" stopColor="#f4e4b3" />
          </linearGradient>
          <radialGradient id="lswGlowGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(212, 175, 55, 0.3)" />
            <stop offset="100%" stopColor="rgba(212, 175, 55, 0)" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
