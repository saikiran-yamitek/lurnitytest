// lambdas/tickets/updateTicket.js
import { getTicketById, updateTicket } from "../../models/Ticket.js";
import { setLastResolvedTicket } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const ticketId = event.pathParameters?.id;
    if (!ticketId) {
      return createResponse(400, { error: "Ticket ID required" });
    }

    const updates = JSON.parse(event.body || "{}");

    // Get existing ticket
    const existing = await getTicketById(ticketId);
    if (!existing) {
      return createResponse(404, { error: "Not found" });
    }

    // Update ticket
    const updated = await updateTicket(ticketId, updates);

    // If resolved, update user record
    if (updated.status === "Resolved" && updated.userEmail) {
      await setLastResolvedTicket(updated.userEmail, updated.id);
    }

    return createResponse(200, updated);
  } catch (err) {
    console.error("Error updating ticket:", err);
    return createResponse(500, { error: "Ticket update failed" });
  }
};
