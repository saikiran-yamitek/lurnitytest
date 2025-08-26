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
    setForm({ ...form, [name]: value });

    if (name === "state") {
      setForm((prev) => ({ ...prev, city: "" }));
    }

    if (name === "phone") {
      const phonePattern = /^\d{10}$/;
      setErrors({
        ...errors,
        phone: !phonePattern.test(value)
          ? "Phone number must be exactly 10 digits"
          : ""
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (errors.phone) {
      setMsg("❌ Please fix form errors before submitting.");
      return;
    }

    setIsSubmitting(true);
    setMsg("");

    try {
      const res = await fetch(`${API}/api/demo/book`, {
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
      <div className="luxury-demo-overlay">
        <div className="luxury-demo-container">
          <button className="luxury-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
          
          {/* Premium Header */}
          <div className="luxury-demo-header">
            <div className="luxury-demo-icon">
              <FaRocket />
            </div>
            <h2 className="luxury-demo-title">
              Book Your <span className="luxury-gradient-text">Exclusive</span> Demo
            </h2>
            <p className="luxury-demo-subtitle">
              Experience premium mentorship and see how Lurnity can transform your career
            </p>
            
            {/* Premium Benefits */}
            <div className="luxury-benefits">
              <div className="luxury-benefit">
                <FaStar className="benefit-icon" />
                <span>30-min personalized session</span>
              </div>
              <div className="luxury-benefit">
                <FaCheckCircle className="benefit-icon" />
                <span>Portfolio review & feedback</span>
              </div>
              <div className="luxury-benefit">
                <FaGraduationCap className="benefit-icon" />
                <span>Career roadmap discussion</span>
              </div>
            </div>
          </div>

          {/* Premium Form */}
          <form onSubmit={handleSubmit} className="luxury-demo-form">
            <div className="luxury-form-grid">
              
              {/* Name Field */}
              <div className="luxury-form-group">
                <label className="luxury-label">
                  <FaUser className="label-icon" />
                  Full Name
                </label>
                <div className="luxury-input-container">
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="luxury-input"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="luxury-form-group">
                <label className="luxury-label">
                  <FaEnvelope className="label-icon" />
                  Email Address
                </label>
                <div className="luxury-input-container">
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="luxury-input"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div className="luxury-form-group">
                <label className="luxury-label">
                  <FaPhone className="label-icon" />
                  Phone Number
                </label>
                <div className="luxury-input-container">
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className={`luxury-input ${errors.phone ? 'luxury-input-error' : ''}`}
                    placeholder="10-digit phone number"
                    maxLength="10"
                    required
                  />
                </div>
                {errors.phone && <span className="luxury-error-text">{errors.phone}</span>}
              </div>

              {/* Education Field */}
              <div className="luxury-form-group">
                <label className="luxury-label">
                  <FaGraduationCap className="label-icon" />
                  Education Level
                </label>
                <div className="luxury-input-container">
                  <select
                    name="education"
                    value={form.education}
                    onChange={handleChange}
                    className="luxury-select"
                    required
                  >
                    <option value="">Select Education Level</option>
                    <option value="High School">High School</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Bachelor's">Bachelor's Degree</option>
                    <option value="Master's">Master's Degree</option>
                    <option value="PhD">PhD</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Current Education Field */}
              <div className="luxury-form-group">
                <label className="luxury-label">
                  <FaGraduationCap className="label-icon" />
                  Current Field of Study
                </label>
                <div className="luxury-input-container">
                  <input
                    name="currentEducation"
                    value={form.currentEducation}
                    onChange={handleChange}
                    className="luxury-input"
                    placeholder="e.g., Computer Science, Engineering"
                    required
                  />
                </div>
              </div>

              {/* State Field */}
              <div className="luxury-form-group">
                <label className="luxury-label">
                  <FaMapMarkerAlt className="label-icon" />
                  State
                </label>
                <div className="luxury-input-container">
                  <select
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    className="luxury-select"
                    required
                  >
                    <option value="">Select State</option>
                    {states.map((s) => (
                      <option key={s.isoCode} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* City Field */}
              <div className="luxury-form-group">
                <label className="luxury-label">
                  <FaMapMarkerAlt className="label-icon" />
                  City
                </label>
                <div className="luxury-input-container">
                  <select
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="luxury-select"
                    required
                  >
                    <option value="">Select City</option>
                    {cities.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* College Field */}
              <div className="luxury-form-group luxury-form-group-full">
                <label className="luxury-label">
                  <FaUniversity className="label-icon" />
                  College/University
                </label>
                <div className="luxury-input-container">
                  <input
                    name="college"
                    value={form.college}
                    onChange={handleChange}
                    className="luxury-input"
                    placeholder="Enter your college/university name"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="luxury-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="btn-spinner" />
                  Booking Your Demo...
                </>
              ) : (
                <>
                  <FaRocket className="btn-icon" />
                  Book My Free Demo
                </>
              )}
            </button>

            {msg && <p className="luxury-form-message">{msg}</p>}
          </form>

          {/* Trust Indicators */}
          <div className="luxury-trust-indicators">
            <div className="trust-item">
              <span className="trust-number">5,000+</span>
              <span className="trust-label">Demos Conducted</span>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
              <span className="trust-number">4.9/5</span>
              <span className="trust-label">Student Rating</span>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
              <span className="trust-number">100%</span>
              <span className="trust-label">Free Session</span>
            </div>
          </div>
        </div>
      </div>

      {/* Luxury Success Popup */}
      {showSuccessPopup && (
        <div className="luxury-success-overlay">
          <div className="luxury-success-container">
            <div className="luxury-success-icon">
              <FaCheckCircle />
            </div>
            <h3 className="luxury-success-title">Demo Booked Successfully!</h3>
            <p className="luxury-success-message">
              Our premium career advisor will contact you within 24 hours to schedule your exclusive demo session.
            </p>
            <div className="luxury-success-benefits">
              <div className="success-benefit">
                <FaCheckCircle className="success-check" />
                <span>Personalized curriculum review</span>
              </div>
              <div className="success-benefit">
                <FaCheckCircle className="success-check" />
                <span>Career roadmap discussion</span>
              </div>
              <div className="success-benefit">
                <FaCheckCircle className="success-check" />
                <span>Live coding session</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
