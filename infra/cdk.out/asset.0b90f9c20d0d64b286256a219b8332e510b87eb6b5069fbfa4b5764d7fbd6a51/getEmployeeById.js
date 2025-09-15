import { getEmployee } from "../../models/Employee.js";

export const handler = async (event) => {
  try {
    const { id } = event.pathParameters || {};
    const employee = await getEmployee(id);

    if (!employee) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Employee not found" }),
      };
    }

    // remove password before returning
    employee.password = "";

    return {
      statusCode: 200,
      body: JSON.stringify(employee),
    };
  } catch (err) {
    console.error("Error fetching employee:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server error fetching employee" }),
    };
  }
};
