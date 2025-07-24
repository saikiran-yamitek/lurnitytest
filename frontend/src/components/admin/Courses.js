import React, { useEffect, useState } from 'react';
import { Link }   from 'react-router-dom';
import {
  listCourses,
  deleteCourse
} from '../../services/adminApi';

import {
  FiEdit2,
  FiTrash2,
  FiPlus
} from 'react-icons/fi';

import './Courses.css';

export default function Courses() {
  const [courses, setCourses] = useState([]);

  /* fetch once */
  useEffect(() => {
    (async () => setCourses(await listCourses()))();
  }, []);

  const handleDelete = async id => {
    if (!window.confirm('Delete course?')) return;
    await deleteCourse(id);
    setCourses(courses.filter(c => c._id !== id));
  };

  return (
    <div className="courses-page">
      <h2 className="page-title">Courses</h2>

      {/* toolbar */}
      <div className="courses-toolbar">
        <Link to="/admin/courses/new" className="new-btn">
          <FiPlus /> New Course
        </Link>
      </div>

      {/* table card */}
      <div className="courses-card">
        <table>
          <thead>
            <tr><th>Title</th><th>Total&nbsp;(min)</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {courses.map(c => (
              <tr key={c._id}>
                <td>{c.title}</td>
                <td>{c.overallDuration}</td>
                <td>
                  <span className={`badge ${c.status.toLowerCase()}`}>
                    {c.status}
                  </span>
                </td>
                <td className="actions">
                  <Link to={`/admin/courses/${c._id}`} title="Edit">
                    <FiEdit2 />
                  </Link>
                  <button onClick={() => handleDelete(c._id)} title="Delete" className="del">
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
