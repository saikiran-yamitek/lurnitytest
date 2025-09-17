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

// ../backend/routes/placement/deletePlacement.js
var deletePlacement_exports = {};
__export(deletePlacement_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(deletePlacement_exports);

// ../backend/models/Placement.js
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var client = new import_client_dynamodb.DynamoDBClient({});
var docClient = import_lib_dynamodb.DynamoDBDocumentClient.from(client);
var TABLE_NAME = process.env.PLACEMENT_TABLE_NAME;
async function deletePlacement(driveId) {
  await docClient.send(
    new import_lib_dynamodb.DeleteCommand({
      TableName: TABLE_NAME,
      Key: { driveId }
    })
  );
  return { message: "Deleted" };
}

// ../backend/routes/placement/deletePlacement.js
var handler = async (event) => {
  try {
    const { id } = event.pathParameters;
    const result = await deletePlacement(id);
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
