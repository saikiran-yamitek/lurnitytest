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

// ../backend/routes/landingPage/getLatestLandingPage.js
var getLatestLandingPage_exports = {};
__export(getLatestLandingPage_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(getLatestLandingPage_exports);

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
async function getLatestLandingPage() {
  const result = await ddbDocClient.send(
    new import_lib_dynamodb.ScanCommand({
      TableName: TABLE
    })
  );
  if (!result.Items || result.Items.length === 0) return null;
  const sorted = result.Items.sort(
    (a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)
  );
  return sorted[0];
}

// ../backend/routes/landingPage/getLatestLandingPage.js
var handler = async () => {
  try {
    const page = await getLatestLandingPage();
    return {
      statusCode: 200,
      body: JSON.stringify(page || {})
    };
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
