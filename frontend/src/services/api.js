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




// POST /users/:id/verify-face



  
