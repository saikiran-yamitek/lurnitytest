// src/components/admin/AdminTickets.js
import React, { useEffect, useState } from "react";
import {
  listTickets,
  updateTicket,
  deleteTicket
} from "../../services/adminApi";

import {
  FiTrash2,
  FiRefreshCw,
  FiHeadphones,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiUser,
  FiMail,
  FiTag,
  FiFlag,
  FiMessageSquare,
  FiActivity
} from "react-icons/fi";

import "./AdminTickets.css";

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const ticketData = await listTickets();
        setTickets(ticketData);
      } catch (error) {
        console.error("Failed to fetch tickets:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const del = async (t) => {
    if (!window.confirm("Are you sure you want to delete this ticket permanently?")) return;
    try {
      await deleteTicket(t.id);
      setTickets((p) => p.filter((x) => x._id !== t.id));
    } catch (error) {
      console.error("Failed to delete ticket:", error);
    }
  };

  const reopen = async (t) => {
    try {
      await updateTicket(t.id, { status: "Open", closedBy: "", resolutionNote: "" });
      setTickets((p) =>
        p.map((x) => (x._id === t.id ? { ...x, status: "Open" } : x))
      );
      setActiveTab('pending');
    } catch (error) {
      console.error("Failed to reopen ticket:", error);
    }
  };

  const pendingList = tickets.filter((t) => t.status !== "Resolved");
  const resolvedList = tickets.filter((t) => t.status === "Resolved");

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return <FiFlag />;
      case 'medium':
        return <FiAlertCircle />;
      case 'low':
        return <FiClock />;
      default:
        return <FiFlag />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'technical':
        return <FiActivity />;
      case 'billing':
        return <FiUser />;
      case 'general':
        return <FiMessageSquare />;
      default:
        return <FiTag />;
    }
  };

  if (loading) {
    return (
      <div className="tickets-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tickets-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-container">
          <FiHeadphones className="page-icon" />
          <h1 className="page-titlepo">Support Tickets</h1>
        </div>
        <p className="page-subtitle">Manage customer support requests and issues</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon pending">
            <FiClock />
          </div>
          <div className="stat-content">
            <h3>{pendingList.length}</h3>
            <p>Pending Tickets</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon resolved">
            <FiCheckCircle />
          </div>
          <div className="stat-content">
            <h3>{resolvedList.length}</h3>
            <p>Resolved Tickets</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon total">
            <FiHeadphones />
          </div>
          <div className="stat-content">
            <h3>{tickets.length}</h3>
            <p>Total Tickets</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tickets-tabs">
        <button
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <FiClock />
          Pending ({pendingList.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'resolved' ? 'active' : ''}`}
          onClick={() => setActiveTab('resolved')}
        >
          <FiCheckCircle />
          Resolved ({resolvedList.length})
        </button>
      </div>

      {/* Tickets List */}
      <div className="tickets-card">
        <div className="tickets-container">
          {(activeTab === 'pending' ? pendingList : resolvedList).length === 0 ? (
            <div className="empty-state">
              {activeTab === 'pending' ? (
                <>
                  <FiClock className="empty-state-icon" />
                  <h3>No pending tickets</h3>
                  <p>All tickets have been resolved. Great work!</p>
                </>
              ) : (
                <>
                  <FiCheckCircle className="empty-state-icon" />
                  <h3>No resolved tickets</h3>
                  <p>Resolved tickets will appear here once you start closing them.</p>
                </>
              )}
            </div>
          ) : (
            <div className="tickets-list">
              {(activeTab === 'pending' ? pendingList : resolvedList).map((t, index) => (
                <div key={t.id} className="ticket-item" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="ticket-header">
                    <div className="ticket-info">
                      <div className="ticket-subject">
                        <FiMessageSquare className="subject-icon" />
                        {t.subject}
                      </div>
                      <div className="ticket-user">
                        <FiMail className="user-icon" />
                        {t.userEmail}
                      </div>
                    </div>
                    <div className="ticket-actions">
                      {t.status === "Resolved" && (
                        <button
                          className="action-btn reopen-btn"
                          onClick={() => reopen(t)}
                          title="Reopen ticket"
                        >
                          <FiRefreshCw />
                        </button>
                      )}
                      <button
                        className="action-btn delete-btn"
                        onClick={() => del(t)}
                        title="Delete ticket"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>

                  <div className="ticket-badges">
                    <span className={`category-badge ${t.category?.toLowerCase()}`}>
                      {getCategoryIcon(t.category)}
                      {t.category}
                    </span>
                    <span className={`priority-badge ${t.priority?.toLowerCase()}`}>
                      {getPriorityIcon(t.priority)}
                      {t.priority} Priority
                    </span>
                    <span className={`status-badge ${t.status?.toLowerCase()}`}>
                      {t.status === "Resolved" ? <FiCheckCircle /> : <FiClock />}
                      {t.status}
                    </span>
                  </div>

                  <div className="ticket-description">
                    <p>{t.description}</p>
                  </div>

                  {t.status === "Resolved" && (
                    <div className="resolution-info">
                      <div className="resolution-header">
                        <FiCheckCircle className="resolution-icon" />
                        <span>Resolution</span>
                      </div>
                      <div className="resolution-content">
                        <div className="resolved-by">
                          <strong>Resolved by:</strong> {t.closedBy || "Unknown"}
                        </div>
                        <div className="resolution-note">
                          <strong>Note:</strong> {t.resolutionNote || "No additional notes provided."}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
