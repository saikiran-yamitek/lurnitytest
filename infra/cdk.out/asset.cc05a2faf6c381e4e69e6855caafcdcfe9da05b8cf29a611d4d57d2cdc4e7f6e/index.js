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

// ../backend/routes/tickets/listTickets.js
var listTickets_exports = {};
__export(listTickets_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(listTickets_exports);

// ../backend/models/Ticket.js
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var REGION = process.env.AWS_REGION || "us-east-1";
var TABLE = process.env.TICKET_TABLE_NAME;
if (!TABLE) throw new Error("TICKET_TABLE_NAME env var is required");
var ddb = import_lib_dynamodb.DynamoDBDocumentClient.from(new import_client_dynamodb.DynamoDBClient({ region: REGION }));
async function listTickets() {
  const result = await ddb.send(new import_lib_dynamodb.ScanCommand({ TableName: TABLE }));
  const items = result.Items || [];
  return items.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

// ../backend/routes/tickets/listTickets.js
var handler = async () => {
  try {
    const tickets = await listTickets();
    return {
      statusCode: 200,
      body: JSON.stringify(tickets)
    };
  } catch (err) {
    console.error("Error listing tickets:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch tickets" })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
