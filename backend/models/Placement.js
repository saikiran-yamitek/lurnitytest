import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  PutCommand,
  DeleteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";


const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.PLACEMENT_TABLE_NAME;

// List all placements
export async function listPlacements() {
  const command = new ScanCommand({ TableName: TABLE_NAME });
  const result = await docClient.send(command);
  return result.Items || [];
}

// Create a new placement
export async function createPlacement(driveData) {
  const newDrive = {
    id: driveData.id || crypto.randomUUID(),   // ✅ ensure PK
    driveId: driveData.driveId || Date.now().toString(),
    registered: driveData.registered || [],
    status: driveData.status || "SCHEDULED",
    createdAt: new Date().toISOString(),
    ...driveData, // put this at the end so extra fields from client are preserved
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: newDrive,
    })
  );

  return newDrive;
}

// Get placement by ID
export async function getPlacementById(driveId) {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { driveId },
    })
  );
  return result.Item;
}

// Delete placement
export async function deletePlacement(driveId) {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { driveId },
    })
  );
  return { message: "Deleted" };
}

// Register student in a drive
export async function registerStudent(driveId, studentId) {
  const placement = await getPlacementById(driveId);
  if (!placement) throw new Error("Drive not found");

  const alreadyRegistered = placement.registered?.find(
    (r) => r.student === studentId
  );
  if (alreadyRegistered) {
    throw new Error("You have already applied for this drive");
  }

  const newEntry = {
    student: studentId,
    status: "NOT PLACED",
    remarks: "",
    offerLetterURL: "",
  };

  placement.registered = [...(placement.registered || []), newEntry];

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: placement,
    })
  );

  return { message: "Registered successfully" };
}

// Update placement details


export async function updatePlacement(id, updateData) {
  // Strip id to avoid trying to update it
  const { id: _, ...fields } = updateData;

  const updateExpr = [];
  const exprAttrNames = {};
  const exprAttrValues = {};

  for (const [key, value] of Object.entries(fields)) {
    updateExpr.push(`#${key} = :${key}`);
    exprAttrNames[`#${key}`] = key;
    exprAttrValues[`:${key}`] = value;
  }

  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { id }, // only PK here (or { id, driveId } if composite key)
    UpdateExpression: `SET ${updateExpr.join(", ")}`,
    ExpressionAttributeNames: exprAttrNames,
    ExpressionAttributeValues: exprAttrValues,
    ReturnValues: "ALL_NEW",
  });

  const result = await docClient.send(command);
  return result.Attributes;
}



// Update student info inside placement
export async function updateStudentStatus(
  driveId,
  studentId,
  { status, remarks, offerLetterURL }
) {
  const placement = await getPlacementById(driveId);
  if (!placement) throw new Error("Drive not found");

  const studentEntry = placement.registered?.find(
    (r) => r.student === studentId
  );

  if (!studentEntry) throw new Error("Student not registered for this drive");

  studentEntry.status = status || studentEntry.status;
  studentEntry.remarks = remarks || studentEntry.remarks || "";
  studentEntry.offerLetterURL = status === "PLACED" ? offerLetterURL : "";

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: placement,
    })
  );

  return { message: "Student status updated successfully" };
}

// Mark drive completed
export async function markDriveCompleted(driveId) {
  return updatePlacement(driveId, { status: "COMPLETED" });
}

// Revoke completed drive
export async function revokeDrive(driveId) {
  return updatePlacement(driveId, { status: "SCHEDULED" });
}

// ✅ Rankings helper: Get all placed student IDs
export async function getPlacedStudentIds() {
  const res = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
  const items = res.Items || [];

  const placed = [];
  items.forEach((item) => {
    if (item.registered) {
      item.registered.forEach((r) => {
        if (r.status === "PLACED" && r.student) {
          placed.push(r.student);
        }
      });
    }
  });

  return placed;
}
