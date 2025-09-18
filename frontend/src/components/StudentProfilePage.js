import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { Country, State, City } from "country-state-city";
import Select from "react-select";
import {
  FiUser, FiPhone, FiMapPin, FiCode, FiHeart, FiBook,
  FiBriefcase, FiAward, FiChevronDown, FiChevronRight, FiSave,
  FiUpload, FiCamera, FiTrash2, FiHome, FiCheck, FiX, 
  FiRotateCw, FiZoomIn, FiZoomOut, 
} from "react-icons/fi";
import logo from "../assets/LURNITY.jpg";
import "./StudentProfilePage.css";
const API = process.env.REACT_APP_API_URL;

const sections = {
  "Basic Details": [
    "Student Profile",
    "Student Contact Details",
    "Parent/Guardian Details",
    "Current Address",
    "Current Expertise",
    "Your Preference",
  ],
  "Education Details": [
    "10th Standard",
    "Intermediate/12th/Diploma",
    "Bachelor's Degree",
  ],
  "Work Experience": ["Experience Details"],
  "Projects & Achievements": ["Projects", "Achievements"],
};

const StudentProfilePage = () => {
  const hist = useHistory();
  const [selectedSection, setSelectedSection] = useState({
    category: "Basic Details",
    item: "Student Profile",
  });
  
  const [collapsed, setCollapsed] = useState({});
  const [showGeminiDisclaimer, setShowGeminiDisclaimer] = useState(false);
  const [hasShownGeminiDisclaimer, setHasShownGeminiDisclaimer] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    name: "",
    gender: "",
    communicationLanguage: "",
    teachingLanguage: "",
    dateOfBirth: "",
    linkedIn: "",
    twitter: "",
    github: "",
    resumeURL: "",
    geminiApiKey: "",
    photo: null,
    photoURL: "",
    phone: "",
    email: "",
    isWhatsAppSame: "Yes",
    whatsappPhone: "",
    parentGuardian: {
      firstName: "",
      lastName: "",
      relation: "",
      occupation: "",
      email: "",
      phone: "",
      isWhatsAppSame: "Yes",
      whatsappPhone: "",
    },
    currentAddress: {
      addressLine1: "",
      addressLine2: "",
      country: "",
      pinCode: "",
      state: "",
      district: "",
      city: ""
    },
    currentExpertise: {
      codingLevel: "",
      hasLaptop: "",
      knownSkills: [],
      otherSkills: ""
    },
    yourPreference: {
      jobSearchStatus: "",
      expectedCTC: ""
    },
    tenthStandard: {
      board: "",
      schoolName: "",
      markingScheme: "",
      cgpa: "",
      percentage: ""
    },
    intermediateOrDiploma: {
      stream: "",
      status: "",
      institutionName: "",
      markingScheme: "",
      cgpa: "",
      percentage: "",
      yearOfCompletion: ""
    },
    bachelorsDegree: {
      degreeName: "",
      status: "",
      department: "",
      markingScheme: "",
      cgpa: "",
      percentage: "",
      startYear: "",
      endYear: "",
      instituteCountry: "",
      instituteName: "",
      institutePincode: "",
      instituteState: "",
      instituteDistrict: "",
      instituteCity: ""
    },
  });

  const [showCropper, setShowCropper] = useState(false);
  const [tempImageForCrop, setTempImageForCrop] = useState(null);
  const [cropSettings, setCropSettings] = useState({
    x: 50,
    y: 50,
    width: 200,
    height: 200,
    zoom: 1,
    rotation: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const cropCanvasRef = useRef(null);
  const [notification, setNotification] = useState(null);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res  = await fetch(`${API}/api/user/${userId}/profile`);
      const data = await res.json();          // {msg, user:{…}}

      if (res.ok && data?.user) {
        const rawPhoto = data.user.photoURL;  // may be undefined/null

        setFormData(prev => ({
          ...prev,
          ...data.user,                       // put every profile field in state
          name:        data.user.ircName || data.user.name || "",
          geminiApiKey: data.user.geminiApiKey || "",

          /* photo fields */
          photo:    rawPhoto,
          photoURL:
            typeof rawPhoto === "string" && rawPhoto.startsWith
              ? rawPhoto.startsWith("data:image")
                ? rawPhoto
                : `data:image/jpeg;base64,${rawPhoto}`
              : "",

          /* nested object – rebuild each level */
          parentGuardian: {
            ...prev.parentGuardian,
            ...data.user.parentGuardian,
            whatsappPhone: data.user.parentGuardian?.whatsappPhone || ""
          }
        }));
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  if (userId) fetchProfile();
}, [userId]);
// Remove formData from dependency array


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const tempUrl = URL.createObjectURL(file);
        
        setFormData(prev => ({
          ...prev,
          photo: event.target.result,
          photoFile: file,
          photoURL: tempUrl
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const dataToSend = {
        ...formData,
        photoURL: formData.photo,
      };
      delete dataToSend.photoFile;
      
      const response = await fetch(`${API}/api/user/${userId}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Save failed");

      setNotification({
        type: 'success',
        title: 'Success',
        message: 'Profile saved successfully!',
        icon: '🎉'
      });
      
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error("Save Error:", err);
      setNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to save profile. Please try again.',
        icon: '❌'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleCropMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - cropSettings.x,
      y: e.clientY - cropSettings.y
    });
  };

  const handleCropMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    setCropSettings(prev => ({
      ...prev,
      x: Math.max(0, Math.min(400 - prev.width, newX)),
      y: Math.max(0, Math.min(300 - prev.height, newY))
    }));
  };

  const handleCropMouseUp = () => {
    setIsDragging(false);
  };

  const getCroppedImage = async () => {
    return new Promise((resolve) => {
      const canvas = cropCanvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const outputSize = 300;
        canvas.width = outputSize;
        canvas.height = outputSize;
        
        const containerWidth = 400;
        const containerHeight = 300;
        const scaleX = img.width / containerWidth;
        const scaleY = img.height / containerHeight;
        
        ctx.save();
        ctx.translate(outputSize / 2, outputSize / 2);
        ctx.rotate((cropSettings.rotation * Math.PI) / 180);
        ctx.scale(cropSettings.zoom, cropSettings.zoom);
        
        const sourceX = cropSettings.x * scaleX;
        const sourceY = cropSettings.y * scaleY;
        const sourceWidth = cropSettings.width * scaleX;
        const sourceHeight = cropSettings.height * scaleY;
        
        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          -outputSize / 2,
          -outputSize / 2,
          outputSize,
          outputSize
        );
        
        ctx.restore();
        
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', 0.9);
      };
      img.src = tempImageForCrop;
    });
  };

  const handleCropComplete = async () => {
    try {
      const croppedBlob = await getCroppedImage();
      if (croppedBlob) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64String = event.target.result;
          
          if (formData.photoURL.startsWith('blob:')) {
            URL.revokeObjectURL(formData.photoURL);
          }
          
          setFormData(prev => ({
            ...prev,
            photo: base64String,
            photoURL: base64String,
          }));
        };
        reader.readAsDataURL(croppedBlob);
      }
    } catch (error) {
      console.error("Error cropping image:", error);
      setNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to process image',
        icon: '❌'
      });
    } finally {
      setShowCropper(false);
      setTempImageForCrop(null);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setTempImageForCrop(null);
  };

  const renderSection = () => {
    const { category, item } = selectedSection;
    
    // Student Profile Section
    if (category === "Basic Details" && item === "Student Profile") {
      return (
        <div className="modern-form-section">
          <div className="section-glow"></div>
          <div className="section-header">
            <div className="header-icon">
              <FiUser />
            </div>
            <div className="header-text">
              <h2>Student Profile</h2>
              <p className="section-description">Information used for IRC Certificate etc.</p>
            </div>
          </div>

          <div className="photo-upload-container">
            <div className="photo-preview-wrapper">
              <div className="photo-preview-container">
                {formData.photoURL ? (
                  <img 
                    src={formData.photoURL} 
                    alt="Preview" 
                    className="photo-preview" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '';
                    }}
                  />
                ) : (
                  <div className="photo-placeholder">
                    <FiUser size={48} />
                  </div>
                )}
                <div className="photo-overlay"></div>
              </div>
            </div>
            <div className="photo-actions">
              <label htmlFor="photo-upload" className="glass-btn primary">
                <FiUpload /> Upload Photo
              </label>
              <input type="file" id="photo-upload" accept="image/*" hidden onChange={handlePhotoUpload} />
              <button className="glass-btn secondary">
                <FiCamera /> Take Selfie
              </button>
              {formData.photoURL && (
                <button 
                  className="glass-btn danger" 
                  onClick={() => setFormData((p) => ({ ...p, photo: null, photoURL: "" }))}
                >
                  <FiTrash2 /> Remove
                </button>
              )}
            </div>
          </div>

          <div className="modern-form-grid">
            {[
              ["First Name", "firstName", "text", true],
              ["Last Name", "lastName", "text", true],
              ["Name on IRC Certificate", "name", "text"],
              ["Gender", "gender", "select"],
              ["Communication Language", "communicationLanguage", "text"],
              ["Teaching Language", "teachingLanguage", "text"],
              ["Date of Birth", "dateOfBirth", "date"],
              ["LinkedIn", "linkedIn", "text"],
              ["Twitter", "twitter", "text"],
              ["GitHub", "github", "text"],
              ["Resume URL", "resumeURL", "text"],
            ].map(([label, name, type, isLockable]) => (
              <div className="glass-form-group" key={name}>
                <label>{label}</label>
                {type === "select" ? (
                  <select 
                    name={name} 
                    value={formData[name]} 
                    onChange={handleInputChange}
                    className="glass-input"
                    disabled={isLockable && formData.profileLock === "locked"}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer Not to Say">Prefer Not to Say</option>
                  </select>
                ) : (
                  <input
                    type={type}
                    name={name}
                    value={
                      name === "dateOfBirth" && formData[name]
                        ? formData[name].substring(0, 10)
                        : formData[name]
                    }
                    onChange={handleInputChange}
                    className="glass-input"
                    disabled={isLockable && formData.profileLock === "locked"}
                  />
                )}
              </div>
            ))}
            <div className="glass-form-group" key="geminiApiKey">
              <label>Gemini API Key</label>
              <input
                type="text"
                name="geminiApiKey"
                value={formData.geminiApiKey}
                onChange={handleInputChange}
                className="glass-input"
                onFocus={() => {
                  if (!hasShownGeminiDisclaimer) {
                    setShowGeminiDisclaimer(true);
                    setHasShownGeminiDisclaimer(true);
                  }
                }}
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="save-btn" onClick={handleSave}>
              <FiSave /> Save Changes
            </button>
          </div>
        </div>
      );
    }

    // Student Contact Details Section
    if (category === "Basic Details" && item === "Student Contact Details") {
      return (
        <div className="modern-form-section">
          <div className="section-glow"></div>
          <div className="section-header">
            <div className="header-icon">
              <FiPhone />
            </div>
            <div className="header-text">
              <h2>Student Contact Details</h2>
              <p className="section-description">
                We will use the contact details you provide to send you important updates during the program
              </p>
            </div>
          </div>

          <div className="modern-form-grid">
            <div className="glass-form-group">
              <label>Registered Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+91 9347494329"
                className="glass-input"
              />
            </div>

            <div className="glass-form-group">
              <label>Is this same as your WhatsApp Number?</label>
              <div className="modern-radio-group">
                {["Yes", "No", "Don't have WhatsApp"].map((option) => (
                  <label key={option} className="modern-radio-option">
                    <input
                      type="radio"
                      name="isWhatsAppSame"
                      value={option}
                      checked={formData.isWhatsAppSame === option}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          isWhatsAppSame: newValue,
                          whatsappPhone: newValue === "No" ? prev.whatsappPhone : "",
                        }));
                      }}
                    />
                    <span className="radio-checkmark"></span>
                    <span className="radio-label">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {formData.isWhatsAppSame === "No" && (
              <div className="glass-form-group">
                <label>WhatsApp Phone Number</label>
                <input
                  type="tel"
                  name="whatsappPhone"
                  value={formData.whatsappPhone || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      whatsappPhone: e.target.value,
                    }))
                  }
                  placeholder="Enter WhatsApp number"
                  className="glass-input"
                />
              </div>
            )}

            <div className="glass-form-group">
              <label>Email ID</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="glass-input"
                disabled={formData.profileLock === "locked"}
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="save-btn" onClick={handleSave}>
              <FiSave /> Save Changes
            </button>
          </div>
        </div>
      );
    }

    // Parent/Guardian Details Section
    if (category === "Basic Details" && item === "Parent/Guardian Details") {
      return (
        <div className="modern-form-section">
          <div className="section-glow"></div>
          <div className="section-header">
            <div className="header-icon">
              <FiHeart />
            </div>
            <div className="header-text">
              <h2>Parent/Guardian Details</h2>
              <p className="section-description">
                Person/Guardian who supports the student during their Lurnity journey. 
                Student's progress will be shared regularly with Parent/Guardian during the program.
              </p>
            </div>
          </div>

          <div className="modern-form-grid">
            {[
              ["First Name", "firstName", "text"],
              ["Last Name", "lastName", "text"],
              ["Relation with the student", "relation", "text"],
              ["Occupation", "occupation", "text"],
              ["Parent/Guardian Email ID", "email", "email"],
              ["Parent/Guardian Phone Number", "phone", "tel"],
            ].map(([label, key, type]) => (
              <div className="glass-form-group" key={key}>
                <label>{label}</label>
                <input
                  type={type}
                  name={key}
                  value={formData.parentGuardian[key] || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      parentGuardian: {
                        ...prev.parentGuardian,
                        [key]: e.target.value,
                      },
                    }))
                  }
                  className="glass-input"
                />
              </div>
            ))}

            <div className="glass-form-group">
              <label>Is this same as your WhatsApp Number?</label>
              <div className="modern-radio-group">
                {["Yes", "No", "Don't have WhatsApp"].map((option) => (
                  <label key={option} className="modern-radio-option">
                    <input
                      type="radio"
                      name="isWhatsAppSame"
                      value={option}
                      checked={formData.parentGuardian.isWhatsAppSame === option}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          parentGuardian: {
                            ...prev.parentGuardian,
                            isWhatsAppSame: e.target.value,
                            whatsappPhone: e.target.value === "No" ? prev.parentGuardian.whatsappPhone : "",
                          },
                        }))
                      }
                    />
                    <span className="radio-checkmark"></span>
                    <span className="radio-label">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {formData.parentGuardian.isWhatsAppSame === "No" && (
              <div className="glass-form-group">
                <label>WhatsApp Phone Number</label>
                <input
                  type="tel"
                  name="whatsappPhone"
                  value={formData.parentGuardian.whatsappPhone || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      parentGuardian: {
                        ...prev.parentGuardian,
                        whatsappPhone: e.target.value,
                      },
                    }))
                  }
                  placeholder="Enter WhatsApp number"
                  className="glass-input"
                />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button className="save-btn" onClick={handleSave}>
              <FiSave /> Save Changes
            </button>
          </div>
        </div>
      );
    }

    // Current Address Section
    if (category === "Basic Details" && item === "Current Address") {
      return (
        <div className="modern-form-section">
          <div className="section-glow"></div>
          <div className="section-header">
            <div className="header-icon">
              <FiMapPin />
            </div>
            <div className="header-text">
              <h2>Current Address</h2>
              <p className="section-description">
                Please provide your complete address to send rewards, resources, certificates, etc.
              </p>
            </div>
          </div>

          <div className="modern-form-grid">
            {[
              ["Address Line 1", "addressLine1", "text"],
              ["Address Line 2", "addressLine2", "text"],
              ["Postal/Pin Code", "pinCode", "text"],
              ["City/Town", "city", "text"]
            ].map(([label, name, type]) => (
              <div className="glass-form-group" key={name}>
                <label>{label}</label>
                <input
                  type={type}
                  name={name}
                  value={formData.currentAddress[name]}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      currentAddress: {
                        ...prev.currentAddress,
                        [name]: e.target.value,
                      },
                    }))
                  }
                  className="glass-input"
                />
              </div>
            ))}

            <div className="glass-form-group">
              <label>Country</label>
              <select
                name="country"
                value={formData.currentAddress.country}
                onChange={(e) => {
                  const selectedCountry = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    currentAddress: {
                      ...prev.currentAddress,
                      country: selectedCountry,
                      state: "",
                      district: "",
                    },
                  }));
                }}
                className="glass-input"
              >
                <option value="">Select Country</option>
                {Country.getAllCountries().map((country) => (
                  <option key={country.isoCode} value={country.isoCode}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="glass-form-group">
              <label>State</label>
              <select
                name="state"
                value={formData.currentAddress.state}
                onChange={(e) => {
                  const selectedState = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    currentAddress: {
                      ...prev.currentAddress,
                      state: selectedState,
                      district: "",
                    },
                  }));
                }}
                className="glass-input"
                disabled={!formData.currentAddress.country}
              >
                <option value="">Select State</option>
                {formData.currentAddress.country &&
                  State.getStatesOfCountry(formData.currentAddress.country).map((state) => (
                    <option key={state.isoCode} value={state.isoCode}>
                      {state.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="glass-form-group">
              <label>District</label>
              <select
                name="district"
                value={formData.currentAddress.district}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    currentAddress: {
                      ...prev.currentAddress,
                      district: e.target.value,
                    },
                  }))
                }
                className="glass-input"
                disabled={!formData.currentAddress.state}
              >
                <option value="">Select District</option>
                {formData.currentAddress.state &&
                  City.getCitiesOfState(
                    formData.currentAddress.country,
                    formData.currentAddress.state
                  ).map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button className="save-btn" onClick={handleSave}>
              <FiSave /> Save Changes
            </button>
          </div>
        </div>
      );
    }

    // Current Expertise Section
    if (category === "Basic Details" && item === "Current Expertise") {
      return (
        <div className="modern-form-section">
          <div className="section-glow"></div>
          <div className="section-header">
            <div className="header-icon">
              <FiCode />
            </div>
            <div className="header-text">
              <h2>Current Expertise</h2>
              <p className="section-description">
                Please provide the following details to help us mentor you better.
              </p>
            </div>
          </div>

          <div className="modern-form-grid">
            <div className="glass-form-group">
              <label>Current Coding Level</label>
              <select
                name="codingLevel"
                value={formData.currentExpertise.codingLevel}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    currentExpertise: {
                      ...prev.currentExpertise,
                      codingLevel: e.target.value
                    }
                  }))
                }
                className="glass-input"
              >
                <option value="">Select</option>
                <option value="No knowledge">I don't have knowledge in coding</option>
                <option value="Basic">I have basic knowledge in coding</option>
                <option value="Intermediate">I know coding very well</option>
                <option value="Advanced">I have built websites and apps</option>
              </select>
            </div>

            <div className="glass-form-group">
              <label>Do you have a Laptop/Computer?</label>
              <div className="modern-radio-group">
                {["Yes", "No"].map((option) => (
                  <label key={option} className="modern-radio-option">
                    <input
                      type="radio"
                      name="hasLaptop"
                      value={option}
                      checked={formData.currentExpertise.hasLaptop === option}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          currentExpertise: {
                            ...prev.currentExpertise,
                            hasLaptop: e.target.value
                          }
                        }))
                      }
                    />
                    <span className="radio-checkmark"></span>
                    <span className="radio-label">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="glass-form-group full-width">
              <label>Technical Skills (select all that apply)</label>
              <Select
                isMulti
                name="skills"
                options={[
                  { value: "HTML", label: "HTML" },
                  { value: "CSS", label: "CSS" },
                  { value: "JavaScript", label: "JavaScript" },
                  { value: "TypeScript", label: "TypeScript" },
                  { value: "Python", label: "Python" },
                  { value: "C", label: "C" },
                  { value: "C++", label: "C++" },
                  { value: "Java", label: "Java" },
                  { value: "Kotlin", label: "Kotlin" },
                  { value: "Swift", label: "Swift" },
                  { value: "React", label: "React" },
                  { value: "Angular", label: "Angular" },
                  { value: "Vue", label: "Vue" },
                  { value: "Next.js", label: "Next.js" },
                  { value: "Node.js", label: "Node.js" },
                  { value: "Express.js", label: "Express.js" },
                  { value: "Flask", label: "Flask" },
                  { value: "Django", label: "Django" },
                  { value: "MongoDB", label: "MongoDB" },
                  { value: "MySQL", label: "MySQL" },
                  { value: "PostgreSQL", label: "PostgreSQL" },
                  { value: "Firebase", label: "Firebase" },
                  { value: "Git", label: "Git" },
                  { value: "GitHub", label: "GitHub" },
                  { value: "Docker", label: "Docker" },
                  { value: "Kubernetes", label: "Kubernetes" },
                  { value: "Linux", label: "Linux" },
                  { value: "Figma", label: "Figma" },
                  { value: "REST APIs", label: "REST APIs" },
                  { value: "GraphQL", label: "GraphQL" },
                  { value: "Machine Learning", label: "Machine Learning" },
                  { value: "Deep Learning", label: "Deep Learning" },
                  { value: "Data Analysis", label: "Data Analysis" },
                  { value: "Pandas", label: "Pandas" },
                  { value: "NumPy", label: "NumPy" },
                  { value: "TensorFlow", label: "TensorFlow" },
                  { value: "PyTorch", label: "PyTorch" },
                  { value: "Android Development", label: "Android Development" },
                  { value: "iOS Development", label: "iOS Development" },
                  { value: "AWS", label: "AWS" },
                  { value: "Azure", label: "Azure" },
                  { value: "GCP", label: "GCP" },
                  { value: "Other", label: "Other" }
                ]}
                value={formData.currentExpertise.knownSkills.map(skill => ({ value: skill, label: skill }))}
                onChange={(selectedOptions) =>
                  setFormData((prev) => ({
                    ...prev,
                    currentExpertise: {
                      ...prev.currentExpertise,
                      knownSkills: selectedOptions.map((opt) => opt.value)
                    }
                  }))
                }
                className="modern-react-select"
                classNamePrefix="modern-select"
                placeholder="Select skills..."
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    borderRadius: '14px',
                    minHeight: '48px',
                    boxShadow: state.isFocused ? '0 0 0 3px rgba(212, 175, 55, 0.1)' : 'none',
                    '&:hover': {
                      borderColor: 'rgba(212, 175, 55, 0.4)'
                    }
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    borderRadius: '14px',
                    boxShadow: '0 8px 32px rgba(212, 175, 55, 0.12)',
                    zIndex: 9999
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isSelected 
                      ? 'rgba(212, 175, 55, 0.2)' 
                      : state.isFocused 
                        ? 'rgba(212, 175, 55, 0.1)' 
                        : 'transparent',
                    color: '#2c2c2c',
                    padding: '12px 16px'
                  }),
                  multiValue: (provided) => ({
                    ...provided,
                    backgroundColor: 'rgba(212, 175, 55, 0.15)',
                    borderRadius: '8px'
                  }),
                  multiValueLabel: (provided) => ({
                    ...provided,
                    color: '#2c2c2c',
                    fontSize: '0.85rem',
                    fontWeight: '500'
                  }),
                  multiValueRemove: (provided) => ({
                    ...provided,
                    color: '#2c2c2c',
                    '&:hover': {
                      backgroundColor: 'rgba(231, 76, 60, 0.2)',
                    }
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: 'rgba(44, 44, 44, 0.5)'
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: '#2c2c2c'
                  }),
                  input: (provided) => ({
                    ...provided,
                    color: '#2c2c2c'
                  })
                }}
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="save-btn" onClick={handleSave}>
              <FiSave /> Save Changes
            </button>
          </div>
        </div>
      );
    }

    // Your Preference Section
    if (category === "Basic Details" && item === "Your Preference") {
      return (
        <div className="modern-form-section">
          <div className="section-glow"></div>
          <div className="section-header">
            <div className="header-icon">
              <FiBriefcase />
            </div>
            <div className="header-text">
              <h2>Your Preference</h2>
              <p className="section-description">
                Share your preference to help us match you with opportunities that fit you best.
              </p>
            </div>
          </div>

          <div className="modern-form-grid">
            <div className="glass-form-group">
              <label>Are you actively looking for jobs?</label>
              <select
                name="jobSearchStatus"
                value={formData.yourPreference.jobSearchStatus}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    yourPreference: {
                      ...prev.yourPreference,
                      jobSearchStatus: e.target.value
                    }
                  }))
                }
                className="glass-input"
              >
                <option value="">Select</option>
                <option value="Actively looking">Actively looking</option>
                <option value="Passively looking">Passively looking</option>
                <option value="Not looking">Not looking</option>
              </select>
            </div>

            <div className="glass-form-group">
              <label>Expected CTC</label>
              <select
                name="expectedCTC"
                value={formData.yourPreference.expectedCTC}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    yourPreference: {
                      ...prev.yourPreference,
                      expectedCTC: e.target.value
                    }
                  }))
                }
                className="glass-input"
              >
                <option value="">Select</option>
                <option value="<3 Lakh Per Annum">&lt;3 Lakh Per Annum</option>
                <option value="3 - 4.5 Lakh Per Annum">3 - 4.5 Lakh Per Annum</option>
                <option value="4.5 - 6 Lakh Per Annum">4.5 - 6 Lakh Per Annum</option>
                <option value="6 - 9 Lakh Per Annum">6 - 9 Lakh Per Annum</option>
                <option value="9 - 18 Lakh Per Annum">9 - 18 Lakh Per Annum</option>
                <option value=">18 Lakh Per Annum">&gt;18 Lakh Per Annum</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button className="save-btn" onClick={handleSave}>
              <FiSave /> Save Changes
            </button>
          </div>
        </div>
      );
    }

    // 10th Standard Section
    if (category === "Education Details" && item === "10th Standard") {
      const boardOptions = [
        "State board",
        "IGCSE",
        "IB",
        "CBSE - Central Board of Secondary Education",
        "ICSE - Indian Certificate of Secondary Education",
        "BSE Telangana - Telangana State Board of Secondary Education",
        "BSEAP - Andhra Pradesh Board of Secondary Education",
        "TNBSE - Tamil Nadu State Board of Secondary Education",
        "KSEEB - Karnataka Secondary Education Examination Board",
        "MSBSHSE - Maharashtra State Board of Secondary & Higher Secondary Education",
        "WBBSE - West Bengal Board of Secondary Education",
        "KB - Kerala Board of Public Examinations",
        "GSEB - Gujarat Secondary and Higher Secondary Education Board",
        "PSEB - Punjab School Education Board",
        "UPMSP - Uttar Pradesh Madhyamik Shiksha Parishad",
        "RBSE - Rajasthan Board of Secondary Education",
        "BSEB - Bihar School Examination Board",
        "HBSE - Haryana Board of School Education",
        "MPBSE - Madhya Pradesh Board of Secondary Education",
        "BSE Odisha - Odisha Board of Secondary Education",
        "SEBA - Assam Board of Secondary Education",
        "CBSE - Chhattisgarh Board of Secondary Education"
      ];

      return (
        <div className="modern-form-section">
          <div className="section-glow"></div>
          <div className="section-header">
            <div className="header-icon">
              <FiBook />
            </div>
            <div className="header-text">
              <h2>10th Standard</h2>
              <p className="section-description">
                Please provide your 10th standard education details.
              </p>
            </div>
          </div>

          <div className="modern-form-grid">
            <div className="glass-form-group">
              <label>Board</label>
              <select
                name="board"
                value={formData.tenthStandard.board}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    tenthStandard: {
                      ...prev.tenthStandard,
                      board: e.target.value,
                    },
                  }))
                }
                className="glass-input"
              >
                <option value="">Select Board</option>
                {boardOptions.map((board) => (
                  <option key={board} value={board}>
                    {board}
                  </option>
                ))}
              </select>
            </div>

            <div className="glass-form-group">
              <label>School Name</label>
              <input
                type="text"
                name="schoolName"
                value={formData.tenthStandard.schoolName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    tenthStandard: {
                      ...prev.tenthStandard,
                      schoolName: e.target.value,
                    },
                  }))
                }
                className="glass-input"
              />
            </div>

            <div className="glass-form-group">
              <label>Marking Scheme</label>
              <div className="modern-radio-group">
                {["Grade/CGPA", "Percentage"].map((scheme) => (
                  <label key={scheme} className="modern-radio-option">
                    <input
                      type="radio"
                      name="markingScheme"
                      value={scheme}
                      checked={formData.tenthStandard.markingScheme === scheme}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          tenthStandard: {
                            ...prev.tenthStandard,
                            markingScheme: e.target.value,
                          },
                        }))
                      }
                    />
                    <span className="radio-checkmark"></span>
                    <span className="radio-label">{scheme}</span>
                  </label>
                ))}
              </div>
            </div>

            {formData.tenthStandard.markingScheme === "Grade/CGPA" && (
              <div className="glass-form-group">
                <label>Enter CGPA</label>
                <input
                  type="text"
                  name="cgpa"
                  value={formData.tenthStandard.cgpa}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tenthStandard: {
                        ...prev.tenthStandard,
                        cgpa: e.target.value,
                      },
                    }))
                  }
                  className="glass-input"
                />
              </div>
            )}

            {formData.tenthStandard.markingScheme === "Percentage" && (
              <div className="glass-form-group">
                <label>Enter Percentage</label>
                <input
                  type="text"
                  name="percentage"
                  value={formData.tenthStandard.percentage}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tenthStandard: {
                        ...prev.tenthStandard,
                        percentage: e.target.value,
                      },
                    }))
                  }
                  className="glass-input"
                />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button className="save-btn" onClick={handleSave}>
              <FiSave /> Save Changes
            </button>
          </div>
        </div>
      );
    }

    // Intermediate/12th/Diploma Section
    if (category === "Education Details" && item === "Intermediate/12th/Diploma") {
      return (
        <div className="modern-form-section">
          <div className="section-glow"></div>
          <div className="section-header">
            <div className="header-icon">
              <FiBook />
            </div>
            <div className="header-text">
              <h2>Intermediate/12th/Diploma</h2>
              <p className="section-description">
                Please provide your intermediate/12th/diploma education details.
              </p>
            </div>
          </div>

          <div className="modern-form-grid">
            <div className="glass-form-group">
              <label>What did you study after 10th?</label>
              <select
                name="stream"
                value={formData.intermediateOrDiploma.stream}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    intermediateOrDiploma: {
                      ...prev.intermediateOrDiploma,
                      stream: e.target.value,
                    },
                  }))
                }
                className="glass-input"
              >
                <option value="">Select</option>
                <option value="Intermediate/12th">Intermediate/12th</option>
                <option value="Diploma">Diploma</option>
                <option value="ITI">ITI</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div className="glass-form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.intermediateOrDiploma.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    intermediateOrDiploma: {
                      ...prev.intermediateOrDiploma,
                      status: e.target.value,
                    },
                  }))
                }
                className="glass-input"
              >
                <option value="">Select</option>
                <option value="Completed Successfully">Completed Successfully</option>
                <option value="Currently Studying">Currently Studying</option>
                <option value="Having Backlogs, will clear them soon">
                  Having Backlogs, will clear them soon
                </option>
              </select>
            </div>

            <div className="glass-form-group">
              <label>Institution Name</label>
              <input
                type="text"
                name="institutionName"
                value={formData.intermediateOrDiploma.institutionName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    intermediateOrDiploma: {
                      ...prev.intermediateOrDiploma,
                      institutionName: e.target.value,
                    },
                  }))
                }
                className="glass-input"
              />
            </div>

            <div className="glass-form-group">
              <label>Marking Scheme</label>
              <div className="modern-radio-group">
                {["Grade/CGPA", "Percentage"].map((scheme) => (
                  <label key={scheme} className="modern-radio-option">
                    <input
                      type="radio"
                      name="markingScheme"
                      value={scheme}
                      checked={
                        formData.intermediateOrDiploma.markingScheme === scheme
                      }
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          intermediateOrDiploma: {
                            ...prev.intermediateOrDiploma,
                            markingScheme: e.target.value,
                          },
                        }))
                      }
                    />
                    <span className="radio-checkmark"></span>
                    <span className="radio-label">{scheme}</span>
                  </label>
                ))}
              </div>
            </div>

            {formData.intermediateOrDiploma.markingScheme === "Grade/CGPA" && (
              <div className="glass-form-group">
                <label>Enter CGPA</label>
                <input
                  type="text"
                  name="cgpa"
                  value={formData.intermediateOrDiploma.cgpa}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      intermediateOrDiploma: {
                        ...prev.intermediateOrDiploma,
                        cgpa: e.target.value,
                      },
                    }))
                  }
                  className="glass-input"
                />
              </div>
            )}

            {formData.intermediateOrDiploma.markingScheme === "Percentage" && (
              <div className="glass-form-group">
                <label>Enter Percentage</label>
                <input
                  type="text"
                  name="percentage"
                  value={formData.intermediateOrDiploma.percentage}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      intermediateOrDiploma: {
                        ...prev.intermediateOrDiploma,
                        percentage: e.target.value,
                      },
                    }))
                  }
                  className="glass-input"
                />
              </div>
            )}

            <div className="glass-form-group">
              <label>Year of Completion</label>
              <input
                type="date"
                name="yearOfCompletion"
                value={
                  formData.intermediateOrDiploma.yearOfCompletion
                    ? formData.intermediateOrDiploma.yearOfCompletion.substring(0, 10)
                    : ""
                }
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    intermediateOrDiploma: {
                      ...prev.intermediateOrDiploma,
                      yearOfCompletion: e.target.value,
                    },
                  }))
                }
                className="glass-input"
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="save-btn" onClick={handleSave}>
              <FiSave /> Save Changes
            </button>
          </div>
        </div>
      );
    }

    // Bachelor's Degree Section
    if (category === "Education Details" && item === "Bachelor's Degree") {
      const bachelorOptions = [
        "B Tech (Bachelor of Technology)",
        "BE (Bachelor of Engineering)",
        "BSc (Bachelor of Science)",
        "B Com (Bachelor of Commerce)",
        "BBA (Bachelor of Business Administration)",
        "BA (Bachelor of Arts)",
        "BCA (Bachelor of Computer Applications)",
        "B Pharm (Bachelor of Pharmacy)",
        "BHM (Bachelor of Hotel Management)",
        "BHMCT (Bachelor of Hotel Management & Catering Technology)",
        "MBBS (Bachelor of Medicine and a Bachelor of Surgery)",
        "B Arch (Bachelor of Architecture)",
        "B Des (Bachelor of Design)",
        "BF Tech (Bachelor of Fashion Technology)",
        "BVC (Bachelor of Visual Communication)",
        "Plan (Bachelor of Planning)",
        "BFSc (Bachelor of Fishery Science)",
        "BPEd (Bachelor of Physical Education)",
        "B Voc (Bachelor of Vocation)",
        "BBI (Bachelor of Banking and Insurance)",
        "BBM (Bachelor of Business Management)",
        "BFM (Bachelor of Financial Markets)",
        "BMS (Bachelor of Management Studies)",
        "B Text (Bachelor of Textile)",
        "BFA (Bachelor of Fine Arts)",
        "BASLP (Bachelor of Audiology & Speech Language Pathology)",
        "BMLT (Bachelor of Medical Laboratory Technology)",
        "BNYS (Bachelor of Naturopathy and Yogic Sciences)",
        "BOPTM (Bachelor of Optometry)",
        "BOT (Bachelors of Occupational Therapy)",
        "BPMT (Bachelor of Paramedical Technology)",
        "BVSc (Bachelor of Veterinary Science)",
        "Others"
      ];

      return (
        <div className="modern-form-section">
          <div className="section-glow"></div>
          <div className="section-header">
            <div className="header-icon">
              <FiBook />
            </div>
            <div className="header-text">
              <h2>Bachelor's Degree</h2>
              <p className="section-description">
                Please provide your bachelor's degree education details.
              </p>
            </div>
          </div>

          <div className="modern-form-grid">
            <div className="glass-form-group">
              <label>Bachelor's Degree</label>
              <select
                name="degreeName"
                value={formData.bachelorsDegree.degreeName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bachelorsDegree: {
                      ...prev.bachelorsDegree,
                      degreeName: e.target.value,
                    },
                  }))
                }
                className="glass-input"
              >
                <option value="">Select Degree</option>
                {bachelorOptions.map((degree) => (
                  <option key={degree} value={degree}>{degree}</option>
                ))}
              </select>
            </div>

            <div className="glass-form-group">
              <label>Degree Status</label>
              <select
                name="status"
                value={formData.bachelorsDegree.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bachelorsDegree: {
                      ...prev.bachelorsDegree,
                      status: e.target.value,
                    },
                  }))
                }
                className="glass-input"
              >
                <option value="">Select</option>
                <option value="Completed Successfully">Completed Successfully</option>
                <option value="Currently Studying">Currently Studying</option>
                <option value="Having Backlogs, will clear them soon">Having Backlogs, will clear them soon</option>
                <option value="Discontinued Degree">Discontinued Degree</option>
              </select>
            </div>

            <div className="glass-form-group">
              <label>Department / Branch</label>
              <input
                type="text"
                name="department"
                value={formData.bachelorsDegree.department}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bachelorsDegree: {
                      ...prev.bachelorsDegree,
                      department: e.target.value,
                    },
                  }))
                }
                className="glass-input"
              />
            </div>

            <div className="glass-form-group">
              <label>Marking Scheme</label>
              <div className="modern-radio-group">
                {["Grade/CGPA", "Percentage"].map((scheme) => (
                  <label key={scheme} className="modern-radio-option">
                    <input
                      type="radio"
                      name="markingScheme"
                      value={scheme}
                      checked={formData.bachelorsDegree.markingScheme === scheme}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          bachelorsDegree: {
                            ...prev.bachelorsDegree,
                            markingScheme: e.target.value,
                          },
                        }))
                      }
                    />
                    <span className="radio-checkmark"></span>
                    <span className="radio-label">{scheme}</span>
                  </label>
                ))}
              </div>
            </div>

            {formData.bachelorsDegree.markingScheme === "Grade/CGPA" && (
              <div className="glass-form-group">
                <label>Enter CGPA (enter 0 if not available)</label>
                <input
                  type="text"
                  name="cgpa"
                  value={formData.bachelorsDegree.cgpa}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      bachelorsDegree: {
                        ...prev.bachelorsDegree,
                        cgpa: e.target.value,
                      },
                    }))
                  }
                  className="glass-input"
                />
              </div>
            )}

            {formData.bachelorsDegree.markingScheme === "Percentage" && (
              <div className="glass-form-group">
                <label>Enter Percentage</label>
                <input
                  type="text"
                  name="percentage"
                  value={formData.bachelorsDegree.percentage}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      bachelorsDegree: {
                        ...prev.bachelorsDegree,
                        percentage: e.target.value,
                      },
                    }))
                  }
                  className="glass-input"
                />
              </div>
            )}

            <div className="glass-form-group">
              <label>Start Year</label>
              <input
                type="date"
                name="startYear"
                value={formData.bachelorsDegree.startYear}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bachelorsDegree: {
                      ...prev.bachelorsDegree,
                      startYear: e.target.value,
                    },
                  }))
                }
                className="glass-input"
              />
            </div>

            <div className="glass-form-group">
              <label>End Year (or expected if studying)</label>
              <input
                type="date"
                name="endYear"
                value={formData.bachelorsDegree.endYear}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bachelorsDegree: {
                      ...prev.bachelorsDegree,
                      endYear: e.target.value,
                    },
                  }))
                }
                className="glass-input"
              />
            </div>

            <div className="glass-form-group">
              <label>Institute Country</label>
              <select
                name="instituteCountry"
                value={formData.bachelorsDegree.instituteCountry}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bachelorsDegree: {
                      ...prev.bachelorsDegree,
                      instituteCountry: e.target.value,
                      instituteState: "",
                      instituteDistrict: "",
                    },
                  }))
                }
                className="glass-input"
              >
                <option value="">Select Country</option>
                {Country.getAllCountries().map((country) => (
                  <option key={country.isoCode} value={country.isoCode}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="glass-form-group">
              <label>Institute State</label>
              <select
                name="instituteState"
                value={formData.bachelorsDegree.instituteState}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bachelorsDegree: {
                      ...prev.bachelorsDegree,
                      instituteState: e.target.value,
                      instituteDistrict: "",
                    },
                  }))
                }
                className="glass-input"
                disabled={!formData.bachelorsDegree.instituteCountry}
              >
                <option value="">Select State</option>
                {formData.bachelorsDegree.instituteCountry &&
                  State.getStatesOfCountry(formData.bachelorsDegree.instituteCountry).map((state) => (
                    <option key={state.isoCode} value={state.isoCode}>
                      {state.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="glass-form-group">
              <label>Institute District</label>
              <select
                name="instituteDistrict"
                value={formData.bachelorsDegree.instituteDistrict}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bachelorsDegree: {
                      ...prev.bachelorsDegree,
                      instituteDistrict: e.target.value,
                    },
                  }))
                }
                className="glass-input"
                disabled={!formData.bachelorsDegree.instituteState}
              >
                <option value="">Select District</option>
                {formData.bachelorsDegree.instituteState &&
                  City.getCitiesOfState(
                    formData.bachelorsDegree.instituteCountry,
                    formData.bachelorsDegree.instituteState
                  ).map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="glass-form-group">
              <label>Institute Name</label>
              <input
                type="text"
                name="instituteName"
                value={formData.bachelorsDegree.instituteName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bachelorsDegree: {
                      ...prev.bachelorsDegree,
                      instituteName: e.target.value,
                    },
                  }))
                }
                className="glass-input"
              />
            </div>

            <div className="glass-form-group">
              <label>Institute Pincode</label>
              <input
                type="text"
                name="institutePincode"
                value={formData.bachelorsDegree.institutePincode}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bachelorsDegree: {
                      ...prev.bachelorsDegree,
                      institutePincode: e.target.value,
                    },
                  }))
                }
                className="glass-input"
              />
            </div>

            <div className="glass-form-group">
              <label>Institute City</label>
              <input
                type="text"
                name="instituteCity"
                value={formData.bachelorsDegree.instituteCity}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bachelorsDegree: {
                      ...prev.bachelorsDegree,
                      instituteCity: e.target.value,
                    },
                  }))
                }
                className="glass-input"
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="save-btn" onClick={handleSave}>
              <FiSave /> Save Changes
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="modern-form-section">
        <div className="section-glow"></div>
        <div className="section-header">
          <div className="header-icon">
            <FiAward />
          </div>
          <div className="header-text">
            <h2>{item}</h2>
            <p className="section-description">This section is under development</p>
          </div>
        </div>
        <div className="coming-soon">
          <div className="coming-soon-icon">
            <FiAward size={64} />
          </div>
          <p>{item} section is coming soon...</p>
        </div>
      </div>
    );
  };

  return (
    <div className="profile-page"> 
      <div className="modern-profile-container">
        {/* Modern Header */}
        <header className="modern-header">
          <div className="header-glow"></div>
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-container">
                <img src={logo} alt="Lurnity Logo" className="modern-logo" />
                <div className="logo-shine"></div>
              </div>
            </div>
            
            <nav className="header-nav">
              <button className="nav-btn" onClick={() => hist.push("/home")}>
                <FiHome />
                <span>Home</span>
              </button>
              
              {formData.photoURL && (
                <div className="user-avatar">
                  <img src={formData.photoURL} alt="Profile" className="avatar-img" />
                  <div className="avatar-glow"></div>
                </div>
              )}
            </nav>
          </div>
        </header>

        <div className="profile-layout">
          {/* Modern Sidebar */}
          <aside className="modern-sidebar">
            <div className="sidebar-glow"></div>
            <div className="sidebar-content">
              {Object.entries(sections).map(([category, items]) => (
                <div className="sidebar-section" key={category}>
                  <div 
                    className="sidebar-category" 
                    onClick={() => setCollapsed((prev) => ({ ...prev, [category]: !prev[category] }))}
                  >
                    <div className="category-icon">
                      {collapsed[category] ? <FiChevronRight /> : <FiChevronDown />}
                    </div>
                    <span className="category-title">{category}</span>
                    <div className="category-glow"></div>
                  </div>
                  
                  {!collapsed[category] && (
                    <div className="sidebar-items">
                      {items.map((item) => (
                        <div
                          key={item}
                          className={`sidebar-item ${
                            selectedSection.category === category && selectedSection.item === item ? "active" : ""
                          }`}
                          onClick={() => setSelectedSection({ category, item })}
                        >
                          <span className="item-text">{item}</span>
                          <div className="item-glow"></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <main className="main-content">
            {renderSection()}
          </main>
        </div>

        {showCropper && (
          <div className="image-cropper-overlay">
            <div className="image-cropper-modal">
              <div className="cropper-header">
                <h3>Crop Your Image</h3>
                <p>Adjust the crop area to frame your photo perfectly</p>
              </div>

              <div className="cropper-container">
                <div 
                  className="crop-area"
                  onMouseMove={handleCropMouseMove}
                  onMouseUp={handleCropMouseUp}
                  onMouseLeave={handleCropMouseUp}
                >
                  <img
                    src={tempImageForCrop}
                    alt="Crop preview"
                    className="crop-image"
                    style={{
                      transform: `scale(${cropSettings.zoom}) rotate(${cropSettings.rotation}deg)`,
                      transformOrigin: 'center'
                    }}
                    draggable={false}
                  />
                  
                  <div
                    className="crop-overlay"
                    style={{
                      left: `${cropSettings.x}px`,
                      top: `${cropSettings.y}px`,
                      width: `${cropSettings.width}px`,
                      height: `${cropSettings.height}px`
                    }}
                    onMouseDown={handleCropMouseDown}
                  >
                    <div className="crop-border"></div>
                    <div className="crop-handles">
                      <div className="crop-handle top-left"></div>
                      <div className="crop-handle top-right"></div>
                      <div className="crop-handle bottom-left"></div>
                      <div className="crop-handle bottom-right"></div>
                    </div>
                  </div>
                </div>

                <div className="cropper-controls">
                  <div className="control-group">
                    <label>Zoom</label>
                    <div className="control-row">
                      <button 
                        className="control-btn"
                        onClick={() => setCropSettings(prev => ({ ...prev, zoom: Math.max(0.5, prev.zoom - 0.1) }))}
                      >
                        <FiZoomOut />
                      </button>
                      <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.1"
                        value={cropSettings.zoom}
                        onChange={(e) => setCropSettings(prev => ({ ...prev, zoom: parseFloat(e.target.value) }))}
                        className="control-slider"
                      />
                      <button 
                        className="control-btn"
                        onClick={() => setCropSettings(prev => ({ ...prev, zoom: Math.min(3, prev.zoom + 0.1) }))}
                      >
                        <FiZoomIn />
                      </button>
                    </div>
                  </div>

                  <div className="control-group">
                    <label>Rotation</label>
                    <div className="control-row">
                      <button 
                        className="control-btn"
                        onClick={() => setCropSettings(prev => ({ ...prev, rotation: prev.rotation - 90 }))}
                      >
                        <FiRotateCw style={{ transform: 'scaleX(-1)' }} />
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={cropSettings.rotation}
                        onChange={(e) => setCropSettings(prev => ({ ...prev, rotation: parseInt(e.target.value) }))}
                        className="control-slider"
                      />
                      <button 
                        className="control-btn"
                        onClick={() => setCropSettings(prev => ({ ...prev, rotation: prev.rotation + 90 }))}
                      >
                        <FiRotateCw />
                      </button>
                    </div>
                  </div>

                  <div className="control-group">
                    <label>Crop Size</label>
                    <div className="control-row">
                      <input
                        type="range"
                        min="50"
                        max="300"
                        value={cropSettings.width}
                        onChange={(e) => {
                          const newWidth = parseInt(e.target.value);
                          setCropSettings(prev => ({
                            ...prev,
                            width: newWidth,
                            height: newWidth
                          }));
                        }}
                        className="control-slider"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="cropper-actions">
                <button className="cancel-btn" onClick={handleCropCancel}>
                  <FiX /> Cancel
                </button>
                <button className="confirm-btn" onClick={handleCropComplete}>
                  <FiCheck /> Apply Crop
                </button>
              </div>

              <canvas ref={cropCanvasRef} style={{ display: 'none' }} />
            </div>
          </div>
        )}

        {notification && (
          <div className="notification-modal">
            <div className="notification-backdrop" onClick={() => setNotification(null)} />
            <div className={`notification-content notification-${notification.type}`}>
              <h2>
                <span>{notification.icon}</span>
                {notification.title}
              </h2>
              <p>{notification.message}</p>
              <button 
                className="glass-btn primary"
                onClick={() => setNotification(null)}
                style={{ width: '100%' }}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {showGeminiDisclaimer && (
          <div className="disclaimer-modal-overlay">
            <div className="disclaimer-modal">
              <div className="disclaimer-header">
                <h3>Gemini API Key Disclaimer</h3>
              </div>
              
              <div className="disclaimer-content">
                <div className="disclaimer-item">
                  <div className="disclaimer-icon">📜</div>
                  <p>By entering your Gemini API key, you agree to:</p>
                </div>
                
                <ul className="disclaimer-list">
                  <li className="disclaimer-list-item">
                    <div className="list-icon">🔹</div>
                    <a 
                      href="https://developers.google.com/terms" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="disclaimer-link"
                    >
                      Google's API Terms of Service
                    </a>
                  </li>
                  <li className="disclaimer-list-item">
                    <div className="list-icon">🔹</div>
                    <a 
                      href="https://ai.google.dev/gemini-api/terms" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="disclaimer-link"
                    >
                      Gemini API Additional Terms
                    </a>
                  </li>
                  <li className="disclaimer-list-item">
                    <div className="list-icon">🔹</div>
                    <a 
                      href="https://policies.google.com/privacy" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="disclaimer-link"
                    >
                      Google's Privacy Policy
                    </a>
                  </li>
                </ul>
                
                <div className="disclaimer-note">
                  <p>You are responsible for any usage charges and compliance with Google's policies.</p>
                </div>
              </div>
              
              <div className="disclaimer-actions">
                <button 
                  className="glass-btn primary" 
                  onClick={() => setShowGeminiDisclaimer(false)}
                >
                  I Understand
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfilePage;
