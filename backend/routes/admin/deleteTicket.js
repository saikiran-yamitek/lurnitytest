// backend/routes/admin/deleteTicket.js
import { deleteTicket } from "../../models/Ticket.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; 

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    verifyToken(event);
    const ticketId = event.pathParameters?.id;
    if (!ticketId) return createResponse(400, { error: "ticket id required" });

    await deleteTicket(ticketId);
    return createResponse(204, "");
  } catch (err) {
    console.error("deleteTicket error:", err);
     const statusCode =
      err.message.includes("token") || err.message.includes("Authorization")
        ? 401
        : 500;

    return createResponse(statusCode, { error: err.message });
  }
};
