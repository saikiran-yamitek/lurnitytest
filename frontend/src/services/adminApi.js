// src/services/adminApi.js
import { apiFetch } from "./apiFetch";

/* ---------- Utility ---------- */
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
  apiFetch(`/api/admin/stats`, { method: "GET" }, role).then(res => res.json());

/* ---------- Users ---------- */
export const listUsers = (role) =>
  apiFetch(`/api/admin/users`, { method: "GET" }, role).then(res => res.json());

export const updateUser = (id, data, role) =>
  apiFetch(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }, role).then(res => res.json());

export const deleteUser = (id, role) =>
  apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' }, role).then(res => res.json());

/* ---------- Courses ---------- */
export const listCourses = (role) =>
  apiFetch(`/api/admin/courses`, { method: "GET" }, role).then(res => res.json());

export const createCourse = (data, role) =>
  apiFetch(`/api/admin/courses`, { method: 'POST', body: JSON.stringify(data) }, role).then(res => res.json());

export const updateCourse = (id, data, role) =>
  apiFetch(`/api/admin/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }, role).then(res => res.json());

export const deleteCourse = (id, role) =>
  apiFetch(`/api/admin/courses/${id}`, { method: 'DELETE' }, role).then(res => res.json());

/* ---------- CSV Export ---------- */
export const exportCSV = (role) =>
  apiFetch(`/api/admin/users/export/csv`, { method: 'GET' }, role).then(res => res.blob());

/* ---------- Log Transaction ---------- */
export const logTransaction = (id, data, role) =>
  apiFetch(`/api/admin/users/${id}/transactions`, { method: 'POST', body: JSON.stringify(data) }, role).then(res => res.json());

/* ---------- Generate Receipt (PDF) ---------- */
export const generateReceipt = async (id, role) => {
  const res = await apiFetch(`/api/admin/users/${id}/receipt`, { headers: { Accept: 'application/pdf' } }, role);
  if (!res.ok) throw new Error(await res.text());
  return res.blob();
};

/* ---------- Employees ---------- */
export const listEmployees = (role) =>
  apiFetch(`/api/employees`, { method: 'GET' }, role).then(res => res.json());

export const createEmployee = (data, role) =>
  apiFetch(`/api/employees`, { method: 'POST', body: JSON.stringify(data) }, role).then(res => res.json());

export const updateEmployee = (id, data, role) =>
  apiFetch(`/api/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }, role).then(res => res.json());

export const deleteEmployee = (id, role) =>
  apiFetch(`/api/employees/${id}`, { method: 'DELETE' }, role).then(res => res.json());

export const getEmployee = (id, role) =>
  apiFetch(`/api/employees/${id}`, { method: 'GET' }, role).then(res => res.json());

export const saveEmployee = (id, data, role) =>
  apiFetch(`/api/employees${id ? `/${id}` : ""}`, { method: id ? 'PUT' : 'POST', body: JSON.stringify(data) }, role).then(res => res.json());

/* ---------- Tickets ---------- */
export const listTickets = (role) =>
  apiFetch(`/api/tickets`, { method: 'GET' }, role).then(res => res.json());

export const updateTicket = (id, body, role) =>
  apiFetch(`/api/admin/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(body) }, role).then(res => res.json());

export const deleteTicket = (id, role) =>
  apiFetch(`/api/admin/tickets/${id}`, { method: 'DELETE' }, role).then(res => (res.status === 204 ? { ok: true } : res.json()));

/* ---------- Profile Lock ---------- */
export const toggleProfileLock = (id, status, role) =>
  apiFetch(`/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify({ lockStatus: status }) }, role).then(res => res.json());

/* ---------- Cohorts ---------- */
export const listCohorts = (role) =>
  apiFetch(`/api/admin/landingpage/cohorts`, { method: 'GET' }, role).then(res => res.json());

export const createCohort = (cohortData, role) =>
  apiFetch(`/api/admin/landingpage/cohorts`, { method: 'POST', body: JSON.stringify(cohortData) }, role).then(res => res.json());

export const updateCohort = (id, cohortData, role) =>
  apiFetch(`/api/admin/landingpage/cohorts/${id}`, { method: 'PUT', body: JSON.stringify(cohortData) }, role).then(res => res.json());

export const deleteCohort = (id, role) =>
  apiFetch(`/api/admin/landingpage/cohorts/${id}`, { method: 'DELETE' }, role).then(res => res.json());
