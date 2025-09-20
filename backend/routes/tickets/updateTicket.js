// lambdas/tickets/updateTicket.js
import { getTicketById, updateTicket } from "../../models/Ticket.js";
import { setLastResolvedTicket } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const ticketId = event.pathParameters?.id;
    if (!ticketId) return createResponse(400, { error: "Ticket ID required" });

    const updates = JSON.parse(event.body || "{}");

    // 1️⃣ Get existing ticket
    const existing = await getTicketById(ticketId);
    if (!existing) return createResponse(404, { error: "Not found" });

    // 2️⃣ Update ticket
    const updated = await updateTicket(ticketId, updates);

    // 3️⃣ If resolved, update user's last resolved ticket
    if (updated.status === "Resolved" && updated.userEmail) {
      await setLastResolvedTicket(updated.userEmail, updated.id);
    }

    return createResponse(200, updated);

  } catch (err) {
    console.error("Error updating ticket:", err);
    return createResponse(500, { error: "Ticket update failed" });
  }
};
