// src/pages/MockInterview.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
   FiPlay, FiPause, FiRefreshCw, FiHeart, 
  FiZap, FiClock, FiFlag, FiShield, FiArrowLeft
} from 'react-icons/fi';
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
  
  // limits
  const [revealCount, setRevealCount] = useState(0);
  const [usedSkip, setUsedSkip] = useState(0);
  const [usedHint, setUsedHint] = useState(0);
  const [hintMessage, setHintMessage] = useState("");

  const [setUsed5050] = useState(false);
  const [reducedOptions, setReducedOptions] = useState(null);

  const timerRef = useRef(null);
  const current = questions[idx];

  // ✅ Fetch questions
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const userRes = await fetch(`${API}/api/homepage`, {
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

  // ✅ Timer
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

  // ✅ Select
  const handleSelectOption = (opt) => {
    if (revealed) return;
    setSelected(opt);
  };

  // ✅ Reveal logic (max 3, no score gain)
  const handleReveal = (manual = true, timeOut = false) => {
    if (!current || revealed || revealCount >= 3) return;

    const isMCQ = Array.isArray(current.options) && current.options.length > 0;
    let isCorrect = false;
    if (isMCQ) {
      isCorrect = selected && current.answer && selected.trim() === current.answer.trim();
    } else {
      isCorrect = !timeOut && manual && !!current.answer;
    }

    // ✅ Score is ONLY based on user answering, NOT reveal
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

  // ✅ Next Question
  const nextQuestion = () => {
    setSelected(null);
    setRevealed(false);
    setReducedOptions(null);
    setHintMessage("");
    if (idx < questions.length - 1) {
      setIdx((i) => i + 1);
    } else {
      alert(`Interview complete! Score: ${score}`);
      onExit && onExit();
    }
  };

  // ✅ Skip (max 2, no score)
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
      onExit && onExit();
    }
  };

  // ✅ Hint (inline display)
  const applyHint = () => {
    if (usedHint >= 2) return;
    setUsedHint(x => x + 1);
    setHintMessage(current?.rationale ? current.rationale.slice(0, 160) + "..." : "No hint available.");
  };

  // ✅ Options
  const visibleOptions = useMemo(() => {
    if (!current?.options) return null;
    if (reducedOptions) return reducedOptions;
    return current.options;
  }, [current, reducedOptions]);

  // ✅ Restart
  const restart = () => {
    setIdx(0); setSelected(null); setRevealed(false); setScore(0);
    setStreak(0); setLives(3); setTimeLeft(45); setIsPaused(false);
    setUsed5050(false); setUsedSkip(0); setUsedHint(0); setHintMessage("");
    setRevealCount(0);
  };

  if (loading) return <div className="mock-interview-wrapper"><div className="mi-loading">Loading questions...</div></div>;

  if (!questions.length) return <div className="mock-interview-wrapper"><p>No Questions Generated</p></div>;

  return (
    <div className="mock-interview-wrapper">
      <div className="mi-card">
        <div className="mi-header">
          <button onClick={() => onExit && onExit()} className="mi-exit"><FiArrowLeft /></button>
          <h3>Mock Interview • {companyName}</h3>
          <div className="mi-stats">
            <span><FiClock /> {timeLeft}s</span>
            <span><FiZap /> {streak}</span>
            <span><FiHeart color={lives > 0 ? "#ff4d6d" : "#bbb"} /> {lives}</span>
            <span><FiShield /> {score}</span>
          </div>
        </div>

        {/* Question */}
        <div className="mi-body">
          <div className="mi-progress-bar"><div style={{ width: `${((idx+1)/questions.length)*100}%` }} /></div>
          <p className="mi-help">{idx+1}/{questions.length}</p>
          <h4 className="mi-question">{current.question}</h4>

          {visibleOptions ? (
            <div className="mi-options">
              {visibleOptions.map((opt) => {
                const isCorrect = revealed && current.answer && opt.trim() === current.answer.trim();
                const isSelected = selected === opt;
                return (
                  <button key={opt} onClick={() => handleSelectOption(opt)} disabled={revealed}
                    className={`mi-opt ${isSelected ? "selected" : ""} ${revealed ? (isCorrect ? "correct":"wrong"):""}`}>
                    {opt}
                  </button>
                );
              })}
            </div>
          ) : (
            <textarea className="mi-textarea" disabled={revealed}
              placeholder="Type your reasoning here..."
              onChange={(e)=>setSelected(e.target.value)} />
          )}

          {/* Actions */}
          <div className="mi-actions">
            <button onClick={() => setIsPaused(p=>!p)}>{isPaused? <FiPlay/> : <FiPause/>} {isPaused? "Resume":"Pause"}</button>
            <button onClick={applySkip} disabled={usedSkip>=2}><FiFlag/> Skip</button>
            <button onClick={applyHint} disabled={usedHint>=2}><FiShield/> Hint</button>
            <button onClick={()=>handleReveal(true)} disabled={revealed || revealCount>=3}>Reveal ({3-revealCount} left)</button>
            <button onClick={nextQuestion} disabled={!revealed}>Next</button>
          </div>

          {hintMessage && <div className="mi-hint"><strong>Hint:</strong> {hintMessage}</div>}
          {revealed && (
            <div className="mi-answer-box">
              <strong>Answer:</strong> {current.answer || "—"}
              {current.rationale && <p><em>{current.rationale}</em></p>}
            </div>
          )}
        </div>

        <div className="mi-footer">
          <button onClick={restart}><FiRefreshCw/> Restart</button>
          <button onClick={() => onExit && onExit()}><FiArrowLeft/> Exit</button>
        </div>
      </div>
    </div>
  );
}
