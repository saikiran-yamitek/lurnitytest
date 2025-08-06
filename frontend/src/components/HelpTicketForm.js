import React, { useState } from "react";
import { createTicket } from "../services/ticketApi";
import './HelpTicketForm.css';

export default function HelpTicketForm({ user, onClose }) {
  const [form, setForm] = useState({
    category: "Technical issue",
    priority: "Low",
    subject: "",
    description: "",
    attachment: "",
    deviceInfo: navigator.userAgent
  });
  const [saving, setSaving] = useState(false);
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
      <div className="ticket-box" onClick={e => e.stopPropagation()}>
        <button className="ticket-close-btn" onClick={onClose}>
          &times;
        </button>
        <h3>Raise a Ticket</h3>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={handle("category")}>
              <option>Technical issue</option>
              <option>Payment related</option>
              <option>Login</option>
              <option>Bug report</option>
              <option>Feedback</option>
              <option>Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Priority</label>
            <select value={form.priority} onChange={handle("priority")}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          <div className="form-group">
            <label>Subject *</label>
            <input
              placeholder="Subject / Title"
              value={form.subject}
              onChange={handle("subject")}
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              rows="4"
              placeholder="Describe your issue in detail"
              value={form.description}
              onChange={handle("description")}
              required
            />
          </div>

          <div className="form-group">
            <label>Attachment URL (optional)</label>
            <input
              placeholder="Paste file URL here"
              value={form.attachment}
              onChange={handle("attachment")}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={saving}>
            {saving ? "Submitting..." : "Submit Ticket"}
          </button>
        </form>

        {showSuccess && (
          <div className="success-modal">
            <div className="success-content">
              <h4>🎉 Ticket Raised Successfully!</h4>
              <p>Our support team is on it. You'll hear back shortly.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}