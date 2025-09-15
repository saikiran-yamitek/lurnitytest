// models/AdminLogin.js
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const REGION = process.env.AWS_REGION || "ap-south-1";
const TABLE = process.env.ADMIN_LOGIN_TABLE;
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

/** Get admin by username */
export async function getAdminByUsername(username) {
  if (!username) throw new Error("username required");
  const params = {
    TableName: TABLE,
    IndexName: "username-index", // assumes you create a GSI on username
    KeyConditionExpression: "username = :u",
    ExpressionAttributeValues: { ":u": username },
  };
  const result = await ddb.send(new QueryCommand(params));
  return (result.Items && result.Items[0]) || null;
}

/** Optionally: generate JWT token for admin */
import jwt from "jsonwebtoken";
export function generateAdminToken(adminId) {
  return jwt.sign({ id: adminId }, process.env.ADMIN_JWT_SECRET || "admin-secret-key", { expiresIn: "1d" });
}

export default {
  getAdminByUsername
};
