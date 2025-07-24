// Home.js
import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import "./Home.css";
import HelpTicketForm from "./HelpTicketForm";
import {
  FiHome, FiAward, FiChevronRight, FiPlayCircle,
  FiUser, FiPhone, FiLogOut, FiCheckCircle,
  FiHelpCircle, FiLifeBuoy, FiTool, FiRefreshCw
} from "react-icons/fi";
import logo from "../assets/LURNITY.jpg";

const API = "http://localhost:7700";
const idOf = (cId, sIdx, vIdx) => `${cId}|${sIdx}|${vIdx}`;

export default function Home() {
  const hist = useHistory();
  const [user, setUser] = useState(null);
  const [course, setCourse] = useState(null);
  const [note, setNote] = useState(null);
  const [watched, setWatched] = useState([]);
  const [labs, setLabs] = useState([]);
  const [selectedSection, setSelectedSection] = useState("home");
  const [showMenu, setShowMenu] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const menuRef = useRef(null);
  const profileRef = useRef(null);
  const helpRef = useRef(null);
  const helpBtnRef = useRef(null);

  const fetchLabs = async (userId) => {
    try {
      const res = await fetch(`${API}/api/workshops/user/${userId}/workshops`, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });
      const data = await res.json();
      setLabs(data);
    } catch (err) {
      console.error("Error fetching labs", err);
      setLabs([]);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      hist.replace("/login");
      return;
    }

    const fetchJSON = (url) =>
      fetch(url, { headers: { Authorization: "Bearer " + token } })
        .then((r) => {
          if (!r.ok) throw new Error(r.statusText);
          return r.json();
        });

    (async () => {
      try {
        setWatched(await fetchJSON(`${API}/api/progress`));
      } catch {}

      try {
        const u = await fetchJSON(`${API}/api/homepage`);
        setUser(u);
        await fetchLabs(u.id);

        if (u.alertAvailable) {
          setPopupMessage("✅ Your ticket has been resolved.");
          setTimeout(() => setPopupMessage(""), 3000);
          await fetch(`${API}/api/user/setAlert`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: u.email, alert: false }),
          });
        }

        if (u.status === "banned") return setNote("This account has been permanently banned.");
        if (u.status === "suspended") return setNote("Your account is suspended. Please contact your mentor.");
        if (!u.course) return setNote("Course yet to be decided. Please wait for admin enrolment.");

        const all = await fetchJSON(`${API}/api/courses`);
        const found = all.find(
          (c) => c._id === u.course || c.title?.toLowerCase() === u.course?.toLowerCase()
        );
        if (!found)
          return setNote(`No course titled "${u.course}" found. Please contact admin.`);
        setCourse(found);
      } catch (e) {
        setNote(e.message || "Unable to load data.");
      }
    })();
  }, [hist]);

  useEffect(() => {
    if (!user || !course || !watched.length) return;
    course.subCourses?.forEach((sc, sIdx) => {
      const allIds = sc.videos?.map((_, vIdx) => idOf(course._id, sIdx, vIdx));
      const isCompleted = allIds?.every((id) => watched.includes(id));
      if (sc.lab === "Yes" && isCompleted) {
        fetch(`${API}/api/certificates/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify({
            userId: user.id,
            courseId: course._id,
            subCourseTitle: sc.title,
          }),
        }).catch(console.error);
      }
    });
  }, [user, course, watched]);

  useEffect(() => {
    const handler = (e) => {
      if (
        showMenu && menuRef.current && !menuRef.current.contains(e.target) &&
        profileRef.current && !profileRef.current.contains(e.target)
      ) {
        setShowMenu(false);
      }
      if (
        showHelp && helpRef.current && !helpRef.current.contains(e.target) &&
        helpBtnRef.current && !helpBtnRef.current.contains(e.target)
      ) {
        setShowHelp(false);
      }
    };
    const esc = (e) => {
      if (e.key === "Escape") {
        setShowMenu(false);
        setShowHelp(false);
        setTicketOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", esc);
    };
  }, [showMenu, showHelp]);

  useEffect(() => {
    if (selectedSection === "labs" && user?.id) {
      fetchLabs(user.id);
    }
  }, [selectedSection, user]);

  const Sidebar = () => (
    <aside className="sidebarr">
      <div className="sidebar-top">
        <img src={logo} alt="Lurnity" className="logo" />
        <nav className="nav-list">
          <button className={`nav-item ${selectedSection === "home" ? "active" : ""}`} onClick={() => setSelectedSection("home")}>
            <FiHome /><span>Home</span>
          </button>
          <button className="nav-item" onClick={() => hist.push("/certificates")}>
            <FiAward /><span>Certificates</span>
          </button>
          <button className="nav-item" onClick={() => hist.push("/sandbox")}>
            <FiPlayCircle /><span>CodeSandbox</span>
          </button>
          <button className={`nav-item ${selectedSection === "labs" ? "active" : ""}`} onClick={() => setSelectedSection("labs")}>
            <FiTool /><span>Registered Labs</span>
          </button>
        </nav>
      </div>

      <div ref={profileRef} className="profile-bar" onClick={() => setShowMenu((p) => !p)}>
  <div className="profile-info">
    <img
  src={user?.profileImage || "/default-profile.png"}
  alt="Profile"
  className="profile-avatar"
/>


    <span className="profile-name">{user?.name || ""}</span>
  </div>
  <FiChevronRight size={18} />
</div>


      {showMenu && (
        <div ref={menuRef} className="popup-menu">
          <ul>
            <li onClick={() => { hist.push("/profile"); setShowMenu(false); }}>
              <FiUser className="menu-ico" /><span>Profile</span>
            </li>
            <li onClick={() => { hist.push("/contact"); setShowMenu(false); }}>
              <FiPhone className="menu-ico" /><span>Contact Us</span>
            </li>
            <li onClick={() => { localStorage.clear(); hist.replace("/login"); }}>
              <FiLogOut className="menu-ico" /><span>Log Out</span>
            </li>
          </ul>
        </div>
      )}
    </aside>
  );

  if (note && user?.status === "banned") {
    return <div className="ban-full"><h2>{note}</h2></div>;
  }

  if (note && !course) {
    return (
      <div className="page-wrapper">
        <Sidebar />
        <main className="status-main">
          <h2 className="status-red">{note}</h2>
        </main>
      </div>
    );
  }

  if (!course) return <div className="loading">Loading…</div>;

  return (
    <div className="homepage">
      <Sidebar />
      <main className="main">
        {selectedSection === "home" && (
          <>
            <header className="course-banner">
              <h4 className="upper">{course.title}</h4>
            </header>
            {course.subCourses?.map((sc, sIdx) => (
              <section key={sIdx} className="subcourse-block">
                <h5 className="sub-title">{sc.title}</h5>
                {sc.videos?.map((v, vIdx) => {
                  const id = idOf(course._id, sIdx, vIdx);
                  const done = watched.includes(id);
                  return (
                    <div key={id} className="video-row" onClick={() => hist.push(`/watch/${course._id}/${sIdx}/${vIdx}`)}>
                      <FiPlayCircle className="play-ico" />
                      <span className="video-name">{v.title}</span>
                      {done && <FiCheckCircle className="tick" />}
                      <span className="mins">{v.duration} min</span>
                    </div>
                  );
                })}
                {sc.lab === "Yes" && (
                  <div className="video-row" onClick={() => hist.push(`/test/${course._id}/${sIdx}`)}>
                    <FiPlayCircle className="play-ico" />
                    <span className="video-name">PRACTICAL LAB</span>
                  </div>
                )}
              </section>
            ))}
          </>
        )}

        {selectedSection === "labs" && (
          <section className="subcourse-block">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="sub-title">Registered Labs</h4>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => fetchLabs(user.id)}>
                <FiRefreshCw /> Refresh Labs
              </button>
            </div>
            {labs.length === 0 ? (
              <p>No labs registered</p>
            ) : (
              labs.map((lab) => {
                const attendance = lab.attendance === true ? "✅ Present"
                  : lab.attendance === false ? "❌ Absent"
                  : "⏳ Not Marked";

                const result = lab.result || "pending";

                const resultBadge = {
                  pass: <span className="badge bg-success">Pass</span>,
                  fail: <span className="badge bg-danger">Fail</span>,
                  pending: <span className="badge bg-warning text-dark">Pending</span>,
                }[result];

                return (
                  <div key={lab._id} className="lab-card">
                    <div className="lab-header">
                      <FiTool size={24} />
                      <div className="lab-title">{lab.labName}</div>
                      <div className="lab-date">{new Date(lab.time).toLocaleDateString()}</div>
                    </div>
                    <div className="lab-details">
                      <div><strong>Address:</strong> {lab.labAddress}</div>
                      <div><strong>Attendance:</strong> {attendance}</div>
                      <div><strong>Result:</strong> {resultBadge}</div>
                    </div>
                  </div>
                );
              })
            )}
          </section>
        )}
      </main>

      <button className="help-btn" ref={helpBtnRef} onClick={() => setShowHelp((p) => !p)}>
        <FiHelpCircle size={26} />
      </button>

      {showHelp && (
        <div ref={helpRef} className="help-menu">
          <ul>
            <li onClick={() => { setShowHelp(false); setTicketOpen(true); }}>
              <FiLifeBuoy className="menu-ico" /><span>Raise a Ticket</span>
            </li>
          </ul>
        </div>
      )}

      {ticketOpen && user && (
        <HelpTicketForm user={user} onClose={() => setTicketOpen(false)} />
      )}

      {popupMessage && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content">
            <h2>🎉 Ticket Resolved</h2>
            <p>{popupMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
