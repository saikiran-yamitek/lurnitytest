import React from "react";
import "./Layout.css";

export default function InstructorHome({emp}){
  return(
    <div className="emp-shell">
      <header className="emp-header">
        <h3>Instructor Home</h3><span>{emp.name}</span>
      </header>

      <main className="emp-main">
        <p>Welcome, {emp.name}! Right now there are no specific tools for instructors.</p>
      </main>
    </div>
  );
}
