const API = `${process.env.REACT_APP_API_URL}/api`;

export const listDemos = async () => {
  const res = await fetch(`${API}/demo/bookings`);
  if (!res.ok) throw new Error("Failed to fetch demos");
  return await res.json();
};

export const markDemoAsBooked = async (id) => {
  const res = await fetch(`${API}/demo/booked/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to mark demo as booked");
};
