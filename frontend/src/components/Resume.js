import React, { useEffect, useState } from "react";
import "./Resume.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useParams } from "react-router-dom";

const API = process.env.REACT_APP_API_URL;


const Resume = () => {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [includeWork, setIncludeWork] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { userId } = useParams();
  console.log(userId)

  useEffect(() => {
  const token = localStorage.getItem("token");
  const id = localStorage.getItem("userId");
  const url = `${API}/api/user/${id}/resume`;

  fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((data) => {
      setUser(data);
      if (data.projects) {
        setProjects(data.projects);
      }
    })
    .catch((err) => console.error("Error loading user:", err));
}, [userId]);


  const fetchProjects = async () => {
    if (!user?.geminiApiKey) return;

    setLoadingProjects(true);

    const skills = [
      ...(user.completedSubcourses || []),
      ...(user.currentExpertise?.knownSkills || []),
      ...(user.currentExpertise?.otherSkills ? [user.currentExpertise.otherSkills] : []),
    ];

    const prompt = `Generate exactly 3 software project ideas tailored to the following skills:

Skills: ${skills.join(", ")}

For each project:
- Provide a concise and creative **project title**.
- List **exactly 2 bullet points** describing the main features or goals.
- Projects should be achievable by someone with the above skills.
- Avoid using any technologies not mentioned in the skill list.
- Format: Numbered list, each project in the following format:

example of exact output should be like 
Retro Recipe Website
Display classic recipes with a vintage aesthetic, using only HTML and CSS for layout and styling.
Create a responsive design that adapts gracefully to different screen sizes.

1. Title: <Project Title>
   - Bullet 1
   - Bullet 2`;

    try {
      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": user.geminiApiKey,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const json = await res.json();
      const raw = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      const formattedProjects = raw
        .split(/\n\n|\n\d+\.\s/)
        .filter((p) => p)
        .map((block) => {
          const [title, ...points] = block
            .split(/\n|-\s/)
            .map((p) => p.trim())
            .filter(Boolean);
          return { title, points: points.slice(0, 2) };
        });

      setProjects(formattedProjects);
      await saveProjectsToBackend(formattedProjects);
    } catch (err) {
      console.error("Gemini API error", err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const downloadResume = () => {
    const input = document.querySelector(".resume-container");
    const originalWidth = input.style.width;
    
    // Temporarily set exact width for PDF generation
    input.style.width = "794px"; // A4 width in pixels at 96dpi
    
    html2canvas(input, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      scrollX: 0,
      scrollY: 0,
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4",
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${user.name}-Resume.pdf`);
      
      // Restore original width
      input.style.width = originalWidth;
    });
  };

  const saveProjectsToBackend = async (formattedProjects) => {
    const token = localStorage.getItem("token");
    const id = localStorage.getItem("userId");
    try {
      const response = await fetch(`${API}/api/user/${id}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projects: formattedProjects }),
      });

      if (!response.ok) throw new Error("Failed to save projects");
    } catch (err) {
      console.error("Save to backend failed:", err);
    }
  };

  if (!user) return <div className="resume-container">Loading...</div>;

  return (
    <div className="resume-wrapper">
      <header className="top-header">
        <div className="left-logo">
          <img src="/LURNITY.jpg" alt="Lurnity Logo" className="logo-img" />
        </div>
        <div className="right-nav">
          <a href="/home" className="nav-link">Home</a>
          {user?.photoURL && (
            <img src={user.photoURL} alt="Profile" className="nav-avatar" />
          )}
        </div>
      </header>

      <div className="resume-container">
        <div className="resume-logo">
          <img className="Lurnityimage" src="/lurnity_original.jpg" alt="Lurnity Logo" />
          <p className="logo-tagline">Made by Lurnity</p>
        </div>
        
        <div className="header-center">
          <h1>{user.name}</h1>
          <p>
            {user.currentAddress?.city}, {user.currentAddress?.state}{" "}
            {user.currentAddress?.pinCode} | {user.phone} | {user.email}
          </p>
          <p className="links">
            {user.github && (
              <a href={user.github} target="_blank" rel="noopener noreferrer">
                {user.github}
              </a>
            )}
            {user.github && user.linkedIn && " | "}
            {user.linkedIn && (
              <a href={user.linkedIn} target="_blank" rel="noopener noreferrer">
                {user.linkedIn}
              </a>
            )}
          </p>
        </div>

        <h2 className="headings">EDUCATION</h2>
        <div className="edu-entry">
          {user.bachelorsDegree?.degreeName && (
            <div className="edu-row">
              <div>
                <strong>{user.bachelorsDegree.instituteName}</strong>
                <br />
                {user.bachelorsDegree.degreeName}, {user.bachelorsDegree.department} (
                {user.bachelorsDegree.startYear?.slice(0, 4)} -{" "}
                {user.bachelorsDegree.endYear?.slice(0, 4)})
              </div>
              <div className="edu-score">
                {user.bachelorsDegree.cgpa && `${user.bachelorsDegree.cgpa} CGPA`}
              </div>
            </div>
          )}
          {user.intermediateOrDiploma?.institutionName && (
            <div className="edu-row">
              <div>
                <strong>{user.intermediateOrDiploma.institutionName}</strong>
                <br />
                Intermediate - {user.intermediateOrDiploma.stream}
              </div>
              <div className="edu-score">
                {user.intermediateOrDiploma.percentage &&
                  `${user.intermediateOrDiploma.percentage}%`}
              </div>
            </div>
          )}
          {user.tenthStandard?.schoolName && (
            <div className="edu-row">
              <div>
                <strong>{user.tenthStandard.schoolName}</strong>
                <br />
                10th Standard
              </div>
              <div className="edu-score">
                {user.tenthStandard.cgpa && `${user.tenthStandard.cgpa} CGPA`}
              </div>
            </div>
          )}
        </div>

        {includeWork && (
          <>
            <h2 className="headings">WORK EXPERIENCE</h2>
            {user.experience?.length > 0 ? (
              user.experience.map((exp, i) => (
                <div key={i}>
                  <h4>
                    {exp.companyName} ({exp.role})
                  </h4>
                  <p>
                    {exp.city}, {exp.state}
                  </p>
                  <p>
                    {exp.startDate} - {exp.endDate || "Present"}
                  </p>
                  <p>{exp.description}</p>
                </div>
              ))
            ) : (
              <p>No work experience added.</p>
            )}
          </>
        )}

        <h2 className="headings">SKILLS</h2>
        <ul className="ulskills">
          {[...new Set([...(user.currentExpertise?.knownSkills || []), ...(user.completedSubcourses || [])])].map((skill, idx) => (
            <li className="liskills" key={idx}>
              {skill}
            </li>
          ))}
          {user.currentExpertise?.otherSkills && <li>{user.currentExpertise.otherSkills}</li>}
        </ul>

        <h2 className="headings">PROJECTS</h2>
        {projects.length > 0 ? (
          projects.map((proj, idx) => (
            <div key={idx} className="project-block">
              <h4>{proj.title}</h4>
              <ul>
                {proj.points.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p>No projects available yet.</p>
        )}

        <h2 className="headings">CERTIFICATIONS</h2>
        <ul>
          {(user.certifications || []).map((cert, idx) => (
            <li key={`cert-${idx}`}>{cert}</li>
          ))}
          {(user.completedSubcourses || []).map((subcourse, idx) => (
            <li key={`dynamic-${idx}`}>Lurnity {subcourse} Certified</li>
          ))}
        </ul>
      </div>

      <div className={`control-toolbar ${isMenuOpen ? 'open' : ''}`}>
        <button 
          className="menu-toggle" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>
        
        <div className="toolbar-content">
          <div className="toolbar-section">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={includeWork}
                onChange={() => setIncludeWork((prev) => !prev)}
              />
              <span className="slider"></span>
              <span className="toggle-label">Work Experience</span>
            </label>
          </div>
          
          <div className="toolbar-section">
            <button 
              className="toolbar-btn update-btn" 
              onClick={fetchProjects} 
              disabled={loadingProjects}
            >
              {loadingProjects ? (
                <>
                  <svg className="spinner" viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                  </svg>
                  Updating...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38"/>
                  </svg>
                  Update Projects
                </>
              )}
            </button>
          </div>
          
          <div className="toolbar-section">
            <button 
              className="toolbar-btn download-btn" 
              onClick={downloadResume}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resume;