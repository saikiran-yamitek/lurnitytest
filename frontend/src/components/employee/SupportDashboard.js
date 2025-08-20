// ✅ Updated SupportDashboard.js with Delete Popup Modal for Feedbacks
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { listTickets, updateTicket } from "../../services/ticketApi";
import { listDemos, markDemoAsBooked } from "../../services/demoApi";
import logo from "../../assets/LURNITY.jpg";
import { FiUser, FiLogOut, FiX, FiSave } from "react-icons/fi";
import "./Layout.css";

export default function SupportDashboard({ emp }) {
  const [activeTab, setActiveTab] = useState("tickets");
  const [tickets, setTickets] = useState([]);
  const [demos, setDemos] = useState([]);
  const [welcome, setWelcome] = useState(true);
  const [modal, setModal] = useState({ open: false, note: "", ticket: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, feedbackId: null });
  const [search, setSearch] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const history = useHistory();
  const [feedbacks, setFeedbacks] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    (async () => {
      setTickets(await listTickets());
      setDemos(await listDemos());
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setTickets(await listTickets());
      setDemos(await listDemos());

      const feedbackRes = await fetch("http://localhost:7700/api/feedback");
      const feedbackJson = await feedbackRes.json();
      setFeedbacks(feedbackJson);

      const courseRes = await fetch("http://localhost:7700/api/courses");
      const courseJson = await courseRes.json();
      setCourses(courseJson);
    })();
  }, []);

  const openModal = (t) => setModal({ open: true, note: "", ticket: t });
  const closeModal = () => setModal({ open: false, note: "", ticket: null });

  const saveResolution = async () => {
    const { ticket, note } = modal;
    if (!note.trim()) return alert("Resolution note required.");

    await updateTicket(ticket._id, {
      status: "Resolved",
      closedBy: emp.name,
      resolutionNote: note.trim()
    });

    await fetch("http://localhost:7700/api/user/setAlert", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: ticket.userEmail,
        alert: true
      })
    });

    setTickets((prev) =>
      prev.map((x) =>
        x._id === ticket._id
          ? { ...x, status: "Resolved", closedBy: emp.name, resolutionNote: note.trim() }
          : x
      )
    );

    closeModal();
    setPopupMessage("✅ Ticket resolved and alert created for the user.");
    setTimeout(() => setPopupMessage(""), 3000);
  };

  const handleMarkBooked = async (id) => {
    try {
      await markDemoAsBooked(id);
      setDemos(await listDemos());
      setPopupMessage("✅ Demo marked as booked");
      setTimeout(() => setPopupMessage(""), 3000);
    } catch (err) {
      alert("❌ Failed to mark demo as booked");
    }
  };

  const doLogout = () => {
    localStorage.removeItem("empInfo");
    history.replace("/employee/login");
  };

  const getCourseDetails = (courseId, subIndex, videoIndex) => {
    const course = courses.find((c) => c._id === courseId);
    if (!course) return {};

    const subCourse = course.subCourses?.[subIndex];
    const video = subCourse?.videos?.[videoIndex];

    return {
      courseTitle: course.title || "Unknown Course",
      subCourseTitle: subCourse?.title || "Unknown SubCourse",
      videoTitle: video?.title || "Unknown Video"
    };
  };

  // Open delete modal
  const openDeleteModal = (id) => {
    setDeleteModal({ open: true, feedbackId: id });
  };

  // Confirm delete
  const confirmDeleteFeedback = async () => {
    const id = deleteModal.feedbackId;
    try {
      const res = await fetch(`http://localhost:7700/api/feedback/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        setFeedbacks((prev) => prev.filter((f) => f._id !== id));
        setPopupMessage("✅ Feedback deleted successfully!");
        setTimeout(() => setPopupMessage(""), 3000);
      } else {
        alert(data.error || "❌ Failed to delete feedback");
      }
    } catch (err) {
      alert("❌ Error deleting feedback");
    } finally {
      setDeleteModal({ open: false, feedbackId: null });
    }
  };

  const openTickets = tickets.filter((t) => t.status !== "Resolved");
  const resolvedTickets = tickets
    .filter((t) => t.status === "Resolved")
    .filter(
      (t) =>
        t.userEmail.toLowerCase().includes(search.toLowerCase()) ||
        t.subject.toLowerCase().includes(search.toLowerCase())
    );

  const bookedDemos = demos.filter((d) => d.booked);
  const newDemos = demos.filter((d) => !d.booked);

  return (
    <div className="cm-shell">
      {/* HEADER */}
      <header className="cm-header shadow-sm">
        <img src={logo} alt="Lurnity" className="cm-logo" />
        <h3 className="cm-title flex-grow-1">Support Desk</h3>
        <div className="d-flex align-items-center gap-3">
          <div className="cm-avatar">
            <FiUser size={20} />
          </div>
          <span className="cm-user">{emp.name}</span>
          <button
            className="cm-logout btn btn-outline-light btn-sm"
            title="Log out"
            onClick={doLogout}
          >
            <FiLogOut />
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="cm-main container-fluid p-4">
        {/* TABS */}
        <div className="tabs mb-4">
          <button className={`tab-btn ${activeTab === "tickets" ? "active" : ""}`} onClick={() => setActiveTab("tickets")}>Tickets</button>
          <button className={`tab-btn ${activeTab === "demos" ? "active" : ""}`} onClick={() => setActiveTab("demos")}>Demos</button>
          <button className={`tab-btn ${activeTab === "feedbacks" ? "active" : ""}`} onClick={() => setActiveTab("feedbacks")}>Feedbacks</button>
        </div>

        {/* TICKETS TAB */}
        {activeTab === "tickets" && (
          <>
            <h4 className="fw-semibold mb-4">Open Tickets</h4>
            <div className="list-group feedback-section">
              {openTickets.map((t) => (
                <div key={t._id} className="list-group-item">
                  <div className="d-flex justify-content-between">
                    <strong>{t.subject}</strong>
                    <span className="badge bg-warning text-dark">{t.priority}</span>
                  </div>
                  <small className="text-muted">{t.category} • {t.userEmail}</small>
                  <p className="mt-2 mb-3">{t.description}</p>
                  <button className="btn btn-sm btn-success" onClick={() => openModal(t)}>
                    Mark Resolved
                  </button>
                </div>
              ))}
              {openTickets.length === 0 && (
                <div className="text-muted p-4 text-center">No open tickets</div>
              )}
            </div>

            <hr className="my-5" />
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-semibold mb-0">Recently Resolved</h5>
              <input
                className="form-control w-auto"
                style={{ maxWidth: 260 }}
                placeholder="Search by email / subject"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="list-group">
              {resolvedTickets.map((t) => (
                <div key={t._id} className="list-group-item">
                  <div className="d-flex justify-content-between">
                    <strong>{t.subject}</strong>
                    <small className="text-muted">Closed by {t.closedBy}</small>
                  </div>
                  <small className="text-muted">{t.userEmail}</small>
                  {t.resolutionNote && (
                    <p className="mb-0 mt-2" title={t.resolutionNote}>
                      <em>
                        {t.resolutionNote.length > 80
                          ? t.resolutionNote.slice(0, 80) + "…"
                          : t.resolutionNote}
                      </em>
                    </p>
                  )}
                </div>
              ))}
              {resolvedTickets.length === 0 && (
                <div className="text-muted p-4 text-center">No matches</div>
              )}
            </div>
          </>
        )}

        {/* DEMOS TAB */}
        {activeTab === "demos" && (
          <>
            <h4 className="fw-semibold mb-3">New Demo Requests</h4>
            <div className="list-group mb-5">
              {newDemos.map((demo) => (
                <div key={demo._id} className="list-group-item">
                  <strong>{demo.name}</strong> • {demo.email} • {demo.phone}
                  <p>{demo.education} • {demo.currentEducation}</p>
                  <p>{demo.city}, {demo.collegeAddress}</p>
                  <button
                    className="btn btn-sm btn-primary mt-2"
                    onClick={() => handleMarkBooked(demo._id)}
                  >
                    Mark as Booked
                  </button>
                </div>
              ))}
              {newDemos.length === 0 && <div className="text-muted p-3">No new demo bookings</div>}
            </div>

            <h4 className="fw-semibold mb-3">Booked Demos</h4>
            <div className="list-group">
              {bookedDemos.map((demo) => (
                <div key={demo._id} className="list-group-item">
                  <strong>{demo.name}</strong> • {demo.email} • {demo.phone}
                  <p>{demo.education} • {demo.currentEducation}</p>
                  <p>{demo.city}, {demo.collegeAddress}</p>
                  <span className="badge bg-success">Booked</span>
                </div>
              ))}
              {bookedDemos.length === 0 && <div className="text-muted p-3">No demos marked as booked</div>}
            </div>
          </>
        )}

        {/* FEEDBACK TAB */}
        {activeTab === "feedbacks" && (
          <>
            <h4 className="fw-semibold mb-4">User Feedbacks</h4>
            <div className="feedback-wrapper">
              {feedbacks.map((f) => (
                <div key={f._id} className="list-group-item feedback-section">
                  <div className="feedback-row d-flex justify-content-between align-items-center">
                    <div>
                      <span className="feedback-label">User:</span>
                      <span>{f.userId?.name || "Unknown User"}</span>
                    </div>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => openDeleteModal(f._id)}
                    >
                      Delete
                    </button>
                  </div>

                  {(() => {
                    const { courseTitle, subCourseTitle, videoTitle } = getCourseDetails(
                      f.courseId,
                      f.subIndex,
                      f.videoIndex
                    );
                    return (
                      <>
                        <div className="feedback-row">
                          <span className="feedback-label">Course:</span>
                          <span>{courseTitle}</span>
                        </div>
                        <div className="feedback-row">
                          <span className="feedback-label">SubCourse:</span>
                          <span>{subCourseTitle}</span>
                        </div>
                        <div className="feedback-row">
                          <span className="feedback-label">Video:</span>
                          <span>{videoTitle}</span>
                        </div>
                      </>
                    );
                  })()}

                  <div className="feedback-row">
                    <span className="feedback-label">Rating:</span>
                    <span className="feedback-stars">
                      {Array.from({ length: f.rating }, (_, i) => (
                        <span key={i}>⭐</span>
                      ))}
                    </span>
                  </div>

                  <div className="feedback-comment">
                    <strong>Comment:</strong>
                    <p className="mb-0 mt-1">{f.comment}</p>
                  </div>
                </div>
              ))}

              {feedbacks.length === 0 && (
                <div className="text-muted p-4 text-center w-100">No feedbacks available</div>
              )}
            </div>
          </>
        )}
      </main>

      {/* WELCOME OVERLAY */}
      {welcome && (
        <div className="cm-welcome-overlay" onClick={() => setWelcome(false)}>
          <div className="cm-welcome-box shadow-lg">
            <h2 className="mb-2">Welcome, {emp.name}!</h2>
            <p className="mb-4">Track open tickets, manage demos, and help students succeed.</p>
            <button className="btn btn-success px-4" onClick={() => setWelcome(false)}>
              Let’s get started
            </button>
          </div>
        </div>
      )}

      {/* RESOLUTION MODAL */}
      {modal.open && (
        <div className="cm-welcome-overlay" onClick={closeModal}>
          <div className="cm-welcome-box shadow-lg" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <h4 className="mb-3">Resolution Note</h4>
            <textarea
              className="form-control mb-3"
              rows="4"
              placeholder="How did you resolve the issue?"
              value={modal.note}
              onChange={(e) => setModal({ ...modal, note: e.target.value })}
            />
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-light" onClick={closeModal}>
                <FiX /> Cancel
              </button>
              <button className="btn btn-success" onClick={saveResolution}>
                <FiSave /> Save & Resolve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModal.open && (
        <div className="cm-welcome-overlay" onClick={() => setDeleteModal({ open: false, feedbackId: null })}>
          <div className="cm-welcome-box shadow-lg" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <h4 className="mb-3">Confirm Delete</h4>
            <p>Are you sure you want to delete this feedback?</p>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <button
                className="btn btn-light"
                onClick={() => setDeleteModal({ open: false, feedbackId: null })}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDeleteFeedback}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS POPUP */}
      {popupMessage && (
        <div className="position-fixed bottom-0 end-0 m-4 p-3 bg-success text-white shadow rounded" style={{ zIndex: 1055 }}>
          {popupMessage}
        </div>
      )}
    </div>
  );
}
