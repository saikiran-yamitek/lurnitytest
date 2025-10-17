import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import crypto from "crypto";

const REGION = process.env.AWS_REGION || "us-east-1";
const TABLE = process.env.DEMO_TABLE_NAME;
const OTP_TABLE = process.env.DEMO_OTP_TABLE_NAME || `${TABLE}_otp`;

if (!TABLE) throw new Error("DEMO_TABLE_NAME env var is required");

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));
const sns = new SNSClient({ region: REGION });

/** Generate 6-digit OTP */
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

/** Store OTP for demo verification */
async function storeDemoOTP(phone, otp) {
  const sessionId = crypto.randomUUID();
  const now = new Date();
  const expiryTime = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes
  const ttl = Math.floor(expiryTime.getTime() / 1000); // Unix timestamp

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

/** Verify demo OTP */
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

    // Check if OTP expired
    const now = new Date();
    const expiresAt = new Date(item.expiresAt);
    if (now > expiresAt) {
      await ddb.send(new DeleteCommand({
        TableName: OTP_TABLE,
        Key: { sessionId }
      }));
      return { valid: false, message: "OTP expired. Please request a new one." };
    }

    // Check attempts
    if (item.attempts <= 0) {
      return { 
        valid: false, 
        message: "Maximum attempts exceeded. Please request a new OTP.",
        attemptsLeft: 0 
      };
    }

    // Verify OTP
    if (item.otp !== otpEntered) {
      // Decrement attempts
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

    // OTP is valid - mark as verified and delete
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

    // Delete the OTP record after successful verification
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

/** Send thank you SMS */
async function sendThankYouSMS(phone) {
  try {
    const message = "Thank you for showing interest in Lurnity. Our support expert will get in touch with you shortly.";
    
    const snsParams = {
      Message: message,
      PhoneNumber: phone,
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional'
        },
        'AWS.SNS.SMS.SenderID': {
          DataType: 'String',
          StringValue: process.env.SNS_SENDER_ID || 'Lurnity'
        }
      }
    };

    await sns.send(new PublishCommand(snsParams));
    console.log(`Thank you SMS sent to ${phone}`);
  } catch (error) {
    console.error("Error sending thank you SMS:", error);
    // Don't throw error - this is non-critical
  }
}

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
  generateOTP,
  storeDemoOTP,
  verifyDemoOTP,
  sendThankYouSMS,
  createDemo,
  listDemos,
  markDemoBooked,
};
