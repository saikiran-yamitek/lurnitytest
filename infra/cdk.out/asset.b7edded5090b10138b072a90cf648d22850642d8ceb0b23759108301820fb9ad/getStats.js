// backend/routes/admin/getStats.js
import { countUsers } from "../../models/User.js";
import { countCourses } from "../../models/Course.js";
import { calculateTotalRevenue } from "../../models/Transaction.js";

export const handler = async () => {
  try {
    const userCount = await countUsers();
    const courseCount = (typeof countCourses === "function") ? await countCourses() : 0;
    const totalRevenue = (typeof calculateTotalRevenue === "function") ? await calculateTotalRevenue() : 0;

    return { statusCode: 200, body: JSON.stringify({ userCount, courseCount, totalRevenue }) };
  } catch (err) {
    console.error("getStats error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
