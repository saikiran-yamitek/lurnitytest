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
async function updateCohort(id, data) {
  const page = await getLandingPage();
  const cohortIndex = page.cohorts.findIndex((c) => c.id === id);
  if (cohortIndex === -1) return null;
  page.cohorts[cohortIndex] = { ...page.cohorts[cohortIndex], ...data };
  await ddbDocClient.send(
    new PutCommand({
      TableName: TABLE,
      Item: page
    })
  );
  return page.cohorts[cohortIndex];
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

// ../backend/routes/landingPage/updateCohort.js
var handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return handleOptionsRequest();
  }
  try {
    const { id } = event.pathParameters;
    const body = JSON.parse(event.body);
    const cohort = await updateCohort(id, body);
    if (!cohort) {
      return createResponse(404, { error: "Cohort not found" });
    }
    return createResponse(200, cohort);
  } catch (err) {
    return createResponse(400, { error: err.message });
  }
};
export {
  handler
};
