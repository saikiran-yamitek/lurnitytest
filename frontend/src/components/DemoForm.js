import React, { useEffect, useState } from "react";
import { Country, State, City } from "country-state-city";
import "./DemoForm.css";

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

    if (errors.phone) return alert("Fix form errors before submitting.");

    try {
      const res = await fetch("http://localhost:7700/api/demo/book", {
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
      }, 2500);
    } catch (err) {
      setMsg("❌ " + err.message);
    }
  };

  return (
    <>
      <div className="demo-form-overlay">
        <div className="demo-form-box">
          <span className="close-btn" onClick={onClose}>×</span>
          <h2 className="form-title">Book a Free Demo</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Name</label>
                <input name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  maxLength="10"
                  required
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
              <div className="form-group">
                <label>Education</label>
                <input name="education" value={form.education} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Current Education</label>
                <input name="currentEducation" value={form.currentEducation} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>State</label>
                <select name="state" value={form.state} onChange={handleChange} required>
                  <option value="">Select State</option>
                  {states.map((s) => (
                    <option key={s.isoCode} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>City</label>
                <select name="city" value={form.city} onChange={handleChange} required>
                  <option value="">Select City</option>
                  {cities.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>College</label>
                <input name="college" value={form.college} onChange={handleChange} required />
              </div>
            </div>
            <button type="submit" className="submit-btn">Submit</button>
          </form>
          {msg && <p className="form-msg">{msg}</p>}
        </div>
      </div>

      {showSuccessPopup && (
        <div className="success-popup">
          <div className="success-box">
            <h3>✅ Demo Booked!</h3>
            <p>We’ll contact you soon.</p>
          </div>
        </div>
      )}
    </>
  );
}
