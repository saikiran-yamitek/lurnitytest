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

// ../backend/routes/companies/updateCompany.js
var updateCompany_exports = {};
__export(updateCompany_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(updateCompany_exports);

// ../backend/models/Company.js
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var client = new import_client_dynamodb.DynamoDBClient({ region: process.env.AWS_REGION });
var ddb = import_lib_dynamodb.DynamoDBDocumentClient.from(client);
var TABLE_NAME = process.env.COMPANY_TABLE_NAME;
async function updateCompany(id, data) {
  const updateExpression = [];
  const expressionAttributeValues = {};
  for (const [key, value] of Object.entries(data)) {
    updateExpression.push(`#${key} = :${key}`);
    expressionAttributeValues[`:${key}`] = value;
  }
  const command = new import_lib_dynamodb.UpdateCommand({
    TableName: TABLE_NAME,
    Key: { id },
    UpdateExpression: `SET ${updateExpression.join(", ")}`,
    ExpressionAttributeNames: Object.keys(data).reduce(
      (acc, key) => ({ ...acc, [`#${key}`]: key }),
      {}
    ),
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "ALL_NEW"
  });
  const response = await ddb.send(command);
  return response.Attributes;
}

// ../backend/routes/companies/updateCompany.js
var handler = async (event) => {
  try {
    const { id } = event.pathParameters;
    const body = JSON.parse(event.body);
    const updatedCompany = await updateCompany(id, body);
    if (!updatedCompany) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Company not found." })
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(updatedCompany)
    };
  } catch (err) {
    console.error("\u274C Error updating company:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to update company." })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
