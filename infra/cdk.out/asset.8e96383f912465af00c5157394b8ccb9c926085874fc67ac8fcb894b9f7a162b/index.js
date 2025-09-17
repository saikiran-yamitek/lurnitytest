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

// ../backend/routes/companies/createCompany.js
var createCompany_exports = {};
__export(createCompany_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(createCompany_exports);

// ../backend/models/Company.js
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var client = new import_client_dynamodb.DynamoDBClient({ region: process.env.AWS_REGION });
var ddb = import_lib_dynamodb.DynamoDBDocumentClient.from(client);
var TABLE_NAME = process.env.COMPANY_TABLE_NAME;
async function createCompany(data) {
  const item = {
    id: data.id || crypto.randomUUID(),
    ...data
  };
  const command = new import_lib_dynamodb.PutCommand({
    TableName: TABLE_NAME,
    Item: item
  });
  await ddb.send(command);
  return item;
}

// ../backend/routes/companies/createCompany.js
var handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const newCompany = await createCompany(body);
    return {
      statusCode: 201,
      body: JSON.stringify(newCompany)
    };
  } catch (err) {
    console.error("\u274C Error creating company:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to create company." })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
