// lambdas/feedback/deleteFeedback.js
import { deleteFeedback } from "../../models/Feedback.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ Import token verification

export const handler = async (event) => {
  // ✅ Handle preflight OPTIONS
  if (event.httpMethod === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    // ✅ Verify token first — ensures only authenticated users can delete feedback
    verifyToken(event);

    const { id } = event.pathParameters || {};
    if (!id) {
      return createResponse(400, { error: "Feedback ID is required" });
    }

    const result = await deleteFeedback(id);

    if (!result) {
      return createResponse(404, { error: "Feedback not found" });
    }

    return createResponse(200, { message: "Feedback deleted successfully", result });
  } catch (err) {
    console.error("❌ Error deleting feedback:", err);

    // Return 401 if token is invalid or missing
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: err.message });
    }

    return createResponse(500, { error: "Failed to delete feedback" });
  }
};
