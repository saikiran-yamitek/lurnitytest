import React, { useEffect, useRef, useState,useCallback } from "react";
import { useHistory } from "react-router-dom";
import HelpTicketForm from "./HelpTicketForm";
import {
  FiHome, FiAward, FiChevronRight, FiPlayCircle,
  FiUser, FiPhone, FiLogOut, FiCheckCircle,
  FiHelpCircle, FiLifeBuoy, FiTool, FiRefreshCw, FiLock, FiFileText, FiBriefcase,
  FiAlertCircle,FiX,
} from "react-icons/fi";
import logo from "../assets/LURNITY.jpg";


import "./Home.css"; // Import the CSS file
import StreakWidget from "./StreakWidget";
import SavedQuestions from "./SavedQuestions";

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
  const [profileCompletion, setProfileCompletion] = useState({ isComplete: true, missingFields: 0, totalFields: 0 });
  const [showResumeLocked, setShowResumeLocked] = useState(false);
  const [showRegisterWarning, setShowRegisterWarning] = useState(false);
  const [pendingLabToRegister, setPendingLabToRegister] = useState(null);
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState("");

  const isSidebarLocked = (user) => {
  return user?.status === "banned" || !user?.course;
};

// Utility functions for video unlocking
const getMaxVideosForDay = (learningHours) => {
    // 3 hours = 2 videos, 4 hours = 3 videos (max)
    return Math.min(learningHours + 1, 4); // Cap at 4 hours (3 videos)
  };

const getUnlockedVideosCount = (user, subCourseIndex) => {
    if (subCourseIndex === 0) {
      // For first subcourse, base on learning hours and current date
      const startDate = user.startDate ? new Date(user.startDate) : new Date();
      const currentDate = new Date();
      const dayDiff = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
      const maxVideos = getMaxVideosForDay(user.learningHours || 3);
      return Math.min(maxVideos * (dayDiff + 1), 100); // Cap at reasonable number
    }
    // For subsequent subcourses, check if previous subcourse is complete
    return 0;
  };

const isSubcourseLocked = (course, subCourseIndex, watched) => {
    if (subCourseIndex === 0) return false; // First subcourse is never locked
    
    // Check if previous subcourse is complete
    const prevSubCourse = course.subCourses[subCourseIndex - 1];
    const videoIds = prevSubCourse.videos?.map((_, vIdx) => 
      idOf(course._id, subCourseIndex - 1, vIdx)) || [];
    const allVideosWatched = videoIds.every(id => watched.includes(id));
    
    // Also check if lab is completed if it exists
    if (prevSubCourse.lab === "Yes") {
      const lab = labs.find(l => l.subCourseId === prevSubCourse._id);
      const labCompleted = lab?.registeredStudents?.some(
        r => r.student === user?.id && r.attendance && r.result?.toLowerCase() === "pass"
      );
      return !(allVideosWatched && labCompleted);
    }
    
    return !allVideosWatched;
  };

const handleRegisterClick = (lab) => {
    setPendingLabToRegister(lab);
    setShowRegisterWarning(true);
  };

const confirmRegister = async () => {
    if (!pendingLabToRegister) return;
    try {
      const res = await fetch(`${API}/api/workshops/${pendingLabToRegister._id}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({ userId: user?.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      
      // Replace alert with popup
      setRegistrationMessage("Registration Successful!");
      setShowRegistrationSuccess(true);
      
      fetchLabs(user.id);
      setShowRegisterWarning(false);
      setPendingLabToRegister(null);
      setSelectedLabSubcourse(null);
      setSelectedSection("home");
      
      // Auto-hide popup after 3 seconds
      setTimeout(() => {
        setShowRegistrationSuccess(false);
      }, 3000);
      
    } catch (err) {
      alert("❌ " + err.message);
    }
  };
  
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

  // Function to check profile completion
  const checkProfileCompletion = (profileData) => {
    if (!profileData) return { isComplete: false, missingFields: 0, totalFields: 0, percentage: 0 };
    
    let totalFields = 0;
    let filledFields = 0;
    
    // Helper function to check if a value is filled
    const isFieldFilled = (value) => {
      if (value === null || value === undefined || value === "") return false;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "object") return Object.keys(value).length > 0;
      return true;
    };
    
    // Basic Details - Student Profile (12 fields)
    const basicFields = [
      profileData.firstName,
      profileData.lastName, 
      profileData.name,
      profileData.gender,
      profileData.communicationLanguage,
      profileData.teachingLanguage,
      profileData.dateOfBirth,
      profileData.linkedIn,
      profileData.twitter,
      profileData.github,
      profileData.resumeURL,
      profileData.photoURL
    ];
    
    basicFields.forEach(field => {
      totalFields++;
      if (isFieldFilled(field)) filledFields++;
    });
    
    // Contact Details (3 fields)
    const contactFields = [
      profileData.phone,
      profileData.email,
      profileData.isWhatsAppSame
    ];
    
    contactFields.forEach(field => {
      totalFields++;
      if (isFieldFilled(field)) filledFields++;
    });
    
    // Parent/Guardian Details (7 fields)
    if (profileData.parentGuardian) {
      const parentFields = [
        profileData.parentGuardian.firstName,
        profileData.parentGuardian.lastName,
        profileData.parentGuardian.relation,
        profileData.parentGuardian.occupation,
        profileData.parentGuardian.email,
        profileData.parentGuardian.phone,
        profileData.parentGuardian.isWhatsAppSame
      ];
      
      parentFields.forEach(field => {
        totalFields++;
        if (isFieldFilled(field)) filledFields++;
      });
    } else {
      totalFields += 7; // Add 7 for missing parent guardian section
    }
    
    // Current Address (7 fields)
    if (profileData.currentAddress) {
      const addressFields = [
        profileData.currentAddress.addressLine1,
        profileData.currentAddress.addressLine2,
        profileData.currentAddress.country,
        profileData.currentAddress.pinCode,
        profileData.currentAddress.state,
        profileData.currentAddress.district,
        profileData.currentAddress.city
      ];
      
      addressFields.forEach(field => {
        totalFields++;
        if (isFieldFilled(field)) filledFields++;
      });
    } else {
      totalFields += 7;
    }
    
    // Current Expertise (3 fields)
    if (profileData.currentExpertise) {
      const expertiseFields = [
        profileData.currentExpertise.codingLevel,
        profileData.currentExpertise.hasLaptop,
        profileData.currentExpertise.knownSkills
      ];
      
      expertiseFields.forEach(field => {
        totalFields++;
        if (isFieldFilled(field)) filledFields++;
      });
    } else {
      totalFields += 3;
    }
    
    // Your Preference (2 fields)
    if (profileData.yourPreference) {
      const preferenceFields = [
        profileData.yourPreference.jobSearchStatus,
        profileData.yourPreference.expectedCTC
      ];
      
      preferenceFields.forEach(field => {
        totalFields++;
        if (isFieldFilled(field)) filledFields++;
      });
    } else {
      totalFields += 2;
    }
    
    // Education Details - 10th Standard (5 fields)
    if (profileData.tenthStandard) {
      const tenthFields = [
        profileData.tenthStandard.board,
        profileData.tenthStandard.schoolName,
        profileData.tenthStandard.markingScheme,
        profileData.tenthStandard.markingScheme === "Grade/CGPA" ? profileData.tenthStandard.cgpa : profileData.tenthStandard.percentage
      ];
      
      tenthFields.forEach(field => {
        totalFields++;
        if (isFieldFilled(field)) filledFields++;
      });
    } else {
      totalFields += 4;
    }
    
    // Education Details - Intermediate (7 fields)
    if (profileData.intermediateOrDiploma) {
      const intermediateFields = [
        profileData.intermediateOrDiploma.stream,
        profileData.intermediateOrDiploma.status,
        profileData.intermediateOrDiploma.institutionName,
        profileData.intermediateOrDiploma.markingScheme,
        profileData.intermediateOrDiploma.markingScheme === "Grade/CGPA" ? profileData.intermediateOrDiploma.cgpa : profileData.intermediateOrDiploma.percentage,
        profileData.intermediateOrDiploma.yearOfCompletion
      ];
      
      intermediateFields.forEach(field => {
        totalFields++;
        if (isFieldFilled(field)) filledFields++;
      });
    } else {
      totalFields += 6;
    }
    
    // Education Details - Bachelor's Degree (13 fields)
    if (profileData.bachelorsDegree) {
      const bachelorFields = [
        profileData.bachelorsDegree.degreeName,
        profileData.bachelorsDegree.status,
        profileData.bachelorsDegree.department,
        profileData.bachelorsDegree.markingScheme,
        profileData.bachelorsDegree.markingScheme === "Grade/CGPA" ? profileData.bachelorsDegree.cgpa : profileData.bachelorsDegree.percentage,
        profileData.bachelorsDegree.startYear,
        profileData.bachelorsDegree.endYear,
        profileData.bachelorsDegree.instituteCountry,
        profileData.bachelorsDegree.instituteName,
        profileData.bachelorsDegree.institutePincode,
        profileData.bachelorsDegree.instituteState,
        profileData.bachelorsDegree.instituteDistrict,
        profileData.bachelorsDegree.instituteCity
      ];
      
      bachelorFields.forEach(field => {
        totalFields++;
        if (isFieldFilled(field)) filledFields++;
      });
    } else {
      totalFields += 13;
    }
    
    const missingFields = totalFields - filledFields;
    const percentage = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
    
    return {
      isComplete: missingFields === 0,
      missingFields,
      totalFields,
      filledFields,
      percentage
    };
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

  // Fetch user profile data
  const fetchProfileData = useCallback(async (userId) => {
    try {
      const response = await fetch(`${API}/api/user/${userId}/profile`);
      const data = await response.json();
      if (response.ok && data) {
        const completion = checkProfileCompletion(data);
        setProfileCompletion(completion);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  }, []);

  // Helper function to check if user is registered for any lab in the subcourse
   const isUserRegisteredForSubcourse = (subCourseId) => {
    return labs.some(lab => 
      lab.subCourseId === subCourseId && 
      lab.registeredStudents?.some(r => r.student === user?.id)
    );
  };

  // Helper function to get user registration for a subcourse
  const getUserRegistrationForSubcourse = (subCourseId) => {
    const lab = labs.find(lab => 
      lab.subCourseId === subCourseId && 
      lab.registeredStudents?.some(r => r.student === user?.id)
    );
    
    if (lab) {
      return lab.registeredStudents.find(r => r.student === user?.id);
    }
    return null;
  };

  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    hist.replace("/login");
    return;
  }

  

  // Function to handle back navigation
  const handleBackNavigation = (e) => {
    // Prevent default back behavior
    e.preventDefault();
    // Replace current history entry with itself
    hist.replace(hist.location.pathname);
  };

  // Add event listener for popstate
  window.addEventListener('popstate', handleBackNavigation);

  // Push a new entry to the history stack
  window.history.pushState(null, null, window.location.href);

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
      
      if (u.id) {
        await fetchProfileData(u.id);
      }

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

  // Cleanup function to remove event listener
  return () => {
    window.removeEventListener('popstate', handleBackNavigation);
  };
}, [hist, fetchProfileData]);
  

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
        setShowResumeLocked(false);
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

  useEffect(() => {
  if (user?.id && courseCompletion >= 0) {
    const updateCourseCompletion = async () => {
      try {
        await fetch(`${API}/api/user/${user.id}/courseCompletion`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({ courseCompletion })
        });
      } catch (err) {
        console.error("Error updating course completion:", err);
      }
    };

    updateCourseCompletion();
  }
}, [courseCompletion, user]);


  const handleResumeClick = () => {
    if (!profileCompletion.isComplete) {
      setShowResumeLocked(true);
      return false;
    }
    hist.push("/resume");
  };

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
        
        <button 
          className={`nav-btn ${isSidebarLocked(user) ? 'disabled' : ''}`} 
          onClick={() => !isSidebarLocked(user) && hist.push("/certificates")}
        >
          <div className="nav-icon"><FiAward /></div>
          <span>Certificates</span>
          {isSidebarLocked(user) && <div className="nav-lock"><FiLock size={14} /></div>}
          <div className="nav-glow"></div>
        </button>
        
        <button 
          className={`nav-btn ${isSidebarLocked(user) ? 'disabled' : ''}`} 
          onClick={() => !isSidebarLocked(user) && hist.push("/sandbox")}
        >
          <div className="nav-icon"><FiPlayCircle /></div>
          <span>CodeSandbox</span>
          {isSidebarLocked(user) && <div className="nav-lock"><FiLock size={14} /></div>}
          <div className="nav-glow"></div>
        </button>
        
        <button 
          className={`nav-btn ${selectedSection === "labs" ? "active" : ""} ${isSidebarLocked(user) ? 'disabled' : ''}`} 
          onClick={() => !isSidebarLocked(user) && setSelectedSection("labs")}
        >
          <div className="nav-icon"><FiTool /></div>
          <span>Labs</span>
          {isSidebarLocked(user) && <div className="nav-lock"><FiLock size={14} /></div>}
          <div className="nav-glow"></div>
        </button>
        
        <button 
          className={`nav-btn ${!profileCompletion.isComplete ? 'disabled' : ''} ${isSidebarLocked(user) ? 'disabled' : ''}`} 
          onClick={(e) => {
            e.preventDefault();
            if (!isSidebarLocked(user)) handleResumeClick();
          }}
        >
          <div className="nav-icon"><FiFileText /></div>
          <span>Resume</span>
          {(!profileCompletion.isComplete || isSidebarLocked(user)) && (
            <div className="nav-lock"><FiLock size={14} /></div>
          )}
          <div className="nav-glow"></div>
        </button>
        
        <button 
          className={`nav-btn ${isSidebarLocked(user) ? 'disabled' : ''}`} 
          onClick={() => !isSidebarLocked(user) && hist.push("/placement")}
        >
          <div className="nav-icon"><FiBriefcase /></div>
          <span>Placement</span>
          {isSidebarLocked(user) && <div className="nav-lock"><FiLock size={14} /></div>}
          <div className="nav-glow"></div>
        </button>

        <button 
          className={`nav-btn ${selectedSection === "saved-questions" ? "active" : ""} ${isSidebarLocked(user) ? 'disabled' : ''}`} 
          onClick={() => !isSidebarLocked(user) && setSelectedSection("saved-questions")}
        >
          <div className="nav-icon"><FiFileText /></div>
          <span>Saved questions</span>
          {isSidebarLocked(user) && <div className="nav-lock"><FiLock size={14} /></div>}
          <div className="nav-glow"></div>
        </button>
      </nav>

        <div ref={profileRef} className="profile-section" onClick={() => setShowMenu((p) => !p)}>
          <div className="profile-glass">
            <div className="profile-content">
              <div className="profile-image-container">
                <img
                  src={user?.profileImage || "/default-profile.png"}
                  alt="Profile"
                  className="profile-image"
                />
                {!profileCompletion.isComplete && (
                  <div className="profile-incomplete-indicator">
                    <FiAlertCircle size={14} />
                  </div>
                )}
              </div>
              <div className="profile-text">
                <span className="profile-name">{user?.name || ""}</span>
                <span className="profile-status">
                  {profileCompletion.isComplete ? "Profile Complete" : `Profile ${profileCompletion.percentage}% Complete`}
                </span>
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
                <div className="menu-item-content">
                  <div className="menu-item-left">
                    <FiUser className="menu-icon" />
                    <span>Profile</span>
                  </div>
                  {!profileCompletion.isComplete && (
                    <div className="profile-completion-badge">
                      <FiAlertCircle size={16} />
                      <span>{profileCompletion.percentage}%</span>
                    </div>
                  )}
                </div>
                {!profileCompletion.isComplete && (
                  <div className="profile-incomplete-message">
                    Complete your profile ({profileCompletion.missingFields} fields missing)
                  </div>
                )}
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

  {/* Add the StreakWidget here - positioned absolutely within hero-content */}
  
</div>
          </header>

          {/* Profile Completion Banner - Always shown when incomplete */}
          {!profileCompletion.isComplete && (
            <section className="profile-completion-banner">
              <div className="banner-glow"></div>
              <div className="banner-content">
                <div className="banner-icon">
                  <FiAlertCircle />
                </div>
                <div className="banner-text">
                  <h3>Complete Your Profile</h3>
                  <p>Your profile is {profileCompletion.percentage}% complete. Complete it to unlock all features and get better opportunities.</p>
                </div>
                <div className="banner-progress">
                  <div className="completion-ring">
                    <svg viewBox="0 0 36 36" className="circular-chart">
                      <path
                        className="circle-bg"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="circle"
                        strokeDasharray={`${profileCompletion.percentage}, 100`}
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="percentage">{profileCompletion.percentage}%</span>
                  </div>
                </div>
                <button className="complete-profile-btn" onClick={() => hist.push("/profile")}>
                  Complete Profile
                </button>
              </div>
            </section>
          )}

          {/* Only show course content if profile is complete */}
          {profileCompletion.isComplete ? (
            <>
            <div className="designing">
            
            <div className="divtwo">
  {course.subCourses?.map((sc, sIdx) => {
    // Calculate completion percentage for this subcourse
    const videoIds = sc.videos?.map((_, vIdx) => idOf(course._id, sIdx, vIdx)) || [];
    const completedVideos = videoIds.filter(id => watched.includes(id)).length;
    const totalVideos = videoIds.length;
    const hasLab = sc.lab === "Yes";
    
    let completed = completedVideos;
    let total = totalVideos;

    if (hasLab) {
      total += 1;
      const normalize = (s) => s?.trim().toLowerCase();
      const labEntry = labs.find((lab) => lab.subCourseId === sc._id);
      const regEntry = labEntry?.registeredStudents?.find(r => r.student === user?.id);
      const labPassed = regEntry?.attendance === true && normalize(regEntry?.result) === "pass";
      if (labPassed) completed += 1;
    }

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
      <section key={sIdx} className={`course-card ${isSubcourseLocked(course, sIdx, watched) ? 'course-locked' : ''}`}>
        <div className="card-glow"></div>
        
        {isSubcourseLocked(course, sIdx, watched) && (
          <div className="course-lock-overlay">
            <FiLock size={24} />
            <p>Complete the previous module to unlock this content</p>
          </div>
        )}
        
        <div className="card-header">
          <h3 style={{
            color: "#FF9500",
            fontWeight: "bold",
            marginLeft: "39px",
            fontSize:"22px",
          }}>{sc.title}</h3>
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

        <div className="card-content">
          {/* Rest of your card content remains the same */}
          {sc.videos?.map((v, vIdx) => {
            const id = idOf(course._id, sIdx, vIdx);
            const done = watched.includes(id);
            
            const unlockedCount = getUnlockedVideosCount(user, sIdx);
            const isLocked = vIdx >= unlockedCount || isSubcourseLocked(course, sIdx, watched);
            
            return (
              <React.Fragment key={id}>
                {/* Video Item */}
                <div 
                  className={`video-item ${done ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
                  onClick={() => {
                    if (!isLocked) hist.push(`/watch/${course._id}/${sIdx}/${vIdx}`);
                  }}
                >
                  <div className="video-icon">
                    {isLocked ? <FiLock /> : <FiPlayCircle />}
                  </div>
                  <span className="video-title">{v.title}</span>
                  <span className="video-duration">{v.duration}m</span>
                  {done && <FiCheckCircle className="completion-check" />}
                  {isLocked && (
                    <div className="locked-tooltip">
                      Complete previous videos to unlock this content
                    </div>
                  )}
                  <div className="item-glow"></div>
                </div>

                {/* Practice Item - Only show if video is unlocked */}
                {!isLocked && (
                  <div 
                    className="video-item"
                    onClick={() => hist.push(`/practice/${course._id}/${sIdx}/${vIdx}`)}
                  >
                    <div className="video-icon">
                      <FiFileText />
                    </div>
                    <span className="video-title">Practice for: {v.title}</span>
                    <span className="video-duration">Quiz</span>
                    <div className="item-glow"></div>
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {sc.lab === "Yes" && (() => {
            const videoIds = sc.videos?.map((_, vIdx) => idOf(course._id, sIdx, vIdx)) || [];
            const allVideosCompleted = videoIds.every(id => watched.includes(id));
            const normalize = s => s?.trim().toLowerCase();
            
            const isRegisteredForSubcourse = isUserRegisteredForSubcourse(sc._id);
            const userRegistration = getUserRegistrationForSubcourse(sc._id);
            const showGreenTick = userRegistration?.attendance === true && normalize(userRegistration?.result) === "pass";

            const isLabLocked = !allVideosCompleted || isRegisteredForSubcourse;

            return (
              <div 
                className={`lab-item ${isLabLocked ? 'locked' : ''} ${showGreenTick ? 'completed' : ''}`}
                onClick={() => {
                  if (!isLabLocked) {
                    setSelectedLabSubcourse(sc.title);
                    setSelectedSection("lab-details");
                  }
                }}
              >
                <div className="lab-icon">
                  {isLabLocked ? <FiLock /> : <FiTool />}
                </div>
                <span className="lab-title">PRACTICAL LAB</span>
                <div className="lab-status">
                  {isRegisteredForSubcourse ? (
                    <div className="status-group">
                      <span className="status-badge registered">✅ Registered</span>
                      
                      {userRegistration?.result && userRegistration.result !== 'pending' && (
                        <span className={`status-badge ${normalize(userRegistration.result)}`}>
                          {normalize(userRegistration.result) === "pass" ? "✅ Pass" : "❌ Fail"}
                        </span>
                      )}
                    </div>
                  ) : allVideosCompleted ? (
                    <span className="status-badge available">🟢 Available</span>
                  ) : (
                    <span className="status-badge pending">🔒 Complete videos first</span>
                  )}
                </div>
                {showGreenTick && <FiCheckCircle className="completion-check" />}
                <div className="item-glow"></div>
              </div>
            );
          })()}
        </div>
      </section>
    );
  })}
</div>
              <div className="widgetclass">
                  <StreakWidget watched={watched} />
            </div>
              </div>
            </>
          ) : (
            <div className="profile-incomplete-message">
              <FiLock size={48} />
              <h3>Complete Your Profile to Access Course Content</h3>
              <p>Your profile is currently {profileCompletion.percentage}% complete. Please complete all required fields to unlock the course materials.</p>
              <button 
                className="complete-profile-btn large"
                onClick={() => hist.push("/profile")}
              >
                Go to Profile
              </button>
            </div>
          )}
        </>
      )}

      {selectedSection === "saved-questions" && (
  <SavedQuestions user={user} />
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

                // Find the subcourse by title
                const selectedSubcourse = course.subCourses?.find(sc => sc.title === selectedLabSubcourse);
                
                if (!selectedSubcourse) {
                  return (
                    <div className="empty-state">
                      <FiTool size={48} />
                      <p>Subcourse not found</p>
                    </div>
                  );
                }

                // Check if user is already registered for this subcourse
                const isUserRegisteredForThisSubcourse = isUserRegisteredForSubcourse(selectedSubcourse._id);

                if (isUserRegisteredForThisSubcourse) {
                  return (
                    <div className="empty-state">
                      <FiLock size={48} />
                      <p>You are already registered for a lab in this subcourse. Lab registration is limited to one per subcourse.</p>
                    </div>
                  );
                }

                // Find matching labs that are NOT the ones user is registered for
                const matchingLabs = labs.filter(
                  (lab) => lab.subCourseId === selectedSubcourse._id
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
                  const currentRegistrations = lab.registeredStudents?.length || 0;
                  const isFull = currentRegistrations >= lab.memberCount;

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
                      // Go back to home after registration
                      setSelectedLabSubcourse(null);
                      setSelectedSection("home");
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
                          <p className="lab-capacity">
                            Capacity: {currentRegistrations}/{lab.memberCount}
                            {isFull && <span className="full-badge"> (Full)</span>}
                          </p>
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
  className={`btn-primary ${isFull ? 'disabled' : ''}`}
  onClick={() => handleRegisterClick(lab)}
  disabled={isFull}
>
  {isFull ? 'Lab Full' : 'Register Now'}
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

        {showRegisterWarning && (
  <div className="popup-overlay">
    <div className="popup-content">
      <h3>⚠️ Important Notice</h3>
      <p>
        Once registered, you cannot modify your slot. If you fail to attend the
        lab for any reason, you will be marked as fail. You can only re-register
        by paying the registration fee again.
      </p>
      <div className="popup-actions">
        <button className="btn-secondary" onClick={() => setShowRegisterWarning(false)}>
          Cancel
        </button>
        <button className="btn-primary" onClick={confirmRegister}>
          Confirm & Register
        </button>
      </div>
    </div>
  </div>
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

      {showResumeLocked && (
        <div className="resume-locked-modal">
          <div className="modal-backdrop" onClick={() => setShowResumeLocked(false)}></div>
          <div className="modal-content">
            <div className="modal-icon-container">
              <FiLock size={48} className="modal-icon" />
            </div>
            <h2>Profile Incomplete</h2>
            <p>Please complete your profile to access the Resume Builder feature. You've completed {profileCompletion.percentage}% of your profile.</p>
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowResumeLocked(false)}
              >
                I'll do it later
              </button>
              <button 
                className="btn-primary"
                onClick={() => {
                  setShowResumeLocked(false);
                  hist.push("/profile");
                }}
              >
                Complete Profile Now
              </button>
            </div>
          </div>
          
        </div>
      )}

      {showRegistrationSuccess && (
  <div className="success-popup">
    <div className="popup-overlay">
      <div className="popup-content registration-success">
        <div className="success-icon">
          <FiCheckCircle size={48} />
        </div>
        <h3>🎉 Success!</h3>
        <p>{registrationMessage}</p>
        <button 
          className="close-popup-btn"
          onClick={() => setShowRegistrationSuccess(false)}
        >
          <FiX />
        </button>
      </div>
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
