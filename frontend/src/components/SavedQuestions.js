import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import "./SavedQuestions.css";

const API = "http://localhost:7700";

export default function SavedQuestions({ user }) {
  const history = useHistory();
  const wrapperRef = useRef(null);
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSavedQuestions = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API}/api/user/${user.id}/saved-questions`, {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to fetch saved questions");
        }

        const data = await res.json();
        setSavedQuestions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching saved questions:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedQuestions();
  }, [user?.id]);

  return (
    <div ref={wrapperRef} className="saved-questions-wrapper">
      {loading ? (
        <div className="saved-questions-loading">
          <div className="loading-spinner"></div>
          <span>Loading your saved questions...</span>
        </div>
      ) : error ? (
        <div className="no-questions-message">
          <p>Error: {error}</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      ) : (
        <div className="saved-questions-container">
          <div className="saved-questions-header">
            <h2>Saved Questions</h2>
            <p>Review your saved practice questions</p>
          </div>

          {savedQuestions.length === 0 ? (
            <div className="no-questions-message">
              <p>You haven't saved any questions yet.</p>
              <button className="btn-primary" onClick={() => history.push("/home")}>
                Go to Practice
              </button>
            </div>
          ) : (
            <div className="questions-list">
              {savedQuestions.map((question) => (
                <div key={question._id} className="question-card">
                  <div className="question-content">
                    <h3>{question.question}</h3>
                    <div className="correct-answer">
                      <span>Correct Answer:</span>
                      <p>{question.correctAnswer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
