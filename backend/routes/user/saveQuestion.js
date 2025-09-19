import { saveQuestion } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    console.log("📨 Raw event body:", event.body);
    
    const body = JSON.parse(event.body);
    console.log("📦 Parsed body:", JSON.stringify(body, null, 2));
    
    // ✅ Fix: Extract correctOption (not correctAnswer)
    const { userId, question, correctOption, options } = body;
    
    console.log("🆔 userId:", userId, "(type:", typeof userId, ")");
    console.log("❓ question:", JSON.stringify(question, null, 2), "(type:", typeof question, ")");
    console.log("✅ correctOption:", JSON.stringify(correctOption, null, 2), "(type:", typeof correctOption, ")");
    console.log("📝 options:", JSON.stringify(options, null, 2), "(type:", typeof options, ")");
    
    // Check for undefined values
    if (userId === undefined) console.log("⚠️ userId is undefined!");
    if (question === undefined) console.log("⚠️ question is undefined!");
    if (correctOption === undefined) console.log("⚠️ correctOption is undefined!");
    if (options === undefined) console.log("⚠️ options is undefined!");
    
    console.log("🚀 Calling saveQuestion with:", { userId, question, correctAnswer: correctOption });
    
    // ✅ Pass correctOption as correctAnswer to maintain your saveQuestion function
    await saveQuestion(userId, question, correctOption);
    
    console.log("✅ Question saved successfully");
    return createResponse(200, { msg: "Question saved" });
    
  } catch (err) {
    console.error("❌ Error saving question:", err);
    console.error("❌ Error message:", err.message);
    console.error("❌ Error stack:", err.stack);
    return createResponse(500, { msg: "Error saving question", error: err.message });
  }
};

