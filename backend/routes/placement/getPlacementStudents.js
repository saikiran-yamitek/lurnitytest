import { getPlacementById } from "../../models/Placement.js";
import { getUserById } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";
import { verifyToken } from "../../utils/authe.js"; // ✅ import token verifier

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    // ✅ Token verification
    verifyToken(event);

    const { id } = event.pathParameters;
    const drive = await getPlacementById(id);

    if (!drive) {
      return createResponse(404, { message: "Drive not found" });
    }

    // ✅ Enrich each registered student's details
    const enrichedStudents = await Promise.all(
      (drive.registered || []).map(async (entry) => {
        const user = await getUserById(entry.student);
        return {
          _id: entry.student,
          name: user?.name || "Unknown",
          email: user?.email || "",
          phone: user?.phone || "",
          status: entry.status,
          remarks: entry.remarks,
          offerLetterURL: entry.offerLetterURL,
        };
      })
    );

    return createResponse(200, enrichedStudents);
  } catch (err) {
    console.error("❌ Error fetching enriched students:", err);

    // Handle token issues clearly
    if (err.message.includes("token") || err.message.includes("Authorization")) {
      return createResponse(401, { error: "Unauthorized: Invalid or missing token" });
    }

    return createResponse(500, { message: "Server error fetching students", error: err.message });
  }
};
