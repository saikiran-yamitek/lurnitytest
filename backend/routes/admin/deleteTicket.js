// backend/routes/admin/deleteTicket.js
import { deleteTicket } from "../../models/Ticket.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const ticketId = event.pathParameters?.id;
    if (!ticketId) return createResponse(400, { error: "ticket id required" });

    await deleteTicket(ticketId);
    return createResponse(204, "");
  } catch (err) {
    console.error("deleteTicket error:", err);
    return createResponse(500, { error: err.message });
  }
};
