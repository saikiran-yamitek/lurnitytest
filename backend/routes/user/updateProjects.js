import { updateProjects } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    const userId = event.pathParameters?.id; // ✅ from URL /api/user/{id}/projects
    const body = JSON.parse(event.body || "{}");
    const { projects } = body; // ✅ from request body

    if (!userId) {
      return createResponse(400, { msg: "userId required in path" });
    }

    if (!projects || !Array.isArray(projects)) {
      return createResponse(400, { msg: "projects must be an array" });
    }

    const updated = await updateProjects(userId, projects);
    return createResponse(200, { msg: "Projects updated", updated });
  } catch (err) {
    console.error("Update projects error:", err);
    return createResponse(500, { msg: "Error updating projects", error: err.message });
  }
};
