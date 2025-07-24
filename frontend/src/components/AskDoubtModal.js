import React, { useEffect, useState, useRef } from "react";
import "./AskDoubtModal.css";

export default function AskDoubtModal({ geminiKey, onClose }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const recognitionRef = useRef(null);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "en-IN";
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        setQuestion(spokenText);
      };

      recognitionRef.current.onerror = (e) => {
        console.error("Speech recognition error:", e);
        alert("🎙️ Could not process your voice input.");
      };
    }
  }, []);

  const handleSpeechInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    } else {
      alert("🎤 Speech recognition is not supported in your browser.");
    }
  };

  const handleSubmit = async () => {
    if (!question.trim()) return alert("Please enter your doubt.");

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
          text: `You are Lurnity AI, an educational assistant. 
Only answer questions strictly related to:
- academic subjects (science, math, coding, etc.)
- educational topics
- career and learning guidance
- the Lurnity platform or company

Do NOT answer personal, political, entertainment, or unrelated questions.
If the question is outside these topics, politely respond: 
"I'm designed to assist only with educational and Lurnity-specific topics. Please ask me something relevant."

Here is the student's question: "${question}"`
        }
      ]
    }
  ]
})

      });

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) setAnswer(text);
      else setError("Lurnity AI didn't return a valid response.");
    } catch (err) {
      console.error("Gemini API error:", err);
      setError("Failed to fetch response.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lurnity-modal-overlay">
      <div className="lurnity-modal-glass">
        <div className="lurnity-header">
          <h1>Lurnity AI</h1>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>

        <textarea
          className="lurnity-input"
          placeholder="🚀 Ask anything related to your course..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={6}
        />

        <div className="lurnity-actions">
          <button className="ask-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Thinking..." : "Ask Now"}
          </button>
          <button className="mic-btn" onClick={handleSpeechInput}>
            🎤 Speak
          </button>
        </div>

        {answer && (
          <div className="lurnity-response">
            <h3>🧠 Lurnity AI Says:</h3>
            <div className="response-box">
              <pre>{answer}</pre>
            </div>
          </div>
        )}

        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
}
