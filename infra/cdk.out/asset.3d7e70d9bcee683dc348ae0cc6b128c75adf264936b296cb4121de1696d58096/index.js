var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../backend/routes/admin/createCourse.js
var createCourse_exports = {};
__export(createCourse_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(createCourse_exports);

// ../backend/models/Course.js
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var import_crypto = __toESM(require("crypto"), 1);
var REGION = process.env.AWS_REGION || "us-east-1";
var TABLE = process.env.COURSE_TABLE_NAME;
if (!TABLE) throw new Error("COURSE_TABLE_NAME env var is required");
var ddb = import_lib_dynamodb.DynamoDBDocumentClient.from(new import_client_dynamodb.DynamoDBClient({ region: REGION }));
function calcTotalMinutes(subs = []) {
  return (subs || []).reduce((sum, sc) => sum + (Number(sc.duration) || 0), 0);
}
async function createCourse(courseData = {}) {
  const id = courseData.id || import_crypto.default.randomUUID();
  const subCourses = courseData.subCourses || [];
  if (!courseData.overallDuration) {
    courseData.overallDuration = calcTotalMinutes(subCourses);
  }
  const item = {
    id,
    ...courseData,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  await ddb.send(new import_lib_dynamodb.PutCommand({ TableName: TABLE, Item: item }));
  return item;
}

// ../backend/routes/admin/createCourse.js
var handler = async (event) => {
  try {
    const payload = event.body ? JSON.parse(event.body) : {};
    const created = await createCourse(payload);
    return { statusCode: 201, body: JSON.stringify(created) };
  } catch (err) {
    console.error("createCourse error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
