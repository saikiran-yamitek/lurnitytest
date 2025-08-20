import React, { useEffect, useState } from "react";
import { FiZap, FiCalendar, FiTrendingUp } from "react-icons/fi";
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

  return (
    <div className="streak-container">
      {/* Main Streak Card */}
      <div className="streak-card">
        <div className="streak-header">
          <div className="streak-icon-wrapper">
            <FiZap className="streak-icon" />
          </div>
          <div className="streak-info">
            <span className="streak-label">Learning Streak</span>
            <div className="streak-number">
              <span className="streak-count">{streak.current}</span>
              <span className="streak-days">Day{streak.current !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
        
        <div className="streak-visual">
          <div className="streak-emoji">{getStreakEmoji(streak.current)}</div>
          <div className="streak-progress-ring">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path
                className="circle-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="circle"
                strokeDasharray={`${Math.min(streak.current * 3, 100)}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="streak-stats">
        <div className="stat-card">
          <FiTrendingUp className="stat-icon" />
          <div className="stat-info">
            <span className="stat-number">{streak.max}</span>
            <span className="stat-label">Best Streak</span>
          </div>
        </div>
        
        <div className="stat-card">
          <FiCalendar className="stat-icon" />
          <div className="stat-info">
            <span className="stat-number">{watched.length}</span>
            <span className="stat-label">Total Activities</span>
          </div>
        </div>
      </div>

      

      {/* SVG Gradient Definition */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <linearGradient id="streakGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF9500" />
            <stop offset="100%" stopColor="#FFB347" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}