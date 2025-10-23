import { createRequire } from 'module'; globalThis.require = createRequire(import.meta.url);

// ../backend/models/LandingPage.js
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
  ScanCommand
} from "@aws-sdk/lib-dynamodb";
var REGION = process.env.AWS_REGION || "us-east-1";
var TABLE = process.env.LANDING_PAGE_TABLE || "LandingPage";
if (!TABLE) {
  throw new Error("LANDING_PAGE_TABLE_NAME env var is required");
}
var client = new DynamoDBClient({ region: REGION });
var ddbDocClient = DynamoDBDocumentClient.from(client);
async function getLatestLandingPage() {
  const result = await ddbDocClient.send(
    new ScanCommand({
      TableName: TABLE
    })
  );
  if (!result.Items || result.Items.length === 0) return null;
  const sorted = result.Items.sort(
    (a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)
  );
  return sorted[0];
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

// ../backend/routes/landingPage/getLatestLandingPage.js
var handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return handleOptionsRequest();
  }
  try {
    const page = await getLatestLandingPage();
    return createResponse(200, page || {});
  } catch (err) {
    return createResponse(500, { error: err.message });
  }
};
export {
  handler
};
