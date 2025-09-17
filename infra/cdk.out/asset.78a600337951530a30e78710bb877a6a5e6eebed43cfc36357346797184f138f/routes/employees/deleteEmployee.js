import { deleteEmployee } from "../../models/Employee.js";

export const handler = async (event) => {
  try {
    const { id } = event.pathParameters || {};
    await deleteEmployee(id);

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error("Error deleting employee:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server error deleting employee" }),
    };
  }
};
