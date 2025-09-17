// lambdas/tickets/createTicket.js
import { generateTicketId, createTicket } from "../../models/Ticket.js";
import { addTicketToUser } from "../../models/User.js";

export const handler = async (event) => {
  try {
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

    return {
      statusCode: 200,
      body: JSON.stringify(saved),
    };
  } catch (err) {
    console.error("Error creating ticket:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Ticket create failed" }),
    };
  }
};
