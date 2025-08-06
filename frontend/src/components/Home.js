import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import HelpTicketForm from "./HelpTicketForm";
import {
  FiHome, FiAward, FiChevronRight, FiPlayCircle,
  FiUser, FiPhone, FiLogOut, FiCheckCircle,
  FiHelpCircle, FiLifeBuoy, FiTool, FiRefreshCw, FiLock, FiFileText, FiBriefcase
} from "react-icons/fi";
import logo from "../assets/LURNITY.jpg";
import { listWorkshops } from "../services/workshopApi";
import "./Home.css"; // Import the CSS file

const API = "http://localhost:7700";
const idOf = (cId, sIdx, vIdx) => `${cId}|${sIdx}|${vIdx}`;

export default function Home() {
  const hist = useHistory();
  const [user, setUser] = useState(null);
  const [course, setCourse] = useState(null);
  const [note, setNote] = useState(null);
  const [watched, setWatched] = useState([]);
  const [selectedLabSubcourse, setSelectedLabSubcourse] = useState(null);
  const [labs, setLabs] = useState([]);
  
  const calculateCourseCompletion = () => {
    if (!course || !watched || !course.subCourses) return 0;
    let totalItems = 0;
    let completedItems = 0;
    course.subCourses.forEach((sc, sIdx) => {
      const videoIds = sc.videos?.map((_, vIdx) => idOf(course._id, sIdx, vIdx)) || [];
      const completed = videoIds.filter(id => watched.includes(id)).length;
      totalItems += videoIds.length;
      completedItems += completed;
      if (sc.lab === "Yes") {
        totalItems += 1;
        const normalize = (s) => s?.trim().toLowerCase();
        const labEntry = labs.find((lab) => lab.subCourseId === sc._id);
        const regEntry = labEntry?.registeredStudents?.find(r => r.student === user?.id);
        const labPassed = regEntry?.attendance === true && normalize(regEntry?.result) === "pass";
        if (labPassed) completedItems += 1;
      }
    });
    return totalItems ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  const courseCompletion = calculateCourseCompletion();
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
      const res = await fetch(`${API}/api/workshops`, {
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
    <aside className="modern-sidebar">
      <div className="sidebar-glow"></div>
      <div className="sidebar-content">
        <div className="logo-section">
          <div className="logo-container">
            <img src={logo} alt="Lurnity" className="modern-logo" />
            <div className="logo-shine"></div>
          </div>
        </div>
        
        <nav className="modern-nav">
          <button 
            className={`nav-btn ${selectedSection === "home" ? "active" : ""}`} 
            onClick={() => setSelectedSection("home")}
          >
            <div className="nav-icon"><FiHome /></div>
            <span>Home</span>
            <div className="nav-glow"></div>
          </button>
          
          <button className="nav-btn" onClick={() => hist.push("/certificates")}>
            <div className="nav-icon"><FiAward /></div>
            <span>Certificates</span>
            <div className="nav-glow"></div>
          </button>
          
          <button className="nav-btn" onClick={() => hist.push("/sandbox")}>
            <div className="nav-icon"><FiPlayCircle /></div>
            <span>CodeSandbox</span>
            <div className="nav-glow"></div>
          </button>
          
          <button 
            className={`nav-btn ${selectedSection === "labs" ? "active" : ""}`} 
            onClick={() => setSelectedSection("labs")}
          >
            <div className="nav-icon"><FiTool /></div>
            <span>Labs</span>
            <div className="nav-glow"></div>
          </button>
          
          <button className="nav-btn" onClick={() => hist.push("/resume")}>
            <div className="nav-icon"><FiFileText /></div>
            <span>Resume</span>
            <div className="nav-glow"></div>
          </button>
          
          <button className="nav-btn" onClick={() => hist.push("/placement")}>
            <div className="nav-icon"><FiBriefcase /></div>
            <span>Placement</span>
            <div className="nav-glow"></div>
          </button>
        </nav>

        <div ref={profileRef} className="profile-section" onClick={() => setShowMenu((p) => !p)}>
          <div className="profile-glass">
            <div className="profile-content">
              <img
                src={user?.profileImage || "/default-profile.png"}
                alt="Profile"
                className="profile-image"
              />
              <div className="profile-text">
                <span className="profile-name">{user?.name || ""}</span>
                <span className="profile-status">Online</span>
              </div>
              <FiChevronRight className="profile-arrow" />
            </div>
          </div>
        </div>

        {showMenu && (
          <div ref={menuRef} className="glass-menu">
            <div className="menu-backdrop"></div>
            <ul>
              <li onClick={() => { hist.push("/profile"); setShowMenu(false); }}>
                <FiUser className="menu-icon" />
                <span>Profile</span>
              </li>
              <li onClick={() => { hist.push("/contact"); setShowMenu(false); }}>
                <FiPhone className="menu-icon" />
                <span>Contact Us</span>
              </li>
              <li onClick={() => { localStorage.clear(); hist.replace("/login"); }}>
                <FiLogOut className="menu-icon" />
                <span>Log Out</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </aside>
  );

  if (note && user?.status === "banned") {
    return <div className="ban-screen"><h2>{note}</h2></div>;
  }

  if (note && !course) {
    return (
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <div className="status-message">
            <h2>{note}</h2>
          </div>
        </main>
      </div>
    );
  }

  if (!course) return <div className="modern-loading">
    <div className="loading-spinner"></div>
    <span>Loading your experience...</span>
  </div>;

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        {selectedSection === "home" && (
          <>
            <header className="hero-banner">
              <div className="hero-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
              </div>
              
              <div className="hero-content">
                <div className="hero-text">
                  <h1 className="hero-title">{course.title}</h1>
                  <p className="hero-subtitle">Continue your extraordinary learning journey</p>
                </div>
                
                <div className="progress-orb">
                  <div className="orb-inner">
                    <svg className="progress-ring" viewBox="0 0 120 120">
                      <circle
                        className="progress-bg"
                        cx="60"
                        cy="60"
                        r="54"
                      />
                      <circle
                        className="progress-fill"
                        cx="60"
                        cy="60"
                        r="54"
                        strokeDasharray={`${courseCompletion * 3.39} 339`}
                      />
                    </svg>
                    <div className="progress-text">
                      <span className="progress-number">{courseCompletion}%</span>
                      <span className="progress-label">Complete</span>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {course.subCourses?.map((sc, sIdx) => (
              <section key={sIdx} className="course-card">
                <div className="card-glow"></div>
                
                {(() => {
                  const videoIds = sc.videos?.map((_, vIdx) => idOf(course._id, sIdx, vIdx)) || [];
                  const completedVideos = videoIds.filter(id => watched.includes(id)).length;
                  const totalVideos = videoIds.length;
                  const hasLab = sc.lab === "Yes";
                  const normalize = (s) => s?.trim().toLowerCase();
                  const labEntry = labs.find(lab => lab.subCourseId === sc._id);
                  const regEntry = labEntry?.registeredStudents?.find(r => r.student === user?.id);
                  const labPassed = regEntry?.attendance === true && normalize(regEntry?.result) === "pass";

                  let completed = completedVideos;
                  let total = totalVideos;

                  if (hasLab) {
                    total += 1;
                    if (labPassed) completed += 1;
                  }

                  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

                  return (
                    <div className="card-header">
                      <h3 className="card-title">{sc.title}</h3>
                      <div className="progress-indicator">
  <span className="progress-percent">{percent}%</span>
  <div className="progress-bar">
    <div 
      className="progress-bar-fill"
      style={{ width: `${percent}%` }}
    ></div>
  </div>
</div>
                    </div>
                  );
                })()}

                <div className="card-content">
                  {sc.videos?.map((v, vIdx) => {
                    const id = idOf(course._id, sIdx, vIdx);
                    const done = watched.includes(id);
                    return (
                      <div 
                        key={id} 
                        className={`video-item ${done ? 'completed' : ''}`}
                        onClick={() => hist.push(`/watch/${course._id}/${sIdx}/${vIdx}`)}
                      >
                        <div className="video-icon">
                          <FiPlayCircle />
                        </div>
                        <span className="video-title">{v.title}</span>
                        <span className="video-duration">{v.duration}m</span>
                        {done && <FiCheckCircle className="completion-check" />}
                        <div className="item-glow"></div>
                      </div>
                    );
                  })}

                  {sc.lab === "Yes" && (() => {
                    const videoIds = sc.videos?.map((_, vIdx) => idOf(course._id, sIdx, vIdx)) || [];
                    const allVideosCompleted = videoIds.every(id => watched.includes(id));
                    const normalize = s => s?.trim().toLowerCase();
                    const subLab = labs.find(lab => lab.subCourseId === sc._id);
                    const regEntry = subLab?.registeredStudents?.find(r => r.student === user?.id);
                    const isRegistered = !!regEntry;
                    const showGreenTick = regEntry?.attendance === true && normalize(regEntry?.result) === "pass";

                    return (
                      <div 
                        className={`lab-item ${!allVideosCompleted ? 'locked' : ''} ${showGreenTick ? 'completed' : ''}`}
                        onClick={() => {
                          if (allVideosCompleted) {
                            setSelectedLabSubcourse(sc.title);
                            setSelectedSection("lab-details");
                          }
                        }}
                      >
                        <div className="lab-icon">
                          {allVideosCompleted ? <FiTool /> : <FiLock />}
                        </div>
                        <span className="lab-title">PRACTICAL LAB</span>
                        <div className="lab-status">
                          {isRegistered ? (
                            <div className="status-group">
                              <span className="status-badge registered">✅ Registered</span>
                              
                            </div>
                          ) : (
                            <span className="status-badge pending">🟡 Not Registered</span>
                          )}
                        </div>
                        {showGreenTick && <FiCheckCircle className="completion-check" />}
                        <div className="item-glow"></div>
                      </div>
                    );
                  })()}
                </div>
              </section>
            ))}
          </>
        )}

        {selectedSection === "labs" && (
          <section className="course-card">
            <div className="card-glow"></div>
            <div className="card-header">
              <h3 className="card-title">Registered Labs</h3>
              <button
                className="refresh-btn"
                onClick={() => fetchLabs(user.id)}
              >
                <FiRefreshCw />
                Refresh
              </button>
            </div>

            <div className="card-content">
              {labs.filter((lab) =>
                lab.registeredStudents?.some((r) => r.student === user?.id)
              ).length === 0 ? (
                <div className="empty-state">
                  <FiTool size={48} />
                  <p>No registered labs yet</p>
                </div>
              ) : (
                labs
                  .filter((lab) =>
                    lab.registeredStudents?.some((r) => r.student === user?.id)
                  )
                  .map((lab) => {
                    const reg = lab.registeredStudents.find((r) => r.student === user?.id);
                    const result = reg?.result?.toLowerCase() || "pending";

                    return (
                      <div key={lab._id} className="lab-card-item">
                        <div className="lab-header">
                          <FiTool className="lab-icon" />
                          <div className="lab-info">
                            <h4 className="lab-name">{lab.labName}</h4>
                            <p className="lab-address">{lab.labAddress}</p>
                          </div>
                          <div className="lab-date">
                            {new Date(lab.time).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="lab-stats">
                          <span className={`lab-badge ${reg?.attendance === true ? 'present' : reg?.attendance === false ? 'absent' : 'pending'}`}>
                            {reg?.attendance === true ? "✅ Present" : 
                             reg?.attendance === false ? "❌ Absent" : "⏳ Pending"}
                          </span>
                          <span className={`lab-badge ${result}`}>
                            {result === "pass" ? "Pass" : result === "fail" ? "Fail" : "Pending"}
                          </span>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </section>
        )}

        {selectedSection === "lab-details" && selectedLabSubcourse && (
  <section className="course-card">
    <div className="card-glow"></div>
    <div className="card-header">
      <button 
        className="back-btn"
        onClick={() => {
          setSelectedLabSubcourse(null);
          setSelectedSection("home");
        }}
      >
        ← Back
      </button>
      <h3 className="card-title">Lab Details: {selectedLabSubcourse}</h3>
    </div>

    <div className="card-content">
      {(() => {
        const normalize = (s) => s?.trim().toLowerCase();
        const userId = user?.id;

        const matchingLabs = labs.filter(
          (lab) => normalize(lab.labName) === normalize(selectedLabSubcourse)
        );

        if (matchingLabs.length === 0) {
          return (
            <div className="empty-state">
              <FiTool size={48} />
              <p>No lab sessions scheduled for this course yet</p>
            </div>
          );
        }

        return matchingLabs.map((lab) => {
          const isRegistered = lab.registeredStudents?.some((r) => r.student === userId);
          const labTime = new Date(lab.time).toLocaleString();

          const handleRegister = async () => {
            try {
              const res = await fetch(`${API}/api/workshops/${lab._id}/register`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: "Bearer " + localStorage.getItem("token"),
                },
                body: JSON.stringify({ userId }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || "Error");
              alert("✅ Registered successfully");
              fetchLabs(userId);
            } catch (err) {
              alert("❌ " + err.message);
            }
          };

          const handleDeregister = async () => {
            try {
              const res = await fetch(`${API}/api/workshops/${lab._id}/deregister`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: "Bearer " + localStorage.getItem("token"),
                },
                body: JSON.stringify({ userId }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || "Error");
              alert("🚫 Deregistered successfully");
              fetchLabs(userId);
            } catch (err) {
              alert("❌ " + err.message);
            }
          };

          return (
            <div key={lab._id} className="lab-detail-card">
              <div className="lab-detail-header">
                <FiTool className="lab-icon" />
                <div className="lab-detail-info">
                  <h4>{lab.labName}</h4>
                  <p className="lab-address">{lab.labAddress}</p>
                  <p className="lab-time">{labTime}</p>
                </div>
              </div>
              
              <div className="lab-detail-actions">
                {isRegistered ? (
                  <>
                    <div className="lab-status-badge registered">
                      ✅ Registered
                    </div>
                    <button 
                      className="btn-danger"
                      onClick={handleDeregister}
                    >
                      Deregister
                    </button>
                  </>
                ) : (
                  <button 
                    className="btn-primary"
                    onClick={handleRegister}
                  >
                    Register Now
                  </button>
                )}
              </div>
            </div>
          );
        });
      })()}
    </div>
  </section>
)}
      </main>

      <button className="floating-help" ref={helpBtnRef} onClick={() => setShowHelp((p) => !p)}>
        <FiHelpCircle />
        <div className="help-pulse"></div>
      </button>

      {showHelp && (
        <div ref={helpRef} className="help-popup">
          <div className="popup-backdrop"></div>
          <ul>
            <li onClick={() => { setShowHelp(false); setTicketOpen(true); }}>
              <FiLifeBuoy className="popup-icon" />
              <span>Raise a Ticket</span>
            </li>
          </ul>
        </div>
      )}

      {ticketOpen && user && (
        <HelpTicketForm user={user} onClose={() => setTicketOpen(false)} />
      )}

      {popupMessage && (
        <div className="success-modal">
          <div className="modal-backdrop"></div>
          <div className="modal-content">
            <h2>🎉 Success</h2>
            <p>{popupMessage}</p>
          </div>
        </div>
      )}

      {/* SVG Definitions for gradients */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}