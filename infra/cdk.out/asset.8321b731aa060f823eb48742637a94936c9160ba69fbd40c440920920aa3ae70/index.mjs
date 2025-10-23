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
async function getLandingPage() {
  const params = {
    TableName: TABLE,
    Key: { id: "landingPage" }
    // fixed PK since only one doc
  };
  const result = await ddbDocClient.send(new GetCommand(params));
  if (!result.Item) {
    const newPage = { id: "landingPage", cohorts: [], jobs: [] };
    await ddbDocClient.send(
      new PutCommand({
        TableName: TABLE,
        Item: newPage
      })
    );
    return newPage;
  }
  return result.Item;
}
async function getCohorts() {
  const page = await getLandingPage();
  return page.cohorts || [];
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

// ../backend/routes/landingPage/getCohorts.js
var handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return handleOptionsRequest();
  }
  try {
    const cohorts = await getCohorts();
    return createResponse(200, cohorts);
  } catch (err) {
    return createResponse(500, { error: err.message });
  }
};
export {
  handler
};
