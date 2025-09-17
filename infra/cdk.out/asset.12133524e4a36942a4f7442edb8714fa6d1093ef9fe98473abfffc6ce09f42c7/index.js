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

// ../backend/routes/admin/listUserTransactions.js
var listUserTransactions_exports = {};
__export(listUserTransactions_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(listUserTransactions_exports);

// ../backend/models/Transaction.js
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var REGION = process.env.AWS_REGION || "us-east-1";
var TABLE = process.env.TRANSACTION_TABLE_NAME;
var USER_TABLE = process.env.USER_TABLE_NAME;
if (!TABLE) throw new Error("TRANSACTION_TABLE_NAME env var is required");
if (!USER_TABLE) throw new Error("USER_TABLE_NAME env var is required");
var ddb = import_lib_dynamodb.DynamoDBDocumentClient.from(new import_client_dynamodb.DynamoDBClient({ region: REGION }));
async function listTransactionsByUser(userId, opts = {}) {
  const params = {
    TableName: TABLE,
    IndexName: "userId-index",
    // ensure you create this GSI in CDK (partitionKey userId, sortKey date maybe)
    KeyConditionExpression: "userId = :uid",
    ExpressionAttributeValues: { ":uid": userId },
    ScanIndexForward: false,
    // latest first if sort key is date
    Limit: opts.limit,
    ExclusiveStartKey: opts.lastKey
  };
  const result = await ddb.send(new import_lib_dynamodb.QueryCommand(params));
  return { items: result.Items || [], lastKey: result.LastEvaluatedKey };
}

// ../backend/routes/admin/listUserTransactions.js
var handler = async (event) => {
  try {
    const userId = event.pathParameters?.id;
    if (!userId) return { statusCode: 400, body: JSON.stringify({ error: "user id required" }) };
    const qs = event.queryStringParameters || {};
    const limit = qs.limit ? Number(qs.limit) : void 0;
    const lastKey = qs.lastKey ? JSON.parse(decodeURIComponent(qs.lastKey)) : void 0;
    const res = await listTransactionsByUser(userId, { limit, lastKey });
    return { statusCode: 200, body: JSON.stringify(res) };
  } catch (err) {
    console.error("listUserTransactions error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
