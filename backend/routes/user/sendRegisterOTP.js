import { findUserByPhone, storeRegisterOTP, generateOTP } from "../../models/User.js";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

const sns = new SNSClient({ region: process.env.AWS_REGION || "ap-south-1" });

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const { phone, email } = JSON.parse(event.body || "{}");

    if (!phone) {
      return createResponse(400, { message: "Phone number is required" });
    }

    // Check if phone number is already used
    const existingUser = await findUserByPhone(phone);
    if (existingUser) {
      return createResponse(400, { 
        message: "Phone number is already registered. Please use a different number or login." 
      });
    }

    // Generate 6-digit OTP
    const otp = generateOTP();
    
    // Store OTP in DynamoDB with 10-minute expiry
    const session = await storeRegisterOTP(phone, otp, email);

    // Send OTP via SNS
    const message = `Your Lurnity registration OTP is: ${otp}. Valid for 10 minutes. Do not share this code.`;
    
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
          StringValue: process.env.SNS_SENDER_ID || 'LURNTY'
        }
      }
    };

    await sns.send(new PublishCommand(snsParams));

    return createResponse(200, { 
      message: "OTP sent successfully",
      sessionId: session.sessionId
    });
  } catch (err) {
    console.error("Error sending registration OTP:", err);
    return createResponse(500, { message: err.message || "Failed to send OTP" });
  }
};
