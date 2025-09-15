import { createEmployee } from "../../models/Employee.js";

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const newEmployee = await createEmployee(body);

    return {
      statusCode: 201,
      body: JSON.stringify(newEmployee),
    };
  } catch (err) {
    console.error("Error creating employee:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server error creating employee" }),
    };
  }
};
