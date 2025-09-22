// routes/certificates/generateCertificate.js
import {
  createCertificate,findCertificateByUserSubCourse
} from "../../models/Certificate.js";
import { findCourseById ,doesSubCourseExist} from "../../models/Course.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { userId, courseId, subCourseTitle } = body;

    if (!userId || !courseId || !subCourseTitle) {
      return createResponse(400, { message: "Missing required fields." });
    }

    // Check for existing certificate
    const existing = await findCertificateByUserSubCourse(userId, subCourseTitle );
    if (existing) {
  return createResponse(200, {
    message: "Certificate already issued.",
    certificate: existing,
  });
}

// Validate course and subCourse
const course = await findCourseById(courseId);
if (!course) return createResponse(404, { message: "Course not found." });

const subCourseExists = await doesSubCourseExist(courseId, subCourseTitle);
if (!subCourseExists)
  return createResponse(400, { message: "Sub-course not found in course." });

// ⚠️ Corrected call: pass separate arguments
const cert = await createCertificate(userId, courseId, subCourseTitle);

return createResponse(201, { message: "Certificate issued.", certificate: cert });
    
  } catch (error) {
    console.error("❌ Certificate issue error:", error);
    return createResponse(500, { message: "Internal server error." });
  }
};
