// src/services/workshopApi.js
import { apiFetch } from "./apiFetch";

const API_BASE = `${process.env.REACT_APP_API_URL}/api`;

/* ---------------- List all workshops ---------------- */
export const listWorkshops = async (role = null) => {
  const res = await apiFetch(`/api/workshops`, {}, role);
  if (!res.ok) throw new Error("Failed to fetch workshops");
  return res.json();
};

/* ---------------- Create a new workshop ---------------- */
export const createWorkshop = async (workshop, role = "user") => {
  const res = await apiFetch(
    `/api/workshops`,
    {
      method: "POST",
      body: JSON.stringify(workshop),
    },
    role
  );
  if (!res.ok) throw new Error("Failed to create workshop");
  return res.json();
};
