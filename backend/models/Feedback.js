// helpers/Feedback.js
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  DeleteCommand
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddb = DynamoDBDocumentClient.from(client);

const FEEDBACK_TABLE = process.env.FEEDBACK_TABLE_NAME;

/**
 * Create new feedback entry
 */
export async function createFeedback({ userId, courseId, subIndex, videoIndex, rating, comment }) {
  const item = {
    id: Date.now().toString(), // or use uuid
    userId,
    courseId,
    subIndex,
    videoIndex,
    rating,
    comment,
    createdAt: new Date().toISOString()
  };

  await ddb.send(new PutCommand({
    TableName: FEEDBACK_TABLE,
    Item: item
  }));

  return item;
}

/**
 * List all feedback entries
 */
export async function listFeedbacks() {
  const result = await ddb.send(new ScanCommand({
    TableName: FEEDBACK_TABLE
  }));

  return result.Items || [];
}

/**
 * Delete feedback by id
 */
export async function deleteFeedback(id) {
  await ddb.send(new DeleteCommand({
    TableName: FEEDBACK_TABLE,
    Key: { id }
  }));
  return { message: "Feedback deleted" };
}
