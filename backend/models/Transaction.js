// models/Transaction.js
// DynamoDB helpers for transactions and transactional updates with user balances.
// Requires: process.env.TRANSACTION_TABLE_NAME and process.env.USER_TABLE_NAME
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  ScanCommand,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";

const REGION = process.env.AWS_REGION || "us-east-1";
const TABLE = process.env.TRANSACTION_TABLE_NAME;
const USER_TABLE = process.env.USER_TABLE_NAME;

if (!TABLE) throw new Error("TRANSACTION_TABLE_NAME env var is required");
if (!USER_TABLE) throw new Error("USER_TABLE_NAME env var is required");

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

/** Create a transaction record (non-transactional) */
export async function createTransaction({ userId, amount, mode, date, meta = {} }) {
  if (!userId) throw new Error("userId required");
  const id = crypto.randomUUID();
  const item = {
    id,
    userId,
    amount: Number(amount || 0),
    mode: mode || "unknown",
    date: date || new Date().toISOString(),
    meta,
    createdAt: new Date().toISOString(),
  };

  await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
  return item;
}

/**
 * List transactions by userId (assumes table is keyed or has GSI by userId).
 * If your table's partition key is id, you must create a GSI with partition key userId.
 * opts: { limit?, lastKey? }
 * returns { items, lastKey }
 */
export async function listTransactionsByUser(userId, opts = {}) {
  // Query by userId - expects a GSI named "userId-index" or similar.
  // Adjust IndexName to match your GSI.
  const params = {
    TableName: TABLE,
    IndexName: "userId-index", // ensure you create this GSI in CDK (partitionKey userId, sortKey date maybe)
    KeyConditionExpression: "userId = :uid",
    ExpressionAttributeValues: { ":uid": userId },
    ScanIndexForward: false, // latest first if sort key is date
    Limit: opts.limit,
    ExclusiveStartKey: opts.lastKey,
  };

  const result = await ddb.send(new QueryCommand(params));
  return { items: result.Items || [], lastKey: result.LastEvaluatedKey };
}

/**
 * Create transaction and atomically update user's amountPaid.
 * Uses TransactWrite to guarantee both operations succeed or fail together.
 * txn = { userId, amount, mode, date, meta }
 */
export async function createTransactionAndApply(txn) {
  if (!txn || !txn.userId) throw new Error("txn.userId required");
  const txId = crypto.randomUUID();
  const transactionItem = {
    id: txId,
    userId: txn.userId,
    amount: Number(txn.amount || 0),
    mode: txn.mode || "unknown",
    date: txn.date || new Date().toISOString(),
    meta: txn.meta || {},
    createdAt: new Date().toISOString(),
  };

  // Transaction: Put transaction, Update user.amountPaid
  const transactParams = {
    TransactItems: [
      {
        Put: {
          TableName: TABLE,
          Item: transactionItem,
        },
      },
      {
        Update: {
          TableName: USER_TABLE,
          Key: { id: txn.userId },
          UpdateExpression: "SET amountPaid = if_not_exists(amountPaid, :zero) + :delta, updatedAt = :updatedAt",
          ExpressionAttributeValues: {
            ":zero": 0,
            ":delta": transactionItem.amount,
            ":updatedAt": new Date().toISOString(),
          },
          // Optionally add ConditionExpression to ensure user exists:
          // ConditionExpression: "attribute_exists(id)"
        },
      },
    ],
  };

  await ddb.send(new TransactWriteCommand(transactParams));

  return { transaction: transactionItem };
}

/**
 * Calculate total revenue by scanning transactions (costly at scale).
 * Returns number.
 */
export async function calculateTotalRevenue() {
  let total = 0;
  let ExclusiveStartKey = undefined;

  do {
    const params = {
      TableName: TABLE,
      ExclusiveStartKey,
      ProjectionExpression: "amount",
    };
    const res = await ddb.send(new ScanCommand(params));
    (res.Items || []).forEach((it) => {
      const amt = Number(it.amount || 0);
      total += amt;
    });
    ExclusiveStartKey = res.LastEvaluatedKey;
  } while (ExclusiveStartKey);

  return total;
}

export default {
  createTransaction,
  listTransactionsByUser,
  createTransactionAndApply,
  calculateTotalRevenue,
};
