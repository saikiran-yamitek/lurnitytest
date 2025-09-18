// lambdas/tickets/listTickets.js
import { listTickets } from "../../models/Ticket.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const tickets = await listTickets();
    return createResponse(200, tickets);
  } catch (err) {
    console.error("Error listing tickets:", err);
    return createResponse(500, { error: "Failed to fetch tickets" });
  }
};
