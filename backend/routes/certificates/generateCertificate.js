// routes/certificates/generateCertificate.js
import {
  findCertificate,
  createCertificate,
} from "../../models/Certificate.js";
import { findCourseById, checkSubCourseExists } from "../../models/Course.js";

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { userId, courseId, subCourseTitle } = body;

    if (!userId || !courseId || !subCourseTitle) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required fields." }),
      };
    }

    // Check for existing certificate
    const existing = await findCertificate({ userId, courseId, subCourseTitle });
    if (existing) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Certificate already issued.",
          certificate: existing,
        }),
      };
    }

    // Validate course and subCourse
    const course = await findCourseById(courseId);
    if (!course) {
      return { statusCode: 404, body: JSON.stringify({ message: "Course not found." }) };
    }

    const subCourseExists = await checkSubCourseExists(courseId, subCourseTitle);
    if (!subCourseExists) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Sub-course not found in course." }),
      };
    }

    // Create certificate
    const cert = await createCertificate({ userId, courseId, subCourseTitle });

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Certificate issued.", certificate: cert }),
    };
  } catch (error) {
    console.error("❌ Certificate issue error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error." }),
    };
  }
};
