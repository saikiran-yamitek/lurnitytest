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
function generateOTP() {
  return crypto.randomInt(1e5, 999999).toString();
}
async function storeDemoOTP(phone, otp) {
  const sessionId = crypto.randomUUID();
  const now = /* @__PURE__ */ new Date();
  const expiryTime = new Date(now.getTime() + 10 * 60 * 1e3);
  const ttl = Math.floor(expiryTime.getTime() / 1e3);
  const item = {
    sessionId,
    phone,
    otp,
    attempts: 3,
    createdAt: now.toISOString(),
    expiresAt: expiryTime.toISOString(),
    ttl,
    verified: false
  };
  await ddb.send(new PutCommand({
    TableName: OTP_TABLE,
    Item: item
  }));
  return { sessionId, expiresAt: expiryTime.toISOString() };
}

// ../backend/routes/demo/sendDemoOTP.js
import { SNSClient as SNSClient2, PublishCommand as PublishCommand2 } from "@aws-sdk/client-sns";
var sns2 = new SNSClient2({ region: process.env.AWS_REGION || "us-east-1" });
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
    const { phone } = JSON.parse(event.body || "{}");
    if (!phone) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: "Phone number is required" })
      };
    }
    const otp = generateOTP();
    const session = await storeDemoOTP(phone, otp);
    const message = `Your Lurnity verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
    const snsParams = {
      Message: message,
      PhoneNumber: phone,
      MessageAttributes: {
        "AWS.SNS.SMS.SMSType": {
          DataType: "String",
          StringValue: "Transactional"
        },
        "AWS.SNS.SMS.SenderID": {
          DataType: "String",
          StringValue: process.env.SNS_SENDER_ID || "Lurnity"
        }
      }
    };
    await sns2.send(new PublishCommand2(snsParams));
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "OTP sent successfully",
        sessionId: session.sessionId
      })
    };
  } catch (err) {
    console.error("Error sending OTP:", err);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: err.message })
    };
  }
};
export {
  handler
};
