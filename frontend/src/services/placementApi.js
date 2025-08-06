const API_BASE = "http://localhost:7700/api";

export const listPlacements = async () => {
  const res = await fetch(`${API_BASE}/placements`);
  return res.json();
};

export const createPlacementDrive = async (payload) => {
  const res = await fetch(`${API_BASE}/placements`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const getStudentsForDrive = async (id) => {
  const res = await fetch(`${API_BASE}/placements/${id}/students`);
  return res.json();
};

export const deletePlacementDrive = async (id) => {
  await fetch(`${API_BASE}/placements/${id}`, { method: "DELETE" });
};
