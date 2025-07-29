import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import logo from "../../assets/LURNITY.jpg";
import { FiUser, FiLogOut, FiUsers, FiX } from "react-icons/fi";
import "./InchargeDashboard.css";

export default function InchargeDashboard() {
  const [workshops, setWorkshops] = useState([]);
  const [emp, setEmp] = useState(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [showStudentPopup, setShowStudentPopup] = useState(false);
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [editedStudents, setEditedStudents] = useState({});
  const history = useHistory();

  useEffect(() => {
    const storedEmp = JSON.parse(localStorage.getItem("empInfo"));
    if (!storedEmp || storedEmp.role !== "lab incharge") {
      alert("Unauthorized access");
      history.replace("/employee/login");
      return;
    }

    setEmp(storedEmp);

    fetch(`http://localhost:7700/api/workshops/incharge/${storedEmp.id}`)
      .then((res) => res.json())
      .then((data) => setWorkshops(data))
      .catch((err) => {
        console.error("Failed to fetch workshops", err);
        alert("Error fetching workshops");
      });
  }, [history]);

  const handleLogout = () => {
    localStorage.removeItem("empInfo");
    history.push("/employee/login");
  };

  const handleViewStudents = async (workshopId) => {
    try {
      const res = await fetch(
        `http://localhost:7700/api/workshops/${workshopId}/students`
      );
      const data = await res.json();
      setRegisteredStudents(Array.isArray(data) ? data : []);
      setSelectedWorkshop(workshopId);
      setEditedStudents({});
      setShowStudentPopup(true);
    } catch (err) {
      console.error("Failed to fetch students", err);
      alert("❌ Error fetching students");
    }
  };

  const handleFieldChange = (studentId, field, value) => {
    setEditedStudents((prev) => {
      const updated = { ...prev[studentId], [field]: value };

      // Logic: If attendance is 'absent', auto-grade = 'F' and result = 'fail'
      if (field === "attendance") {
        const isPresent = value === "present";
        updated.attendance = isPresent;

        if (!isPresent) {
          updated.grade = "F";
          updated.result = "fail";
        }
      }

      // If grade manually changed, update result
      if (field === "grade") {
        updated.result = value === "F" ? "fail" : "pass";
      }

      return {
        ...prev,
        [studentId]: updated,
      };
    });
  };

  const handleSaveChanges = async () => {
    try {
      const updates = Object.entries(editedStudents);

      for (const [studentId, fields] of updates) {
        if (fields.attendance === undefined || !fields.grade) {
          alert("⚠️ Please mark both attendance and grade for all students.");
          return;
        }
      }

      for (const [studentId, fields] of updates) {
        const res = await fetch(
          `http://localhost:7700/api/workshops/${selectedWorkshop}/attendance`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentId, ...fields }),
          }
        );
        if (!res.ok) throw new Error("Update failed");
      }

      await handleViewStudents(selectedWorkshop); // Refresh data
      setEditedStudents({});
      alert("✅ Changes saved successfully.");
    } catch (error) {
      console.error("Save error", error);
      alert("❌ Failed to save changes.");
    }
  };

  return (
    <div className="cm-shell">
      <header className="cm-header shadow-sm">
        <img src={logo} alt="Lurnity" className="cm-logo" />
        <h3 className="cm-title flex-grow-1">Lab Incharge Dashboard</h3>
        <div className="d-flex align-items-center gap-3">
          <div className="cm-avatar">
            <FiUser size={20} />
          </div>
          <span className="cm-user">{emp?.name}</span>
          <button
            className="cm-logout btn btn-outline-light btn-sm"
            title="Log out"
            onClick={handleLogout}
          >
            <FiLogOut />
          </button>
        </div>
      </header>

      <main className="cm-main container py-4">
        <h4 className="fw-semibold mb-4">Assigned Workshops</h4>
        <div className="row">
          {workshops.length === 0 ? (
            <p>No workshops assigned to you.</p>
          ) : (
            workshops.map((ws) => {
              const registered = ws.registeredStudents?.length || 0;
              const available = ws.memberCount - registered;

              return (
                <div className="col-md-6 mb-4" key={ws._id}>
                  <div className="card shadow-sm border-0">
                    <div className="card-body">
                      <h5 className="card-title">{ws.labName}</h5>
                      <h6 className="text-muted mb-2">
                        {new Date(ws.time).toLocaleString()}
                      </h6>
                      <p><strong>Address:</strong> {ws.labAddress}</p>
                      <p><strong>Total Seats:</strong> {ws.memberCount}</p>
                      <p><strong>Registered:</strong> {registered}</p>
                      <p><strong>Seats Available:</strong> {available}</p>
                      <p><strong>Incharge:</strong> {ws.inchargeId?.name || "N/A"}</p>
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleViewStudents(ws._id)}
                      >
                        <FiUsers className="me-1" /> View Registered Students
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {showStudentPopup && (
        <div className="modal-overlay" onClick={() => setShowStudentPopup(false)}>
          <div className="modal-student" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-student d-flex justify-content-between align-items-center">
              <h5>Registered Students</h5>
              <button
                className="btn btn-sm btn-outline-dark"
                onClick={() => setShowStudentPopup(false)}
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body-student">
              {registeredStudents.length === 0 ? (
                <p>No students registered.</p>
              ) : (
                <>
                  <table className="table table-striped small">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Attendance</th>
                        <th>Grade</th>
                        <th>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registeredStudents.map((student) => {
                        const edited = editedStudents[student._id] || {};
                        const attendanceValue =
                          edited.attendance !== undefined
                            ? edited.attendance
                              ? "present"
                              : "absent"
                            : student.attendance === true
                              ? "present"
                              : "absent";

                        const gradeValue =
                          edited.grade !== undefined
                            ? edited.grade
                            : student.grade || "";

                        const resultValue =
                          gradeValue === "F"
                            ? "fail"
                            : gradeValue !== ""
                            ? "pass"
                            : "pending";

                        return (
                          <tr key={student._id}>
                            <td>{student.name}</td>
                            <td>{student.email}</td>
                            <td>{student.phone || "N/A"}</td>
                            <td>
                              <select
                                className="form-select form-select-sm"
                                value={attendanceValue}
                                onChange={(e) =>
                                  handleFieldChange(
                                    student._id,
                                    "attendance",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="present">Present</option>
                                <option value="absent">Absent</option>
                              </select>
                            </td>
                            <td>
                              <select
                                className="form-select form-select-sm"
                                value={gradeValue}
                                onChange={(e) =>
                                  handleFieldChange(
                                    student._id,
                                    "grade",
                                    e.target.value
                                  )
                                }
                                disabled={
                                  edited.attendance === false ||
                                  student.attendance === false
                                }
                              >
                                <option value="">-- Select --</option>
                                <option value="S">S</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                                <option value="E">E</option>
                                <option value="F">F</option>
                              </select>
                            </td>
                            <td>{resultValue}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="text-end mt-3">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={handleSaveChanges}
                      disabled={Object.keys(editedStudents).length === 0}
                    >
                      💾 Save Changes
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
