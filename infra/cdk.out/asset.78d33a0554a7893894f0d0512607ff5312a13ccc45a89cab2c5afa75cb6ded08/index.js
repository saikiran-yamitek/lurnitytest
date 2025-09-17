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

// ../backend/routes/feedback/submitFeedback.js
var submitFeedback_exports = {};
__export(submitFeedback_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(submitFeedback_exports);

// ../backend/models/Feedback.js
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var client = new import_client_dynamodb.DynamoDBClient({ region: process.env.AWS_REGION });
var ddb = import_lib_dynamodb.DynamoDBDocumentClient.from(client);
var FEEDBACK_TABLE = process.env.FEEDBACK_TABLE_NAME;
async function createFeedback({ userId, courseId, subIndex, videoIndex, rating, comment }) {
  const item = {
    id: Date.now().toString(),
    // or use uuid
    userId,
    courseId,
    subIndex,
    videoIndex,
    rating,
    comment,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  await ddb.send(new import_lib_dynamodb.PutCommand({
    TableName: FEEDBACK_TABLE,
    Item: item
  }));
  return item;
}

// ../backend/routes/feedback/submitFeedback.js
var handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { userId, courseId, subIndex, videoIndex, rating, comment } = body;
    const feedback = await createFeedback({
      userId,
      courseId,
      subIndex,
      videoIndex,
      rating,
      comment
    });
    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Feedback saved successfully!", feedback })
    };
  } catch (err) {
    console.error("Error saving feedback:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to save feedback" })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
