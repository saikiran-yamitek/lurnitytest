// src/services/ticketApi.js
import { apiFetch } from "./apiFetch";

const API_BASE = `${process.env.REACT_APP_API_URL}/api`;

/* ---------------- Create a ticket (public or logged-in user) ---------------- */
export const createTicket = async (data, role) => {
  const res = await apiFetch(
    `/api/tickets`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    role
  );
  return res.json();
};

/* ---------------- List all tickets (support/admin only) ---------------- */
export const listTickets = async (role) => {
  const res = await apiFetch(`/api/tickets`, {}, role);
  return res.json();
};

/* ---------------- Update or close a ticket ---------------- */
export const updateTicket = async (id, data, role) => {
  const res = await apiFetch(
    `/api/tickets/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
    role
  );
  return res.json();
};
