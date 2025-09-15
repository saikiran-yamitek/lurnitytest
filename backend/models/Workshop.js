import {
  DynamoDBClient,
  ScanCommand,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { unmarshall, marshall } from "@aws-sdk/util-dynamodb";
import { getUserById } from "./User.js"; // ✅ for rankings

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const TABLE = process.env.WORKSHOP_TABLE_NAME;

// 1. List all workshops
export async function listWorkshops() {
  const command = new ScanCommand({ TableName: TABLE });
  const res = await client.send(command);
  return res.Items.map(unmarshall);
}

// 2. Create new workshop
export async function createWorkshop(data) {
  const item = marshall({
    ...data,
    id: data.id || Date.now().toString(),
    createdAt: new Date().toISOString(),
    registeredStudents: [],
  });
  await client.send(new PutItemCommand({ TableName: TABLE, Item: item }));
  return unmarshall(item);
}

// 3. Register student (POST)
export async function registerStudent(workshopId, userId) {
  const workshop = await getWorkshopById(workshopId);
  if (!workshop) throw new Error("Workshop not found");

  const alreadyRegistered = workshop.registeredStudents?.some(
    (entry) => entry.student === userId
  );
  if (alreadyRegistered) throw new Error("Already registered");

  if (workshop.registeredStudents?.length >= workshop.capacity) {
    throw new Error("Workshop is full");
  }

  const newEntry = {
    student: userId,
    attendance: false,
    result: "pending",
    registeredAt: new Date().toISOString(),
  };

  workshop.registeredStudents = [...(workshop.registeredStudents || []), newEntry];
  await saveWorkshop(workshop);
  return workshop;
}

// 4. Get workshops of a user
export async function getUserWorkshops(userId) {
  const workshops = await listWorkshops();
  return workshops
    .filter((w) => w.registeredStudents?.some((s) => s.student === userId))
    .map((w) => {
      const entry = w.registeredStudents.find((s) => s.student === userId);
      return {
        id: w.id,
        labName: w.labName,
        labAddress: w.labAddress,
        time: w.time,
        attendance: entry.attendance,
        result: entry.result,
        registeredAt: entry.registeredAt,
        inchargeName: w.inchargeName,
      };
    });
}

// 5. Get students in a workshop
export async function getWorkshopStudents(workshopId) {
  const workshop = await getWorkshopById(workshopId);
  if (!workshop) throw new Error("Workshop not found");

  return (workshop.registeredStudents || []).map((entry) => ({
    student: entry.student,
    attendance: entry.attendance,
    result: entry.result,
    grade: entry.grade,
  }));
}

// 6. Delete workshop
export async function deleteWorkshop(workshopId) {
  await client.send(
    new DeleteItemCommand({ TableName: TABLE, Key: marshall({ id: workshopId }) })
  );
  return { message: "Workshop deleted" };
}

// 7. Get workshops by incharge
export async function getWorkshopsByIncharge(empId) {
  const workshops = await listWorkshops();
  return workshops.filter((w) => w.inchargeId === empId);
}

// 8. Update student attendance
export async function updateStudentAttendance(workshopId, studentId, updates) {
  const workshop = await getWorkshopById(workshopId);
  if (!workshop) throw new Error("Workshop not found");

  const student = workshop.registeredStudents.find((s) => s.student === studentId);
  if (!student) throw new Error("Student not found");

  Object.assign(student, updates);

  await saveWorkshop(workshop);
  return { message: "Student updated" };
}

// 9. Register student (PUT)
export async function registerStudentPut(workshopId, userId) {
  return registerStudent(workshopId, userId);
}

// 10. Update workshop
export async function updateWorkshop(workshopId, data) {
  const workshop = await getWorkshopById(workshopId);
  if (!workshop) throw new Error("Workshop not found");

  const updated = { ...workshop, ...data };
  await saveWorkshop(updated);
  return updated;
}

// --- Rankings helper: Get workshops with populated student details ---
export async function getWorkshopsWithStudents() {
  const res = await client.send(new ScanCommand({ TableName: TABLE }));
  const workshops = res.Items.map(unmarshall);

  for (const w of workshops) {
    if (w.registeredStudents) {
      for (const student of w.registeredStudents) {
        if (student.student) {
          const user = await getUserById(student.student);
          student.student = {
            _id: user?.id,
            name: user?.name,
            email: user?.email,
            bachelorsDegree: user?.bachelorsDegree,
          };
        }
      }
    }
  }

  return workshops;
}

// --- Internal Helpers ---
async function getWorkshopById(id) {
  const res = await client.send(
    new GetItemCommand({ TableName: TABLE, Key: marshall({ id }) })
  );
  return res.Item ? unmarshall(res.Item) : null;
}

async function saveWorkshop(workshop) {
  await client.send(
    new PutItemCommand({ TableName: TABLE, Item: marshall(workshop) })
  );
}
