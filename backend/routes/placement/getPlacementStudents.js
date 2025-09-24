import { getPlacementById } from "../../models/Placement.js";
import { getUserById } from "../../models/User.js"; // enrich student details
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const { id } = event.pathParameters;
    const drive = await getPlacementById(id);

    if (!drive) {
      return createResponse(404, { message: "Drive not found" });
    }

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
    return createResponse(500, { message: err.message });
  }
};
