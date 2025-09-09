// src/components/admin/AdminLayout.js
import React, { useState, useEffect } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import './adminLayout.css';
import { FaSignOutAlt } from 'react-icons/fa';
import { 
  FaChartLine, 
  FaBook, 
  FaUsers, 
  FaUserTie, 
  FaTicketAlt, 
  FaChalkboardTeacher,
  FaCog,
  FaCalendarAlt,
} from 'react-icons/fa';
import logo from '../../assets/LURNITY.jpg';


export default function AdminLayout(props) {
  const [theme] = useState(localStorage.getItem('theme') || 'light');
  const [isHovering, setIsHovering] = useState(null);
  const history = useHistory();

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    history.push('/admin-login');
  };

  const navItems = [
    { path: "/admin", name: "Dashboard", icon: <FaChartLine /> },
    { path: "/admin/courses", name: "Courses", icon: <FaBook /> },
    { path: "/admin/users", name: "Users", icon: <FaUsers /> },
    { path: "/admin/employees", name: "Employees", icon: <FaUserTie /> },
    { path: "/admin/tickets", name: "Tickets", icon: <FaTicketAlt /> },
    { path: "/admin/workshops", name: "Workshops", icon: <FaChalkboardTeacher /> },
    { path: "/admin/settings", name: "Settings", icon: <FaCog /> },
    { path: "/admin/hiring", name: "Hiring", icon: <FaUserTie /> },
    { path: "/admin/cohorts", name: "Manage Masterclass", icon: <FaCalendarAlt /> }
  ];

  return (
    <div className={`admin-layout ${theme}`}>
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <img src={logo} alt="Lurnity Logo" />
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => (
            <NavLink 
              exact 
              to={item.path} 
              activeClassName="active-link"
              key={item.path}
              onMouseEnter={() => setIsHovering(item.path)}
              onMouseLeave={() => setIsHovering(null)}
            >
              <span className="nav-icon">
                {React.cloneElement(item.icon, {
                  className: isHovering === item.path ? 'icon-hover' : ''
                })}
              </span>
              <span className="nav-text">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
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
