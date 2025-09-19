import { createRequire } from 'module'; globalThis.require = createRequire(import.meta.url);

// ../backend/routes/user/getPracticeHistory.js
var handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return handleOptionsRequest();
  }
  try {
    const userId = event.pathParameters?.id;
    if (!userId) return createResponse(400, { msg: "userId required" });
    const body = event.body ? JSON.parse(event.body) : {};
    const { courseId, subIdx, vidIdx } = body;
    const history = await getPracticeHistory(userId, courseId, subIdx, vidIdx);
    return createResponse(200, history);
  } catch (err) {
    return createResponse(500, { msg: "Error fetching practice history", error: err.message });
  }
};
export {
  handler
};
