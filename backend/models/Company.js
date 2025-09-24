// models/Company.js
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.COMPANY_TABLE_NAME;

// ✅ List all companies
export async function listCompanies() {
  const command = new ScanCommand({ TableName: TABLE_NAME });
  const response = await ddb.send(command);
  return response.Items || [];
}

// ✅ Create a new company
export async function createCompany(data) {
  const item = {
    id: data.id || crypto.randomUUID(),
    ...data,
  };

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: item,
  });

  await ddb.send(command);
  return item;
}

// ✅ Update existing company
export async function updateCompany(id, data) {
  // Strip out id so it’s not updated
  const { id: _, ...fields } = data;

  if (Object.keys(fields).length === 0) {
    throw new Error("No fields to update");
  }

  const updateExpression = [];
  const expressionAttributeValues = {};
  const expressionAttributeNames = {};

  for (const [key, value] of Object.entries(fields)) {
    updateExpression.push(`#${key} = :${key}`);
    expressionAttributeValues[`:${key}`] = value;
    expressionAttributeNames[`#${key}`] = key;
  }

  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { id },
    UpdateExpression: `SET ${updateExpression.join(", ")}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "ALL_NEW",
  });

  const response = await ddb.send(command);
  return response.Attributes;
}

