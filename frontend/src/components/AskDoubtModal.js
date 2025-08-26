import React, { useEffect, useState, useRef } from "react";
import { 
  FiX, FiMic, FiSend, FiMessageCircle, FiMicOff, 
  FiLoader, FiStar, FiZap,  FiCheckCircle 
} from "react-icons/fi";
import { FaBrain } from "react-icons/fa";
import "./AskDoubtModal.css";

export default function AskDoubtModal({ geminiKey, onClose }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "en-IN";
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        setQuestion(spokenText);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (e) => {
        console.error("Speech recognition error:", e);
        setError("Could not process voice input. Please try again.");
        setIsListening(false);
      };
    }
  }, []);

  const handleSpeechInput = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        setError("");
        recognitionRef.current.start();
      }
    } else {
      setError("Speech recognition is not supported in your browser.");
    }
  };

  const handleSubmit = async () => {
    if (!question.trim()) {
      setError("Please enter your question to get started.");
      return;
    }

    setLoading(true);
    setAnswer("");
    setError("");

    try {
      const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": geminiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are Lurnity AI, a premium educational assistant designed to provide comprehensive, accurate, and helpful responses.

SCOPE: Answer questions strictly related to:
- Academic subjects (science, math, coding, programming, engineering, etc.)
- Educational topics and learning strategies
- Career guidance and professional development
- Study techniques and academic planning
- The Lurnity platform, courses, and services
- Technology and software development

STYLE: Provide detailed, well-structured responses with:
- Clear explanations and examples
- Step-by-step guidance when appropriate
- Practical tips and best practices
- Encouraging and supportive tone

RESTRICTIONS: If asked about unrelated topics (personal advice, politics, entertainment, gossip, etc.), politely respond:
"I'm Lurnity AI, specialized in educational and career guidance. Please ask me something related to learning, academics, or your educational journey, and I'll be happy to help!"

Student's Question: "${question}"`
                }
              ]
            }
          ]
        })
      });

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        setAnswer(text);
      } else {
        setError("I couldn't generate a response. Please try rephrasing your question.");
      }
    } catch (err) {
      console.error("Gemini API error:", err);
      setError("Unable to connect to Lurnity AI. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="luxury-doubt-modal-wrapper">
      <div className="ldm-overlay">
        <div className="ldm-backdrop-blur"></div>
        <div className="ldm-container">
          
          {/* Header Section */}
          <div className="ldm-header">
            <div className="ldm-header-glow"></div>
            <div className="ldm-header-content">
              <div className="ldm-brand-section">
                <div className="ldm-brand-icon">
                  <FaBrain className="ldm-brand-svg" />
                  <div className="ldm-brand-glow"></div>
                </div>
                <div className="ldm-brand-content">
                  <h2 className="ldm-title">Lurnity AI</h2>
                  <p className="ldm-subtitle">Your Premium Learning Assistant</p>
                </div>
              </div>
              
              <button className="ldm-close-btn" onClick={onClose} title="Close">
                <FiX className="ldm-close-icon" />
              </button>
            </div>
          </div>

          {/* Input Section */}
          <div className="ldm-input-section">
            <div className="ldm-input-header">
              <div className="ldm-input-label">
                <FiMessageCircle className="ldm-input-icon" />
                <span>Ask Your Question</span>
              </div>
              <div className="ldm-input-features">
                <span className="ldm-feature-badge">
                  <FiZap className="ldm-feature-icon" />
                  AI-Powered
                </span>
                <span className="ldm-feature-badge">
                  <FiStar className="ldm-feature-icon" />
                  Instant Response
                </span>
              </div>
            </div>
            
            <div className="ldm-input-container">
              <textarea
                className="ldm-input"
                placeholder="Ask me anything about your studies, coding, career guidance, or the Lurnity platform..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={4}
                disabled={loading}
              />
              <div className="ldm-input-footer">
                <span className="ldm-input-hint">Press Ctrl + Enter to submit</span>
                <div className="ldm-char-count">
                  {question.length}/500
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="ldm-actions">
            <button 
              className={`ldm-voice-btn ${isListening ? 'listening' : ''}`}
              onClick={handleSpeechInput}
              disabled={loading}
              title={isListening ? "Stop listening" : "Use voice input"}
            >
              {isListening ? (
                <>
                  <FiMicOff className="ldm-voice-icon" />
                  <span className="ldm-voice-text">Listening...</span>
                </>
              ) : (
                <>
                  <FiMic className="ldm-voice-icon" />
                  <span className="ldm-voice-text">Voice Input</span>
                </>
              )}
              {isListening && <div className="ldm-voice-indicator"></div>}
            </button>
            
            <button 
              className="ldm-submit-btn"
              onClick={handleSubmit}
              disabled={loading || !question.trim()}
            >
              {loading ? (
                <>
                  <FiLoader className="ldm-submit-icon loading" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <FiSend className="ldm-submit-icon" />
                  <span>Ask Lurnity AI</span>
                </>
              )}
            </button>
          </div>

          {/* Response Section */}
          {answer && (
            <div className="ldm-response-section">
              <div className="ldm-response-header">
                <div className="ldm-ai-badge">
                  <FaBrain className="ldm-ai-icon" />
                  <span>Lurnity AI Response</span>
                </div>
                <div className="ldm-response-status">
                  <FiCheckCircle className="ldm-status-icon" />
                  <span>Complete</span>
                </div>
              </div>
              
              <div className="ldm-response-container">
                <div className="ldm-response-content">
                  <pre className="ldm-response-text">{answer}</pre>
                </div>
                <div className="ldm-response-footer">
                  <span className="ldm-response-note">
                    Response generated by Lurnity AI • Educational assistance only
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="ldm-error-section">
              <div className="ldm-error-container">
                <div className="ldm-error-icon">⚠️</div>
                <div className="ldm-error-content">
                  <h4 className="ldm-error-title">Something went wrong</h4>
                  <p className="ldm-error-message">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="ldm-footer">
            <div className="ldm-footer-content">
              <div className="ldm-footer-left">
                <span className="ldm-footer-text">Powered by</span>
                <span className="ldm-footer-brand">Gemini AI</span>
              </div>
              <div className="ldm-footer-right">
                <span className="ldm-footer-version">Lurnity AI v2.0</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
