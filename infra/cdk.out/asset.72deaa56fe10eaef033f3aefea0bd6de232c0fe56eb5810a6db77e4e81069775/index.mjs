import { createRequire } from 'module'; globalThis.require = createRequire(import.meta.url);

// ../backend/models/Demo.js
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand
} from "@aws-sdk/lib-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import crypto from "crypto";
var REGION = process.env.AWS_REGION || "us-east-1";
var TABLE = process.env.DEMO_TABLE_NAME;
var OTP_TABLE = process.env.DEMO_OTP_TABLE_NAME || `${TABLE}_otp`;
if (!TABLE) throw new Error("DEMO_TABLE_NAME env var is required");
var ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));
var sns = new SNSClient({ region: REGION });
async function createDemo(data = {}) {
  const id = data.id || crypto.randomUUID();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const item = {
    id,
    ...data,
    booked: data.booked ?? false,
    createdAt: now,
    updatedAt: now
  };
  await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
  return item;
}

// ../backend/routes/demo/createDemo.js
var handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Max-Age": "86400"
      },
      body: ""
    };
  }
  try {
    const data = JSON.parse(event.body || "{}");
    const demo = await createDemo(data);
    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: "Demo booked successfully.", demo })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ error: err.message })
    };
  }
};
export {
  handler
};
