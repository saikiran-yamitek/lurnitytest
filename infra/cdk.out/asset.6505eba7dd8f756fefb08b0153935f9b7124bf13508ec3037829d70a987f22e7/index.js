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

// ../backend/routes/courses/listCourses.js
var listCourses_exports = {};
__export(listCourses_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(listCourses_exports);

// ../backend/models/Course.js
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var REGION = process.env.AWS_REGION || "us-east-1";
var TABLE = process.env.COURSE_TABLE_NAME;
if (!TABLE) throw new Error("COURSE_TABLE_NAME env var is required");
var ddb = import_lib_dynamodb.DynamoDBDocumentClient.from(new import_client_dynamodb.DynamoDBClient({ region: REGION }));
async function listCourses(opts = {}) {
  const params = {
    TableName: TABLE,
    Limit: opts.limit,
    ExclusiveStartKey: opts.lastKey
  };
  const result = await ddb.send(new import_lib_dynamodb.ScanCommand(params));
  return { items: result.Items || [], lastKey: result.LastEvaluatedKey };
}

// ../backend/routes/courses/listCourses.js
var handler = async (event) => {
  try {
    const limit = event.queryStringParameters?.limit ? Number(event.queryStringParameters.limit) : void 0;
    const lastKey = event.queryStringParameters?.lastKey ? JSON.parse(event.queryStringParameters.lastKey) : void 0;
    const result = await listCourses({ limit, lastKey });
    return {
      statusCode: 200,
      body: JSON.stringify(result)
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
