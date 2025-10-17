import React, { useEffect, useState } from "react";
import { Country, State, City } from "country-state-city";
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaGraduationCap, FaMapMarkerAlt, FaUniversity, FaRocket, FaStar, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import "./DemoForm.css";
const API = process.env.REACT_APP_API_URL;

export default function DemoForm({ onClose }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    education: "",
    currentEducation: "",
    state: "",
    city: "",
    college: ""
  });

  const [msg, setMsg] = useState("");
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [errors, setErrors] = useState({});
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const indianStates = State.getStatesOfCountry("IN");
    setStates(indianStates);
  }, []);

  useEffect(() => {
    if (form.state) {
      const selectedState = states.find((s) => s.name === form.state);
      if (selectedState) {
        const stateCities = City.getCitiesOfState("IN", selectedState.isoCode);
        setCities(stateCities);
      }
    } else {
      setCities([]);
    }
  }, [form.state, states]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update form
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "state") {
      setForm((prev) => ({ ...prev, city: "" }));
    }

    // Phone validation
    if (name === "phone") {
      const phonePattern = /^\+\d{1,3}\d{10}$/; // +countrycode + 10 digits
      if (!value.startsWith("+")) {
        setErrors({
          ...errors,
          phone: "Phone number must include country code (e.g., +91xxxxxxxxxx)"
        });
      } else if (!phonePattern.test(value)) {
        setErrors({
          ...errors,
          phone: "Phone number must include valid country code and 10 digits"
        });
      } else {
        setErrors({ ...errors, phone: "" });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check errors
    if (errors.phone) {
      setMsg("❌ Please fix form errors before submitting.");
      return;
    }

    // Validate phone again before submit
    const phonePattern = /^\+\d{1,3}\d{10}$/;
    if (!phonePattern.test(form.phone)) {
      setMsg("❌ Phone number must include valid country code and 10 digits.");
      return;
    }

    setIsSubmitting(true);
    setMsg("");

    try {
      const res = await fetch(`${API}/api/demos/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
        onClose();
      }, 3000);
    } catch (err) {
      setMsg("❌ " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="lurnity-demo-overlay">
        <div className="lurnity-demo-container">
          <button className="lurnity-close-btn" onClick={onClose}>
            <FaTimes />
          </button>

          {/* Header and Benefits */}
          <div className="lurnity-demo-header">
            <div className="lurnity-demo-icon"><FaRocket /></div>
            <h2 className="lurnity-demo-title">
              Book Your <span className="lurnity-gradient-text">Exclusive</span> Demo
            </h2>
            <p className="lurnity-demo-subtitle">
              Experience premium mentorship and see how Lurnity can transform your career
            </p>

            <div className="lurnity-benefits">
              <div className="lurnity-benefit"><FaStar className="benefit-icon" /><span>30-min personalized session</span></div>
              <div className="lurnity-benefit"><FaCheckCircle className="benefit-icon" /><span>Portfolio review & feedback</span></div>
              <div className="lurnity-benefit"><FaGraduationCap className="benefit-icon" /><span>Career roadmap discussion</span></div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="lurnity-demo-form">
            <div className="lurnity-form-grid">
              {/* Name */}
              <div className="lurnity-form-group">
                <label className="lurnity-label"><FaUser className="label-icon" />Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="lurnity-input" placeholder="Enter your full name" required />
              </div>

              {/* Email */}
              <div className="lurnity-form-group">
                <label className="lurnity-label"><FaEnvelope className="label-icon" />Email Address</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className="lurnity-input" placeholder="your.email@example.com" required />
              </div>

              {/* Phone */}
              <div className="lurnity-form-group">
                <label className="lurnity-label"><FaPhone className="label-icon" />Phone Number</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={`lurnity-input ${errors.phone ? 'lurnity-input-error' : ''}`}
                  placeholder="+91xxxxxxxxxx"
                  required
                />
                {errors.phone && <span className="lurnity-error-text">{errors.phone}</span>}
              </div>

              {/* Education */}
              <div className="lurnity-form-group">
                <label className="lurnity-label"><FaGraduationCap className="label-icon" />Education Level</label>
                <select name="education" value={form.education} onChange={handleChange} className="lurnity-select" required>
                  <option value="">Select Education Level</option>
                  <option value="High School">High School</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Bachelor's">Bachelor's Degree</option>
                  <option value="Master's">Master's Degree</option>
                  <option value="PhD">PhD</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Current Education */}
              <div className="lurnity-form-group">
                <label className="lurnity-label"><FaGraduationCap className="label-icon" />Current Field of Study</label>
                <input name="currentEducation" value={form.currentEducation} onChange={handleChange} className="lurnity-input" placeholder="e.g., Computer Science, Engineering" required />
              </div>

              {/* State */}
              <div className="lurnity-form-group">
                <label className="lurnity-label"><FaMapMarkerAlt className="label-icon" />State</label>
                <select name="state" value={form.state} onChange={handleChange} className="lurnity-select" required>
                  <option value="">Select State</option>
                  {states.map((s) => <option key={s.isoCode} value={s.name}>{s.name}</option>)}
                </select>
              </div>

              {/* City */}
              <div className="lurnity-form-group">
                <label className="lurnity-label"><FaMapMarkerAlt className="label-icon" />City</label>
                <select name="city" value={form.city} onChange={handleChange} className="lurnity-select" required>
                  <option value="">Select City</option>
                  {cities.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              {/* College */}
              <div className="lurnity-form-group lurnity-form-group-full">
                <label className="lurnity-label"><FaUniversity className="label-icon" />College/University</label>
                <input name="college" value={form.college} onChange={handleChange} className="lurnity-input" placeholder="Enter your college/university name" required />
              </div>
            </div>

            {/* Submit */}
            <button type="submit" className="lurnity-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? <><FaSpinner className="btn-spinner" />Booking Your Demo...</> : <><FaRocket className="btn-icon" />Book My Free Demo</>}
            </button>

            {msg && <p className="lurnity-form-message">{msg}</p>}
          </form>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="lurnity-success-overlay">
          <div className="lurnity-success-container">
            <div className="lurnity-success-icon"><FaCheckCircle /></div>
            <h3 className="lurnity-success-title">Demo Booked Successfully!</h3>
            <p className="lurnity-success-message">Our premium career advisor will contact you within 24 hours to schedule your exclusive demo session.</p>
          </div>
        </div>
      )}
    </>
  );
}
