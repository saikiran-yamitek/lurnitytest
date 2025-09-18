// backend/routes/admin/getStats.js
import { countUsers } from "../../models/User.js";
import { countCourses } from "../../models/Course.js";
import { calculateTotalRevenue } from "../../models/Transaction.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const userCount = await countUsers();
    const courseCount = (typeof countCourses === "function") ? await countCourses() : 0;
    const totalRevenue = (typeof calculateTotalRevenue === "function") ? await calculateTotalRevenue() : 0;

    return createResponse(200, { userCount, courseCount, totalRevenue });
  } catch (err) {
    console.error("getStats error:", err);
    return createResponse(500, { error: err.message });
  }
};
