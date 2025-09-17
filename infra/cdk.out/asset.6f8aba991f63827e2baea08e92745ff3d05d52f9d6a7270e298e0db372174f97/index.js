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

// ../backend/routes/courses/getCourseById.js
var getCourseById_exports = {};
__export(getCourseById_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(getCourseById_exports);

// ../backend/models/Course.js
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var REGION = process.env.AWS_REGION || "us-east-1";
var TABLE = process.env.COURSE_TABLE_NAME;
if (!TABLE) throw new Error("COURSE_TABLE_NAME env var is required");
var ddb = import_lib_dynamodb.DynamoDBDocumentClient.from(new import_client_dynamodb.DynamoDBClient({ region: REGION }));
async function getCourseById(courseId) {
  const res = await ddb.send(new import_lib_dynamodb.GetCommand({ TableName: TABLE, Key: { id: courseId } }));
  return res.Item ?? null;
}

// ../backend/routes/courses/getCourseById.js
var handler = async (event) => {
  try {
    const id = event.pathParameters?.id;
    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ error: "id is required" }) };
    }
    const course = await getCourseById(id);
    if (!course) {
      return { statusCode: 404, body: JSON.stringify({ error: "Not found" }) };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(course)
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
