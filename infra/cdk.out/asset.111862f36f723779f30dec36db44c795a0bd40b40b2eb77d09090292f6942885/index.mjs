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
var REGION = process.env.AWS_REGION || "us-east-1";
var TABLE = process.env.DEMO_TABLE_NAME;
var OTP_TABLE = process.env.DEMO_OTP_TABLE_NAME || `${TABLE}_otp`;
if (!TABLE) throw new Error("DEMO_TABLE_NAME env var is required");
var ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));
var sns = new SNSClient({ region: REGION });
async function verifyDemoOTP(phone, otpEntered, sessionId) {
  try {
    const result = await ddb.send(
      new GetCommand({
        TableName: OTP_TABLE,
        Key: { sessionId }
      })
    );
    const item = result.Item;
    if (!item) {
      return { valid: false, message: "Invalid session or OTP expired" };
    }
    if (item.phone !== phone) {
      return { valid: false, message: "Phone number mismatch" };
    }
    if (item.verified) {
      return { valid: false, message: "OTP already used" };
    }
    const now = /* @__PURE__ */ new Date();
    const expiresAt = new Date(item.expiresAt);
    if (now > expiresAt) {
      await ddb.send(new DeleteCommand({
        TableName: OTP_TABLE,
        Key: { sessionId }
      }));
      return { valid: false, message: "OTP expired. Please request a new one." };
    }
    if (item.attempts <= 0) {
      return {
        valid: false,
        message: "Maximum attempts exceeded. Please request a new OTP.",
        attemptsLeft: 0
      };
    }
    if (item.otp !== otpEntered) {
      const newAttempts = item.attempts - 1;
      await ddb.send(
        new UpdateCommand({
          TableName: OTP_TABLE,
          Key: { sessionId },
          UpdateExpression: "SET attempts = :attempts",
          ExpressionAttributeValues: {
            ":attempts": newAttempts
          }
        })
      );
      return {
        valid: false,
        message: `Invalid OTP. ${newAttempts} attempt(s) remaining.`,
        attemptsLeft: newAttempts
      };
    }
    await ddb.send(
      new UpdateCommand({
        TableName: OTP_TABLE,
        Key: { sessionId },
        UpdateExpression: "SET verified = :verified",
        ExpressionAttributeValues: {
          ":verified": true
        }
      })
    );
    await ddb.send(new DeleteCommand({
      TableName: OTP_TABLE,
      Key: { sessionId }
    }));
    return { valid: true, message: "OTP verified successfully" };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw new Error("Failed to verify OTP");
  }
}
async function sendThankYouSMS(phone) {
  try {
    const message = "Thank you for showing interest in Lurnity. Our support expert will get in touch with you shortly.";
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
    await sns.send(new PublishCommand(snsParams));
    console.log(`Thank you SMS sent to ${phone}`);
  } catch (error) {
    console.error("Error sending thank you SMS:", error);
  }
}

// ../backend/routes/demo/verifyDemoOTP.js
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
    const { phone, otp, sessionId } = JSON.parse(event.body || "{}");
    if (!phone || !otp || !sessionId) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: "Phone, OTP, and sessionId are required" })
      };
    }
    const verification = await verifyDemoOTP(phone, otp, sessionId);
    if (!verification.valid) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: verification.message || "Invalid or expired OTP",
          attemptsLeft: verification.attemptsLeft
        })
      };
    }
    await sendThankYouSMS(phone);
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "OTP verified successfully",
        verified: true
      })
    };
  } catch (err) {
    console.error("Error verifying OTP:", err);
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
