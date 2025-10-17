import { updateProjects } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ token verification

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") return handleOptionsRequest();

  try {
    // ✅ Verify token
    verifyToken(event);

    const userId = event.pathParameters?.id; // from URL /api/user/{id}/projects
    if (!userId) {
      console.error("❌ Missing userId in path parameters");
      return createResponse(400, { msg: "userId required in path" });
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const { projects } = body;

    if (!projects || !Array.isArray(projects)) {
      console.error("❌ Invalid projects data:", projects);
      return createResponse(400, { msg: "projects must be a non-empty array" });
    }

    console.log(`🔍 Updating projects for user ${userId}:`, projects);

    const updated = await updateProjects(userId, projects);

    console.log(`✅ Projects updated successfully for user ${userId}`);
    return createResponse(200, { msg: "Projects updated successfully", updated });

  } catch (err) {
    console.error("❌ Error updating projects:", err);

    // Handle token errors explicitly
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { msg: "Error updating projects", error: err.message });
  }
};
