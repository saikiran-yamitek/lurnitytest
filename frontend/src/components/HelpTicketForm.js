import React, { useState } from "react";
import { createTicket } from "../services/ticketApi";

export default function HelpTicketForm({ user, onClose }) {
  const [form, setForm] = useState({
    category:"Technical issue",
    priority:"Low",
    subject:"",
    description:"",
    attachment:"",
    deviceInfo: navigator.userAgent
  });
  const [saving,setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const uid = user?._id || user?.id;

  const handle = k => e => setForm({ ...form, [k]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    await createTicket({
      ...form,
      userId: uid,
      userEmail: user.email
    });
    setShowSuccess(true);
    setSaving(false);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 3000);
  };

  return (
    <div className="ticket-overlay" onClick={onClose}>
      <div className="ticket-box" onClick={e=>e.stopPropagation()}>
        <h3 className="mb-3">Raise a Ticket</h3>
        <form onSubmit={submit} className="d-flex flex-column gap-3">
          <select className="form-select" value={form.category} onChange={handle("category")}>
            <option>Technical issue</option><option>Payment related</option>
            <option>Login</option><option>Bug report</option>
            <option>Feedback</option><option>Other</option>
          </select>
          <select className="form-select" value={form.priority} onChange={handle("priority")}>
            <option>Low</option><option>Medium</option><option>High</option>
          </select>
          <input  className="form-control" placeholder="Subject / Title *"
                  value={form.subject} onChange={handle("subject")} required />
          <textarea className="form-control" rows="4" placeholder="Description *"
                  value={form.description} onChange={handle("description")} required/>
          <input  className="form-control" placeholder="Attachment URL (optional)"
                  value={form.attachment} onChange={handle("attachment")} />
          <button className="btn btn-success" disabled={saving}>
            {saving ? "Submitting…" : "Submit Ticket"}
          </button>
        </form>

        {showSuccess && (
          <div className="ticket-success-modal">
            <div className="ticket-success-card">
              <h4>🎉 Ticket Raised Successfully!</h4>
              <p>Our support team is on it. You’ll hear back shortly. Keep learning, you’re doing great! 🚀</p>
            </div>
          </div>
        )}
      </div>

      {/* Success Modal Styles */}
      <style>{`
        .ticket-success-modal {
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100vh;
          background: rgba(0, 0, 0, 0.3);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease-in-out;
        }

        .ticket-success-card {
          background: rgba(255, 255, 255, 0.85);
          border-radius: 16px;
          padding: 28px 26px;
          max-width: 400px;
          text-align: center;
          box-shadow: 0 8px 30px rgba(0,0,0,0.2);
          backdrop-filter: blur(12px);
          animation: scaleIn 0.4s ease-in-out;
        }

        .ticket-success-card h4 {
          color: #2e7d32;
          margin-bottom: 12px;
        }

        .ticket-success-card p {
          color: #333;
          font-size: 15px;
        }

        @keyframes fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }

        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0 }
          to { transform: scale(1); opacity: 1 }
        }
      `}</style>
    </div>
  );
}
