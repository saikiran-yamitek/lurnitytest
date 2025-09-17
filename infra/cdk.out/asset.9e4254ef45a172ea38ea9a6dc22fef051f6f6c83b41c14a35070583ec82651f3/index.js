var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../backend/routes/certificates/checkCertificateExists.js
var checkCertificateExists_exports = {};
__export(checkCertificateExists_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(checkCertificateExists_exports);

// ../backend/models/Certificate.js
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var client = new import_client_dynamodb.DynamoDBClient({});
var docClient = import_lib_dynamodb.DynamoDBDocumentClient.from(client);
var TABLE_NAME = process.env.CERTIFICATE_TABLE_NAME;
async function checkCertificateExists(userId, subCourseTitle) {
  const result = await docClient.send(
    new import_lib_dynamodb.QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "userId-index",
      // ⚠️ Same GSI
      KeyConditionExpression: "userId = :u",
      ExpressionAttributeValues: {
        ":u": userId
      }
    })
  );
  return result.Items?.some((c) => c.subCourseTitle === subCourseTitle);
}

// ../backend/routes/certificates/checkCertificateExists.js
var handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { userId, subCourseTitle } = body;
    if (!userId || !subCourseTitle) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing fields" }) };
    }
    const exists = await checkCertificateExists({ userId, subCourseTitle });
    return {
      statusCode: 200,
      body: JSON.stringify({ exists })
    };
  } catch (err) {
    console.error("Error checking certificate existence:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error" })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
