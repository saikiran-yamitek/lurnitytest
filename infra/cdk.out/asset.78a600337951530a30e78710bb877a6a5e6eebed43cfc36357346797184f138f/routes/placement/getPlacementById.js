import { getPlacementById } from "../../models/Placement.js"; // Adjust the path if needed

export async function handler(event) {
    try {
        const driveId = event.pathParameters?.driveId;

        if (!driveId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Missing driveId in path parameters" }),
            };
        }

        const placement = await getPlacementById(driveId);

        if (!placement) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Placement not found" }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(placement),
        };

    } catch (error) {
        console.error("Error fetching placement by ID:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
        };
    }
}
