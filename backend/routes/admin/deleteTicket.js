// backend/routes/admin/deleteTicket.js
import { deleteTicket } from "../../models/Ticket.js";

export const handler = async (event) => {
  try {
    const ticketId = event.pathParameters?.id;
    if (!ticketId) return { statusCode: 400, body: JSON.stringify({ error: "ticket id required" }) };

    await deleteTicket(ticketId);
    return { statusCode: 204, body: "" };
  } catch (err) {
    console.error("deleteTicket error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
