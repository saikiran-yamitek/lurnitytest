// models/Ticket.js
// DynamoDB helper(s) for tickets
// Requires: process.env.TICKET_TABLE_NAME
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const REGION = process.env.AWS_REGION || "us-east-1";
const TABLE = process.env.TICKET_TABLE_NAME;

if (!TABLE) throw new Error("TICKET_TABLE_NAME env var is required");

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

/** Delete a ticket by id */
export async function deleteTicket(ticketId) {
  if (!ticketId) throw new Error("ticketId required");
  await ddb.send(new DeleteCommand({ TableName: TABLE, Key: { id: ticketId } }));
  return true;
}

/** Generate a sequential ticketId with prefix */
export async function generateTicketId() {
  const now = new Date();
  const prefix = `TIC-${now.getFullYear()}${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-`;

  // Query last ticket with same prefix
  const result = await ddb.send(
    new ScanCommand({
      TableName: TABLE,
      FilterExpression: "begins_with(ticketId, :p)",
      ExpressionAttributeValues: { ":p": prefix },
    })
  );

  let maxSeq = 0;
  (result.Items || []).forEach((item) => {
    const seqNum = Number(item.ticketId.slice(-4));
    if (!isNaN(seqNum) && seqNum > maxSeq) maxSeq = seqNum;
  });

  const newSeq = maxSeq + 1;
  return prefix + newSeq.toString().padStart(4, "0");
}

/** Create a new ticket */
export async function createTicket(ticket) {
  if (!ticket.id) ticket.id = crypto.randomUUID();
  ticket.createdAt = new Date().toISOString();

  await ddb.send(new PutCommand({ TableName: TABLE, Item: ticket }));
  return ticket;
}

/** List all tickets (sorted by createdAt desc client-side) */
export async function listTickets() {
  const result = await ddb.send(new ScanCommand({ TableName: TABLE }));
  const items = result.Items || [];
  return items.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

/** Get a ticket by id */
export async function getTicketById(ticketId) {
  const result = await ddb.send(
    new GetCommand({ TableName: TABLE, Key: { id: ticketId } })
  );
  return result.Item ?? null;
}

/** Update a ticket by id */
export async function updateTicket(ticketId, updates = {}) {
  if (!ticketId) throw new Error("ticketId is required");

  const keys = Object.keys(updates);
  if (keys.length === 0) return getTicketById(ticketId);

  const exprParts = [];
  const exprAttrNames = {};
  const exprAttrValues = {};

  keys.forEach((k) => {
    exprParts.push(`#${k} = :${k}`);
    exprAttrNames[`#${k}`] = k;
    exprAttrValues[`:${k}`] = updates[k];
  });

  exprParts.push("#updatedAt = :updatedAt");
  exprAttrNames["#updatedAt"] = "updatedAt";
  exprAttrValues[":updatedAt"] = new Date().toISOString();

  const result = await ddb.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { id: ticketId },
      UpdateExpression: `SET ${exprParts.join(", ")}`,
      ExpressionAttributeNames: exprAttrNames,
      ExpressionAttributeValues: exprAttrValues,
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes ?? null;
}

export default {
  deleteTicket,
  generateTicketId,
  createTicket,
  listTickets,
  getTicketById,
  updateTicket,
};
