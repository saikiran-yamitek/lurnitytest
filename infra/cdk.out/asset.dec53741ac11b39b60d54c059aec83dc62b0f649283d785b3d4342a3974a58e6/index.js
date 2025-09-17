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

// ../backend/routes/feedback/deleteFeedback.js
var deleteFeedback_exports = {};
__export(deleteFeedback_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(deleteFeedback_exports);

// ../backend/models/Feedback.js
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var client = new import_client_dynamodb.DynamoDBClient({ region: process.env.AWS_REGION });
var ddb = import_lib_dynamodb.DynamoDBDocumentClient.from(client);
var FEEDBACK_TABLE = process.env.FEEDBACK_TABLE_NAME;
async function deleteFeedback(id) {
  await ddb.send(new import_lib_dynamodb.DeleteCommand({
    TableName: FEEDBACK_TABLE,
    Key: { id }
  }));
  return { message: "Feedback deleted" };
}

// ../backend/routes/feedback/deleteFeedback.js
var handler = async (event) => {
  try {
    const { id } = event.pathParameters;
    const result = await deleteFeedback(id);
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (err) {
    console.error("Error deleting feedback:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to delete feedback" })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
