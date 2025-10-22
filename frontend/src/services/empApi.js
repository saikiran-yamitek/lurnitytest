// src/services/employeeApi.js
import { apiFetch } from "./apiFetch";

const API_BASE = `${process.env.REACT_APP_API_URL}/api`;
const EMPLOYEE_BASE = `${process.env.REACT_APP_EMPLOYEES_API_URL}/api`

/* ---------------- Employee Auth ---------------- */
export const empLogin = async (username, password) => {
  const r = await fetch(`${API_BASE}/employees/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!r.ok) throw new Error((await r.json()).error || "Login failed");
  return r.json(); // → { name, role }
};

/* ---------------- Courses ---------------- */
export const listCourses = async (role) => {
  const res = await apiFetch(`/api/courses`, {}, role);
  return res.json();
};

/* ---------------- Tickets ---------------- */
export const listTickets = async (role) => {
  const res = await apiFetch(`/api/tickets`, {}, role);
  return res.json();
};

export const closeTicket = async (id, empName, role) => {
  const res = await apiFetch(
    `/api/tickets/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status: "closed", closedBy: empName }),
    },
    role
  );
  return res.json();
};
