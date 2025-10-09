// models/User.js

// --------- Imports ---------
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import crypto from 'crypto';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";


// --------- Config ---------
const REGION = process.env.AWS_REGION || "us-east-1";
const TABLE = process.env.USER_TABLE_NAME || "User"; // fallback to "User" like new.js
const FORGOT_TABLE = process.env.FORGOT_TABLE_NAME || 'ForgotPassword';
const OTP_DIGITS = parseInt(process.env.OTP_DIGITS || '6', 10);
const OTP_TTL_SECONDS = parseInt(process.env.OTP_TTL_SECONDS || '600', 10);  // 10 min
const RESET_WINDOW_SECONDS = parseInt(process.env.RESET_WINDOW_SECONDS || '600', 10);
const SES_FROM = process.env.SES_FROM;
const SES_CONFIG_SET = process.env.SES_CONFIG_SET; // optional

const sesClient = new SESClient({ region: REGION });
const snsClient = new SNSClient({ region: REGION });


if (!TABLE) {
  throw new Error("USER_TABLE_NAME env var is required");
}

const client = new DynamoDBClient({ region: REGION });
const ddb = DynamoDBDocumentClient.from(client);
const JWT_SECRET = process.env.JWT_SECRET || "secretKey";

const GOOGLE_CLIENT_ID =
  "322821846367-514od8575kmib97gji4q88ntskndmo9b.apps.googleusercontent.com";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ===================================================
// ---------------- NEW USER.JS HELPERS --------------
// ===================================================

// Registration
export const findUserByEmail = async (email) => {
  const cmd = new QueryCommand({
    TableName: TABLE,
    IndexName: "email-index", // requires GSI on email
    KeyConditionExpression: "email = :e",
    ExpressionAttributeValues: { ":e": email },
  });
  const res = await ddb.send(cmd);
  return res.Items?.[0] || null;
};

export const findUserByPhone = async (phoneE164) => {
  const cmd = new QueryCommand({
    TableName: TABLE,
    IndexName: "phone-index",
    KeyConditionExpression: "phone = :p",
    ExpressionAttributeValues: { ":p": phoneE164 },
    Limit: 1
  });
  const res = await ddb.send(cmd);
  return res.Items?.[0] || null;
};

export const createUser = async (userData) => {
  const hashed = await bcrypt.hash(userData.password, 10);
  const item = {
    ...userData,
    password: hashed,
    role: "user",
    status: "active",
    createdAt: new Date().toISOString(),
  };
  await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
  return item;
};

// Find by ID
export const getUserById = async (userId) => {
  const res = await ddb.send(
    new GetCommand({ TableName: TABLE, Key: { id: userId } })
  );
  return res.Item || null;
};

// ✅ Verify token & get user
export const getUserFromToken = async (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return await getUserById(decoded.id);
  } catch (err) {
    console.error("Invalid token:", err);
    return null;
  }
};

// ✅ Get Judge0 Key
export const getUserJudge0Key = async (userId) => {
  const user = await getUserById(userId);
  return user?.judge0Key || "";
};

// ✅ Update Judge0 Key
export const updateUserJudge0Key = async (userId, key) => {
  const params = {
    TableName: TABLE,
    Key: { id: userId },
    UpdateExpression: "SET #judge0Key = :key, #updatedAt = :updatedAt",
    ExpressionAttributeNames: {
      "#judge0Key": "judge0Key",
      "#updatedAt": "updatedAt",
    },
    ExpressionAttributeValues: {
      ":key": key.trim(),
      ":updatedAt": new Date().toISOString(),
    },
    ReturnValues: "ALL_NEW",
  };

  const result = await ddb.send(new UpdateCommand(params));
  return result.Attributes;
};

// Resume Data
export const getResumeData = async (userId) => {
  return await getUserById(userId);
};

// Completed Subcourses
export const addCompletedSubcourse = async (userId, subCourseTitle) => {
  const res = await ddb.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { id: userId },
      UpdateExpression:
        "SET completedSubcourses = list_append(if_not_exists(completedSubcourses, :empty), :s)",
      ConditionExpression:
        "attribute_not_exists(completedSubcourses) OR NOT contains(completedSubcourses, :sub)",
      ExpressionAttributeValues: {
        ":s": [subCourseTitle],
        ":sub": subCourseTitle,
        ":empty": [],
      },
      ReturnValues: "ALL_NEW",
    })
  );
  return res.Attributes;
};

// Alerts
export const setUserAlert = async (email, alert) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("User not found");

  await ddb.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { id: user.id },
      UpdateExpression: "SET alertAvailable = :a",
      ExpressionAttributeValues: { ":a": alert },
    })
  );
  return { success: true };
};

// Profile Update
export const updateUserProfile = async (userId, updateFields) => {
  const exprs = [];
  const values = {};
  for (const key in updateFields) {
    exprs.push(`#${key} = :${key}`);
    values[`:${key}`] = updateFields[key];
  }

  const res = await ddb.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { id: userId },
      UpdateExpression: `SET ${exprs.join(", ")}`,
      ExpressionAttributeValues: values,
      ExpressionAttributeNames: Object.keys(updateFields).reduce(
        (acc, k) => ({ ...acc, [`#${k}`]: k }),
        {}
      ),
      ReturnValues: "ALL_NEW",
    })
  );
  return res.Attributes;
};

// Projects
export const updateProjects = async (userId, projects) => {
  const res = await ddb.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { id: userId },
      UpdateExpression: "SET projects = :p",
      ExpressionAttributeValues: { ":p": projects },
      ReturnValues: "ALL_NEW",
    })
  );
  return res.Attributes;
};

// Practice Results
export const addPracticeResult = async (userId, result) => {
  const res = await ddb.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { id: userId },
      UpdateExpression:
        "SET practiceHistory = list_append(if_not_exists(practiceHistory, :empty), :r)",
      ExpressionAttributeValues: {
        ":r": [result],
        ":empty": [],
      },
      ReturnValues: "ALL_NEW",
    })
  );
  return res.Attributes.practiceHistory;
};

export const getPracticeHistory = async ({ userId, courseId, subIdx, vidIdx }) => {
  const user = await getUserById(userId);
  let history = user?.practiceHistory || [];

  // Optional: filter based on provided parameters
  if (courseId !== undefined) history = history.filter(h => h.courseId === courseId);
  if (subIdx !== undefined) history = history.filter(h => h.subIdx === subIdx);
  if (vidIdx !== undefined) history = history.filter(h => h.vidIdx === vidIdx);

  return history;
};


// Streaks
export const getStreakData = async (userId) => {
  const user = await getUserById(userId);
  return user?.streakData || null;
};

export const updateStreakData = async (userId, streakData) => {
  const res = await ddb.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { id: userId },
      UpdateExpression: "SET streakData = :s",
      ExpressionAttributeValues: { ":s": streakData },
      ReturnValues: "ALL_NEW",
    })
  );
  return res.Attributes.streakData;
};

// Course Completion
export const updateCourseCompletion = async (userId, courseCompletion) => {
  const res = await ddb.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { id: userId },
      UpdateExpression: "SET courseCompletion = :c",
      ExpressionAttributeValues: { ":c": courseCompletion },
      ReturnValues: "ALL_NEW",
    })
  );
  return res.Attributes;
};

// Saved Questions
export const saveQuestion = async (userId, question, correctAnswer) => {
  console.log("💾 Original userId:", userId, "type:", typeof userId);
  
  const userIdStr = String(userId);
  console.log("🔧 Converted userId:", userIdStr);
  
  await ddb.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { id: userIdStr }, // ← Always use string
      UpdateExpression:
        "SET savedQuestions = list_append(if_not_exists(savedQuestions, :empty), :q)",
      ExpressionAttributeValues: {
        ":q": [{ question, correctAnswer }],
        ":empty": [],
      },
      ReturnValues: "ALL_NEW",
    })
  );
  console.log("✅ Question saved successfully for user:", userIdStr);
};


export const getSavedQuestions = async (userId) => {
  const user = await getUserById(userId);
  return user?.savedQuestions || [];
};

// ✅ NEW HELPERS for login & google-login

// Verify password
export const verifyUserPassword = async (user, plainPassword) => {
  return bcrypt.compare(plainPassword, user.password);
};

// Check suspension / ban status
export const isUserSuspendedOrBanned = (user) => {
  if (user.status === "suspended") {
    return {
      blocked: true,
      message: "Your account is suspended. Please contact support.",
    };
  }
  if (user.status === "banned") {
    return { blocked: true, message: "This account has been banned." };
  }
  return { blocked: false };
};

// Generate JWT
export const generateJwtToken = (payload, expiresIn = "1d") => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

// Verify Google ID token
export const verifyGoogleIdToken = async (token) => {
  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
};

// ===================================================
// ---------------- OLD USER.JS HELPERS --------------
// ===================================================

// List users with optional pagination
export async function listUsers(opts = {}) {
  const params = {
    TableName: TABLE,
    Limit: opts.limit,
    ExclusiveStartKey: opts.lastKey,
  };

  const result = await ddb.send(new ScanCommand(params));
  return {
    items: result.Items || [],
    lastKey: result.LastEvaluatedKey,
  };
}

// Alias for route compatibility
export async function findUserById(userId) {
  return getUserById(userId);
}

// Update user fields (generic)
export async function updateUser(userId, updateFields = {}) {
  if (!userId) throw new Error("userId is required");

  // ❌ Strip reserved/auto-managed fields
  const { id, createdAt, updatedAt, ...safeFields } = updateFields;

  // ✅ Fix: normalize numeric fields
  if ("learningHours" in safeFields) {
    safeFields.learningHours = Number(safeFields.learningHours);
  }

  const keys = Object.keys(safeFields);
  if (keys.length === 0) return getUserById(userId);

  const exprParts = [];
  const exprAttrNames = {};
  const exprAttrValues = {};

  keys.forEach((k) => {
    exprParts.push(`#${k} = :${k}`);
    exprAttrNames[`#${k}`] = k;
    exprAttrValues[`:${k}`] = safeFields[k];
  });

  // ✅ Add updatedAt only once (server-side)
  exprParts.push("#updatedAt = :updatedAt");
  exprAttrNames["#updatedAt"] = "updatedAt";
  exprAttrValues[":updatedAt"] = new Date().toISOString();

  const params = {
    TableName: TABLE,
    Key: { id: userId },
    UpdateExpression: `SET ${exprParts.join(", ")}`,
    ExpressionAttributeNames: exprAttrNames,
    ExpressionAttributeValues: exprAttrValues,
    ReturnValues: "ALL_NEW",
  };

  console.log("🛠 Final update params:", JSON.stringify(params, null, 2)); // <--- Debug

  const result = await ddb.send(new UpdateCommand(params));
  return result.Attributes ?? null;
}



// Delete a user
export async function deleteUser(userId) {
  const params = { TableName: TABLE, Key: { id: userId } };
  await ddb.send(new DeleteCommand(params));
  return true;
}

// Lock profile
export async function setUserLockStatus(userId, lockStatus) {
  return updateUser(userId, { profileLock: lockStatus });
}

// Atomically update amountPaid
export async function updateUserAmountPaid(userId, amountDelta) {
  if (typeof amountDelta !== "number") {
    amountDelta = Number(amountDelta);
    if (Number.isNaN(amountDelta)) throw new Error("amountDelta must be a number");
  }

  const params = {
    TableName: TABLE,
    Key: { id: userId },
    UpdateExpression:
      "SET amountPaid = if_not_exists(amountPaid, :zero) + :delta, updatedAt = :updatedAt",
    ExpressionAttributeValues: {
      ":zero": 0,
      ":delta": amountDelta,
      ":updatedAt": new Date().toISOString(),
    },
    ReturnValues: "ALL_NEW",
  };

  const result = await ddb.send(new UpdateCommand(params));
  return result.Attributes ?? null;
}

// Count users
export async function countUsers() {
  const params = { TableName: TABLE, Select: "COUNT" };
  const result = await ddb.send(new ScanCommand(params));
  return result.Count || 0;
}

// Get user name only
export async function getUserName(userId) {
  const params = {
    TableName: TABLE,
    Key: { id: userId },
    ProjectionExpression: "#nm", // alias instead of reserved word
    ExpressionAttributeNames: {
      "#nm": "name",
    },
  };

  const result = await ddb.send(new GetCommand(params));
  return result.Item ? result.Item.name : null;
}

// Push ticketId
export async function addTicketToUser(userId, ticketId) {
  const params = {
    TableName: TABLE,
    Key: { id: userId },
    UpdateExpression:
      "SET ticketIds = list_append(if_not_exists(ticketIds, :empty), :t), updatedAt = :updatedAt",
    ExpressionAttributeValues: {
      ":empty": [],
      ":t": [ticketId],
      ":updatedAt": new Date().toISOString(),
    },
    ReturnValues: "ALL_NEW",
  };

  const result = await ddb.send(new UpdateCommand(params));
  return result.Attributes ?? null;
}

// Update lastSeenResolvedTicketId
export async function setLastResolvedTicket(userEmail, ticketId) {
  // 1️⃣ Query user table by email (GSI)
  const userResult = await ddb.send(new QueryCommand({
    TableName: TABLE,
    IndexName: "email-index",
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: { ":email": userEmail },
    Limit: 1
  }));

  if (!userResult.Items?.length) {
    console.error("User not found for email:", userEmail);
    return null;
  }

  const userId = userResult.Items[0].id;

  // 2️⃣ Update the user by id (PK)
  const updateResult = await ddb.send(new UpdateCommand({
    TableName: TABLE,
    Key: { id: userId },
    UpdateExpression: "SET lastSeenResolvedTicketId = :tid, updatedAt = :updatedAt",
    ExpressionAttributeValues: {
      ":tid": ticketId,
      ":updatedAt": new Date().toISOString()
    },
    ReturnValues: "ALL_NEW"
  }));

  return updateResult.Attributes ?? null;
}

// Progress-related helpers
export async function getWatchedVideos(userId) {
  if (!userId) throw new Error("userId required");
  const res = await ddb.send(
    new GetCommand({
      TableName: TABLE,
      Key: { id: userId },
      ProjectionExpression: "watchedVideos",
    })
  );
  return (res.Item && res.Item.watchedVideos) || [];
}

export async function addWatchedVideo(userId, videoId) {
  if (!userId) throw new Error("userId required");
  if (!videoId) throw new Error("videoId required");

  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");

  const current = user.watchedVideos || [];
  if (current.includes(videoId)) {
    return { ok: true, alreadyPresent: true };
  }

  const newArr = [...current, videoId];
  const updated = await updateUser(userId, { watchedVideos: newArr });
  return { ok: true, updated };
}

// JWT helper
export function verifyJwt(token) {
  if (!token) throw new Error("token required");
  return jwt.verify(token, JWT_SECRET);
}




export async function saveUserGeminiKey(userId, geminiApiKey) {
  await ddb.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { id: userId },
      UpdateExpression: "SET geminiApiKey = :k, updatedAt = :u",
      ExpressionAttributeValues: {
        ":k": geminiApiKey,
        ":u": new Date().toISOString()
      },
      ReturnValues: "ALL_NEW",
    })
  );
  return { message: "Gemini API key saved successfully" };
}


/**
 * Fetch Gemini API key for a user
 */
export async function getUserGeminiKey(userId) {
  const res = await ddb.send(
    new GetCommand({
      TableName: TABLE,
      Key: { id: userId },
      ProjectionExpression: "geminiApiKey",
    })
  );
  return res.Item ? res.Item.geminiApiKey : null;
}

/**
 * Generate mock interview questions using Gemini API
 */
export async function generateMockQuestions(companyName, skills = [], userName = "Candidate", geminiApiKey) {
  if (!geminiApiKey) throw new Error("Missing geminiApiKey");
  if (!companyName) throw new Error("Missing companyName");

  const skillsList = Array.isArray(skills) ? skills.filter(Boolean).slice(0, 12) : [];
  const skillLine = skillsList.length
    ? `Skills: ${skillsList.join(", ")}`
    : "Skills: general software engineering";

  const systemPrompt = `
You are generating a 30-question mock interview for a candidate applying to ${companyName}.
Candidate name: ${userName}.
${skillLine}.

Output requirements (STRICT):
- Output MUST be a single JSON object only. Do NOT include backticks, markdown code fences, or any prose outside the JSON.
- JSON shape MUST be exactly:
{
  "questions": [
    {
      "id": "string-unique",
      "type": "technical" | "scenario" | "best",
      "question": "string",
      "options": ["A", "B", "C", "D"], 
      "answer": "string",              
      "difficulty": "easy" | "medium" | "hard",
      "skillTag": "string (optional for technical)",
      "rationale": "string (brief explanation)"
    },
    ... 30 total objects ...
  ]
}

Content constraints:
- Exactly 30 questions:
  - 20 technical tailored to the candidate's skills
  - 5 scenario/behavioral
  - 5 best/challenging
- Difficulty distribution: ~30% easy, ~50% medium, ~20% hard.
`;

  const geminiUrl =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
    ],
  };

  const r = await fetch(`${geminiUrl}?key=${encodeURIComponent(geminiApiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Gemini API error: ${txt}`);
  }

  const data = await r.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Extract and sanitize JSON
  const extractJson = (raw) => {
    if (!raw || typeof raw !== "string") return null;
    let s = raw.trim();
    s = s.replace(/\u200b|\u200c|\u200d|\ufeff|\xa0/g, "");
    const start = s.indexOf("{");
    const end = s.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      s = s.slice(start, end + 1).trim();
    }
    s = s.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  };

  let parsed = extractJson(text);
  if (!parsed || !Array.isArray(parsed.questions)) {
    throw new Error("Model did not return valid JSON");
  }

  // Ensure exactly 30
  if (parsed.questions.length !== 30) {
    parsed.questions = parsed.questions.slice(0, 30);
  }

  return parsed.questions.map((q, idx) => ({
    id: String(q?.id ?? `q_${idx + 1}`),
    type:
      q?.type === "technical" || q?.type === "scenario" || q?.type === "best"
        ? q.type
        : "technical",
    question: String(q?.question ?? "").slice(0, 1000),
    options: Array.isArray(q?.options)
      ? q.options.slice(0, 4).map((o) => String(o).slice(0, 200))
      : undefined,
    answer: q?.answer ? String(q.answer).slice(0, 1200) : "",
    difficulty:
      q?.difficulty === "easy" || q?.difficulty === "medium" || q?.difficulty === "hard"
        ? q.difficulty
        : "medium",
    skillTag: q?.skillTag ? String(q.skillTag).slice(0, 60) : undefined,
    rationale: q?.rationale ? String(q.rationale).slice(0, 1200) : "",
  }));
}


// ===== Forgot-password OTP helpers (stored in the same models/User.js) =====

function nowEpoch() { return Math.floor(Date.now() / 1000); }

function genOtp(len = OTP_DIGITS) {
  const n = crypto.randomInt(0, 10 ** len);
  return n.toString().padStart(len, '0');
}

function hashOtp(code, salt) {
  return crypto.createHmac('sha256', salt).update(code).digest('hex');
}

function timingEqHex(hexA, hexB) {
  const a = Buffer.from(hexA, 'hex');
  const b = Buffer.from(hexB, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Create an OTP bundle and store hashed values in ForgotPassword table.
 */
export async function fpCreateAndStoreOtps({ requestId, userId }) {
  const emailCode = genOtp();
  const emailSalt = crypto.randomBytes(16).toString('hex');
  const emailHash = hashOtp(emailCode, emailSalt);

  const smsCode = genOtp();
  const smsSalt = crypto.randomBytes(16).toString('hex');
  const smsHash = hashOtp(smsCode, smsSalt);

  const exp = nowEpoch() + OTP_TTL_SECONDS;

  const item = {
    requestId,
    userId,
    emailHash,
    emailSalt,
    emailExpiresAt: exp,
    emailVerified: false,
    smsHash,
    smsSalt,
    smsExpiresAt: exp,
    smsVerified: false,
    attemptsEmail: 0,
    attemptsSms: 0,
    bothVerified: false,
    expiresAt: Math.max(exp, exp) + RESET_WINDOW_SECONDS, // table TTL
  };

  await ddb.send(new PutCommand({ TableName: FORGOT_TABLE, Item: item }));

  // Return raw codes for channel delivery
  return { emailCode, smsCode };
}

export async function fpSendEmailOtp(to, code) {
  const params = {
    Source: SES_FROM,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: 'Your Lurnity password reset code', Charset: 'UTF-8' },
      Body: {
        Text: {
          Data: `Your OTP is ${code}. It expires in ${Math.floor(OTP_TTL_SECONDS/60)} minutes. If not requested, ignore this message.`,
          Charset: 'UTF-8',
        },
      },
    },
    ...(SES_CONFIG_SET ? { ConfigurationSetName: SES_CONFIG_SET } : {}),
  };
  await sesClient.send(new SendEmailCommand(params));
}

export async function fpSendSmsOtp(phoneE164, code) {
  const message = `Lurnity OTP: ${code}. Expires in ${Math.floor(OTP_TTL_SECONDS/60)} minutes.`;
  await snsClient.send(new PublishCommand({ PhoneNumber: phoneE164, Message: message }));
}

export async function fpGetRequest(requestId) {
  const res = await ddb.send(new GetCommand({ TableName: FORGOT_TABLE, Key: { requestId } }));
  return res.Item;
}

export async function fpVerifyChannel({ request, channel, code }) {
  const now = nowEpoch();
  if (channel === 'email') {
    if (request.emailVerified) return { ok: true };
    if (now > request.emailExpiresAt) return { ok: false, reason: 'expired' };
    const computed = hashOtp(code, request.emailSalt);
    const ok = timingEqHex(request.emailHash, computed);
    const attempts = (request.attemptsEmail || 0) + 1;
    if (!ok && attempts >= 5) return { ok: false, reason: 'locked' };
    await ddb.send(new UpdateCommand({
      TableName: FORGOT_TABLE,
      Key: { requestId: request.requestId },
      UpdateExpression: ok ? 'SET emailVerified = :t' : 'SET attemptsEmail = :a',
      ExpressionAttributeValues: ok ? { ':t': true } : { ':a': attempts },
    }));
    return { ok };
  } else {
    if (request.smsVerified) return { ok: true };
    if (now > request.smsExpiresAt) return { ok: false, reason: 'expired' };
    const computed = hashOtp(code, request.smsSalt);
    const ok = timingEqHex(request.smsHash, computed);
    const attempts = (request.attemptsSms || 0) + 1;
    if (!ok && attempts >= 5) return { ok: false, reason: 'locked' };
    await ddb.send(new UpdateCommand({
      TableName: FORGOT_TABLE,
      Key: { requestId: request.requestId },
      UpdateExpression: ok ? 'SET smsVerified = :t' : 'SET attemptsSms = :a',
      ExpressionAttributeValues: ok ? { ':t': true } : { ':a': attempts },
    }));
    return { ok };
  }
}

export async function fpMarkBothVerified(requestId) {
  const req = await fpGetRequest(requestId);
  if (req?.emailVerified && req?.smsVerified) {
    await ddb.send(new UpdateCommand({
      TableName: FORGOT_TABLE,
      Key: { requestId },
      UpdateExpression: 'SET bothVerified = :t, expiresAt = :ttl',
      ExpressionAttributeValues: { ':t': true, ':ttl': nowEpoch() + RESET_WINDOW_SECONDS },
    }));
    return true;
  }
  return false;
}

export async function fpClearRequest(requestId) {
  await ddb.send(new DeleteCommand({ TableName: FORGOT_TABLE, Key: { requestId } }));
}

/**
 * Bcryptjs-based password update consistent with createUser/login
 */
export async function updateUserPasswordWithPolicy(userId, newPassword) {
  if (!newPassword || newPassword.length < 10) {
    throw new Error('Password must be at least 10 characters.');
  }
  const hash = await bcrypt.hash(newPassword, 10); // same rounds as createUser
  await updateUser(userId, { password: hash, passwordUpdatedAt: new Date().toISOString() });
  return true;
}
