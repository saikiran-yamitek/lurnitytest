// src/services/placementApi.js
import { apiFetch } from "./apiFetch";

const API_BASE = `${process.env.REACT_APP_API_URL}/api`;

/* ---------------- List all placement drives ---------------- */
export const listPlacements = async (role) => {
  const res = await apiFetch(`/api/placements`, {}, role);
  return res.json();
};

/* ---------------- Create a new placement drive --------------- */
export const createPlacementDrive = async (payload, role) => {
  const res = await apiFetch(
    `/api/placements`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    role
  );
  return res.json();
};

/* ---------------- Get students for a specific drive ---------- */
export const getStudentsForDrive = async (id, role) => {
  const res = await apiFetch(`/api/placements/${id}/students`, {}, role);
  return res.json();
};

/* ---------------- Delete a placement drive ------------------- */
export const deletePlacementDrive = async (id, role) => {
  const res = await apiFetch(
    `/api/placements/${id}`,
    { method: "DELETE" },
    role
  );
  return res.json();
};
