// AdminWorkshops.js
import React, { useEffect, useState } from "react";
import { FiEdit, FiTrash2, FiUsers, FiX } from "react-icons/fi";
import { listWorkshops } from "../../services/workshopApi";
import { listEmployees } from "../../services/adminApi";

export default function AdminWorkshops() {
  const [workshops, setWorkshops] = useState([]);
  const [incharges, setIncharges] = useState([]);
  const [editWorkshop, setEditWorkshop] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [showStudentPopup, setShowStudentPopup] = useState(false);

  useEffect(() => {
    (async () => {
      const w = await listWorkshops();
      const e = await listEmployees();
      setIncharges(e.filter(emp => emp.role === "lab incharge"));
      setWorkshops(w);
    })();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this workshop?")) return;

    await fetch(`http://localhost:7700/api/workshops/${id}`, { method: "DELETE" });
    setWorkshops(workshops.filter(w => w._id !== id));
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`http://localhost:7700/api/workshops/${editWorkshop._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editWorkshop),
      });
      const updated = await res.json();
      setWorkshops((prev) =>
        prev.map((w) => (w._id === updated._id ? updated : w))
      );
      setEditWorkshop(null);
    } catch (err) {
      alert("❌ Failed to update");
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
        setSelectedStudents([]);
      }

      setSelectedWorkshop(workshopId);
      setShowStudentPopup(true);
    } catch (err) {
      alert("❌ Failed to fetch registered students");
      console.error(err);
    }
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4">All Scheduled Workshops</h3>

      <div className="row">
        {workshops.map((w) => {
          const registered = w.registeredStudents?.length || 0;

          return (
            <div className="col-md-6 mb-4" key={w._id}>
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="d-flex justify-content-between">
                    {w.labName}
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => setEditWorkshop(w)}>
                        <FiEdit />
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(w._id)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  </h5>
                  <p><strong>Address:</strong> {w.labAddress}</p>
                  <p><strong>Time:</strong> {new Date(w.time).toLocaleString()}</p>
                  <p><strong>Incharge:</strong> {typeof w.inchargeId === "object" ? w.inchargeId.name : incharges.find(i => i._id === w.inchargeId)?.name || "—"}</p>
                  <p><strong>Registered Students:</strong> {registered}</p>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => handleViewStudents(w._id)}>
                    <FiUsers /> View Students
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editWorkshop && (
        <div className="modal-overlay" onClick={() => setEditWorkshop(null)}>
          <div className="modal-student" onClick={(e) => e.stopPropagation()}>
            <h5>Reschedule Workshop</h5>
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Lab Name"
              value={editWorkshop.labName}
              onChange={(e) =>
                setEditWorkshop({ ...editWorkshop, labName: e.target.value })
              }
            />
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Lab Address"
              value={editWorkshop.labAddress}
              onChange={(e) =>
                setEditWorkshop({ ...editWorkshop, labAddress: e.target.value })
              }
            />
            <input
              type="datetime-local"
              className="form-control mb-2"
              value={editWorkshop.time.slice(0, 16)}
              onChange={(e) =>
                setEditWorkshop({ ...editWorkshop, time: e.target.value })
              }
            />
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={() => setEditWorkshop(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdate}>Update</button>
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
