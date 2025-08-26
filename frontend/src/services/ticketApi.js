const API = `${process.env.REACT_APP_API_URL}/api`;

/* create ticket */
export const createTicket = data =>
  fetch(`${API}/tickets`, {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json());

/* list for support staff */
export const listTickets = () =>
  fetch(`${API}/tickets`).then(r => r.json());

/* close / update */
export const updateTicket = (id,data) =>
  fetch(`${API}/tickets/${id}`,{
    method:"PATCH",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify(data)
  }).then(r=>r.json());
