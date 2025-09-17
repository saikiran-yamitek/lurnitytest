// models/Course.js
// DynamoDB helpers for Course entity
// Requires: process.env.COURSE_TABLE_NAME
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";

const REGION = process.env.AWS_REGION || "us-east-1";
const TABLE = process.env.COURSE_TABLE_NAME;

if (!TABLE) throw new Error("COURSE_TABLE_NAME env var is required");

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

/* helper – calc total minutes from subCourses */
export function calcTotalMinutes(subs = []) {
  return (subs || []).reduce((sum, sc) => sum + (Number(sc.duration) || 0), 0);
}

/** Create course */
export async function createCourse(courseData = {}) {
  const id = courseData.id || crypto.randomUUID();
  const subCourses = courseData.subCourses || [];
  if (!courseData.overallDuration) {
    courseData.overallDuration = calcTotalMinutes(subCourses);
  }

  const item = {
    id,
    ...courseData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
  return item;
}

/** List courses with optional pagination */
export async function listCourses(opts = {}) {
  const params = {
    TableName: TABLE,
    Limit: opts.limit,
    ExclusiveStartKey: opts.lastKey,
  };

  const result = await ddb.send(new ScanCommand(params));
  return { items: result.Items || [], lastKey: result.LastEvaluatedKey };
}

/** Get course by id */
export async function getCourseById(courseId) {
  const res = await ddb.send(new GetCommand({ TableName: TABLE, Key: { id: courseId } }));
  return res.Item ?? null;
}

/** Update course */
export async function updateCourse(courseId, data = {}) {
  if (!courseId) throw new Error("courseId required");
  if (!data.overallDuration && data.subCourses) {
    data.overallDuration = calcTotalMinutes(data.subCourses);
  }

  const keys = Object.keys(data);
  if (keys.length === 0) return getCourseById(courseId);

  const exprParts = [];
  const exprAttrNames = {};
  const exprAttrValues = {};

  keys.forEach((k) => {
    exprParts.push(`#${k} = :${k}`);
    exprAttrNames[`#${k}`] = k;
    exprAttrValues[`:${k}`] = data[k];
  });

  exprParts.push("#updatedAt = :updatedAt");
  exprAttrNames["#updatedAt"] = "updatedAt";
  exprAttrValues[":updatedAt"] = new Date().toISOString();

  const params = {
    TableName: TABLE,
    Key: { id: courseId },
    UpdateExpression: `SET ${exprParts.join(", ")}`,
    ExpressionAttributeNames: exprAttrNames,
    ExpressionAttributeValues: exprAttrValues,
    ReturnValues: "ALL_NEW",
  };

  const res = await ddb.send(new UpdateCommand(params));
  return res.Attributes ?? null;
}

/** Delete course */
export async function deleteCourse(courseId) {
  await ddb.send(new DeleteCommand({ TableName: TABLE, Key: { id: courseId } }));
  return true;
}

export async function countCourses() {
  const res = await ddb.send(new ScanCommand({ TableName: TABLE, Select: "COUNT" }));
  return res.Count ?? 0;
}

export async function checkSubCourseExists(courseId, subCourseId) {
  const course = await getCourseById(courseId);
  if (!course || !course.subCourses) return false;
  return course.subCourses.some(sc => sc.id === subCourseId);
}

export async function findCourseById(courseId) {
  return getCourseById(courseId);
}


export default {
  calcTotalMinutes,
  createCourse,
  listCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  countCourses,
  checkSubCourseExists,
  findCourseById,
};

