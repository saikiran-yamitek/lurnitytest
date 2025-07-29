import React, { useState, useEffect } from "react";
import { Country, State, City } from "country-state-city";
import "./StudentProfilePage.css";
import Select from "react-select";

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
  const [selectedSection, setSelectedSection] = useState({
    category: "Basic Details",
    item: "Student Profile",
  });
  

  const [collapsed, setCollapsed] = useState({});
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
    phone: "",       // Already present in backend
  email: "",       // Already present in backend
  isWhatsAppSame: "Yes",
  parentGuardian: {
    firstName: "",
    lastName: "",
    relation: "",
    occupation: "",
    email: "",
    phone: "",
    isWhatsAppSame: "Yes",
  },
  currentAddress: {
  addressLine1: "",
  addressLine2: "",
  country: "",
  pinCode: "",
  state: "",
  district: "",
  city: ""
},currentExpertise: {
  codingLevel: "",
  hasLaptop: "",
  knownSkills: [],
  otherSkills: ""
},yourPreference: {
  jobSearchStatus: "",
  expectedCTC: ""
},tenthStandard: {
    board: "",
    schoolName: "",
    markingScheme: "",
    cgpa: "",
    percentage: ""
  },intermediateOrDiploma: {
  stream: "",
  status: "",
  institutionName: "",
  markingScheme: "",
  cgpa: "",
  percentage: "",
  yearOfCompletion: ""
},bachelorsDegree: {
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

  const userId = localStorage.getItem("userId");

  useEffect(() => {
  const fetchProfile = async () => {
    try {
      const response = await fetch(`http://localhost:7700/api/user/${userId}/profile`);
      const data = await response.json();
      if (response.ok && data) {
        setFormData({
          ...formData,
          ...data,
          name: data.name || data.ircName || "",
          geminiApiKey: data.geminiApiKey || "",
          photo: null,
          photoURL: data.photoURL || "",
          parentGuardian: {
            ...formData.parentGuardian,
            ...data.parentGuardian
          }
        });
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  if (userId) fetchProfile();
}, [userId]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({
          ...prev,
          photo: file,
          photoURL: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
        const { email, ...updatableFields } = formData;
      const response = await fetch(`http://localhost:7700/api/user/${userId}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatableFields),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Save failed");

      alert("✅ Profile saved successfully!");
    } catch (err) {
      console.error("Save Error:", err);
      alert("❌ Failed to save profile.");
    }
  };

  const renderSection = () => {
    const { category, item } = selectedSection;
    if (category === "Basic Details" && item === "Student Profile") {
      return (
        <div className="form-section">
          <h2>Student Profile</h2>
          <p className="section-description">Information used for IRC Certificate etc.</p>

          <div className="photo-upload">
            {formData.photoURL && <img src={formData.photoURL} alt="Preview" className="photo-preview" />}
            <div className="photo-buttons">
              <label htmlFor="photo-upload" className="upload-btn">Upload Photo</label>
              <input type="file" id="photo-upload" accept="image/*" hidden onChange={handlePhotoUpload} />
              <button className="secondary-btn">Take Selfie Again</button>
              <button className="remove-btn" onClick={() => setFormData((p) => ({ ...p, photo: null, photoURL: "" }))}>
                Remove Photo
              </button>
            </div>
          </div>

          <div className="form-grid">
            {[
              ["First Name", "firstName"],
              ["Last Name", "lastName"],
              ["Name on IRC Certificate", "name"],
              ["Gender", "gender", "select"],
              ["Communication Language", "communicationLanguage"],
              ["Teaching Language", "teachingLanguage"],
              ["Date of Birth", "dateOfBirth", "date"],
              ["LinkedIn", "linkedIn"],
              ["Twitter", "twitter"],
              ["GitHub", "github"],
              ["Gemini API Key", "geminiApiKey"],
              ["Resume URL", "resumeURL"],
            ].map(([label, name, type]) => (
              <div className="form-group" key={name}>
                <label>{label}</label>
                {type === "select" ? (
                  <select name={name} value={formData[name]} onChange={handleInputChange}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer Not to Say">Prefer Not to Say</option>
                  </select>
                ) : (
                  <input
  type={type || "text"}
  name={name}
  value={
    name === "dateOfBirth" && formData[name]
      ? formData[name].substring(0, 10)
      : formData[name]
  }
  onChange={handleInputChange}
/>

                )}
              </div>
            ))}
          </div>

          <button className="save-button" onClick={handleSave}>Save</button>
        </div>
      );
    }

    if (category === "Basic Details" && item === "Student Contact Details") {
  return (
    <div className="form-section">
      <h2>Student Contact Details</h2>
      <p className="section-description">
        We will use the contact details you provide to send you the important updates during the program
      </p>

      <div className="form-group">
        <label>Registered Phone Number</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="+91 9347494329"
        />
      </div>

      <div className="form-group">
        <label>Is this same as your WhatsApp Number?</label>
        <div className="radio-group">
          {["Yes", "No", "Don't have WhatsApp"].map((option) => (
            <label key={option}>
              <input
                type="radio"
                name="isWhatsAppSame"
                value={option}
                checked={formData.isWhatsAppSame === option}
                onChange={handleInputChange}
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Email ID</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
        />
      </div>

      <button className="save-button" onClick={handleSave}>Save</button>
    </div>
  );
}
    if (category === "Basic Details" && item === "Parent/Guardian Details") {
  return (
    <div className="form-section">
      <h2>Parent/Guardian Details</h2>
      <p className="section-description">
        Person/Guardian is the one who supports the student during their Lurnity journey. 
        Student's progress will be shared regularly with Parent/Guardian during the program.
        Eg: Father, Mother, Uncle etc.
      </p>

      <div className="form-grid">
        {[
          ["First Name", "firstName"],
          ["Last Name", "lastName"],
          ["Relation with the student", "relation"],
          ["Occupation", "occupation"],
          ["Parent/Guardian Email ID", "email"],
          ["Parent/Guardian Phone Number", "phone"],
        ].map(([label, key]) => (
          <div className="form-group" key={key}>
            <label>{label}</label>
            <input
              type="text"
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
            />
          </div>
        ))}

        <div className="form-group">
          <label>Is this same as your WhatsApp Number?</label>
          <div className="radio-group">
            {["Yes", "No", "Don't have WhatsApp"].map((option) => (
              <label key={option}>
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
                      },
                    }))
                  }
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      </div>

      <button className="save-button" onClick={handleSave}>
        Save
      </button>
    </div>
  );
}
    if (category === "Basic Details" && item === "Current Address"){
        return(
        <div className="form-section">
  <h2>Current Address</h2>
  <p className="section-description">Please provide your complete address to send rewards, resources, certificates, etc.</p>

  <div className="form-grid">
    {[
      ["Address Line 1", "addressLine1"],
      ["Address Line 2", "addressLine2"],
      ["Postal/Pin Code", "pinCode"],
      ["City/Town", "city"]
    ].map(([label, name]) => (
      <div className="form-group" key={name}>
        <label>{label}</label>
        <input
          type="text"
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
        />
      </div>
    ))}

    {/* Country Dropdown */}
    <div className="form-group">
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
              state: "", // reset state
              district: "", // reset district
            },
          }));
        }}
      >
        <option value="">Select Country</option>
        {Country.getAllCountries().map((country) => (
          <option key={country.isoCode} value={country.isoCode}>
            {country.name}
          </option>
        ))}
      </select>
    </div>

    {/* State Dropdown */}
    <div className="form-group">
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

    {/* District Dropdown */}
    <div className="form-group">
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

  <button className="save-button" onClick={handleSave}>Save</button>
</div>
)

    }

    if (category === "Basic Details" && item === "Current Expertise") {
  return (
    <div className="form-section">
      <h2>Current Expertise</h2>
      <p className="section-description">
        Please provide the following details to help us mentor you better.
      </p>

      <div className="form-group">
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
        >
          <option value="">Select</option>
          <option value="No knowledge">I don't have knowledge in coding</option>
          <option value="Basic">I have basic knowledge in coding</option>
          <option value="Intermediate">I know coding very well</option>
          <option value="Advanced">I have built websites and apps</option>
        </select>
      </div>

      <div className="form-group">
        <label>Do you have a Laptop/Computer?</label>
        <div className="radio-group">
          {["Yes", "No"].map((option) => (
            <label key={option}>
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
              {option}
            </label>
          ))}
        </div>
      </div>

      

      <div className="form-group">
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
    className="basic-multi-select"
    classNamePrefix="select"
  />
</div>



      <button className="save-button" onClick={handleSave}>
        Save
      </button>
    </div>
  );
}
    if (category === "Basic Details" && item === "Your Preference") {
  return (
    <div className="form-section">
      <h2>Your Preference</h2>
      <p className="section-description">
        Share your preference to help us match you with opportunities that fit you the best.
      </p>

      <div className="form-group">
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
        >
          <option value="">Select</option>
          <option value="Actively looking">Actively looking</option>
          <option value="Passively looking">Passively looking</option>
          <option value="Not looking">Not looking</option>
        </select>
      </div>

      <div className="form-group">
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

      <button className="save-button" onClick={handleSave}>
        Save
      </button>
    </div>
  );
}
    // Add inside StudentProfilePage.js in renderSection()
    // Continue inside renderSection function in StudentProfilePage component
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
    <div className="form-section">
      <h2>10th Standard</h2>

      <div className="form-group">
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
        >
          <option value="">Select Board</option>
          {boardOptions.map((board) => (
            <option key={board} value={board}>
              {board}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
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
        />
      </div>

      <div className="form-group">
        <label>Marking Scheme</label>
        <div className="radio-group">
          {["Grade/CGPA", "Percentage"].map((scheme) => (
            <label key={scheme}>
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
              {scheme}
            </label>
          ))}
        </div>
      </div>

      {formData.tenthStandard.markingScheme === "Grade/CGPA" && (
        <div className="form-group">
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
          />
        </div>
      )}

      {formData.tenthStandard.markingScheme === "Percentage" && (
        <div className="form-group">
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
          />
        </div>
      )}

      <button className="save-button" onClick={handleSave}>
        Save
      </button>
    </div>
  );
}
    if (category === "Education Details" && item === "Intermediate/12th/Diploma") {
  return (
    <div className="form-section">
      <h2>Intermediate/12th/Diploma</h2>

      {/* What did you study after 10th? */}
      <div className="form-group">
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
        >
          <option value="">Select</option>
          <option value="Intermediate/12th">Intermediate/12th</option>
          <option value="Diploma">Diploma</option>
          <option value="ITI">ITI</option>
          <option value="Others">Others</option>
        </select>
      </div>

      {/* Status */}
      <div className="form-group">
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
        >
          <option value="">Select</option>
          <option value="Completed Successfully">Completed Successfully</option>
          <option value="Currently Studying">Currently Studying</option>
          <option value="Having Backlogs, will clear them soon">
            Having Backlogs, will clear them soon
          </option>
        </select>
      </div>

      {/* Institution Name */}
      <div className="form-group">
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
        />
      </div>

      {/* Marking Scheme */}
      <div className="form-group">
        <label>Marking Scheme</label>
        <div className="radio-group">
          {["Grade/CGPA", "Percentage"].map((scheme) => (
            <label key={scheme}>
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
              {scheme}
            </label>
          ))}
        </div>
      </div>

      {/* CGPA or Percentage based on selection */}
      {formData.intermediateOrDiploma.markingScheme === "Grade/CGPA" && (
        <div className="form-group">
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
          />
        </div>
      )}
      {formData.intermediateOrDiploma.markingScheme === "Percentage" && (
        <div className="form-group">
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
          />
        </div>
      )}

      {/* Year of Completion */}
      <div className="form-group">
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
        />
      </div>

      <button className="save-button" onClick={handleSave}>
        Save
      </button>
    </div>
  );
}

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
    <div className="form-section">
      <h2>Bachelor's Degree</h2>

      {/* Degree Name Dropdown */}
      <div className="form-group">
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
        >
          <option value="">Select Degree</option>
          {bachelorOptions.map((degree) => (
            <option key={degree} value={degree}>{degree}</option>
          ))}
        </select>
      </div>

      {/* Degree Status */}
      <div className="form-group">
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
        >
          <option value="">Select</option>
          <option value="Completed Successfully">Completed Successfully</option>
          <option value="Currently Studying">Currently Studying</option>
          <option value="Having Backlogs, will clear them soon">Having Backlogs, will clear them soon</option>
          <option value="Discontinued Degree">Discontinued Degree</option>
        </select>
      </div>

      {/* Department */}
      <div className="form-group">
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
        />
      </div>

      {/* Marking Scheme */}
      <div className="form-group">
        <label>Marking Scheme</label>
        <div className="radio-group">
          {["Grade/CGPA", "Percentage"].map((scheme) => (
            <label key={scheme}>
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
              {scheme}
            </label>
          ))}
        </div>
      </div>

      {/* CGPA or Percentage Field */}
      {formData.bachelorsDegree.markingScheme === "Grade/CGPA" && (
        <div className="form-group">
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
          />
        </div>
      )}

      {formData.bachelorsDegree.markingScheme === "Percentage" && (
        <div className="form-group">
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
          />
        </div>
      )}

      {/* Start Year */}
      <div className="form-group">
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
        />
      </div>

      {/* End Year */}
      <div className="form-group">
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
        />
      </div>

      {/* Institute Country */}
      <div className="form-group">
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
        >
          <option value="">Select Country</option>
          {Country.getAllCountries().map((country) => (
            <option key={country.isoCode} value={country.isoCode}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      {/* Institute State */}
      <div className="form-group">
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

      {/* Institute District */}
      <div className="form-group">
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

      {/* Institute Name */}
      <div className="form-group">
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
        />
      </div>

      {/* Institute Pincode */}
      <div className="form-group">
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
        />
      </div>

      {/* Institute City */}
      <div className="form-group">
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
        />
      </div>

      <button className="save-button" onClick={handleSave}>Save</button>
    </div>
  );
}









    return <p className="coming-soon">{item} section coming soon...</p>;
  };

  return (
    <>
    <header className="top-header">
    <div className="left-logo">
      <img src="/LURNITY.jpg" alt="Lurnity Logo" className="logo-img" />
    </div>
    <div className="right-nav">
      <a href="/home" className="nav-link">Home</a>
      {formData.photoURL && (
        <img src={formData.photoURL} alt="Profile" className="nav-avatar" />
      )}
    </div>
  </header>

  

    <div className="profile-container">
        
      <div className="sidebar">
        {Object.entries(sections).map(([category, items]) => (
          <div className="sidebar-section" key={category}>
            <div className="sidebar-title" onClick={() => setCollapsed((prev) => ({ ...prev, [category]: !prev[category] }))}>
              {category}
              <span className="collapse-icon">{collapsed[category] ? "▶" : "▼"}</span>
            </div>
            {!collapsed[category] && (
              <ul className="sidebar-items">
                {items.map((item) => (
                  <li
                    key={item}
                    className={`sidebar-item ${
                      selectedSection.category === category && selectedSection.item === item ? "active" : ""
                    }`}
                    onClick={() => setSelectedSection({ category, item })}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      <div className="main-content">{renderSection()}</div>
    </div>
    </>
  );
};

export default StudentProfilePage;
