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

// ../backend/routes/demo/listDemos.js
var listDemos_exports = {};
__export(listDemos_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(listDemos_exports);

// ../backend/models/Demo.js
var { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
var {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  UpdateCommand
} = require("@aws-sdk/lib-dynamodb");
var crypto = require("crypto");
var REGION = process.env.AWS_REGION || "us-east-1";
var TABLE = process.env.DEMO_TABLE_NAME;
if (!TABLE) throw new Error("DEMO_TABLE_NAME env var is required");
var ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));
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
module.exports = {
  createDemo,
  listDemos,
  markDemoBooked
};

// ../backend/routes/demo/listDemos.js
var handler = async () => {
  try {
    const demos = await (void 0)();
    return {
      statusCode: 200,
      body: JSON.stringify(demos)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
