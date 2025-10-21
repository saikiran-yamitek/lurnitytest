// src/services/api.js

const API = `${process.env.REACT_APP_API_URL}/api`;

export const register = (data) =>
  fetch(`${API}/user/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(res => res.json());


export const login = async ({ email, password }) => {
  const res  = await fetch(`${API}/auth/login`, {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    body:JSON.stringify({ email, password })
  });
  const text = await res.text();
  const data = JSON.parse(text || '{}');
  if(!res.ok) throw new Error(data.error || 'Login failed');
  return data;                                     // { token, user }
};

export async function requestReset(payload) {
  const r = await fetch(`${API}/user/forgot-password/request`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
  return r.json();
}
export async function verifyReset(payload) {
  const r = await fetch(`${API}/user/forgot-password/verify`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
  return r.json();
}
export async function finalizeReset(payload) {
  const r = await fetch(`${API}/user/forgot-password/reset`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
  return r.json();
}

// Add to your existing api.js file

export const sendRegisterOTP = async (data) => {
  const res = await fetch(`${API}/api/user/send-register-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to send OTP');
  return json;
};

export const verifyRegisterOTP = async (data) => {
  const res = await fetch(`${API}/api/user/verify-register-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to verify OTP');
  return json;
};




// POST /users/:id/verify-face



  
