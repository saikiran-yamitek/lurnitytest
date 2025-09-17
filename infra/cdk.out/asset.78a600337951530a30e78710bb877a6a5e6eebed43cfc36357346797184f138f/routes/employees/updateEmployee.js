import { updateEmployee } from "../../models/Employee.js";

export const handler = async (event) => {
  try {
    const { id } = event.pathParameters || {};
    const body = JSON.parse(event.body || "{}");

    const updatedEmployee = await updateEmployee(id, body);

    if (!updatedEmployee) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Employee not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(updatedEmployee),
    };
  } catch (err) {
    console.error("Error updating employee:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server error updating employee" }),
    };
  }
};
