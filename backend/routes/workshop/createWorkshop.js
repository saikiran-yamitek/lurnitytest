import { createWorkshop } from "../../models/Workshop.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ token verification

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') return handleOptionsRequest();

  try {
    // ✅ Verify token
    verifyToken(event);

    const body = event.body ? JSON.parse(event.body) : {};

    // ✅ Validate required fields (adjust based on your Workshop model)
    const { title, description, date, duration } = body;
    if (!title || !description || !date || !duration) {
      console.error("❌ Missing required workshop fields:", body);
      return createResponse(400, { 
        msg: "Missing required fields", 
        required: ["title", "description", "date", "duration"] 
      });
    }

    console.log("🔍 Creating new workshop:", { title, date });

    const newWorkshop = await createWorkshop(body);

    console.log("✅ Workshop created successfully:", newWorkshop.id || title);
    return createResponse(201, newWorkshop);

  } catch (err) {
    console.error("❌ Workshop creation error:", err);

    // Handle token errors explicitly
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { error: err.message });
  }
};
