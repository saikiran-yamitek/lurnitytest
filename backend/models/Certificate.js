import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";


const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.CERTIFICATE_TABLE_NAME;

// Generate new certificate
export async function generateCertificate(userId, courseId, subCourseTitle) {
  // First check if exists
  const existing = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "user-subcourse-index",
KeyConditionExpression: "userId = :u AND subCourseTitle = :s",
ExpressionAttributeValues: {
  ":u": userId,
  ":s": subCourseTitle,
},
    })
  );

  if (
    existing.Items?.some((c) => c.subCourseTitle === subCourseTitle)
  ) {
    return { duplicate: true, certificate: existing.Items[0] };
  }

  const newCert = {
    id: crypto.randomUUID(),
    userId,
    courseId,
    subCourseTitle,
    issuedAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: newCert,
    })
  );

  return { duplicate: false, certificate: newCert };
}

// Get all certificates
export async function getAllCertificates() {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    })
  );
  return result.Items || [];
}

// Get certificate by ID
export async function getCertificateById(id) {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    })
  );
  return result.Item || null;
}

// Get certificates for a user
export async function getCertificatesByUserId(userId) {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "userId-index", // ⚠️ Add GSI on userId
      KeyConditionExpression: "userId = :u",
      ExpressionAttributeValues: {
        ":u": userId,
      },
    })
  );
  return result.Items || [];
}

// Check certificate existence
export async function checkCertificateExists(userId, subCourseTitle) {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "userId-index", // ⚠️ Same GSI
      KeyConditionExpression: "userId = :u",
      ExpressionAttributeValues: {
        ":u": userId,
      },
    })
  );
  return result.Items?.some((c) => c.subCourseTitle === subCourseTitle);
}


export async function findCertificateByUserSubCourse(userId, subCourseTitle) {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "user-subcourse-index", // Add this GSI in DynamoDB
      KeyConditionExpression: "userId = :u AND subCourseTitle = :s",
      ExpressionAttributeValues: {
        ":u": userId,
        ":s": subCourseTitle,
      },
    })
  );

  return result.Items?.[0] || null; // return first certificate if exists
}


export { generateCertificate as createCertificate };
export { getCertificateById as findCertificate };
export { getAllCertificates as listCertificates };
export { getCertificateById as findCertificateById };
export { getCertificatesByUserId as listCertificatesByUserId };
export { checkCertificateExists as certificateExists };
