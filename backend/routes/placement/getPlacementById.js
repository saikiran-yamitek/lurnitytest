import { getPlacementById } from "../../models/Placement.js"; // Adjust the path if needed
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export async function handler(event) {
    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return handleOptionsRequest();
    }

    try {
        const driveId = event.pathParameters?.driveId;

        if (!driveId) {
            return createResponse(400, { message: "Missing driveId in path parameters" });
        }

        const placement = await getPlacementById(driveId);

        if (!placement) {
            return createResponse(404, { message: "Placement not found" });
        }

        return createResponse(200, placement);

    } catch (error) {
        console.error("Error fetching placement by ID:", error);
        return createResponse(500, { message: "Internal Server Error", error: error.message });
    }
}
