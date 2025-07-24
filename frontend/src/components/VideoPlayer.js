import React, { useEffect, useState } from "react";
import { useParams, useHistory, Link } from "react-router-dom";
import "./VideoPlayer.css";
import "bootstrap/dist/css/bootstrap.min.css";
import AskDoubtModal from "../components/AskDoubtModal";

import logo from "../assets/LURNITY.jpg";
import { FiPlayCircle, FiChevronLeft, FiCode } from "react-icons/fi";
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

  if (err) return <pre className="error">{err}</pre>;
  if (!course) return <div className="loading">Loading…</div>;

  const sub = course.subCourses[sIdx];
  const vid = sub.videos[vIdx];

  const play = (i) => history.replace(`/watch/${courseId}/${sIdx}/${i}`);

  return (
    <div className="vp-root">
      <header className="vp-header">
        <img
          src={logo}
          alt="Lurnity"
          className="vp-logo"
          onClick={() => history.push("/home")}
        />
        <div className="vp-right-links">
          <Link to="/home" className="vp-nav-link">Home</Link>
          <span className="vp-divider">|</span>
          <Link to="/sandbox" className="vp-nav-link"><FiCode /> CodeSandbox</Link>
          <span className="vp-divider">|</span>
          <span className="vp-user">{localStorage.getItem("userName") || "User"}</span>
        </div>
      </header>

      <div className="vp-body">
        {showList ? (
          <aside className="vp-playlist">
            <div className="vp-sub-header">
              <FiChevronLeft className="vp-back" onClick={() => history.push("/home")} />
              <p className="vp-playlist-title">CONTENTS</p>
              <TbLayoutSidebarLeftCollapse className="vp-close" onClick={() => setShow(false)} />
            </div>
            <div className="vp-scroll">
              {sub.videos.map((v, i) => (
                <div
                  key={i}
                  className={i === vIdx ? "vp-row active" : "vp-row"}
                  onClick={() => play(i)}
                >
                  <FiPlayCircle className="me-2" /> {v.title}
                </div>
              ))}
            </div>
          </aside>
        ) : (
          <button className="vp-open" onClick={() => setShow(true)}>
            <TbLayoutSidebarLeftExpand size={22} />
          </button>
        )}

        <main className={showList ? "vp-player" : "vp-player full"}>
          <h3 className="vp-video-title">{vid.title}</h3>
          <video
            src={vid.url}
            controls
            width="100%"
            className="vp-video"
            onEnded={markWatched}
            onPause={handlePause}
            onPlay={handlePlay}
          />

          <div className="ask-doubt-container">
            <button className="ask-doubt-button" onClick={askDoubt}>
              💡 Ask a Doubt
            </button>
          </div>
        </main>
      </div>

      {showDoubtModal && (
        <AskDoubtModal
          geminiKey={geminiKey}
          onClose={() => setShowDoubtModal(false)}
        />
      )}

      {showKeyModal && (
        <div className="gemini-key-modal-overlay">
          <div className="gemini-key-modal">
            <h2>🚀 Ready to Learn Smarter?</h2>
            <p>Enter your Gemini API key to unlock AI-powered doubt solving!</p>
            <input
              className="gemini-input"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="Paste your Gemini API key here..."
            />
            <div className="gemini-buttons">
              <button onClick={saveGeminiKey} className="submit-btn">Save</button>
              <button onClick={() => setShowKeyModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
