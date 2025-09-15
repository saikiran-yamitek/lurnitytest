import { listEmployees } from "../../models/Employee.js";

export const handler = async () => {
  try {
    const employees = await listEmployees();
    return {
      statusCode: 200,
      body: JSON.stringify(employees),
    };
  } catch (err) {
    console.error("Error fetching employees:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server error fetching employees" }),
    };
  }
};
