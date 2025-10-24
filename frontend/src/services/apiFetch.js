// src/services/apiFetch.js
const MAIN_API =
  process.env.REACT_APP_API_URL || "https://qh5me238u3.execute-api.ap-south-1.amazonaws.com/dev";

const EMPLOYEES_API =
  process.env.REACT_APP_EMPLOYEES_API_URL ||
  "https://z4k5arnlg4.execute-api.ap-south-1.amazonaws.com/dev";

// ✅ NEW: Admin API
const ADMIN_API =
  process.env.REACT_APP_ADMIN_API_URL ||
  "https://your-admin-api.execute-api.ap-south-1.amazonaws.com/dev";

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

  // ✅ Automatically decide which API to call
  let baseURL = MAIN_API;
  
  if (endpoint.startsWith("/api/employees")) {
    baseURL = EMPLOYEES_API;
  } else if (endpoint.startsWith("/api/admin")) {
    baseURL = ADMIN_API;  // ✅ Route admin requests to admin API
  }

  const response = await fetch(`${baseURL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}
