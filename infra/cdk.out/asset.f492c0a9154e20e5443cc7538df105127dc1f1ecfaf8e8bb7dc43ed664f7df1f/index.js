var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
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

// ../backend/models/Demo.js
var Demo_exports = {};
async function createDemo(data = {}) {
  const id = data.id || crypto.randomUUID();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const item = {
    id,
    ...data,
    booked: data.booked ?? false,
    createdAt: now,
    updatedAt: now
  };
  await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
  return item;
}
async function listDemos() {
  const result = await ddb.send(new ScanCommand({ TableName: TABLE }));
  const items = (result.Items || []).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  return items;
}
async function markDemoBooked(demoId) {
  if (!demoId) throw new Error("demoId required");
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const params = {
    TableName: TABLE,
    Key: { id: demoId },
    UpdateExpression: "SET #booked = :true, #updatedAt = :now",
    ExpressionAttributeNames: {
      "#booked": "booked",
      "#updatedAt": "updatedAt"
    },
    ExpressionAttributeValues: {
      ":true": true,
      ":now": now
    },
    ReturnValues: "ALL_NEW"
  };
  const res = await ddb.send(new UpdateCommand(params));
  return res.Attributes ?? null;
}
var DynamoDBClient, DynamoDBDocumentClient, PutCommand, ScanCommand, UpdateCommand, crypto, REGION, TABLE, ddb;
var init_Demo = __esm({
  "../backend/models/Demo.js"() {
    ({ DynamoDBClient } = require("@aws-sdk/client-dynamodb"));
    ({
      DynamoDBDocumentClient,
      PutCommand,
      ScanCommand,
      UpdateCommand
    } = require("@aws-sdk/lib-dynamodb"));
    crypto = require("crypto");
    REGION = process.env.AWS_REGION || "us-east-1";
    TABLE = process.env.DEMO_TABLE_NAME;
    if (!TABLE) throw new Error("DEMO_TABLE_NAME env var is required");
    ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));
    module.exports = {
      createDemo,
      listDemos,
      markDemoBooked
    };
  }
});

// ../backend/routes/demo/createDemo.js
var { createDemo: createDemo2 } = (init_Demo(), __toCommonJS(Demo_exports));
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Max-Age": "86400"
      },
      body: ""
    };
  }
  try {
    const data = JSON.parse(event.body || "{}");
    const demo = await createDemo2(data);
    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: "Demo booked successfully.", demo })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ error: err.message })
    };
  }
};
