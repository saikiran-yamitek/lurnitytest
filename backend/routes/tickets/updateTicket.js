import { getTicketById, updateTicket } from "../../models/Ticket.js";
import { setLastResolvedTicket } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ added token verification

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    // ✅ Verify the request token
    verifyToken(event);

    const ticketId = event.pathParameters?.id;
    if (!ticketId) return createResponse(400, { error: "Ticket ID required" });

    const updates = JSON.parse(event.body || "{}");

    // 1️⃣ Get existing ticket
    const existing = await getTicketById(ticketId);
    if (!existing) return createResponse(404, { error: "Ticket not found" });

    // 2️⃣ Update ticket
    const updated = await updateTicket(ticketId, updates);

    // 3️⃣ If resolved, update user's last resolved ticket
    if (updated.status === "Resolved" && updated.userEmail) {
      await setLastResolvedTicket(updated.userEmail, updated.id);
    }

    return createResponse(200, updated);
  } catch (err) {
    console.error("❌ Error updating ticket:", err);

    // Handle token errors specifically
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { error: "Ticket update failed", details: err.message });
  }
};
