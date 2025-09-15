// lambdas/tickets/updateTicket.js
import { getTicketById, updateTicket } from "../../models/Ticket.js";
import { setLastResolvedTicket } from "../../models/User.js";

export const handler = async (event) => {
  try {
    const ticketId = event.pathParameters?.id;
    if (!ticketId) {
      return { statusCode: 400, body: JSON.stringify({ error: "Ticket ID required" }) };
    }

    const updates = JSON.parse(event.body || "{}");

    // Get existing ticket
    const existing = await getTicketById(ticketId);
    if (!existing) {
      return { statusCode: 404, body: JSON.stringify({ error: "Not found" }) };
    }

    // Update ticket
    const updated = await updateTicket(ticketId, updates);

    // If resolved, update user record
    if (updated.status === "Resolved" && updated.userEmail) {
      await setLastResolvedTicket(updated.userEmail, updated.id);
    }

    return {
      statusCode: 200,
      body: JSON.stringify(updated),
    };
  } catch (err) {
    console.error("Error updating ticket:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Ticket update failed" }),
    };
  }
};
