// src/services/apiFetch.js
const MAIN_API =
  process.env.REACT_APP_MAIN_API_URL ;

const EMPLOYEES_API =
  process.env.REACT_APP_EMPLOYEES_API_URL ;

/**
 * Unified fetch helper for all roles.
 * role: 'admin' | 'employee' | 'user' | null (for public endpoints)
 */
export async function apiFetch(endpoint, options = {}, role = null) {
  let token = "";

  if (role === "admin") token = localStorage.getItem("adminToken");
  else if (role === "employee") token = localStorage.getItem("empToken");
  else if (role === "user") token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  // 🧠 Automatically decide which API to call
  // Anything starting with /api/employees goes to employees API
  const baseURL = endpoint.startsWith("/api/employees")
    ? EMPLOYEES_API
    : MAIN_API;

  const response = await fetch(`${baseURL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}
