// models/Demo.js
// DynamoDB helpers for Demo bookings
// Requires: process.env.DEMO_TABLE_NAME
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";

const REGION = process.env.AWS_REGION || "us-east-1";
const TABLE = process.env.DEMO_TABLE_NAME;

if (!TABLE) throw new Error("DEMO_TABLE_NAME env var is required");

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

/** Create a demo booking */
async function createDemo(data = {}) {
  const id = data.id || crypto.randomUUID();
  const now = new Date().toISOString();

  const item = {
    id,
    ...data,
    booked: data.booked ?? false,
    createdAt: now,
    updatedAt: now,
  };

  await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
  return item;
}

/** List all demo bookings (latest first) */
async function listDemos() {
  const result = await ddb.send(new ScanCommand({ TableName: TABLE }));

  const items = (result.Items || []).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return items;
}

/** Mark a demo booking as booked */
async function markDemoBooked(demoId) {
  if (!demoId) throw new Error("demoId required");

  const now = new Date().toISOString();
  const params = {
    TableName: TABLE,
    Key: { id: demoId },
    UpdateExpression: "SET #booked = :true, #updatedAt = :now",
    ExpressionAttributeNames: {
      "#booked": "booked",
      "#updatedAt": "updatedAt",
    },
    ExpressionAttributeValues: {
      ":true": true,
      ":now": now,
    },
    ReturnValues: "ALL_NEW",
  };

  const res = await ddb.send(new UpdateCommand(params));
  return res.Attributes ?? null;
}

export {
  createDemo,
  listDemos,
  markDemoBooked,
};
