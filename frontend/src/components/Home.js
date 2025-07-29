// Home.js
import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import "./Home.css";
import HelpTicketForm from "./HelpTicketForm";
import {
  FiHome, FiAward, FiChevronRight, FiPlayCircle,
  FiUser, FiPhone, FiLogOut, FiCheckCircle,
  FiHelpCircle, FiLifeBuoy, FiTool, FiRefreshCw,FiLock ,FiFileText
} from "react-icons/fi";
import logo from "../assets/LURNITY.jpg";
import { listWorkshops } from "../services/workshopApi";

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
    setLabs(data); // workshops = labs
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
          <button className={`nav-item ${selectedSection === "resume" ? "active" : ""}`} onClick={() => hist.push("/resume")}><FiFileText /><span>Resume</span></button>
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
  {/* Gradient definition - same as subcourse progress */}
  <svg style={{ position: 'absolute', width: 0, height: 0 }}>
    <defs>
      <linearGradient id="course-progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#3b82f6" /> {/* Blue start */}
        <stop offset="100%" stopColor="#6366f1" /> {/* Purple end */}
      </linearGradient>
    </defs>
  </svg>

  <div className="course-banner-inner">
    <h1 className="course-title">{course.title}</h1>
    <p className="course-subtext">Let's continue your learning journey.</p>
  </div>

  <div className="course-progress-circle">
    <svg className="circle-svg" viewBox="0 0 36 36">
      <path
        className="circle-bg"
        d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
      />
      <path
        className="circle-bar gradient-stroke"
        strokeDasharray={`${courseCompletion}, 100`}
        d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
        // Apply the gradient
      />
      <text x="18" y="20.35" className="circle-text">{courseCompletion}%</text>
    </svg>
  </div>
</header>



            {course.subCourses?.map((sc, sIdx) => (
  <section key={sIdx} className="subcourse-block">
    {/* ✅ Wrap the title + progress in one row */}
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
  if (percent === 100) {
  // ✅ Mark subcourse as completed
  fetch(`${API}/api/user/update-completed-subcourses`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: JSON.stringify({
      userId: user.id,
      subCourseTitle: sc.title
    })
  }).catch(console.error);

  // ✅ Generate certificate only if not already generated
  fetch(`${API}/api/certificates/check-exists`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: JSON.stringify({
      userId: user.id,
      subCourseTitle: sc.title,
    }),
  })
    .then(res => res.json())
    .then(data => {
      if (!data.exists) {
        return fetch(`${API}/api/certificates/generate`, {
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
        });
      }
    })
    .catch(console.error);
}



  return (
    <div className="sub-header">
      <h5 className="sub-title">{sc.title}</h5>
      <div className="progress-wrapper">
        <div className="progress-label">{percent}%</div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
})()
}

    {/* Videos List */}
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

    {/* Lab Button */}
    {sc.lab === "Yes" && (() => {
  const videoIds = sc.videos?.map((_, vIdx) => idOf(course._id, sIdx, vIdx)) || [];
  const allVideosCompleted = videoIds.every(id => watched.includes(id));

  const normalize = s => s?.trim().toLowerCase();
  
  // Try to find the user's lab registration for this sub-course
  const subLab = labs.find(lab => lab.subCourseId === sc._id);
  const regEntry = subLab?.registeredStudents?.find(r => r.student === user?.id);

  
 
  const isRegistered = !!regEntry;

const attendance = regEntry
  ? regEntry.attendance === true
    ? "✅ Present"
    : regEntry.attendance === false
    ? "❌ Absent"
    : "⏳ Not Marked"
  : "🟡 Yet to be registered";

const result = regEntry?.result || null;

const showGreenTick = regEntry?.attendance === true && normalize(result) === "pass";

  return (
    <div
      className={`video-row ${!allVideosCompleted ? "disabled" : ""}`}
      onClick={() => {
        if (allVideosCompleted) {
  setSelectedLabSubcourse(sc.title);
  setSelectedSection("lab-details");
}

      }}
      style={{
        cursor: allVideosCompleted ? "pointer" : "not-allowed",
        opacity: allVideosCompleted ? 1 : 0.5,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {allVideosCompleted ? <FiPlayCircle className="play-ico" /> : <FiLock className="play-ico" />}
        <span className="video-name">PRACTICAL LAB</span>
        {showGreenTick && <FiCheckCircle className="tick" style={{ color: "green" }} />}
      </div>
      <div style={{ fontSize: '0.85rem', textAlign: 'right', lineHeight: '1.5' }}>
  {isRegistered ? (
    <>
      <div>
        <strong style={{ color: "#ffffff" }}>Status:</strong> <span style={{ color: '#10b981' }}>✅ Registered</span>
      </div>
      <div>
        <strong style={{ color: "#ffffff" }}>Attendance:</strong>{" "}
        <span style={{ color: regEntry?.attendance === true ? '#10b981' : regEntry?.attendance === false ? '#ef4444' : '#d97706' }}>
          {attendance}
        </span>
      </div>
      <div>
        <strong style={{ color: "#ffffff" }}>Result:</strong>{" "}
        <span style={{
          color:
            normalize(result) === "pass"
              ? "#10b981"
              : normalize(result) === "fail"
              ? "#ef4444"
              : "#d97706"
        }}>
          {result ? result.toUpperCase() : "Pending"}
        </span>
      </div>
    </>
  ) : (
    <div>
      <strong>Status:</strong>{" "}
      <span style={{ color: "#d97706" }}>🟡 Yet to be registered</span>
    </div>
  )}
</div>

    </div>
  );
})()}


  </section>
))}

          </>
        )}

        {selectedSection === "labs" && (
  <section className="subcourse-block">
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h4 className="sub-title">Registered Labs</h4>
      <button
        className="btn btn-sm btn-outline-secondary"
        onClick={() => fetchLabs(user.id)}
      >
        <FiRefreshCw /> Refresh Labs
      </button>
    </div>

    {labs.filter((lab) =>
      lab.registeredStudents?.some((r) => r.student === user?.id)
    ).length === 0 ? (
      <p>You have not registered for any labs yet.</p>
    ) : (
      labs
  .filter((lab) =>
    lab.registeredStudents?.some((r) => r.student === user?.id)
  )
  .map((lab) => {
    const reg = lab.registeredStudents.find((r) => r.student === user?.id);
    const attendance =
      reg?.attendance === true
        ? "✅ Present"
        : reg?.attendance === false
        ? "❌ Absent"
        : "⏳ Not Marked";

    const result = reg?.result?.toLowerCase() || "pending";

    const resultBadge = {
      pass: <span className="badge bg-success">Pass</span>,
      fail: <span className="badge bg-danger">Fail</span>,
      pending: (
        <span className="badge bg-warning text-dark">Pending</span>
      ),
    }[result];

    return (
      <div key={lab._id} className="lab-card">
        <div className="lab-header">
          <FiTool size={24} />
          <div className="lab-title">{lab.labName}</div>
          <div className="lab-date">
            {new Date(lab.time).toLocaleDateString()}
          </div>
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

        {selectedSection === "lab-details" && selectedLabSubcourse && (
  <section className="subcourse-block">
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h4 className="sub-title">Lab Details for: {selectedLabSubcourse}</h4>
      <button className="btn btn-sm btn-outline-secondary" onClick={() => {
        setSelectedLabSubcourse(null);
        setSelectedSection("home");
      }}>
        ← Back
      </button>
    </div>

    {(() => {
  const normalize = (s) => s?.trim().toLowerCase();
  const userId = user?.id;

  const matchingLabs = labs.filter(
    (lab) => normalize(lab.labName) === normalize(selectedLabSubcourse)
  );

  if (matchingLabs.length === 0) {
    return <p>No lab found for this sub-course</p>;
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
      <div key={lab._id} className="lab-card">
        <div className="lab-header">
          <FiTool size={24} />
          <div className="lab-title">{lab.labName}</div>
          <div className="lab-date">{labTime}</div>
        </div>
        <div className="lab-details">
          <div><strong>Address:</strong> {lab.labAddress}</div>
          <div><strong>Time:</strong> {labTime}</div>
          <div><strong>Status:</strong> {isRegistered ? "✅ Registered" : "🟡 Not Registered"}</div>
          <div className="mt-2">
            {isRegistered ? (
              <button className="btn btn-danger btn-sm" onClick={handleDeregister}>Deregister</button>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={handleRegister}>Register</button>
            )}
          </div>
        </div>
      </div>
    );
  });
})()}

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
