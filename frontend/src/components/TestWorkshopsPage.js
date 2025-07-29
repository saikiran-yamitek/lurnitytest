// TestWorkshopsPage.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./TestWorkshopsPage.css";

const API = "http://localhost:7700";

export default function TestWorkshopsPage() {
  const { courseId, subCourseIdx } = useParams();
  const [workshops, setWorkshops] = useState([]);
  const [registeredIds, setRegisteredIds] = useState([]);
  const [registeredSubCourses, setRegisteredSubCourses] = useState([]);
  const [loadingIds, setLoadingIds] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${API}/api/homepage`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((u) => {
        setUser(u);

        fetch(`${API}/api/workshops`, {
          headers: { Authorization: "Bearer " + token },
        })
          .then((res) => res.json())
          .then((data) => {
            setWorkshops(data);

            // Track already registered workshops and their subCourseIdx
            const alreadyRegistered = data
              .filter((w) =>
                w.registeredStudents.some(
                  (entry) =>
                    entry.student === u.id || entry === u.id // support both formats
                )
              )
              .map((w) => ({
                id: w._id,
                subCourse: w.subCourseIdx,
              }));

            setRegisteredIds(alreadyRegistered.map((r) => r.id));
            setRegisteredSubCourses([
              ...new Set(alreadyRegistered.map((r) => r.subCourse)),
            ]);
          });
      });
  }, []);

  const handleRegister = async (id, subIdx) => {
  if (loadingIds.includes(id)) return;

  // Prevent if already registered for this subCourse
  if (registeredSubCourses.includes(subIdx)) {
    alert("✅ You are already registered for a workshop in this sub-course.");
    return;
  }

  setLoadingIds((prev) => [...prev, id]);

  const token = localStorage.getItem("token");
  const res = await fetch(`${API}/api/workshops/${id}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ userId: user.id }),
  });

  setLoadingIds((prev) => prev.filter((item) => item !== id));

  const result = await res.json();

  if (res.ok) {
    setRegisteredIds((prev) => [...prev, id]);
    setRegisteredSubCourses((prev) => [...prev, subIdx]);

    const updated = workshops.map((w) =>
      w._id === id
        ? {
            ...w,
            registeredStudents: [...w.registeredStudents, { student: user.id }],
          }
        : w
    );
    setWorkshops(updated);
  } else {
    // Show specific server response
    if (result?.error === "Already registered") {
      alert("✅ You are already registered for this workshop.");
    } else if (result?.error === "Workshop is full") {
      alert("❌ Workshop is already full.");
    } else {
      alert("❌ Registration failed due to a server error.");
      console.error("Registration failed:", result);
    }
  }
};


  return (
    <div className="test-page">
      <h2 className="page-title">🚀 Explore Workshops</h2>
      {workshops.length === 0 && (
        <p className="no-workshops">No workshops scheduled yet.</p>
      )}
      <ul className="workshop-list">
        {workshops.map((w) => {
          const isRegistered = registeredIds.includes(w._id);
          const isFull = w.registeredStudents.length >= w.memberCount;
          const subCourseConflict = registeredSubCourses.includes(w.subCourseIdx);
          const isLoading = loadingIds.includes(w._id);

          return (
            <li key={w._id} className="workshop-card">
              <div className="card-header">
                <h3 className="lab-name">🧪 {w.labName}</h3>
                <p className="lab-time">
                  🕒 {new Date(w.time).toLocaleString()}
                </p>
              </div>
              <p className="lab-address">📍 {w.labAddress}</p>
              <p className={`lab-seats ${isFull ? "seats-full" : "seats-ok"}`}>
                🎫 Seats Available:{" "}
                {w.memberCount - w.registeredStudents.length}
              </p>
              <p className="lab-incharge">
                👨‍💼 Incharge: {w.inchargeId?.name || "N/A"}
              </p>

              {isRegistered ? (
                <button className="registered-btn" disabled>
                  ✅ Registered
                </button>
              ) : isFull ? (
                <button className="full-btn" disabled>
                  ⛔ Full
                </button>
              ) : subCourseConflict ? (
                <button className="full-btn" disabled>
                  ✅ Already Registered lab for this Subcourse
                </button>
              ) : (
                <button
                  className="register-btn"
                  onClick={() => handleRegister(w._id, w.subCourseIdx)}
                  disabled={isLoading}
                >
                  {isLoading ? "Registering..." : "Register Now"}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
