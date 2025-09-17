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

// ../backend/routes/placement/getPlacementById.js
var getPlacementById_exports = {};
__export(getPlacementById_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(getPlacementById_exports);

// ../backend/models/Placement.js
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var client = new import_client_dynamodb.DynamoDBClient({});
var docClient = import_lib_dynamodb.DynamoDBDocumentClient.from(client);
var TABLE_NAME = process.env.PLACEMENT_TABLE_NAME;
async function getPlacementById(driveId) {
  const result = await docClient.send(
    new import_lib_dynamodb.GetCommand({
      TableName: TABLE_NAME,
      Key: { driveId }
    })
  );
  return result.Item;
}

// ../backend/routes/placement/getPlacementById.js
async function handler(event) {
  try {
    const driveId = event.pathParameters?.driveId;
    if (!driveId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing driveId in path parameters" })
      };
    }
    const placement = await getPlacementById(driveId);
    if (!placement) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Placement not found" })
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(placement)
    };
  } catch (error) {
    console.error("Error fetching placement by ID:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error", error: error.message })
    };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
