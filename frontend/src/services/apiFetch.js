// src/services/apiFetch.js
const API_BASE =
  process.env.REACT_APP_API_URL ||
  "https://0b2k8twmkf.execute-api.ap-south-1.amazonaws.com/dev";

/**
 * Unified fetch helper for all roles.
 * role: 'admin' | 'employee' | 'user' | null (for public endpoints)
 */
export async function apiFetch(endpoint, options = {}, role = null) {
  let token = "";

  // Pick token based on role
  if (role === 'admin') token = localStorage.getItem("adminToken");
  else if (role === 'employee') token = localStorage.getItem("empToken");
  else if (role === 'user') token = localStorage.getItem("token");
  // if role is null or not specified, no token is sent (public API)

  // Merge headers
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  // Make the request
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}
