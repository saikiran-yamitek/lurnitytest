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

// ../backend/routes/placement/updatePlacement.js
var updatePlacement_exports = {};
__export(updatePlacement_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(updatePlacement_exports);

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
async function updatePlacement(driveId, updateData) {
  const placement = await getPlacementById(driveId);
  if (!placement) throw new Error("Drive not found");
  const updated = { ...placement, ...updateData };
  await docClient.send(
    new import_lib_dynamodb.PutCommand({
      TableName: TABLE_NAME,
      Item: updated
    })
  );
  return updated;
}

// ../backend/routes/placement/updatePlacement.js
var handler = async (event) => {
  try {
    const { id } = event.pathParameters;
    const body = JSON.parse(event.body);
    const updated = await updatePlacement(id, body);
    return { statusCode: 200, body: JSON.stringify(updated) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
