import { updateProjects } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const body = JSON.parse(event.body);
    const { userId, projects } = body;

    if (!userId) {
      return createResponse(400, { msg: "userId required" });
    }

    const updated = await updateProjects(userId, projects);
    return createResponse(200, updated);
  } catch (err) {
    return createResponse(500, { msg: "Error updating projects", error: err.message });
  }
};
