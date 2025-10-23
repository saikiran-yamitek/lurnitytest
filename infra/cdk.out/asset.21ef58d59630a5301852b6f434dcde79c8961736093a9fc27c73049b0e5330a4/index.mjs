import { createRequire } from 'module'; globalThis.require = createRequire(import.meta.url);

// ../backend/models/Demo.js
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand
} from "@aws-sdk/lib-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
var REGION = process.env.AWS_REGION || "us-east-1";
var TABLE = process.env.DEMO_TABLE_NAME;
var OTP_TABLE = process.env.DEMO_OTP_TABLE_NAME || `${TABLE}_otp`;
if (!TABLE) throw new Error("DEMO_TABLE_NAME env var is required");
var ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));
var sns = new SNSClient({ region: REGION });
async function markDemoBooked(demoId) {
  if (!demoId) throw new Error("demoId required");
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const params = {
    TableName: TABLE,
    Key: { id: demoId },
    UpdateExpression: "SET #booked = :true, #updatedAt = :now",
    ExpressionAttributeNames: {
      "#booked": "booked",
      "#updatedAt": "updatedAt"
    },
    ExpressionAttributeValues: {
      ":true": true,
      ":now": now
    },
    ReturnValues: "ALL_NEW"
  };
  const res = await ddb.send(new UpdateCommand(params));
  return res.Attributes ?? null;
}

// ../backend/utils/cors.js
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Content-Type": "application/json"
};
var handleOptionsRequest = () => ({
  statusCode: 200,
  headers: {
    ...corsHeaders,
    "Access-Control-Max-Age": "86400"
  },
  body: ""
});
var createResponse = (statusCode, body) => ({
  statusCode,
  headers: corsHeaders,
  body: JSON.stringify(body)
});

// ../backend/routes/demo/markDemoBooked.js
var handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return handleOptionsRequest();
  }
  try {
    const id = event.pathParameters?.id;
    if (!id) {
      return createResponse(400, { error: "id is required" });
    }
    const updated = await markDemoBooked(id);
    return createResponse(200, { message: "Demo marked as booked", demo: updated });
  } catch (err) {
    return createResponse(500, { error: err.message });
  }
};
export {
  handler
};
