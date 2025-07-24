// src/components/admin/AdminLayout.js
import React, { useState, useEffect } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import './adminLayout.css';
import { FaSignOutAlt } from 'react-icons/fa';
import logo from '../../assets/LURNITY.jpg';

export default function AdminLayout(props) {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const history = useHistory();

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    history.push('/admin-login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <img src={logo} alt="Lurnity Logo" />
          <h2>Lurnity Admin</h2>
        </div>

         <nav className="admin-nav">
   <NavLink exact to="/admin" activeClassName="active-link">Dashboard</NavLink>
   <NavLink to="/admin/courses" activeClassName="active-link">Courses</NavLink>
   <NavLink to="/admin/users"   activeClassName="active-link">Users</NavLink>
  <NavLink to="/admin/employees" activeClassName="active-link">Employees</NavLink>
    <NavLink       to="/admin/tickets"    activeClassName="active-link">Tickets</NavLink>
    <NavLink to="/admin/workshops" activeClassName="active-link">Workshops</NavLink>
   <NavLink to="/admin/settings" activeClassName="active-link">Settings</NavLink>
 </nav>


        <div className="logout-container">
          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt className="logout-icon" />
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-main-content">
        {props.children}
      </main>
    </div>
  );
}
