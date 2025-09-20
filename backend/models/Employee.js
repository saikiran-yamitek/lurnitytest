// models/Employee.js
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

const EMPLOYEE_TABLE = process.env.EMPLOYEE_TABLE_NAME; // Make sure this is set in .env
if (!EMPLOYEE_TABLE) {
  throw new Error("EMPLOYEE_TABLE env var is required");
}

// ------------------------
// CREATE EMPLOYEE
// ------------------------


export const createEmployee = async (employeeData) => {
  console.log("👤 Creating new employee:", employeeData.name);
  
  let hashedPassword = null;
  if (employeeData.password) {
    console.log("🔐 Hashing password...");
    hashedPassword = await bcrypt.hash(employeeData.password, 12);
    console.log("✅ Password hashed successfully");
  }

  const newEmployee = {
    ...employeeData,
    password: hashedPassword,
    id: employeeData.id || crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({ TableName: EMPLOYEE_TABLE, Item: newEmployee })
  );
  
  console.log("✅ Employee created with ID:", newEmployee.id);
  return newEmployee;
};


// ------------------------
// GET ALL EMPLOYEES
// ------------------------
export const getAllEmployees = async () => {
  const result = await docClient.send(
    new ScanCommand({ TableName: EMPLOYEE_TABLE })
  );
  return (
    result.Items?.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ) || []
  );
};

// ------------------------
// GET SINGLE EMPLOYEE
// ------------------------
export const getEmployeeById = async (id) => {
  const result = await docClient.send(
    new GetCommand({ TableName: EMPLOYEE_TABLE, Key: { id } })
  );
  if (!result.Item) return null;
  const emp = result.Item;
  emp.password = ""; // don't expose password
  return emp;
};

// ------------------------
// UPDATE EMPLOYEE
// ------------------------
export const updateEmployee = async (id, updateData) => {
  console.log("📝 Updating employee ID:", id);
  console.log("📦 Raw update data:", updateData);
  
  // ✅ Remove id and other non-updatable fields
  const { id: _, createdAt, updatedAt, ...cleanUpdateData } = updateData;
  
  console.log("🧹 Cleaned update data:", cleanUpdateData);
  
  const now = new Date().toISOString();
  const updateExpressionParts = [];
  const expressionValues = {};
  const expressionAttributeNames = {};

  // ✅ Only iterate over cleaned data (no 'id' field)
  for (const key in cleanUpdateData) {
    updateExpressionParts.push(`#${key} = :${key}`);
    expressionValues[`:${key}`] = cleanUpdateData[key];
    expressionAttributeNames[`#${key}`] = key;
  }
  
  // Add updatedAt separately
  updateExpressionParts.push("#updatedAt = :updatedAt");
  expressionValues[":updatedAt"] = now;
  expressionAttributeNames["#updatedAt"] = "updatedAt";

  if (updateExpressionParts.length === 1) { // Only updatedAt
    console.log("⚠️ No fields to update");
    return null;
  }

  const params = {
    TableName: EMPLOYEE_TABLE,
    Key: { id },
    UpdateExpression: `SET ${updateExpressionParts.join(", ")}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionValues,
    ReturnValues: "ALL_NEW",
  };

  console.log("📤 DynamoDB UpdateCommand:", JSON.stringify(params, null, 2));

  try {
    const result = await docClient.send(new UpdateCommand(params));
    console.log("✅ Employee updated successfully");
    return result.Attributes;
  } catch (error) {
    console.error("❌ DynamoDB update error:", error);
    throw error;
  }
};


// ------------------------
// DELETE EMPLOYEE
// ------------------------
export const deleteEmployee = async (id) => {
  await docClient.send(
    new DeleteCommand({ TableName: EMPLOYEE_TABLE, Key: { id } })
  );
  return { ok: true };
};

// ------------------------
// NEW HELPERS (for login route)
// ------------------------

/**
 * Get employee by username.
 * ⚠️ Requires "username" to be either PK or a GSI.
 */
export const getEmployeeByUsername = async (username) => {
  if (!username) throw new Error("username is required");


  const result = await docClient.send(
    new QueryCommand({
      TableName: EMPLOYEE_TABLE,
      IndexName: "username-index", // GSI name
      KeyConditionExpression: "username = :u",
      ExpressionAttributeValues: { ":u": username },
    })
  );
  return result.Items && result.Items[0] ? result.Items[0] : null;
  

  
};

/**
 * Compare plain password with bcrypt hash
 */
export const verifyEmployeePassword = async (employee, password) => {
  if (!employee || !employee.password) {
    throw new Error("employee record missing password hash");
  }
  return bcrypt.compare(password, employee.password);
};

export { getAllEmployees as listEmployees };
