// src/components/admin/AdminWorkshops.js
import React, { useEffect, useState } from "react";
import { 
  FiEdit, 
  FiTrash2, 
  FiUser, 
  FiUsers, 
  FiX, 
  FiSettings,
  FiMapPin,
  FiClock,
  FiUserCheck,
  FiCalendar,
  FiActivity,
  FiBook
} from "react-icons/fi";
import { listWorkshops } from "../../services/workshopApi";
import { listEmployees } from "../../services/adminApi";
import "./AdminWorkshops.css";
const API = process.env.REACT_APP_API_URL;

export default function AdminWorkshops() {
  const [workshops, setWorkshops] = useState([]);
  const [incharges, setIncharges] = useState([]);
  const [editWorkshop, setEditWorkshop] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
 const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [showStudentPopup, setShowStudentPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [w, e] = await Promise.all([listWorkshops(), listEmployees()]);
        setIncharges(e.filter(emp => emp.role === "lab incharge"));
        setWorkshops(w);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this workshop?")) return;

    try {
      await fetch(`${API}/api/workshops/${id}`, { method: "DELETE" });
      setWorkshops(workshops.filter(w => w.id !== id));
    } catch (error) {
      console.error("Failed to delete workshop:", error);
      alert("Failed to delete workshop. Please try again.");
    }
  };

  const handleUpdate = async () => {
    if (!editWorkshop.labName || !editWorkshop.labAddress || !editWorkshop.time) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`${API}/api/workshops/${editWorkshop.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editWorkshop),
      });
      const updated = await res.json();
      setWorkshops((prev) =>
        prev.map((w) => (w.id === updated.id ? updated : w))
      );
      setEditWorkshop(null);
    } catch (err) {
      console.error("Failed to update workshop:", err);
      alert("Failed to update workshop. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleViewStudents = async (workshopId) => {
  try {
    const res = await fetch(`${API}/api/workshops/${workshopId}/students`);
    const data = await res.json();
    setSelectedStudents(Array.isArray(data) ? data : []);
    setSelectedWorkshop(workshopId); // now safe
    setShowStudentPopup(true);
  } catch (err) {
    console.error("Failed to fetch students:", err);
    alert("Failed to fetch registered students. Please try again.");
  }
};


  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", { 
        year: "numeric", 
        month: "short", 
        day: "numeric" 
      }),
      time: date.toLocaleTimeString("en-US", { 
        hour: "2-digit", 
        minute: "2-digit" 
      })
    };
  };

  if (loading) {
    return (
      <div className="workshops-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading workshops...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="workshops-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-container">
          <FiSettings className="page-icon" />
          <h1 className="page-titlepo">Workshop Management</h1>
        </div>
        <p className="page-subtitle">Manage lab workshops and student registrations</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <FiBook />
          </div>
          <div className="stat-content">
            <h3>{workshops.length}</h3>
            <p>Total Workshops</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <FiActivity />
          </div>
          <div className="stat-content">
            <h3>{workshops.filter(w => new Date(w.time) > new Date()).length}</h3>
            <p>Upcoming</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon registered">
            <FiUsers />
          </div>
          <div className="stat-content">
            <h3>{workshops.reduce((sum, w) => sum + (w.registeredStudents?.length || 0), 0)}</h3>
            <p>Total Registrations</p>
          </div>
        </div>
      </div>

      {/* Workshops Grid */}
      <div className="workshops-container">
        {workshops.length === 0 ? (
          <div className="empty-state">
            <FiBook className="empty-state-icon" />
            <h3>No workshops scheduled</h3>
            <p>Workshops will appear here once they are scheduled</p>
          </div>
        ) : (
          <div className="workshops-grid">
            {workshops.map((w, index) => {
              const registered = w.registeredStudents?.length || 0;
              const { date, time } = formatDateTime(w.time);
              const isUpcoming = new Date(w.time) > new Date();

              return (
                <div 
                  key={w.id} 
                  className={`workshop-card ${isUpcoming ? "upcoming" : "past"}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="workshop-header">
                    <div className="workshop-title">
                      <FiBook className="title-icon" />
                      <h3>{w.labName}</h3>
                    </div>
                    <div className="workshop-actions">
                      <button 
                        className="action-btn edit-btn" 
                        onClick={() => setEditWorkshop(w)}
                        title="Edit Workshop"
                      >
                        <FiEdit />
                      </button>
                      <button 
                        className="action-btn delete-btn" 
                        onClick={() => handleDelete(w.id)}
                        title="Delete Workshop"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>

                  <div className="workshop-content">
                    <div className="workshop-info">
                      <div className="info-item">
                        <FiMapPin className="info-icon" />
                        <div className="info-content">
                          <span className="info-label">Address</span>
                          <span className="info-value">{w.labAddress}</span>
                        </div>
                      </div>

                      <div className="info-item">
                        <FiCalendar className="info-icon" />
                        <div className="info-content">
                          <span className="info-label">Date</span>
                          <span className="info-value">{date}</span>
                        </div>
                      </div>

                      <div className="info-item">
                        <FiClock className="info-icon" />
                        <div className="info-content">
                          <span className="info-label">Time</span>
                          <span className="info-value">{time}</span>
                        </div>
                      </div>

                      <div className="info-item">
                        <FiUserCheck className="info-icon" />
                        <div className="info-content">
                          <span className="info-label">Incharge</span>
                          <span className="info-value">
                            {w.inchargeId && typeof w.inchargeId === "object"
                              ? w.inchargeId?.name
                              : incharges.find(i => i.id === w.inchargeId)?.name || "Not assigned"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="workshop-stats">
                      <div className="stat-item">
                        <span className="stat-number">{registered}</span>
                        <span className="stat-label">Registered Students</span>
                      </div>
                    </div>

                    <button 
                      className="view-students-btn" 
                      onClick={() => handleViewStudents(w.id)}
                    >
                      <FiUsers />
                      View Registered Students
                    </button>
                  </div>

                  {isUpcoming && (
                    <div className="upcoming-badge">
                      <FiClock />
                      Upcoming
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Workshop Modal */}
      {editWorkshop && (
        <div className="modal-backdrop">
          <div className="modal-card edit-modal">
            {saving && (
              <div className="saving-overlay">
                <div className="saving-content">
                  <div className="saving-spinner"></div>
                  <p>Updating workshop...</p>
                </div>
              </div>
            )}

            <div className="modal-header">
              <h3>
                <FiEdit className="modal-icon" />
                Edit Workshop
              </h3>
              <button 
                className="close-btn" 
                onClick={() => setEditWorkshop(null)}
              >
                <FiX />
              </button>
            </div>

            <div className="modal-content">
              <div className="form-group">
                <label className="form-label">
                  <FiBook className="label-icon" />
                  Lab Name *
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter lab name"
                  value={editWorkshop.labName}
                  onChange={(e) =>
                    setEditWorkshop({ ...editWorkshop, labName: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FiMapPin className="label-icon" />
                  Lab Address *
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter lab address"
                  value={editWorkshop.labAddress}
                  onChange={(e) =>
                    setEditWorkshop({ ...editWorkshop, labAddress: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FiClock className="label-icon" />
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={editWorkshop.time.slice(0, 16)}
                  onChange={(e) =>
                    setEditWorkshop({ ...editWorkshop, time: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="modal-btn cancel-btn" 
                onClick={() => setEditWorkshop(null)}
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                className="modal-btn save-btn" 
                onClick={handleUpdate}
                disabled={saving}
              >
                <FiEdit />
                {saving ? "Updating..." : "Update Workshop"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Students Modal */}
      {showStudentPopup && (
        <div className="modal-backdrop">
          <div className="modal-card students-modal">
            <div className="modal-header">
              <h3>
                <FiUsers className="modal-icon" />
                Registered Students
              </h3>
              <button 
                className="close-btn" 
                onClick={() => setShowStudentPopup(false)}
              >
                <FiX />
              </button>
            </div>

            <div className="modal-content">
              {selectedStudents.length === 0 ? (
                <div className="empty-students">
                  <FiUsers className="empty-icon" />
                  <h4>No students registered</h4>
                  <p>Students will appear here once they register for this workshop</p>
                </div>
              ) : (
                <div className="students-table-container">
                  <table className="students-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStudents.map((entry, index) => (
                        <tr key={entry.id || index} style={{ animationDelay: `${index * 0.05}s` }}>
                          <td className="student-name">
                            <FiUser className="student-icon" />
                            {entry?.name || "Unknown"}
                          </td>
                          <td className="student-email">{entry?.email || "N/A"}</td>
                          <td className="student-phone">{entry?.phone || "N/A"}</td>
                          <td>
                            <span className="status-badge registered">
                              <FiUserCheck />
                              Registered
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {selectedStudents.length > 0 && (
              <div className="modal-footer">
                <div className="students-count">
                  Total: {selectedStudents.length} registered students
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
