// src/components/admin/Courses.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  listCourses,
  deleteCourse
} from '../../services/adminApi';

import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiBook,
  FiClock,
  FiActivity
} from 'react-icons/fi';

import './Courses.css';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  /* fetch once with proper response handling */
  useEffect(() => {
    const loadCourses = async () => {
      console.log('🚀 Loading courses...');
      try {
        const response = await listCourses("admin");
        console.log('📚 Raw API response:', response);
        
        // ✅ FIXED: Extract items array from response
        let coursesArray = [];
        
        if (Array.isArray(response)) {
          // Response is already an array
          coursesArray = response;
        } else if (response && Array.isArray(response.items)) {
          // Response has items property with array
          coursesArray = response.items;
        } else if (response && typeof response === 'object') {
          // Response is object, try to extract array values
          coursesArray = Object.values(response).filter(item => 
            item && typeof item === 'object' && item.id
          );
        }
        
        console.log('✅ Courses extracted:', coursesArray.length, coursesArray);
        setCourses(coursesArray);
        
      } catch (error) {
        console.error('❌ Failed to fetch courses:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await deleteCourse(id, "admin");
      // Safe filter with array check
      if (Array.isArray(courses)) {
        setCourses(courses.filter(c => c.id !== id)); // Note: using 'id' instead of '_id'
      }
    } catch (error) {
      console.error('❌ Failed to delete course:', error);
    }
  };

  // Safe filter functions
  const safeFilterCourses = (predicate) => {
    if (Array.isArray(courses)) {
      return courses.filter(predicate);
    }
    return [];
  };

  // Ensure courses is always an array for rendering
  const safeCourses = Array.isArray(courses) ? courses : [];

  if (loading) {
    return (
      <div className="courses-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="courses-page">
      {/* Header Section */}
      <div className="page-header">
        <div className="page-title-container">
          <FiBook className="page-icon" />
          <h1 className="page-titlepo">Courses Management</h1>
        </div>
        <p className="page-subtitle">Manage and organize your course content</p>
      </div>

      {/* Stats Cards - Using safe filter functions */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon published">
            <FiActivity />
          </div>
          <div className="stat-content">
            <h3>{safeFilterCourses(c => (c.status || "").toLowerCase().trim() === "published").length}</h3>
            <p>Published</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon draft">
            <FiClock />
          </div>
          <div className="stat-content">
            <h3>{safeFilterCourses(c => (c.status || "").toLowerCase().trim() === "draft").length}</h3>
            <p>Draft</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon total">
            <FiBook />
          </div>
          <div className="stat-content">
            <h3>{safeCourses.length}</h3>
            <p>Total Courses</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="courses-toolbar">
        <div className="toolbar-left">
          <h2 className="section-title">All Courses</h2>
        </div>
        <div className="toolbar-right">
          <Link to="/admin/courses/new" className="new-btn">
            <FiPlus />
            <span>New Course</span>
          </Link>
        </div>
      </div>

      {/* Table Card */}
      <div className="courses-card">
        {safeCourses.length === 0 ? (
          <div className="empty-state">
            <FiBook className="empty-state-icon" />
            <h3>No courses found</h3>
            <p>Get started by creating your first course</p>
            <Link to="/admin/courses/new" className="empty-state-btn">
              <FiPlus />
              Create Course
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Course Title</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {safeCourses.map((c, index) => (
                  <tr key={c.id} style={{ animationDelay: `${index * 0.1}s` }}>
                    <td className="course-title">
                      <div className="course-info">
                        <h4>{c.title || 'Untitled Course'}</h4>
                        <span className="course-meta">Course ID: {c.id?.slice?.(-6) || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="duration">
                      <div className="duration-badge">
                        <FiClock />
                        {c.overallDuration || 0} min
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${(c.status || 'unknown').toLowerCase()}`}>
                        {c.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="actions">
                      <Link 
                        to={`/admin/courses/${c.id}`} 
                        className="action-btn edit-btn"
                        title="Edit Course"
                      >
                        <FiEdit2 />
                      </Link>
                      <button 
                        onClick={() => handleDelete(c.id)} 
                        className="action-btn delete-btn"
                        title="Delete Course"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
