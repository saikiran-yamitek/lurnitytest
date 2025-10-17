import { storeDemoOTP, generateOTP } from "../../models/Demo.js";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const sns = new SNSClient({ region: process.env.AWS_REGION || "us-east-1" });

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Max-Age': '86400'
      },
      body: ''
    };
  }

  try {
    const { phone } = JSON.parse(event.body || "{}");

    if (!phone) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: "Phone number is required" })
      };
    }

    // Generate 6-digit OTP
    const otp = generateOTP();
    
    // Store OTP in DynamoDB with 10-minute expiry
    const session = await storeDemoOTP(phone, otp);

    // Send OTP via SNS
    const message = `Your Lurnity verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
    
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

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
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
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: err.message })
    };
  }
};
