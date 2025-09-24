import React, { useEffect, useRef, useState, useCallback } from "react";
import { useHistory } from "react-router-dom";
import HelpTicketForm from "./HelpTicketForm";
import {
  FiHome, FiAward, FiChevronRight, FiPlayCircle,
  FiUser, FiPhone, FiLogOut, FiCheckCircle,
  FiHelpCircle, FiLifeBuoy, FiTool, FiRefreshCw, FiLock, FiFileText, FiBriefcase,
  FiAlertCircle, FiX, FiStar, FiTrendingUp,
} from "react-icons/fi";
import logo from "../assets/LURNITY.jpg";

import "./Home.css";
import StreakWidget from "./StreakWidget";
import SavedQuestions from "./SavedQuestions";

const API = process.env.REACT_APP_API_URL;
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
  const [issuedCertificates, setIssuedCertificates] = useState([]);

  // ✅ Safe array helper function
  const getSafeArray = (data, fallbackKeys = ['items', 'data', 'results']) => {
    if (Array.isArray(data)) return data;
    
    for (const key of fallbackKeys) {
      if (data && Array.isArray(data[key])) {
        return data[key];
      }
    }
    
    return [];
  };

  const isSidebarLocked = (user) => {
    return user?.status === "banned" || !user?.course;
  };

  // Utility functions for video unlocking
  const getMaxVideosForDay = (learningHours) => {
    return Math.min(learningHours + 1, 4);
  };

  const getUnlockedVideosCount = (user, subCourseIndex) => {
  // Calculate time-based unlocking for all subcourses
  const startDate = user.startDate ? new Date(user.startDate) : new Date();
  const currentDate = new Date();
  const dayDiff = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
  const maxVideos = getMaxVideosForDay(user.learningHours || 3);
  
  if (subCourseIndex === 0) {
    // First subcourse: Standard time-based unlocking
    return Math.min(maxVideos * (dayDiff + 1), 100);
  } else {
    // Other subcourses: If unlocked, apply same time-based logic
    // but maybe with a bonus or accelerated unlocking
    const acceleratedVideos = Math.min(maxVideos * (dayDiff + 1), 100);
    return acceleratedVideos;
  }
};


  // ✅ FIXED: Only consider videos and labs for subcourse locking (exclude practice)
  const isSubcourseLocked = (course, subCourseIndex, watched) => {
  if (subCourseIndex === 0) return false;
  
  const prevSubCourse = course.subCourses[subCourseIndex - 1];
  const videoIds = prevSubCourse.videos?.map((_, vIdx) => 
    idOf(course.id, subCourseIndex - 1, vIdx)
  );
  const allVideosWatched = videoIds.every(id => watched.includes(id));

  if (prevSubCourse.lab === "Yes") {
    const safeLabs = getSafeArray(labs);
    const lab = safeLabs.find(l => l.subCourseId === prevSubCourse.title);
    if (lab) {
      const registeredStudents = getSafeArray(lab.registeredStudents);
      const labCompleted = registeredStudents.some(r => 
        r.student === user?.id && r.attendance && r.result?.toLowerCase() === "pass"
      );
      // FIXED: Both videos AND lab must be completed to unlock next subcourse
      return !(allVideosWatched && labCompleted);
    }
    return true; // If lab exists but no registration found, keep locked
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
      const res = await fetch(`${API}/api/workshops/${pendingLabToRegister.id}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({ userId: user?.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      
      setRegistrationMessage("Registration Successful!");
      setShowRegistrationSuccess(true);
      
      fetchLabs(user.id);
      setShowRegisterWarning(false);
      setPendingLabToRegister(null);
      setSelectedLabSubcourse(null);
      setSelectedSection("home");
      
      setTimeout(() => {
        setShowRegistrationSuccess(false);
      }, 3000);
      
    } catch (err) {
      alert("❌ " + err.message);
    }
  };
  
  // ✅ FIXED: Only count videos and labs for course completion (exclude practice)
  const calculateCourseCompletion = () => {
    if (!course || !watched || !course.subCourses) return 0;
    let totalItems = 0;
    let completedItems = 0;
    
    const safeCourse = course.subCourses || [];
    const safeLabs = getSafeArray(labs);
    
    safeCourse.forEach((sc, sIdx) => {
      // Only count videos (not practice)
      const videoIds = sc.videos?.map((_, vIdx) => idOf(course.id, sIdx, vIdx)) || [];
      const completed = videoIds.filter(id => watched.includes(id)).length;
      totalItems += videoIds.length;
      completedItems += completed;
      
      // Only count labs if they exist
      if (sc.lab === "Yes") {
        totalItems += 1;
        const normalize = (s) => s?.trim().toLowerCase();
        const labEntry = safeLabs.find((lab) => lab.subCourseId === sc.title);
        
        if (labEntry) {
          const registeredStudents = getSafeArray(labEntry.registeredStudents);
          const regEntry = registeredStudents.find(r => r.student === user?.id);
          const labPassed = regEntry?.attendance === true && normalize(regEntry?.result) === "pass";
          if (labPassed) completedItems += 1;
        }
      }
    });
    return totalItems ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  // ✅ FIXED: Calculate subcourse completion only with videos and labs
  const calculateSubcourseCompletion = (sc, sIdx) => {
    const videoIds = sc.videos?.map((_, vIdx) => idOf(course.id, sIdx, vIdx)) || [];
    let completed = videoIds.filter(id => watched.includes(id)).length;
    let total = videoIds.length;

    // Only include lab if it exists
    if (sc.lab === "Yes") {
      total += 1;
      const normalize = (s) => s?.trim().toLowerCase();
      const safeLabs = getSafeArray(labs);
      const labEntry = safeLabs.find((lab) => lab.subCourseId === sc.title);
      
      if (labEntry) {
        const registeredStudents = getSafeArray(labEntry.registeredStudents);
        const regEntry = registeredStudents.find(r => r.student === user?.id);
        const labPassed = regEntry?.attendance === true && normalize(regEntry?.result) === "pass";
        if (labPassed) completed += 1;
      }
    }

    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const generateSubcourseCertificate = async (subCourseTitle) => {
    try {
      const res = await fetch(`${API}/api/certificates/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({
          userId: user.id,
          courseId: course.id,
          subCourseTitle,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Certificate generation failed");

    } catch (err) {
      console.error("Certificate generation error:", err);
    }
  };

  // ✅ FIXED: Proper video completion tracking function
  const markVideoAsWatched = async (courseId, sIdx, vIdx) => {
    const videoId = idOf(courseId, sIdx, vIdx);
    
    // Don't mark as watched if already watched
    if (watched.includes(videoId)) return;
    
    try {
      const res = await fetch(`${API}/api/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({
          videoId: videoId,
          userId: user?.id,
          completed: true
        }),
      });
      
      if (res.ok) {
        // Update local state
        setWatched(prev => [...prev, videoId]);
      }
    } catch (err) {
      console.error("Error marking video as watched:", err);
    }
  };

  const checkProfileCompletion = (profileData) => {
    if (!profileData) return { isComplete: false, missingFields: 0, totalFields: 0, percentage: 0 };
    
    let totalFields = 0;
    let filledFields = 0;
    
    const isFieldFilled = (value) => {
      if (value === null || value === undefined || value === "") return false;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "object") return Object.keys(value).length > 0;
      return true;
    };
    
    // Profile completion logic (same as before)
    const basicFields = [
      profileData.firstName, profileData.lastName, profileData.name,
      profileData.gender, profileData.communicationLanguage, profileData.teachingLanguage,
      profileData.dateOfBirth, profileData.linkedIn, profileData.twitter,
      profileData.github, profileData.resumeURL, profileData.photoURL
    ];
    
    basicFields.forEach(field => {
      totalFields++;
      if (isFieldFilled(field)) filledFields++;
    });

    // Add other field checks...
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

  // ✅ Safe fetchLabs function
  const fetchLabs = async (userId) => {
    try {
      const res = await fetch(`${API}/api/workshops`, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });
      const data = await res.json();
      console.log('🔍 Labs API response:', data);
      
      const safeLabs = getSafeArray(data, ['items', 'workshops']);
      console.log('✅ Safe labs array:', safeLabs);
      setLabs(safeLabs);
    } catch (err) {
      console.error("Error fetching labs", err);
      setLabs([]);
    }
  };

  const fetchProfileData = useCallback(async (userId) => {
    try {
      const response = await fetch(`${API}/api/user/${userId}/profile`);
      const data = await response.json();
      if (response.ok && data) {
        const completion = checkProfileCompletion(data.user);
        setProfileCompletion(completion);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  }, []);

  // ✅ Safe user registration functions
  const isUserRegisteredForSubcourse = (subCourseId) => {
    const safeLabs = getSafeArray(labs);
    return safeLabs.some(lab => {
      if (lab.subCourseId !== subCourseId) return false;
      const registeredStudents = getSafeArray(lab.registeredStudents);
      return registeredStudents.some(r => r.student === user?.id);
    });
  };

  const getUserRegistrationForSubcourse = (subCourseId) => {
    const safeLabs = getSafeArray(labs);
    const lab = safeLabs.find(lab => {
      if (lab.subCourseId !== subCourseId) return false;
      const registeredStudents = getSafeArray(lab.registeredStudents);
      return registeredStudents.some(r => r.student === user?.id);
    });
    
    if (lab) {
      const registeredStudents = getSafeArray(lab.registeredStudents);
      return registeredStudents.find(r => r.student === user?.id);
    }
    return null;
  };

  // All useEffect hooks
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      hist.replace("/login");
      return;
    }

    const handleBackNavigation = (e) => {
      e.preventDefault();
      hist.replace(hist.location.pathname);
    };

    window.addEventListener('popstate', handleBackNavigation);
    window.history.pushState(null, null, window.location.href);

    const fetchJSON = (url) =>
      fetch(url, { headers: { Authorization: "Bearer " + token } })
        .then((r) => {
          if (!r.ok) throw new Error(r.statusText);
          return r.json();
        });

    (async () => {
      try {
        const watchedData = await fetchJSON(`${API}/api/progress`);
        setWatched(Array.isArray(watchedData) ? watchedData : []);
      } catch {}

      try {
        const u = await fetchJSON(`${API}/api/user/homepage`);
        setUser(u);
        await fetchLabs(u.id);
        
        if (u.id) {
          await fetchProfileData(u.id);
        }

        if (u.alertAvailable) {
          setPopupMessage("✅ Your ticket has been resolved.");
          setTimeout(() => setPopupMessage(""), 3000);
          await fetch(`${API}/api/user/alert`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: u.email, alert: false }),
          });
        }

        if (u.status === "banned") return setNote("This account has been permanently banned.");
        if (u.status === "suspended") return setNote("Your account is suspended. Please contact your mentor.");
        if (!u.course) return setNote("Course yet to be decided. Please wait for admin enrolment.");

        const coursesResponse = await fetchJSON(`${API}/api/courses`);
        console.log('🔍 Courses API response:', coursesResponse);
        
        const allCourses = getSafeArray(coursesResponse, ['items', 'courses']);
        console.log('✅ Safe courses array:', allCourses);
        
        const found = allCourses.find(
          (c) => c.id === u.course || c.title?.toLowerCase() === u.course?.toLowerCase()
        );
        
        if (!found)
          return setNote(`No course titled "${u.course}" found. Please contact admin.`);
        setCourse(found);
      } catch (e) {
        setNote(e.message || "Unable to load data.");
      }
    })();

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

  // ✅ FIXED: Certificate generation only for 100% completed subcourses (videos + labs only)
  useEffect(() => {
    if (!user || !course || !course.subCourses) return;

    course.subCourses.forEach(async (sc, sIdx) => {
      const percent = calculateSubcourseCompletion(sc, sIdx);
      
      // Only issue certificate if 100% complete and not already issued
      const alreadyIssued = issuedCertificates.includes(sc.title);
      if (percent === 100 && !alreadyIssued) {
        await generateSubcourseCertificate(sc.title);
        setIssuedCertificates(prev => [...prev, sc.title]);
      }
    });
  }, [watched, labs, course, user, issuedCertificates]);

  const handleResumeClick = () => {
    if (!profileCompletion.isComplete) {
      setShowResumeLocked(true);
      return false;
    }
    hist.push("/resume");
  };

  // **ENHANCED SCROLLABLE SIDEBAR COMPONENT**
  const Sidebar = () => (
    <aside className="lms-luxury-sidebar">
      <div className="lms-sidebar-shimmer"></div>
      <div className="lms-sidebar-scroll-container">
        <div className="lms-sidebar-content">
          {/* Premium Logo Section */}
          <div className="lms-luxury-logo-section">
            <div className="lms-logo-backdrop">
              <div className="lms-logo-aurora"></div>
            </div>
            <div className="lms-logo-container">
              <img src={logo} alt="Lurnity" className="lms-luxury-logo" />
              <div className="lms-logo-reflection"></div>
            </div>
            <div className="lms-logo-text">
              <h2>LURNITY</h2>
              <span>Excellence in Learning</span>
            </div>
          </div>
          
          {/* Premium Navigation */}
          <nav className="lms-luxury-nav">
            <div className="lms-nav-section">
              <span className="lms-nav-section-title">MAIN</span>
              <button 
                className={`lms-luxury-nav-btn ${selectedSection === "home" ? "active" : ""}`} 
                onClick={() => setSelectedSection("home")}
              >
                <div className="lms-nav-btn-content">
                  <div className="lms-nav-icon-wrapper">
                    <FiHome className="lms-nav-icon" />
                  </div>
                  <span className="lms-nav-text">Dashboard</span>
                  <div className="lms-nav-indicator"></div>
                </div>
                <div className="lms-nav-glow-effect"></div>
              </button>
              
              <button 
                className={`lms-luxury-nav-btn ${isSidebarLocked(user) ? 'disabled' : ''}`} 
                onClick={() => !isSidebarLocked(user) && hist.push("/certificates")}
              >
                <div className="lms-nav-btn-content">
                  <div className="lms-nav-icon-wrapper">
                    <FiAward className="lms-nav-icon" />
                  </div>
                  <span className="lms-nav-text">Certificates</span>
                  {isSidebarLocked(user) && <FiLock className="lms-nav-lock" />}
                  <div className="lms-nav-indicator"></div>
                </div>
                <div className="lms-nav-glow-effect"></div>
              </button>
              
              <button 
                className={`lms-luxury-nav-btn ${isSidebarLocked(user) ? 'disabled' : ''}`} 
                onClick={() => !isSidebarLocked(user) && hist.push("/sandbox")}
              >
                <div className="lms-nav-btn-content">
                  <div className="lms-nav-icon-wrapper">
                    <FiPlayCircle className="lms-nav-icon" />
                  </div>
                  <span className="lms-nav-text">CodeSandbox</span>
                  {isSidebarLocked(user) && <FiLock className="lms-nav-lock" />}
                  <div className="lms-nav-indicator"></div>
                </div>
                <div className="lms-nav-glow-effect"></div>
              </button>
            </div>

            <div className="lms-nav-section">
              <span className="lms-nav-section-title">LEARNING</span>
              <button 
                className={`lms-luxury-nav-btn ${selectedSection === "labs" ? "active" : ""} ${isSidebarLocked(user) ? 'disabled' : ''}`} 
                onClick={() => !isSidebarLocked(user) && setSelectedSection("labs")}
              >
                <div className="lms-nav-btn-content">
                  <div className="lms-nav-icon-wrapper">
                    <FiTool className="lms-nav-icon" />
                  </div>
                  <span className="lms-nav-text">Practical Labs</span>
                  {isSidebarLocked(user) && <FiLock className="lms-nav-lock" />}
                  <div className="lms-nav-indicator"></div>
                </div>
                <div className="lms-nav-glow-effect"></div>
              </button>
              
              <button 
                className={`lms-luxury-nav-btn ${selectedSection === "saved-questions" ? "active" : ""} ${isSidebarLocked(user) ? 'disabled' : ''}`} 
                onClick={() => !isSidebarLocked(user) && setSelectedSection("saved-questions")}
              >
                <div className="lms-nav-btn-content">
                  <div className="lms-nav-icon-wrapper">
                    <FiFileText className="lms-nav-icon" />
                  </div>
                  <span className="lms-nav-text">Saved Questions</span>
                  {isSidebarLocked(user) && <FiLock className="lms-nav-lock" />}
                  <div className="lms-nav-indicator"></div>
                </div>
                <div className="lms-nav-glow-effect"></div>
              </button>
            </div>

            <div className="lms-nav-section">
              <span className="lms-nav-section-title">CAREER</span>
              <button 
                className={`lms-luxury-nav-btn ${!profileCompletion.isComplete ? 'disabled' : ''} ${isSidebarLocked(user) ? 'disabled' : ''}`} 
                onClick={(e) => {
                  e.preventDefault();
                  if (!isSidebarLocked(user)) handleResumeClick();
                }}
              >
                <div className="lms-nav-btn-content">
                  <div className="lms-nav-icon-wrapper">
                    <FiFileText className="lms-nav-icon" />
                  </div>
                  <span className="lms-nav-text">Resume Builder</span>
                  {(!profileCompletion.isComplete || isSidebarLocked(user)) && (
                    <FiLock className="lms-nav-lock" />
                  )}
                  <div className="lms-nav-indicator"></div>
                </div>
                <div className="lms-nav-glow-effect"></div>
              </button>
              
              <button 
                className={`lms-luxury-nav-btn ${isSidebarLocked(user) ? 'disabled' : ''}`} 
                onClick={() => !isSidebarLocked(user) && hist.push("/placement")}
              >
                <div className="lms-nav-btn-content">
                  <div className="lms-nav-icon-wrapper">
                    <FiBriefcase className="lms-nav-icon" />
                  </div>
                  <span className="lms-nav-text">Placement Portal</span>
                  {isSidebarLocked(user) && <FiLock className="lms-nav-lock" />}
                  <div className="lms-nav-indicator"></div>
                </div>
                <div className="lms-nav-glow-effect"></div>
              </button>
            </div>
          </nav>

          {/* Premium Profile Section */}
          <div ref={profileRef} className="lms-luxury-profile-section" onClick={() => setShowMenu((p) => !p)}>
            <div className="lms-profile-card">
              <div className="lms-profile-backdrop"></div>
              <div className="lms-profile-content">
                <div className="lms-profile-avatar-container">
                  <div className="lms-profile-avatar-ring">
                    <img
                      src={user?.profileImage || "/default-profile.png"}
                      alt="Profile"
                      className="lms-profile-avatar"
                    />
                  </div>
                  {!profileCompletion.isComplete && (
                    <div className="lms-profile-status-indicator">
                      <FiAlertCircle />
                    </div>
                  )}
                </div>
                <div className="lms-profile-info">
                  <span className="lms-profile-name">{user?.name || "User"}</span>
                  <span className="lms-profile-status">
                    {profileCompletion.isComplete ? (
                      <>
                        <FiCheckCircle className="lms-status-icon" />
                        Profile Complete
                      </>
                    ) : (
                      <>
                        <FiTrendingUp className="lms-status-icon" />
                        {profileCompletion.percentage}% Complete
                      </>
                    )}
                  </span>
                </div>
                <div className="lms-profile-expand">
                  <FiChevronRight className="lms-expand-icon" />
                </div>
              </div>
            </div>
          </div>

          {/* Premium Menu */}
          {showMenu && (
            <div ref={menuRef} className="lms-luxury-menu">
              <div className="lms-menu-backdrop"></div>
              <div className="lms-menu-content">
                <div className="lms-menu-item" onClick={() => { hist.push("/profile"); setShowMenu(false); }}>
                  <div className="lms-menu-item-icon">
                    <FiUser />
                  </div>
                  <div className="lms-menu-item-content">
                    <span className="lms-menu-item-title">Profile Settings</span>
                    <span className="lms-menu-item-subtitle">Manage your account</span>
                  </div>
                  {!profileCompletion.isComplete && (
                    <div className="lms-menu-item-badge">
                      <span>{profileCompletion.percentage}%</span>
                    </div>
                  )}
                </div>
                
                <div className="lms-menu-item" onClick={() => { hist.push("/contact"); setShowMenu(false); }}>
                  <div className="lms-menu-item-icon">
                    <FiPhone />
                  </div>
                  <div className="lms-menu-item-content">
                    <span className="lms-menu-item-title">Contact Support</span>
                    <span className="lms-menu-item-subtitle">Get help when you need it</span>
                  </div>
                </div>
                
                <div className="lms-menu-divider"></div>
                
                <div className="lms-menu-item danger" onClick={() => { localStorage.clear(); hist.replace("/login"); }}>
                  <div className="lms-menu-item-icon">
                    <FiLogOut />
                  </div>
                  <div className="lms-menu-item-content">
                    <span className="lms-menu-item-title">Sign Out</span>
                    <span className="lms-menu-item-subtitle">Securely log out</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );

  // Error states remain the same...
  if (note && user?.status === "banned") {
    return (
      <div className="lms-home-wrapper">
        <div className="lms-ban-screen">
          <h2>{note}</h2>
        </div>
      </div>
    );
  }

  if (note && !course) {
    return (
      <div className="lms-home-wrapper">
        <div className="lms-app-container">
          <Sidebar />
          <main className="lms-main-content">
            <div className="lms-status-message">
              <h2>{note}</h2>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!course) return (
    <div className="lms-home-wrapper">
      <div className="lms-luxury-loading">
        <div className="lms-loading-backdrop">
          <div className="lms-loading-aurora"></div>
        </div>
        <div className="lms-loading-content">
          <div className="lms-loading-spinner">
            <div className="lms-spinner-ring"></div>
            <div className="lms-spinner-ring"></div>
            <div className="lms-spinner-ring"></div>
          </div>
          <h3>Preparing Your Experience</h3>
          <p>Setting up your luxury learning environment...</p>
        </div>
      </div>
    </div>
  );

  // Main render with enhanced luxury structure...
  return (
    <div className="lms-home-wrapper">
      <div className="lms-app-container">
        <Sidebar />
        <main className="lms-luxury-main-content">
          {selectedSection === "home" && (
            <>
              {/* Premium Hero Section */}
              <section className="lms-luxury-hero">
                <div className="lms-hero-backdrop">
                  <div className="lms-hero-aurora lms-aurora-1"></div>
                  <div className="lms-hero-aurora lms-aurora-2"></div>
                  <div className="lms-hero-aurora lms-aurora-3"></div>
                </div>
                
                <div className="lms-hero-content">
                  <div className="lms-hero-text">
                    <div className="lms-hero-badge">
                      <FiStar className="lms-badge-icon" />
                      <span>Premium Learning Experience</span>
                    </div>
                    <h1 className="lms-hero-title">{course.title}</h1>
                    <p className="lms-hero-subtitle">Continue your extraordinary journey to excellence</p>
                  </div>
                  
                  <div className="lms-hero-progress">
                    <div className="lms-progress-card">
                      <div className="lms-progress-ring-container">
                        <svg className="lms-progress-ring" viewBox="0 0 120 120">
                          <defs>
                            <linearGradient id="lmsProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#FFD700" />
                              <stop offset="50%" stopColor="#FFA500" />
                              <stop offset="100%" stopColor="#FF8C00" />
                            </linearGradient>
                          </defs>
                          <circle
                            className="lms-progress-bg"
                            cx="60"
                            cy="60"
                            r="54"
                          />
                          <circle
                            className="lms-progress-fill"
                            cx="60"
                            cy="60"
                            r="54"
                            strokeDasharray={`${courseCompletion * 3.39} 339`}
                          />
                        </svg>
                        <div className="lms-progress-text">
                          <span className="lms-progress-number">{courseCompletion}%</span>
                          <span className="lms-progress-label">Mastered</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Profile completion banner */}
              {!profileCompletion.isComplete && (
                <section className="lms-luxury-alert-banner">
                  <div className="lms-alert-backdrop"></div>
                  <div className="lms-alert-content">
                    <div className="lms-alert-icon">
                      <FiAlertCircle />
                    </div>
                    <div className="lms-alert-text">
                      <h3>Complete Your Premium Profile</h3>
                      <p>Unlock all premium features and opportunities by completing your profile ({profileCompletion.percentage}% done)</p>
                    </div>
                    <button className="lms-luxury-btn primary" onClick={() => hist.push("/profile")}>
                      Complete Now
                    </button>
                  </div>
                </section>
              )}

              {/* Course content with luxury styling and STREAK WIDGET */}
              {profileCompletion.isComplete ? (
                <div className="lms-luxury-content-grid">
                  <div className="lms-content-main">
                    {course.subCourses?.map((sc, sIdx) => {
                      const percent = calculateSubcourseCompletion(sc, sIdx);

                      return (
                        <div key={sIdx} className={`lms-luxury-course-module ${isSubcourseLocked(course, sIdx, watched) ? 'locked' : ''}`}>
                          <div className="lms-module-backdrop"></div>
                          
                          {isSubcourseLocked(course, sIdx, watched) && (
                            <div className="lms-module-lock-overlay">
                              <FiLock className="lms-lock-icon" />
                              <h4>Module Locked</h4>
                              <p>Complete previous modules to unlock</p>
                            </div>
                          )}
                          
                          <div className="lms-module-header">
                            <div className="lms-module-title-section">
                              <h3 className="lms-module-title">{sc.title}</h3>
                              <div className="lms-module-progress">
                                <span className="lms-progress-text">{percent}% Complete</span>
                                <div className="lms-progress-bar">
                                  <div 
                                    className="lms-progress-fill"
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="lms-module-content">
                            {sc.videos?.map((v, vIdx) => {
                              const id = idOf(course.id, sIdx, vIdx);
                              const done = watched.includes(id);
                              
                              const unlockedCount = getUnlockedVideosCount(user, sIdx);
                              const isLocked = vIdx >= unlockedCount || isSubcourseLocked(course, sIdx, watched);
                              
                              return (
                                <React.Fragment key={id}>
                                  <div 
                                    className={`lms-luxury-content-item video ${done ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
                                    onClick={() => {
                                      if (!isLocked) hist.push(`/watch/${course.id}/${sIdx}/${vIdx}`);
                                    }}
                                  >
                                    <div className="lms-item-backdrop"></div>
                                    <div className="lms-item-icon">
                                      {isLocked ? <FiLock /> : <FiPlayCircle />}
                                    </div>
                                    <div className="lms-item-content">
                                      <h4 className="lms-item-title">{v.title}</h4>
                                      <span className="lms-item-meta">{v.duration} minutes</span>
                                    </div>
                                    {done && <FiCheckCircle className="lms-completion-icon" />}
                                    {isLocked && (
                                      <div className="lms-item-tooltip">
                                        Complete previous content to unlock
                                      </div>
                                    )}
                                  </div>

                                  {!isLocked && (
                                    <div 
                                      className="lms-luxury-content-item practice"
                                      onClick={() => hist.push(`/practice/${course.id}/${sIdx}/${vIdx}`)}
                                    >
                                      <div className="lms-item-backdrop"></div>
                                      <div className="lms-item-icon">
                                        <FiFileText />
                                      </div>
                                      <div className="lms-item-content">
                                        <h4 className="lms-item-title">Practice: {v.title}</h4>
                                        <span className="lms-item-meta">Interactive Quiz</span>
                                      </div>
                                    </div>
                                  )}
                                </React.Fragment>
                              );
                            })}

                            {/* ✅ FIXED: Lab component with proper video completion checking */}
                            {sc.lab === "Yes" && (() => {
                              const videoIds = sc.videos?.map((_, vIdx) => idOf(course.id, sIdx, vIdx)) || [];
                              const allVideosCompleted = videoIds.every(id => watched.includes(id));
                              const normalize = s => s?.trim().toLowerCase();
                              
                              const isRegisteredForSubcourse = isUserRegisteredForSubcourse(sc.title);
                              const userRegistration = getUserRegistrationForSubcourse(sc.title);
                              const showGreenTick = userRegistration?.attendance === true && normalize(userRegistration?.result) === "pass";

                              // ✅ FIXED: Lab is locked if videos not completed OR already registered
                              const isLabLocked = !allVideosCompleted || isRegisteredForSubcourse;

                              return (
                                <div 
                                  className={`lms-luxury-content-item lab ${isLabLocked ? 'locked' : ''} ${showGreenTick ? 'completed' : ''}`}
                                  onClick={() => {
                                    if (!isLabLocked) {
                                      setSelectedLabSubcourse(sc.title);
                                      setSelectedSection("lab-details");
                                    }
                                  }}
                                >
                                  <div className="lms-item-backdrop"></div>
                                  <div className="lms-item-icon">
                                    {isLabLocked ? <FiLock /> : <FiTool />}
                                  </div>
                                  <div className="lms-item-content">
                                    <h4 className="lms-item-title">Hands-on Lab Session</h4>
                                    <div className="lms-lab-status-container">
                                      {isRegisteredForSubcourse ? (
                                        <div className="lms-status-badges">
                                          <span className="lms-status-badge registered">✓ Registered</span>
                                          {userRegistration?.result && userRegistration.result !== 'pending' && (
                                            <span className={`lms-status-badge ${normalize(userRegistration.result)}`}>
                                              {normalize(userRegistration.result) === "pass" ? "✓ Passed" : "✗ Failed"}
                                            </span>
                                          )}
                                        </div>
                                      ) : allVideosCompleted ? (
                                        <span className="lms-status-badge available">Available</span>
                                      ) : (
                                        <span className="lms-status-badge locked">Complete videos first</span>
                                      )}
                                    </div>
                                  </div>
                                  {showGreenTick && <FiCheckCircle className="lms-completion-icon" />}
                                </div>
                              );
                            })()}

                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="lms-content-sidebar">
                    <StreakWidget watched={watched} />
                  </div>
                </div>
              ) : (
                <div className="lms-profile-incomplete-screen">
                  <div className="lms-incomplete-backdrop"></div>
                  <div className="lms-incomplete-content">
                    <FiLock className="lms-incomplete-icon" />
                    <h3>Premium Features Locked</h3>
                    <p>Complete your profile to unlock all course materials and premium features.</p>
                    <div className="lms-completion-stats">
                      <span>Progress: {profileCompletion.percentage}%</span>
                      <div className="lms-mini-progress-bar">
                        <div 
                          className="lms-mini-progress-fill" 
                          style={{ width: `${profileCompletion.percentage}%` }}
                        />
                      </div>
                    </div>
                    <button 
                      className="lms-luxury-btn primary large"
                      onClick={() => hist.push("/profile")}
                    >
                      Complete Profile Now
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {selectedSection === "saved-questions" && (
            <div className="lms-section-wrapper">
              <SavedQuestions user={user} />
            </div>
          )}

          {/* Other sections with proper wrapper classes */}
          {selectedSection === "labs" && (
            <section className="lms-luxury-section">
              <div className="lms-section-header">
                <h2 className="lms-section-title">Registered Laboratory Sessions</h2>
                <button
                  className="lms-luxury-btn secondary"
                  onClick={() => fetchLabs(user.id)}
                >
                  <FiRefreshCw />
                  Refresh
                </button>
              </div>

              <div className="lms-labs-grid">
                {(() => {
                  const safeLabs = getSafeArray(labs);
                  const registeredLabs = safeLabs.filter((lab) => {
                    const registeredStudents = getSafeArray(lab.registeredStudents);
                    return registeredStudents.some((r) => r.student === user?.id);
                  });

                  if (registeredLabs.length === 0) {
                    return (
                      <div className="lms-empty-state">
                        <FiTool className="lms-empty-icon" />
                        <h3>No Registered Labs</h3>
                        <p>You haven't registered for any lab sessions yet.</p>
                      </div>
                    );
                  }

                  return registeredLabs.map((lab) => {
                    const registeredStudents = getSafeArray(lab.registeredStudents);
                    const reg = registeredStudents.find((r) => r.student === user?.id);
                    const result = reg?.result?.toLowerCase() || "pending";

                    return (
                      <div key={lab.id} className="lms-luxury-lab-card">
                        <div className="lms-lab-card-backdrop"></div>
                        <div className="lms-lab-card-content">
                          <div className="lms-lab-header">
                            <div className="lms-lab-icon">
                              <FiTool />
                            </div>
                            <div className="lms-lab-info">
                              <h4 className="lms-lab-name">{lab.labName}</h4>
                              <p className="lms-lab-address">{lab.labAddress}</p>
                              <p className="lms-lab-time">
                                {new Date(lab.time).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="lms-lab-footer">
                            <div className="lms-lab-badges">
                              <span className={`lms-lab-badge attendance ${reg?.attendance === true ? 'present' : reg?.attendance === false ? 'absent' : 'pending'}`}>
                                {reg?.attendance === true ? "Present" : 
                                 reg?.attendance === false ? "Absent" : "Pending"}
                              </span>
                              <span className={`lms-lab-badge result ${result}`}>
                                {result === "pass" ? "Passed" : result === "fail" ? "Failed" : "Pending"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </section>
          )}

          {/* Lab details section with wrapper */}
          {selectedSection === "lab-details" && selectedLabSubcourse && (
            <section className="lms-luxury-section">
              <div className="lms-section-header">
                <button 
                  className="lms-luxury-btn text"
                  onClick={() => {
                    setSelectedLabSubcourse(null);
                    setSelectedSection("home");
                  }}
                >
                  ← Back to Dashboard
                </button>
                <h2 className="lms-section-title">Lab Sessions: {selectedLabSubcourse}</h2>
              </div>

              <div className="lms-lab-details-grid">
                {(() => {
                  const userId = user?.id;
                  const safeLabs = getSafeArray(labs);
                  const matchingLabs = safeLabs.filter(
                    (lab) => lab.subCourseId === selectedLabSubcourse
                  );

                  if (matchingLabs.length === 0) {
                    return (
                      <div className="lms-empty-state">
                        <FiTool className="lms-empty-icon" />
                        <h3>No Lab Sessions</h3>
                        <p>No laboratory sessions are scheduled for this module yet.</p>
                      </div>
                    );
                  }

                  return matchingLabs.map((lab) => {
                    const registeredStudents = getSafeArray(lab.registeredStudents);
                    const isRegistered = registeredStudents.some((r) => r.student === userId);
                    const labTime = new Date(lab.time).toLocaleString();
                    const currentRegistrations = registeredStudents.length;
                    const isFull = currentRegistrations >= Number(lab.memberCount);

                    const handleRegister = async () => {
                      try {
                        const res = await fetch(`${API}/api/workshops/${lab.id}/register`, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + localStorage.getItem("token"),
                          },
                          body: JSON.stringify({ userId }),
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error || "Error");
                        setRegistrationMessage("Registration Successful!");
                        setShowRegistrationSuccess(true);
                        fetchLabs(userId);
                        setSelectedLabSubcourse(null);
                        setSelectedSection("home");
                      } catch (err) {
                        alert("❌ " + err.message);
                      }
                    };

                    const handleDeregister = async () => {
                      try {
                        const res = await fetch(`${API}/api/workshops/${lab.id}/deregister`, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + localStorage.getItem("token"),
                          },
                          body: JSON.stringify({ userId }),
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error || "Error");
                        alert("Successfully deregistered from lab session");
                        fetchLabs(userId);
                      } catch (err) {
                        alert("❌ " + err.message);
                      }
                    };

                    return (
                      <div key={lab.id} className="lms-luxury-lab-detail-card">
                        <div className="lms-lab-detail-backdrop"></div>
                        <div className="lms-lab-detail-content">
                          <div className="lms-lab-detail-header">
                            <div className="lms-lab-detail-icon">
                              <FiTool />
                            </div>
                            <div className="lms-lab-detail-info">
                              <h4 className="lms-lab-detail-title">{lab.labName}</h4>
                              <p className="lms-lab-detail-address">{lab.labAddress}</p>
                              <p className="lms-lab-detail-time">{labTime}</p>
                              <div className="lms-lab-detail-capacity">
                                <span className={`lms-capacity-text ${isFull ? 'full' : ''}`}>
                                  {currentRegistrations}/{lab.memberCount} registered
                                  {isFull && " (FULL)"}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="lms-lab-detail-actions">
                            {isRegistered ? (
                              <>
                                <div className="lms-status-badge registered">
                                  <FiCheckCircle />
                                  Registered
                                </div>
                                <button 
                                  className="lms-luxury-btn danger"
                                  onClick={handleDeregister}
                                >
                                  Cancel Registration
                                </button>
                              </>
                            ) : (
                              <button 
                                className={`lms-luxury-btn primary ${isFull ? 'disabled' : ''}`}
                                onClick={handleRegister}
                                disabled={isFull}
                              >
                                {isFull ? 'Session Full' : 'Register Now'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </section>
          )}

          {/* Warning popup */}
          {showRegisterWarning && (
            <div className="lms-luxury-modal-overlay">
              <div className="lms-luxury-modal">
                <div className="lms-modal-backdrop"></div>
                <div className="lms-modal-content">
                  <div className="lms-modal-header">
                    <div className="lms-modal-icon warning">
                      <FiAlertCircle />
                    </div>
                    <h3>Important Registration Notice</h3>
                  </div>
                  <div className="lms-modal-body">
                    <p>
                      Please note that once you register for this lab session:
                    </p>
                    <ul>
                      <li>You cannot modify or change your selected time slot</li>
                      <li>Missing the session will result in automatic failure</li>
                      <li>Re-registration requires payment of fees again</li>
                    </ul>
                  </div>
                  <div className="lms-modal-actions">
                    <button 
                      className="lms-luxury-btn secondary" 
                      onClick={() => setShowRegisterWarning(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="lms-luxury-btn primary" 
                      onClick={confirmRegister}
                    >
                      I Understand - Register
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Floating help button */}
        <button className="lms-luxury-help-btn" ref={helpBtnRef} onClick={() => setShowHelp((p) => !p)}>
          <div className="lms-help-btn-backdrop"></div>
          <FiHelpCircle className="lms-help-icon" />
          <div className="lms-help-pulse"></div>
        </button>

        {showHelp && (
          <div ref={helpRef} className="lms-luxury-help-popup">
            <div className="lms-help-popup-backdrop"></div>
            <div className="lms-help-popup-content">
              <div 
                className="lms-help-option"
                onClick={() => { setShowHelp(false); setTicketOpen(true); }}
              >
                <FiLifeBuoy className="lms-help-option-icon" />
                <div className="lms-help-option-text">
                  <span className="lms-help-option-title">Contact Support</span>
                  <span className="lms-help-option-subtitle">Get expert help</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {ticketOpen && user && (
          <HelpTicketForm user={user} onClose={() => setTicketOpen(false)} />
        )}

        {popupMessage && (
          <div className="lms-luxury-success-modal">
            <div className="lms-success-modal-backdrop"></div>
            <div className="lms-success-modal-content">
              <div className="lms-success-icon">
                <FiCheckCircle />
              </div>
              <h3>Success!</h3>
              <p>{popupMessage}</p>
            </div>
          </div>
        )}

        {showResumeLocked && (
          <div className="lms-luxury-modal-overlay">
            <div className="lms-luxury-modal" onClick={() => setShowResumeLocked(false)}>
              <div className="lms-modal-backdrop"></div>
              <div className="lms-modal-content" onClick={e => e.stopPropagation()}>
                <div className="lms-modal-header">
                  <div className="lms-modal-icon locked">
                    <FiLock />
                  </div>
                  <h3>Profile Incomplete</h3>
                </div>
                <div className="lms-modal-body">
                  <p>
                    Complete your profile to unlock the Resume Builder. 
                    You're {profileCompletion.percentage}% there!
                  </p>
                </div>
                <div className="lms-modal-actions">
                  <button 
                    className="lms-luxury-btn secondary"
                    onClick={() => setShowResumeLocked(false)}
                  >
                    Maybe Later
                  </button>
                  <button 
                    className="lms-luxury-btn primary"
                    onClick={() => {
                      setShowResumeLocked(false);
                      hist.push("/profile");
                    }}
                  >
                    Complete Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showRegistrationSuccess && (
          <div className="lms-luxury-success-popup">
            <div className="lms-success-popup-backdrop"></div>
            <div className="lms-success-popup-content">
              <div className="lms-success-popup-icon">
                <FiCheckCircle />
              </div>
              <h3>Registration Successful!</h3>
              <p>{registrationMessage}</p>
              <button 
                className="lms-success-close-btn"
                onClick={() => setShowRegistrationSuccess(false)}
              >
                <FiX />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
