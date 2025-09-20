// lambdas/tickets/createTicket.js
import crypto from "crypto"; // ✅ import crypto
import { generateTicketId, createTicket } from "../../models/Ticket.js";
import { addTicketToUser } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    const body = JSON.parse(event.body || "{}");

    // Generate new sequential ticketId
    const ticketId = await generateTicketId();

    const ticket = {
      ...body,
      ticketId,
      id: crypto.randomUUID(), // ✅ now works
    };

    // Save ticket
    const saved = await createTicket(ticket);

    // Link ticket to user
    if (body.userId) {
      await addTicketToUser(body.userId, saved.id);
    }

    return createResponse(200, saved);
  } catch (err) {
    console.error("Error creating ticket:", err);
    return createResponse(500, { error: "Ticket create failed", details: err.message });
  }
};
