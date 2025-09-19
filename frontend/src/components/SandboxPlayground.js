/* eslint react-hooks/exhaustive-deps: 0 */
import React, { useEffect, useState } from "react";
import { useHistory, Link } from "react-router-dom";
import "./SandboxPlayground.css";
import CodeSandboxEmbed from "./CodeSandboxEmbed";

import logo from "../assets/LURNITY.jpg";


const API = process.env.REACT_APP_API_URL;

export default function SandboxPlayground() {
  const history = useHistory();
  const token   = localStorage.getItem("token");

  const [userName, setUserName] = useState("");   // real name

  /* fetch user profile once (to get the name) */
  useEffect(() => {
    if (!token) return;

    fetch(`${API}/apiuser/homepage`, {
      headers: { Authorization: "Bearer " + token }
    })
      .then((r) => r.ok ? r.json() : null)
      .then((u) => {
        if (u?.name) {
          setUserName(u.name);
          /* optional: cache for other pages */
          localStorage.setItem("userName", u.name);
        }
      })
      .catch(() => {}); // silent fail
  }, [token]);

  return (
    <div className="sp-root">
      {/* Bigger header */}
      <header className="sp-header">
        <img
          src={logo}
          alt="Lurnity"
          className="sp-logo"
          onClick={() => history.push("/home")}
        />

        <div className="sp-right-links">
          <Link to="/home" className="sp-nav-link">Home</Link>
          <span className="sp-divider">|</span>
          <span className="sp-user">{userName || "User"}</span>
        </div>
      </header>

      {/* Embedded CodeSandbox */}
      <main className="sp-main">
        <CodeSandboxEmbed template="react" title="Code Playground" />
      </main>
    </div>
  );
}
