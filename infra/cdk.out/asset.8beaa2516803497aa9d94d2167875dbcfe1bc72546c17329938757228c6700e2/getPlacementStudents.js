import { getPlacementById } from "../../models/Placement.js";
import { getUser } from "../../models/User.js"; // enrich student details

export const handler = async (event) => {
  try {
    const { id } = event.pathParameters;
    const drive = await getPlacementById(id);

    if (!drive) {
      return { statusCode: 404, body: JSON.stringify({ message: "Drive not found" }) };
    }

    const enrichedStudents = await Promise.all(
      (drive.registered || []).map(async (entry) => {
        const user = await getUser(entry.student);
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

    return { statusCode: 200, body: JSON.stringify(enrichedStudents) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};
