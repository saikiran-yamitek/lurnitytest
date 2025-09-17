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

// ../backend/routes/courses/updateCourse.js
var updateCourse_exports = {};
__export(updateCourse_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(updateCourse_exports);

// ../backend/models/Course.js
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var REGION = process.env.AWS_REGION || "us-east-1";
var TABLE = process.env.COURSE_TABLE_NAME;
if (!TABLE) throw new Error("COURSE_TABLE_NAME env var is required");
var ddb = import_lib_dynamodb.DynamoDBDocumentClient.from(new import_client_dynamodb.DynamoDBClient({ region: REGION }));
function calcTotalMinutes(subs = []) {
  return (subs || []).reduce((sum, sc) => sum + (Number(sc.duration) || 0), 0);
}
async function getCourseById(courseId) {
  const res = await ddb.send(new import_lib_dynamodb.GetCommand({ TableName: TABLE, Key: { id: courseId } }));
  return res.Item ?? null;
}
async function updateCourse(courseId, data = {}) {
  if (!courseId) throw new Error("courseId required");
  if (!data.overallDuration && data.subCourses) {
    data.overallDuration = calcTotalMinutes(data.subCourses);
  }
  const keys = Object.keys(data);
  if (keys.length === 0) return getCourseById(courseId);
  const exprParts = [];
  const exprAttrNames = {};
  const exprAttrValues = {};
  keys.forEach((k) => {
    exprParts.push(`#${k} = :${k}`);
    exprAttrNames[`#${k}`] = k;
    exprAttrValues[`:${k}`] = data[k];
  });
  exprParts.push("#updatedAt = :updatedAt");
  exprAttrNames["#updatedAt"] = "updatedAt";
  exprAttrValues[":updatedAt"] = (/* @__PURE__ */ new Date()).toISOString();
  const params = {
    TableName: TABLE,
    Key: { id: courseId },
    UpdateExpression: `SET ${exprParts.join(", ")}`,
    ExpressionAttributeNames: exprAttrNames,
    ExpressionAttributeValues: exprAttrValues,
    ReturnValues: "ALL_NEW"
  };
  const res = await ddb.send(new import_lib_dynamodb.UpdateCommand(params));
  return res.Attributes ?? null;
}

// ../backend/routes/courses/updateCourse.js
var handler = async (event) => {
  try {
    const id = event.pathParameters?.id;
    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ error: "id is required" }) };
    }
    const data = JSON.parse(event.body || "{}");
    const updated = await updateCourse(id, data);
    if (!updated) {
      return { statusCode: 404, body: JSON.stringify({ error: "Not found" }) };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(updated)
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
