import crypto from "crypto"; // ✅ import crypto
import { generateTicketId, createTicket } from "../../models/Ticket.js";
import { addTicketToUser } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ token verification

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    // ✅ Verify token
    verifyToken(event);

    const body = JSON.parse(event.body || "{}");

    // Generate new sequential ticketId
    const ticketId = await generateTicketId();

    const ticket = {
      ...body,
      ticketId,
      id: crypto.randomUUID(),
    };

    // Save ticket
    const saved = await createTicket(ticket);

    // Link ticket to user
    if (body.userId) {
      await addTicketToUser(body.userId, saved.id);
    }

    return createResponse(201, saved);
  } catch (err) {
    console.error("❌ Error creating ticket:", err);

    // ✅ Handle auth errors
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, {
      error: "Ticket creation failed",
      details: err.message,
    });
  }
};
