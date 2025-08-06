// src/pages/EmpLogin.js
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { empLogin } from "../../services/empApi";
import "./EmpLogin.css";
import logo from "../../assets/LURNITY.jpg"; // 🔁 Update path as needed

export default function EmpLogin() {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const hist = useHistory();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const info = await empLogin(u, p); // {name, role}
      console.log("LOGIN RESPONSE:", info); 
      localStorage.setItem("empInfo", JSON.stringify(info));
      console.log(JSON.stringify(info))
      if (info.role === "content" || info.role === "super")
        hist.push("/employee/content");
      else if (info.role === "support") hist.push("/employee/support");
      else if (info.role === "lab administrator") hist.push("/employee/labadmin");
      else if (info.role === "lab incharge") hist.push("/employee/labincharge");
      else if (info.role === "placement") hist.push("/employee/placement");
      else hist.push("/employee/instructor");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="emp-login-container">
      <div className="emp-login-card">
        <img src={logo} alt="Lurnity Logo" className="emp-logo" />
        <h1 className="emp-title">Employee Portal</h1>
        <form className="emp-login-form" onSubmit={submit}>
          <input
            placeholder="Username"
            value={u}
            onChange={(e) => setU(e.target.value)}
            required
            className="emp-input"
          />
          <input
            placeholder="Password"
            type="password"
            value={p}
            onChange={(e) => setP(e.target.value)}
            required
            className="emp-input"
          />
          <button className="emp-button">Login</button>
        </form>
      </div>
    </div>
  );
}
