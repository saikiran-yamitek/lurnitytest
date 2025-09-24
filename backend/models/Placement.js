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
export async function getPlacementById(id) {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    })
  );
  return result.Item;
}

// Delete placement
export async function deletePlacement(id) {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id },
    })
  );
  return { message: "Deleted" };
}


// registerStudent implementation — safe update (appends to `registered`)
export async function registerStudent(id, studentId) {
  // Ensure id is a string (table expects string)
  const placementId = String(id);

  // 1) fetch existing placement to validate & check duplicates
  const placement = await getPlacementById(placementId);
  if (!placement) throw new Error("Drive not found");

  const alreadyRegistered = (placement.registered || []).some(r =>
    String(r.student) === String(studentId) ||
    (r.student && String(r.student.id) === String(studentId))
  );
  if (alreadyRegistered) {
    throw new Error("You have already applied for this drive");
  }

  // 2) new registration entry
  const newEntry = {
    student: studentId,
    status: "NOT PLACED",
    remarks: "",
    offerLetterURL: ""
  };

  // 3) KEY must exactly match table's PK name and type — your PK is `id` (String)
  const Key = { id: placementId };

  // 4) Append the new entry to the `registered` list safely
  await docClient.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key,
    UpdateExpression: "SET registered = list_append(if_not_exists(registered, :empty_list), :newEntry)",
    ExpressionAttributeValues: {
      ":newEntry": [newEntry],
      ":empty_list": []
    },
    ReturnValues: "UPDATED_NEW"
  }));

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
  id,
  studentId,
  { status, remarks, offerLetterURL }
) {
  const placement = await getPlacementById(id);
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
