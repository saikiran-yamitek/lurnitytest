import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { FiTrash2, FiBookmark, FiCheckCircle, FiAlertTriangle, FiHome, FiRefreshCw, } from "react-icons/fi";
import "./SavedQuestions.css";


const API = process.env.REACT_APP_API_URL;

export default function SavedQuestions({ user }) {
  const history = useHistory();
  const wrapperRef = useRef(null);
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState({ show: false, questionId: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchSavedQuestions = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API}/api/user/${user.id}/savedQuestions`, {
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

  const handleDeleteQuestion = async (questionId) => {
    setDeleting(true);
    try {
      const res = await fetch(`${API}/api/user/${user.id}/saved-questions/${questionId}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });

      if (!res.ok) {
        throw new Error("Failed to delete question");
      }

      setSavedQuestions(prev => prev.filter(q => q._id !== questionId));
      setDeleteModal({ show: false, questionId: null });
    } catch (err) {
      console.error("Error deleting question:", err);
      alert("Failed to delete question");
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (questionId) => {
    setDeleteModal({ show: true, questionId });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, questionId: null });
  };

  const retryFetch = () => {
    setError("");
    setLoading(true);
    // Re-trigger useEffect by updating a dependency or call the fetch function directly
    window.location.reload();
  };

  return (
    <div ref={wrapperRef} className="lms-saved-questions-wrapper">
      <div className="lms-saved-questions-container">
        {loading ? (
          <div className="lms-saved-questions-loading">
            <div className="lms-loading-backdrop">
              <div className="lms-loading-aurora"></div>
            </div>
            <div className="lms-loading-content">
              <div className="lms-loading-spinner">
                <div className="lms-spinner-ring"></div>
                <div className="lms-spinner-ring"></div>
                <div className="lms-spinner-ring"></div>
              </div>
              <h3>Loading Your Saved Questions</h3>
              <p>Retrieving your bookmarked practice questions...</p>
            </div>
          </div>
        ) : error ? (
          <div className="lms-error-state">
            <div className="lms-error-backdrop"></div>
            <div className="lms-error-content">
              <div className="lms-error-icon">
                <FiAlertTriangle />
              </div>
              <h3>Unable to Load Questions</h3>
              <p>Error: {error}</p>
              <div className="lms-error-actions">
                <button className="lms-luxury-btn secondary" onClick={retryFetch}>
                  <FiRefreshCw />
                  Retry
                </button>
                <button className="lms-luxury-btn primary" onClick={() => history.push("/home")}>
                  <FiHome />
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Header Section */}
            <section className="lms-saved-questions-hero">
              <div className="lms-hero-backdrop">
                <div className="lms-hero-aurora lms-aurora-1"></div>
                <div className="lms-hero-aurora lms-aurora-2"></div>
              </div>
              
              <div className="lms-hero-content">
                <div className="lms-hero-text">
                  <div className="lms-hero-badge">
                    <FiBookmark className="lms-badge-icon" />
                    <span>Knowledge Library</span>
                  </div>
                  <h1 className="lms-hero-title">Saved Questions</h1>
                  <p className="lms-hero-subtitle">
                    Review and revisit your bookmarked practice questions
                  </p>
                </div>
                
                <div className="lms-hero-stats">
                  <div className="lms-stats-card">
                    <div className="lms-stats-number">{savedQuestions.length}</div>
                    <div className="lms-stats-label">Questions Saved</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Content Section */}
            {savedQuestions.length === 0 ? (
              <div className="lms-empty-state">
                <div className="lms-empty-backdrop"></div>
                <div className="lms-empty-content">
                  <div className="lms-empty-icon">
                    <FiBookmark />
                  </div>
                  <h3>No Saved Questions Yet</h3>
                  <p>Start practicing and bookmark questions to build your personal study collection.</p>
                  <button className="lms-luxury-btn primary large" onClick={() => history.push("/home")}>
                    <FiHome />
                    Start Practicing
                  </button>
                </div>
              </div>
            ) : (
              <div className="lms-questions-grid">
                {savedQuestions.map((question, index) => (
                  <div key={question._id} className="lms-question-card">
                    <div className="lms-card-backdrop"></div>
                    
                    <div className="lms-card-header">
                      <div className="lms-question-number">
                        Question {index + 1}
                      </div>
                      <button 
                        className="lms-delete-btn"
                        onClick={() => openDeleteModal(question._id)}
                        title="Remove from saved questions"
                      >
                        <FiTrash2 />
                      </button>
                    </div>

                    <div className="lms-card-content">
                      <div className="lms-question-text">
                        <h3>{question.question}</h3>
                      </div>

                      <div className="lms-answer-section">
                        <div className="lms-answer-header">
                          <FiCheckCircle className="lms-answer-icon" />
                          <span className="lms-answer-label">Correct Answer</span>
                        </div>
                        <div className="lms-answer-content">
                          <p>{question.correctAnswer}</p>
                        </div>
                      </div>

                      {question.explanation && (
                        <div className="lms-explanation-section">
                          <div className="lms-explanation-header">
                            <span className="lms-explanation-label">Explanation</span>
                          </div>
                          <div className="lms-explanation-content">
                            <p>{question.explanation}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Delete Modal */}
            {deleteModal.show && (
              <div className="lms-delete-modal-overlay">
                <div className="lms-delete-modal">
                  <div className="lms-modal-backdrop"></div>
                  <div className="lms-modal-content">
                    <div className="lms-modal-header">
                      <div className="lms-modal-icon">
                        <FiTrash2 />
                      </div>
                      <h3>Remove Question</h3>
                      <p>Are you sure you want to remove this question from your saved collection?</p>
                    </div>
                    
                    <div className="lms-modal-actions">
                      <button 
                        className="lms-luxury-btn secondary"
                        onClick={closeDeleteModal}
                        disabled={deleting}
                      >
                        Cancel
                      </button>
                      <button 
                        className="lms-luxury-btn danger"
                        onClick={() => handleDeleteQuestion(deleteModal.questionId)}
                        disabled={deleting}
                      >
                        {deleting ? (
                          <>
                            <div className="lms-btn-spinner"></div>
                            Removing...
                          </>
                        ) : (
                          <>
                            <FiTrash2 />
                            Remove
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
