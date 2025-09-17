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

// ../backend/routes/placement/createPlacement.js
var createPlacement_exports = {};
__export(createPlacement_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(createPlacement_exports);

// ../backend/models/Placement.js
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var client = new import_client_dynamodb.DynamoDBClient({});
var docClient = import_lib_dynamodb.DynamoDBDocumentClient.from(client);
var TABLE_NAME = process.env.PLACEMENT_TABLE_NAME;
async function createPlacement(driveData) {
  const newDrive = {
    ...driveData,
    driveId: driveData.driveId || Date.now().toString(),
    registered: driveData.registered || [],
    status: driveData.status || "SCHEDULED",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  await docClient.send(
    new import_lib_dynamodb.PutCommand({
      TableName: TABLE_NAME,
      Item: newDrive
    })
  );
  return newDrive;
}

// ../backend/routes/placement/createPlacement.js
var handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const newDrive = await createPlacement(body);
    return {
      statusCode: 201,
      body: JSON.stringify(newDrive)
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
