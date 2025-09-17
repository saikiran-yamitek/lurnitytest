var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../backend/routes/admin/deleteTicket.js
var deleteTicket_exports = {};
__export(deleteTicket_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(deleteTicket_exports);

// ../backend/models/Ticket.js
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var REGION = process.env.AWS_REGION || "us-east-1";
var TABLE = process.env.TICKET_TABLE_NAME;
if (!TABLE) throw new Error("TICKET_TABLE_NAME env var is required");
var ddb = import_lib_dynamodb.DynamoDBDocumentClient.from(new import_client_dynamodb.DynamoDBClient({ region: REGION }));
async function deleteTicket(ticketId) {
  if (!ticketId) throw new Error("ticketId required");
  await ddb.send(new import_lib_dynamodb.DeleteCommand({ TableName: TABLE, Key: { id: ticketId } }));
  return true;
}

// ../backend/routes/admin/deleteTicket.js
var handler = async (event) => {
  try {
    const ticketId = event.pathParameters?.id;
    if (!ticketId) return { statusCode: 400, body: JSON.stringify({ error: "ticket id required" }) };
    await deleteTicket(ticketId);
    return { statusCode: 204, body: "" };
  } catch (err) {
    console.error("deleteTicket error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
