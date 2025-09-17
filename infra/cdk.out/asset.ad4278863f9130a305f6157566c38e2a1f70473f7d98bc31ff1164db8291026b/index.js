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

// ../backend/routes/certificates/generateCertificate.js
var generateCertificate_exports = {};
__export(generateCertificate_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(generateCertificate_exports);

// ../backend/models/Certificate.js
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var client = new import_client_dynamodb.DynamoDBClient({});
var docClient = import_lib_dynamodb.DynamoDBDocumentClient.from(client);
var TABLE_NAME = process.env.CERTIFICATE_TABLE_NAME;
async function generateCertificate(userId, courseId, subCourseTitle) {
  const existing = await docClient.send(
    new import_lib_dynamodb.QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "user-course-subcourse-index",
      // ⚠️ Needs GSI if you want composite lookup
      KeyConditionExpression: "userId = :u AND courseId = :c",
      ExpressionAttributeValues: {
        ":u": userId,
        ":c": courseId
      }
    })
  );
  if (existing.Items?.some((c) => c.subCourseTitle === subCourseTitle)) {
    return { duplicate: true, certificate: existing.Items[0] };
  }
  const newCert = {
    id: crypto.randomUUID(),
    userId,
    courseId,
    subCourseTitle,
    issuedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  await docClient.send(
    new import_lib_dynamodb.PutCommand({
      TableName: TABLE_NAME,
      Item: newCert
    })
  );
  return { duplicate: false, certificate: newCert };
}
async function getCertificateById(id) {
  const result = await docClient.send(
    new import_lib_dynamodb.GetCommand({
      TableName: TABLE_NAME,
      Key: { id }
    })
  );
  return result.Item || null;
}

// ../backend/models/Course.js
var import_client_dynamodb2 = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb2 = require("@aws-sdk/lib-dynamodb");
var REGION = process.env.AWS_REGION || "us-east-1";
var TABLE = process.env.COURSE_TABLE_NAME;
if (!TABLE) throw new Error("COURSE_TABLE_NAME env var is required");
var ddb = import_lib_dynamodb2.DynamoDBDocumentClient.from(new import_client_dynamodb2.DynamoDBClient({ region: REGION }));
async function getCourseById(courseId) {
  const res = await ddb.send(new import_lib_dynamodb2.GetCommand({ TableName: TABLE, Key: { id: courseId } }));
  return res.Item ?? null;
}
async function checkSubCourseExists(courseId, subCourseId) {
  const course = await getCourseById(courseId);
  if (!course || !course.subCourses) return false;
  return course.subCourses.some((sc) => sc.id === subCourseId);
}
async function findCourseById(courseId) {
  return getCourseById(courseId);
}

// ../backend/routes/certificates/generateCertificate.js
var handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { userId, courseId, subCourseTitle } = body;
    if (!userId || !courseId || !subCourseTitle) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required fields." })
      };
    }
    const existing = await getCertificateById({ userId, courseId, subCourseTitle });
    if (existing) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Certificate already issued.",
          certificate: existing
        })
      };
    }
    const course = await findCourseById(courseId);
    if (!course) {
      return { statusCode: 404, body: JSON.stringify({ message: "Course not found." }) };
    }
    const subCourseExists = await checkSubCourseExists(courseId, subCourseTitle);
    if (!subCourseExists) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Sub-course not found in course." })
      };
    }
    const cert = await generateCertificate({ userId, courseId, subCourseTitle });
    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Certificate issued.", certificate: cert })
    };
  } catch (error) {
    console.error("\u274C Certificate issue error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error." })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
