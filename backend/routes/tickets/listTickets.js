// lambdas/tickets/listTickets.js
import { listTickets } from "../../models/Ticket.js";

export const handler = async () => {
  try {
    const tickets = await listTickets();
    return {
      statusCode: 200,
      body: JSON.stringify(tickets),
    };
  } catch (err) {
    console.error("Error listing tickets:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch tickets" }),
    };
  }
};
