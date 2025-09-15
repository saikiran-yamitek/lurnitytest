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
  const newEmployee = {
    ...employeeData,
    id: employeeData.id || crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await docClient.send(
    new PutCommand({ TableName: EMPLOYEE_TABLE, Item: newEmployee })
  );
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
  const now = new Date().toISOString();
  const updateExpressionParts = [];
  const expressionValues = {};

  for (const key in updateData) {
    updateExpressionParts.push(`#${key} = :${key}`);
    expressionValues[`:${key}`] = updateData[key];
  }
  updateExpressionParts.push("#updatedAt = :updatedAt");
  expressionValues[":updatedAt"] = now;

  const params = {
    TableName: EMPLOYEE_TABLE,
    Key: { id },
    UpdateExpression: `SET ${updateExpressionParts.join(", ")}`,
    ExpressionAttributeNames: Object.fromEntries(
      Object.keys(updateData).map((k) => [`#${k}`, k])
    ),
    ExpressionAttributeValues: expressionValues,
    ReturnValues: "ALL_NEW",
  };

  const result = await docClient.send(new UpdateCommand(params));
  return result.Attributes;
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

  // If "username" is the PK
  const result = await docClient.send(
    new GetCommand({ TableName: EMPLOYEE_TABLE, Key: { username } })
  );
  if (result.Item) return result.Item;

  // If username is stored in a GSI instead:
  /*
  const result = await docClient.send(
    new QueryCommand({
      TableName: EMPLOYEE_TABLE,
      IndexName: "username-index", // GSI name
      KeyConditionExpression: "username = :u",
      ExpressionAttributeValues: { ":u": username },
    })
  );
  return result.Items && result.Items[0] ? result.Items[0] : null;
  */

  return null;
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
