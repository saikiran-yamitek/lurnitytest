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
        
        // Fetch profile data for completion check
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
  }, [hist, fetchProfileData]);
  
  // ... rest of the component code remains the same ...