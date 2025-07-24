import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { listCourses } from "../../services/adminApi";
import logo from "../../assets/LURNITY.jpg";

import { FiUser, FiLogOut } from "react-icons/fi";
import "./Layout.css";

export default function ContentDashboard({ emp }) {
  /* ---------------- state ---------------- */
  const [courses, setCourses] = useState([]);
  const [welcome, setWelcome] = useState(true);
  const history = useHistory();

  /* ---------------- data ---------------- */
  useEffect(() => {
    (async () => setCourses(await listCourses()))();
  }, []);

  /* ---------------- handlers ---------------- */
  const doLogout = () => {
    localStorage.removeItem("empInfo");
    history.replace("/employee/login");
  };

  /* ---------------- ui ---------------- */
  return (
    <div className="cm-shell">
      {/* ---------- HEADER ---------- */}
      <header className="cm-header shadow-sm">
        <img src={logo} alt="Lurnity" className="cm-logo" />

        <h3 className="cm-title flex-grow-1">Course&nbsp;Studio</h3>

        {/* profile + logout */}
        <div className="d-flex align-items-center gap-3">
          <div className="cm-avatar">
            <FiUser size={20} />
          </div>
          <span className="cm-user">{emp.name}</span>
          <button className="cm-logout btn btn-outline-light btn-sm" onClick={doLogout}>
            <FiLogOut />
          </button>
        </div>
      </header>

      {/* ---------- BODY ---------- */}
      <main className="cm-main container-fluid p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0 fw-semibold">All Courses</h4>
          <Link to="/employee/content/new" className="btn btn-lg btn-primary px-4">
            + Create Course
          </Link>
        </div>

        <div className="row g-4">
          {courses.map((c) => (
            <div key={c._id} className="col-xl-4 col-md-6">
              {c.status === "Published" ? (
                <div className="cm-card locked shadow-sm">
                  <h5 className="mb-2 text-truncate">{c.title}</h5>
                  <span className="badge bg-success">Published</span>
                </div>
              ) : (
                <Link
                  to={`/employee/content/${c._id}`}
                  className="cm-card playable shadow-sm text-decoration-none"
                >
                  <h5 className="mb-2 text-truncate">{c.title}</h5>
                  <span className="badge bg-secondary">Draft</span>
                </Link>
              )}
            </div>
          ))}

          {courses.length === 0 && (
            <div className="text-center text-muted py-5">
              <p className="mb-1">No courses yet</p>
              <small>Create your first course using the button above.</small>
            </div>
          )}
        </div>
      </main>

      {/* ---------- WELCOME POPUP ---------- */}
      {welcome && (
        <div className="cm-welcome-overlay" onClick={() => setWelcome(false)}>
          <div className="cm-welcome-box shadow-lg">
            <h2 className="mb-2">Welcome, {emp.name}!</h2>
            <p className="mb-4">
              Create new courses or continue editing your drafts.<br />
              Published courses are managed by the&nbsp;Super&nbsp;Admin.
            </p>
            <button
              className="btn btn-success px-4"
              onClick={() => setWelcome(false)}
            >
              Let&rsquo;s get started
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
