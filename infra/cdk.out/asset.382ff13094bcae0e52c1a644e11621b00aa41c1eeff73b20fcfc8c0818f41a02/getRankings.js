import { listPlacements } from "../../models/Placement.js";
import { listWorkshops } from "../../models/Workshop.js";
import { getUserById } from "../../models/User.js";

const gradeOrder = { S: 7, A: 6, B: 5, C: 4, D: 3, E: 2, F: 1 };

export const handler = async (event) => {
  try {
    const sortBy = event.queryStringParameters?.sortBy || "lab";

    // 1️⃣ Get placed students
    const placements = await listPlacements();
    const placedIds = new Set();

    placements.forEach((p) => {
      (p.registered || []).forEach((r) => {
        if (r.status === "PLACED") placedIds.add(r.student);
      });
    });

    // 2️⃣ Get workshops and build student map
    const workshops = await listWorkshops();
    const studentMap = new Map();

    for (const w of workshops) {
      for (const s of w.registeredStudents || []) {
        const studentId = s.student;
        if (!studentId || placedIds.has(studentId)) continue;

        if (!studentMap.has(studentId)) {
          const student = await getUserById(studentId);
          if (!student) continue;

          studentMap.set(studentId, {
            _id: student.id,
            name: student.name,
            email: student.email,
            bachelors: student.bachelorsDegree || {},
            labGrade: s.grade,
          });
        }
      }
    }

    let students = Array.from(studentMap.values());

    // 3️⃣ Sorting
    students.sort((a, b) => {
      if (sortBy === "lab") {
        const gA = gradeOrder[a.labGrade] || 0;
        const gB = gradeOrder[b.labGrade] || 0;
        if (gB !== gA) return gB - gA;

        const cA = a.bachelors?.cgpa || a.bachelors?.percentage || 0;
        const cB = b.bachelors?.cgpa || b.bachelors?.percentage || 0;
        return cB - cA;
      } else {
        const cA = a.bachelors?.cgpa || a.bachelors?.percentage || 0;
        const cB = b.bachelors?.cgpa || b.bachelors?.percentage || 0;
        if (cB !== cA) return cB - cA;

        const gA = gradeOrder[a.labGrade] || 0;
        const gB = gradeOrder[b.labGrade] || 0;
        return gB - gA;
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify(students),
    };
  } catch (err) {
    console.error("Error fetching rankings:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch rankings" }),
    };
  }
};
