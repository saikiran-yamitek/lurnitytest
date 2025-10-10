// src/services/adminApi.js
import { apiFetch } from "./apiFetch";

const API_BASE_URL = process.env.REACT_APP_API_URL;
const API = `${API_BASE_URL}/api/admin`;
const API_URL = `${API_BASE_URL}/api/employees`;

export async function listAllSubCourses(role) {
  const courses = await listCourses(role);
  let subs = [];
  courses.forEach(c => {
    c.subCourses.forEach(sc => {
      subs.push({ ...sc, parentCourse: c.title });
    });
  });
  return subs;
}

/* ---------- Dashboard ---------- */
export const getStats = (role) =>
  apiFetch(`${API}/stats`, { method: "GET" }, role).then(res => res.json());

/* ---------- Users ---------- */
export const listUsers = (role) =>
  apiFetch(`${API}/users`, { method: "GET" }, role).then(res => res.json());

export const updateUser = (id, data, role) =>
  apiFetch(`${API}/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }, role).then(res => res.json());

export const deleteUser = (id, role) =>
  apiFetch(`${API}/users/${id}`, { method: 'DELETE' }, role).then(res => res.json());

/* ---------- Courses ---------- */
export const listCourses = (role) =>
  apiFetch(`${API}/courses`, { method: "GET" }, role).then(res => res.json());

export const createCourse = (data, role) =>
  apiFetch(`${API}/courses`, { method: 'POST', body: JSON.stringify(data) }, role).then(res => res.json());

export const updateCourse = (id, data, role) =>
  apiFetch(`${API}/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }, role).then(res => res.json());

export const deleteCourse = (id, role) =>
  apiFetch(`${API}/courses/${id}`, { method: 'DELETE' }, role).then(res => res.json());

/* ---------- CSV Export ---------- */
export const exportCSV = (role) =>
  apiFetch(`${API}/users/export/csv`, { method: 'GET' }, role).then(res => res.blob());

/* ---------- Log Transaction ---------- */
export const logTransaction = (id, data, role) =>
  apiFetch(`${API}/users/${id}/transactions`, { method: 'POST', body: JSON.stringify(data) }, role).then(res => res.json());

/* ---------- Generate Receipt (PDF) ---------- */
export const generateReceipt = async (id, role) => {
  const res = await apiFetch(`${API}/users/${id}/receipt`, {
    headers: { Accept: 'application/pdf' }
  }, role);
  if (!res.ok) throw new Error(await res.text());
  return res.blob();
};

/* ---------- Employees ---------- */
export const listEmployees = (role) =>
  apiFetch(API_URL, { method: 'GET' }, role).then(res => res.json());

export const createEmployee = (data, role) =>
  apiFetch(API_URL, { method: 'POST', body: JSON.stringify(data) }, role).then(res => res.json());

export const updateEmployee = (id, data, role) =>
  apiFetch(`${API_URL}/${id}`, { method: 'PUT', body: JSON.stringify(data) }, role).then(res => res.json());

export const deleteEmployee = (id, role) =>
  apiFetch(`${API_URL}/${id}`, { method: 'DELETE' }, role).then(res => res.json());

export const getEmployee = (id, role) =>
  apiFetch(`${API_BASE_URL}/api/employees/${id}`, { method: 'GET' }, role).then(res => res.json());

export const saveEmployee = (id, data, role) =>
  apiFetch(`${API_URL}${id ? `/${id}` : ""}`, { method: id ? 'PUT' : 'POST', body: JSON.stringify(data) }, role).then(res => res.json());

/* ---------- Tickets ---------- */
export const listTickets = (role) =>
  apiFetch(`${API_BASE_URL}/api/tickets`, { method: 'GET' }, role).then(res => res.json());

export const updateTicket = (id, body, role) =>
  apiFetch(`${API}/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(body) }, role).then(res => res.json());

export const deleteTicket = (id, role) =>
  apiFetch(`${API_BASE_URL}/api/tickets/${id}`, { method: 'DELETE' }, role).then(res => (res.status === 204 ? { ok: true } : res.json()));

/* ---------- Profile Lock ---------- */
export const toggleProfileLock = (id, status, role) =>
  apiFetch(`${API}/users/${id}`, { method: 'PATCH', body: JSON.stringify({ lockStatus: status }) }, role)
    .then(res => res.json());

/* ---------- Cohorts ---------- */
export const listCohorts = (role) =>
  apiFetch(`${API}/landingpage/cohorts`, { method: 'GET' }, role).then(res => res.json());

export const createCohort = (cohortData, role) =>
  apiFetch(`${API}/landingpage/cohorts`, { method: 'POST', body: JSON.stringify(cohortData) }, role).then(res => res.json());

export const updateCohort = (id, cohortData, role) =>
  apiFetch(`${API}/landingpage/cohorts/${id}`, { method: 'PUT', body: JSON.stringify(cohortData) }, role).then(res => res.json());

export const deleteCohort = (id, role) =>
  apiFetch(`${API}/landingpage/cohorts/${id}`, { method: 'DELETE' }, role).then(res => res.json());
