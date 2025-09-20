const API_BASE_URL = 'https://kc281uzp54.execute-api.ap-south-1.amazonaws.com/dev';
const API = `${API_BASE_URL}/api/admin`;
const API_URL = `${API_BASE_URL}/api/employees`;

// Utility to include Authorization header
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
});

export async function listAllSubCourses() {
  const courses = await listCourses();
  let subs = [];
  courses.forEach(c => {
    c.subCourses.forEach(sc => {
      subs.push({ ...sc, parentCourse: c.title });
    });
  });
  return subs;
}

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
export const generateReceipt = async id => {
  const res = await fetch(`${API}/users/${id}/receipt`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      Accept: 'application/pdf'
    }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.blob();
};

/* ---------- Employees ---------- */
// Fetch all employees
export const listEmployees = async () => {
  const res = await fetch(API_URL, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch employees');
  return await res.json();
};

// Create a new employee
export const createEmployee = async (data) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create employee');
  return await res.json();
};

// Update an existing employee
export const updateEmployee = async (id, data) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update employee');
  return await res.json();
};

// Delete an employee
export const deleteEmployee = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete employee');
};

export const getEmployee = (id) => 
  fetch(`${API_BASE_URL}/employees/${id}`, {
    headers: authHeaders(),
  }).then(r => r.json());

export const saveEmployee = async (id, data) => {
  const res = await fetch(`${API_URL}${id ? `/${id}` : ""}`, {
    method: id ? "PUT" : "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
};

/* ---------- Tickets ---------- */
export const listTickets = () =>
  fetch(`${API_BASE_URL}/api/tickets`, { headers: authHeaders() }).then((r) => r.json());

export const updateTicket = (id, body) =>
  fetch(`${API}/tickets/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(body),
  }).then((r) => r.json());

export const deleteTicket = (id) =>
  fetch(`${API_BASE_URL}/api/tickets/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then((r) => (r.status === 204 ? { ok: true } : r.json()));

/* ---------- Profile Lock ---------- */
export async function toggleProfileLock(id, status) {
  const res = await fetch(`${API}/users/${id}/lock`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ lockStatus: status })
  });
  if (!res.ok) throw new Error("Failed to update lock");
  return await res.json();
}

/* ---------- Cohorts ---------- */
export const listCohorts = async () => {
  const response = await fetch(`${API}/landingpage/cohorts`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch cohorts');
  }
  return response.json();
};

export const createCohort = async (cohortData) => {
  const response = await fetch(`${API}/landingpage/cohorts`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(cohortData)
  });
  if (!response.ok) {
    throw new Error('Failed to create cohort');
  }
  return response.json();
};

export const updateCohort = async (id, cohortData) => {
  const response = await fetch(`${API}/landingpage/cohorts/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(cohortData)
  });
  if (!response.ok) {
    throw new Error('Failed to update cohort');
  }
  return response.json();
};

export const deleteCohort = async (id) => {
  const response = await fetch(`${API}/landingpage/cohorts/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to delete cohort');
  }
  return response.json();
};
