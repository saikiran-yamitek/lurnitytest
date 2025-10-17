import AWS from "aws-sdk";
import { createDemo } from "../../models/Demo.js";

AWS.config.update({ region: "ap-south-1" }); // Update your region
const sns = new AWS.SNS();

export const handler = async (event) => {
  // Handle preflight OPTIONS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Max-Age": "86400",
      },
      body: "",
    };
  }

  try {
    const data = JSON.parse(event.body || "{}");
    const demo = await createDemo(data);

    // ✅ Send SMS using SNS
    const params = {
      Message: `Hi ${data.name}, you have successfully registered for a Lurnity demo. One of our experts will contact you shortly. Thank you!`,
      PhoneNumber: data.phone, // Make sure phone includes country code
    };

    await sns.publish(params).promise();

    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Demo booked successfully.", demo }),
    };
  } catch (err) {
    console.error("Error booking demo:", err);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
