// LabAdminDashboard.js
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import logo from "../../assets/LURNITY.jpg";
import {
  FiUser,
  FiLogOut,
  FiPlus,
  FiUsers,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { listEmployees } from "../../services/adminApi";
import {
  listWorkshops,
  createWorkshop,
} from "../../services/workshopApi";
import "./LabAdminDashboard.css";

export default function LabAdminDashboard() {
  const [workshops, setWorkshops] = useState([]);
  const [incharges, setIncharges] = useState([]);
  const [form, setForm] = useState({});
  const [popup, setPopup] = useState("");
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [workshopToDelete, setWorkshopToDelete] = useState(null);
  const [showStudentPopup, setShowStudentPopup] = useState(false);
  const history = useHistory();

  const emp = JSON.parse(localStorage.getItem("empInfo"));

  useEffect(() => {
    if (!emp || !emp.id) {
      alert("Session expired. Please login again.");
      history.replace("/employee/login");
      return;
    }

    (async () => {
      const all = await listEmployees();
      const inchargesOnly = all.filter((e) => e.role === "lab incharge");
      setIncharges(inchargesOnly);
      setWorkshops(await listWorkshops());
    })();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async () => {
    try {
      const payload = { ...form, createdBy: emp.id };
      await createWorkshop(payload);
      setPopup("✅ Workshop scheduled");
      setForm({});
      setWorkshops(await listWorkshops());
      setTimeout(() => setPopup(""), 3000);
    } catch (err) {
      console.error("Workshop creation error:", err);
      alert("❌ Failed to schedule workshop");
    }
  };

  const confirmDeleteWorkshop = async () => {
    try {
      await fetch(`http://localhost:7700/api/workshops/${workshopToDelete}`, {
        method: "DELETE",
      });
      setPopup("🗑️ Workshop deleted");
      setWorkshops(await listWorkshops());
      setWorkshopToDelete(null);
      setTimeout(() => setPopup(""), 3000);
    } catch (err) {
      alert("❌ Failed to delete workshop");
      console.error(err);
    }
  };

  const handleViewStudents = async (workshopId) => {
  try {
    const res = await fetch(`http://localhost:7700/api/workshops/${workshopId}/students`);
    const data = await res.json();

    if (Array.isArray(data)) {
      setSelectedStudents(data);
    } else {
      console.warn("Expected array, got:", data);
      setSelectedStudents([]); // fallback to empty
    }

    setSelectedWorkshop(workshopId);
    setShowStudentPopup(true);
  } catch (err) {
    alert("❌ Failed to fetch registered students");
    console.error(err);
  }
};



  const doLogout = () => {
    localStorage.removeItem("empInfo");
    history.replace("/employee/login");
  };

  return (
    <div className="cm-shell">
      <header className="cm-header shadow-sm">
        <img src={logo} alt="Lurnity" className="cm-logo" />
        <h3 className="cm-title flex-grow-1">Lab Admin Dashboard</h3>
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

      <main className="cm-main container py-4">
        <h4 className="fw-semibold mb-4">Schedule Workshop</h4>
        <div className="row g-3 mb-5">
          <div className="col-md-4">
            <input
              className="form-control"
              placeholder="Lab Name"
              name="labName"
              value={form.labName || ""}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <input
              className="form-control"
              placeholder="Lab Address"
              name="labAddress"
              value={form.labAddress || ""}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-2">
            <input
              className="form-control"
              type="datetime-local"
              name="time"
              value={form.time || ""}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-2">
            <input
              className="form-control"
              placeholder="Member Count"
              name="memberCount"
              type="number"
              value={form.memberCount || ""}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              name="inchargeId"
              value={form.inchargeId || ""}
              onChange={handleChange}
            >
              <option value="">Assign Incharge</option>
              {incharges.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <button className="btn btn-success w-100" onClick={handleCreate}>
              <FiPlus /> Schedule
            </button>
          </div>
        </div>

        <h4 className="fw-semibold mb-3">Scheduled Workshops</h4>
        <div className="row">
          {workshops.map((w) => {
            const registered = w.registeredStudents?.length || 0;
            const seatsAvailable = w.memberCount - registered;

            return (
              <div className="col-md-6 mb-4" key={w._id}>
                <div className="card shadow-sm border-0">
                  <div className="card-body">
                    <h5 className="card-title d-flex justify-content-between">
                      {w.labName}
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => setWorkshopToDelete(w._id)}
                        title="Delete Workshop"
                      >
                        <FiTrash2 />
                      </button>
                    </h5>
                    <h6 className="text-muted mb-2">
                      {new Date(w.time).toLocaleString()}
                    </h6>
                    <p><strong>Address:</strong> {w.labAddress}</p>
                    <p><strong>Total Seats:</strong> {w.memberCount}</p>
                    <p><strong>Registered:</strong> {registered}</p>
                    <p><strong>Seats Available:</strong> {seatsAvailable}</p>
                    <p><strong>Incharge:</strong>{" "}
                      {typeof w.inchargeId === "object"
                        ? w.inchargeId.name
                        : incharges.find((i) => i._id === w.inchargeId)?.name || "—"}
                    </p>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => handleViewStudents(w._id)}
                    >
                      <FiUsers className="me-1" /> View Registered Students
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {popup && (
        <div className="dashboard-popup">
          {popup}
        </div>
      )}

      {workshopToDelete && (
        <div className="modal-overlay">
          <div className="modal-student">
            <div className="modal-header-student">
              <h5 className="text-danger mb-0">Confirm Deletion</h5>
              <button
                className="btn btn-sm btn-outline-dark"
                onClick={() => setWorkshopToDelete(null)}
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this workshop? This action cannot be undone.</p>
            </div>
            <div className="modal-footer d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={() => setWorkshopToDelete(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDeleteWorkshop}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showStudentPopup && (
        <div className="modal-overlay" onClick={() => setShowStudentPopup(false)}>
          <div className="modal-student" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-student">
              <h5>Registered Students</h5>
              <button
                className="btn btn-sm btn-outline-dark"
                onClick={() => setShowStudentPopup(false)}
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body-student">
              {selectedStudents.length === 0 ? (
                <p>No students registered.</p>
              ) : (
                <table className="table table-striped small">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudents.map((entry) => (
  <tr key={entry._id}>
    <td>{entry.name}</td>
    <td>{entry.email}</td>
    <td>{entry.phone}</td>
    <td><span className="badge bg-success">Registered</span></td>
  </tr>
))}

                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
