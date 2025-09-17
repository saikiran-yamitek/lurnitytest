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

// ../backend/routes/admin/deleteCourse.js
var deleteCourse_exports = {};
__export(deleteCourse_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(deleteCourse_exports);

// ../backend/models/Course.js
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var REGION = process.env.AWS_REGION || "us-east-1";
var TABLE = process.env.COURSE_TABLE_NAME;
if (!TABLE) throw new Error("COURSE_TABLE_NAME env var is required");
var ddb = import_lib_dynamodb.DynamoDBDocumentClient.from(new import_client_dynamodb.DynamoDBClient({ region: REGION }));
async function deleteCourse(courseId) {
  await ddb.send(new import_lib_dynamodb.DeleteCommand({ TableName: TABLE, Key: { id: courseId } }));
  return true;
}

// ../backend/routes/admin/deleteCourse.js
var handler = async (event) => {
  try {
    const courseId = event.pathParameters?.id;
    if (!courseId) return { statusCode: 400, body: JSON.stringify({ error: "course id required" }) };
    await deleteCourse(courseId);
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error("deleteCourse error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
