// models/Company.js
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

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
  const updateExpression = [];
  const expressionAttributeValues = {};

  for (const [key, value] of Object.entries(data)) {
    updateExpression.push(`#${key} = :${key}`);
    expressionAttributeValues[`:${key}`] = value;
  }

  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { id },
    UpdateExpression: `SET ${updateExpression.join(", ")}`,
    ExpressionAttributeNames: Object.keys(data).reduce(
      (acc, key) => ({ ...acc, [`#${key}`]: key }),
      {}
    ),
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "ALL_NEW",
  });

  const response = await ddb.send(command);
  return response.Attributes;
}
