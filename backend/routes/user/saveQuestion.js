import { saveQuestion } from "../../models/User.js";
import { handleOptionsRequest, createResponse } from "../../utils/cors.js";

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    console.log("📨 Raw event body:", event.body);
    
    const body = JSON.parse(event.body);
    console.log("📦 Parsed body:", JSON.stringify(body, null, 2));
    
    const { userId, question, correctAnswer } = body;
    
    console.log("🆔 userId:", userId, "(type:", typeof userId, ")");
    console.log("❓ question:", JSON.stringify(question, null, 2), "(type:", typeof question, ")");
    console.log("✅ correctAnswer:", JSON.stringify(correctAnswer, null, 2), "(type:", typeof correctAnswer, ")");
    
    // Check for undefined values in question object
    if (question && typeof question === 'object') {
      console.log("🔍 Checking question properties:");
      Object.entries(question).forEach(([key, value]) => {
        console.log(`   ${key}:`, value, "(type:", typeof value, ", undefined?", value === undefined, ")");
        
        // If value is an array or object, check its contents
        if (Array.isArray(value)) {
          console.log(`   ${key} array contents:`);
          value.forEach((item, index) => {
            console.log(`     [${index}]:`, item, "(type:", typeof item, ", undefined?", item === undefined, ")");
            if (item && typeof item === 'object') {
              Object.entries(item).forEach(([subKey, subValue]) => {
                console.log(`       ${subKey}:`, subValue, "(type:", typeof subValue, ", undefined?", subValue === undefined, ")");
              });
            }
          });
        } else if (value && typeof value === 'object') {
          console.log(`   ${key} object contents:`);
          Object.entries(value).forEach(([subKey, subValue]) => {
            console.log(`     ${subKey}:`, subValue, "(type:", typeof subValue, ", undefined?", subValue === undefined, ")");
          });
        }
      });
    }
    
    // Check for undefined values in correctAnswer object
    if (correctAnswer && typeof correctAnswer === 'object') {
      console.log("🔍 Checking correctAnswer properties:");
      Object.entries(correctAnswer).forEach(([key, value]) => {
        console.log(`   ${key}:`, value, "(type:", typeof value, ", undefined?", value === undefined, ")");
        
        // If value is an array or object, check its contents
        if (Array.isArray(value)) {
          console.log(`   ${key} array contents:`);
          value.forEach((item, index) => {
            console.log(`     [${index}]:`, item, "(type:", typeof item, ", undefined?", item === undefined, ")");
            if (item && typeof item === 'object') {
              Object.entries(item).forEach(([subKey, subValue]) => {
                console.log(`       ${subKey}:`, subValue, "(type:", typeof subValue, ", undefined?", subValue === undefined, ")");
              });
            }
          });
        } else if (value && typeof value === 'object') {
          console.log(`   ${key} object contents:`);
          Object.entries(value).forEach(([subKey, subValue]) => {
            console.log(`     ${subKey}:`, subValue, "(type:", typeof subValue, ", undefined?", subValue === undefined, ")");
          });
        }
      });
    }
    
    console.log("🚀 Calling saveQuestion with:", { userId, question, correctAnswer });
    
    await saveQuestion(userId, question, correctAnswer);
    
    console.log("✅ Question saved successfully");
    return createResponse(200, { msg: "Question saved" });
    
  } catch (err) {
    console.error("❌ Error saving question:", err);
    console.error("❌ Error message:", err.message);
    console.error("❌ Error stack:", err.stack);
    return createResponse(500, { msg: "Error saving question", error: err.message });
  }
};
