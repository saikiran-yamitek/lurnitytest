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

// ../backend/routes/landingPage/updateJobStatus.js
var updateJobStatus_exports = {};
__export(updateJobStatus_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(updateJobStatus_exports);

// ../backend/models/LandingPage.js
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var REGION = process.env.AWS_REGION || "us-east-1";
var TABLE = process.env.LANDING_PAGE_TABLE || "LandingPage";
if (!TABLE) {
  throw new Error("LANDING_PAGE_TABLE_NAME env var is required");
}
var client = new import_client_dynamodb.DynamoDBClient({ region: REGION });
var ddbDocClient = import_lib_dynamodb.DynamoDBDocumentClient.from(client);
async function getLandingPage() {
  const params = {
    TableName: TABLE,
    Key: { id: "landingPage" }
    // fixed PK since only one doc
  };
  const result = await ddbDocClient.send(new import_lib_dynamodb.GetCommand(params));
  if (!result.Item) {
    const newPage = { id: "landingPage", cohorts: [], jobs: [] };
    await ddbDocClient.send(
      new import_lib_dynamodb.PutCommand({
        TableName: TABLE,
        Item: newPage
      })
    );
    return newPage;
  }
  return result.Item;
}
async function updateJob(jobId, data) {
  const page = await getLandingPage();
  const jobIndex = page.jobs.findIndex((j) => j.id === jobId);
  if (jobIndex === -1) return null;
  page.jobs[jobIndex] = { ...page.jobs[jobIndex], ...data };
  page.lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
  await ddbDocClient.send(
    new import_lib_dynamodb.PutCommand({
      TableName: TABLE,
      Item: page
    })
  );
  return page.jobs[jobIndex];
}
async function updateJobStatus(jobId, isActive) {
  return updateJob(jobId, { isActive });
}

// ../backend/routes/landingPage/updateJobStatus.js
var handler = async (event) => {
  try {
    const { jobId } = event.pathParameters;
    const { isActive } = JSON.parse(event.body);
    const updated = await updateJobStatus(jobId, isActive);
    return updated ? { statusCode: 200, body: JSON.stringify(updated) } : { statusCode: 404, body: JSON.stringify({ error: "Job not found" }) };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
