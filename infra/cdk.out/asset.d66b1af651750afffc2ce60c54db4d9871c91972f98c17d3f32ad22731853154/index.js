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

// ../backend/routes/certificates/listCertificatesByUser.js
var listCertificatesByUser_exports = {};
__export(listCertificatesByUser_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(listCertificatesByUser_exports);

// ../backend/models/Certificate.js
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var client = new import_client_dynamodb.DynamoDBClient({});
var docClient = import_lib_dynamodb.DynamoDBDocumentClient.from(client);
var TABLE_NAME = process.env.CERTIFICATE_TABLE_NAME;
async function getCertificatesByUserId(userId) {
  const result = await docClient.send(
    new import_lib_dynamodb.QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "userId-index",
      // ⚠️ Add GSI on userId
      KeyConditionExpression: "userId = :u",
      ExpressionAttributeValues: {
        ":u": userId
      }
    })
  );
  return result.Items || [];
}

// ../backend/routes/certificates/listCertificatesByUser.js
var handler = async (event) => {
  try {
    const userId = event.pathParameters?.userId;
    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ error: "User ID required" }) };
    }
    const certs = await getCertificatesByUserId(userId);
    return {
      statusCode: 200,
      body: JSON.stringify(certs)
    };
  } catch (err) {
    console.error("Error fetching certificates for user:", err);
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
