const API = "http://localhost:7700/api";

/* ---------------- employee auth ---------------- */
export const empLogin = async (username, password) => {
  const r = await fetch("http://localhost:7700/api/employees/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  if (!r.ok) throw new Error((await r.json()).error || "Login failed");
  return r.json();   // → { name, role }
};

/* ---------------- courses (content managers) ---- */
export const listCourses = () =>
  fetch(`${API}/courses`).then(r => r.json());

/* ---------------- tickets (support staff) ------- */
export const listTickets = () =>
  fetch(`${API}/tickets`).then(r => r.json());

export const closeTicket = (id, empName) =>
  fetch(`${API}/tickets/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "closed", closedBy: empName })
  });
