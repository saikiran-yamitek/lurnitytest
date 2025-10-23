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
async function listDemos() {
  const result = await ddb.send(new ScanCommand({ TableName: TABLE }));
  const items = (result.Items || []).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  return items;
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

// ../backend/routes/demo/listDemos.js
var handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return handleOptionsRequest();
  }
  try {
    const demos = await listDemos();
    return createResponse(200, demos);
  } catch (err) {
    return createResponse(500, { error: err.message });
  }
};
export {
  handler
};
