import { listTickets } from "../../models/Ticket.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ token verification

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    // ✅ Verify token before fetching tickets
    verifyToken(event);

    const tickets = await listTickets();
    return createResponse(200, tickets);
  } catch (err) {
    console.error("❌ Error listing tickets:", err);

    // Handle unauthorized errors
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { error: "Failed to fetch tickets", details: err.message });
  }
};
