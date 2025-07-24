const API = 'http://localhost:7700/api/admin';
const API_URL = 'http://localhost:7700/api/employees';


// Utility to include Authorization header
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
});

/* ---------- Dashboard ---------- */
export const getStats = () =>
  fetch(`${API}/stats`, {
    headers: authHeaders(),
  }).then(res => res.json());

/* ---------- Users ---------- */
export const listUsers = () =>
  fetch(`${API}/users`, {
    headers: authHeaders(),
  }).then(res => res.json());

export const updateUser = (id, data) =>
  fetch(`${API}/users/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(res => res.json());

export const deleteUser = (id) =>
  fetch(`${API}/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }).then(res => res.json());

/* ---------- Courses ---------- */
export const listCourses = () =>
  fetch(`${API}/courses`, {
    headers: authHeaders(),
  }).then(res => res.json());

export const createCourse = (data) =>
  fetch(`${API}/courses`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(res => res.json());

export const updateCourse = (id, data) =>
  fetch(`${API}/courses/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(res => res.json());

export const deleteCourse = (id) =>
  fetch(`${API}/courses/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }).then(res => res.json());

/* ---------- CSV Export ---------- */
export const exportCSV = () =>
  fetch(`${API}/users/export/csv`, {
    method: 'GET',
    headers: authHeaders(),
  }).then(res => res.blob());

/* ---------- Log Transaction ---------- */
export const logTransaction = (id, data) =>
  fetch(`${API}/users/${id}/transactions`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(res => res.json());



/* ---------- Generate Receipt (PDF) ---------- */
// services/adminApi.js
export const generateReceipt = async id => {
  const res = await fetch(`${API}/users/${id}/receipt`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      Accept: 'application/pdf'
    }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.blob();           // valid Blob of PDF
};





// Fetch all employees
export const listEmployees = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch employees');
  return await res.json();
};

// Create a new employee
export const createEmployee = async (data) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create employee');
  return await res.json();
};

// Update an existing employee
export const updateEmployee = async (id, data) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update employee');
  return await res.json();
};

// Delete an employee
export const deleteEmployee = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete employee');
};


export const getEmployee     = (id) => fetch(`${API}/employees/${id}`).then(r => r.json());

export const saveEmployee = async (id, data) => {
  const res = await fetch(`${API_URL}${id ? `/${id}` : ""}`, {
    method: id ? "PUT" : "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
};


export const listTickets = () =>
  fetch(`${API}/tickets`, { headers: authHeaders() }).then((r) => r.json());

export const updateTicket = (id, body) =>
  fetch(`${API}/tickets/${id}`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());

export const deleteTicket = (id) =>
  fetch(`${API}/tickets/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then((r) => (r.status === 204 ? { ok: true } : r.json()));




