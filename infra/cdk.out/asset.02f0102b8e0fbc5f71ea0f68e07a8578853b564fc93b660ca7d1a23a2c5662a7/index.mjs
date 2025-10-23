import { createRequire } from 'module'; globalThis.require = createRequire(import.meta.url);

// ../backend/models/Certificate.js
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  QueryCommand
} from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";
var client = new DynamoDBClient({});
var docClient = DynamoDBDocumentClient.from(client);
var TABLE_NAME = process.env.CERTIFICATE_TABLE_NAME;
async function generateCertificate(userId, courseId, subCourseTitle) {
  const existing = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "user-subcourse-index",
      KeyConditionExpression: "userId = :u AND subCourseTitle = :s",
      ExpressionAttributeValues: {
        ":u": userId,
        ":s": subCourseTitle
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
    new PutCommand({
      TableName: TABLE_NAME,
      Item: newCert
    })
  );
  return { duplicate: false, certificate: newCert };
}
async function findCertificateByUserSubCourse(userId, subCourseTitle) {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "user-subcourse-index",
      // Add this GSI in DynamoDB
      KeyConditionExpression: "userId = :u AND subCourseTitle = :s",
      ExpressionAttributeValues: {
        ":u": userId,
        ":s": subCourseTitle
      }
    })
  );
  return result.Items?.[0] || null;
}

// ../backend/models/Course.js
import { DynamoDBClient as DynamoDBClient2 } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient as DynamoDBDocumentClient2,
  PutCommand as PutCommand2,
  ScanCommand as ScanCommand2,
  GetCommand as GetCommand2,
  UpdateCommand,
  DeleteCommand
} from "@aws-sdk/lib-dynamodb";
var REGION = process.env.AWS_REGION || "us-east-1";
var TABLE = process.env.COURSE_TABLE_NAME;
if (!TABLE) throw new Error("COURSE_TABLE_NAME env var is required");
var ddb = DynamoDBDocumentClient2.from(new DynamoDBClient2({ region: REGION }));
async function getCourseById(courseId) {
  const res = await ddb.send(new GetCommand2({ TableName: TABLE, Key: { id: courseId } }));
  return res.Item ?? null;
}
async function findCourseById(courseId) {
  return getCourseById(courseId);
}
async function doesSubCourseExist(courseId, subCourseTitle) {
  const course = await getCourseById(courseId);
  if (!course || !course.subCourses) return false;
  return course.subCourses.some((sc) => sc.title === subCourseTitle);
}

// ../backend/utils/cors.js
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Content-Type": "application/json"
};
var handleOptionsRequest = () => ({
  statusCode: 200,
  headers: {
    ...corsHeaders,
    "Access-Control-Max-Age": "86400"
  },
  body: ""
});
var createResponse = (statusCode, body) => ({
  statusCode,
  headers: corsHeaders,
  body: JSON.stringify(body)
});

// ../backend/routes/certificates/generateCertificate.js
var handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return handleOptionsRequest();
  }
  try {
    const body = JSON.parse(event.body || "{}");
    const { userId, courseId, subCourseTitle } = body;
    if (!userId || !courseId || !subCourseTitle) {
      return createResponse(400, { message: "Missing required fields." });
    }
    const existing = await findCertificateByUserSubCourse(userId, subCourseTitle);
    if (existing) {
      return createResponse(200, {
        message: "Certificate already issued.",
        certificate: existing
      });
    }
    const course = await findCourseById(courseId);
    if (!course) return createResponse(404, { message: "Course not found." });
    const subCourseExists = await doesSubCourseExist(courseId, subCourseTitle);
    if (!subCourseExists)
      return createResponse(400, { message: "Sub-course not found in course." });
    const cert = await generateCertificate(userId, courseId, subCourseTitle);
    return createResponse(201, { message: "Certificate issued.", certificate: cert });
  } catch (error) {
    console.error("\u274C Certificate issue error:", error);
    return createResponse(500, { message: "Internal server error." });
  }
};
export {
  handler
};
