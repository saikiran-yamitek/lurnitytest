const API = `${process.env.REACT_APP_API_URL}/api`;

export const listWorkshops = async () => {
  const res = await fetch(`${API}/workshops`);
  if (!res.ok) throw new Error("Failed to fetch workshops");
  return res.json();
};

export const createWorkshop = async (workshop) => {
  const res = await fetch(`${API}/workshops`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify(workshop)
  });
  if (!res.ok) throw new Error("Failed to create workshop");
  return res.json();
};
