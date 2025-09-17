// helpers/LandingPage.js
// DynamoDB helpers for LandingPage operations

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const REGION = process.env.AWS_REGION || "us-east-1";
const TABLE = process.env.LANDING_PAGE_TABLE || "LandingPage";

if (!TABLE) {
  throw new Error("LANDING_PAGE_TABLE_NAME env var is required");
}

const client = new DynamoDBClient({ region: REGION });
const ddbDocClient = DynamoDBDocumentClient.from(client);

// =============================
// Old Style: Fixed PK landing page helpers
// =============================

// Ensure a landing page always exists
export async function getLandingPage() {
  const params = {
    TableName: TABLE,
    Key: { id: "landingPage" }, // fixed PK since only one doc
  };

  const result = await ddbDocClient.send(new GetCommand(params));

  if (!result.Item) {
    const newPage = { id: "landingPage", cohorts: [], jobs: [] };
    await ddbDocClient.send(
      new PutCommand({
        TableName: TABLE,
        Item: newPage,
      })
    );
    return newPage;
  }

  return result.Item;
}

// Get all cohorts
export async function getCohorts() {
  const page = await getLandingPage();
  return page.cohorts || [];
}

// Create a new cohort
export async function createCohort(data) {
  const page = await getLandingPage();
  const newCohort = { id: uuidv4(), ...data };

  page.cohorts.push(newCohort);

  await ddbDocClient.send(
    new PutCommand({
      TableName: TABLE,
      Item: page,
    })
  );

  return newCohort;
}

// Update cohort
export async function updateCohort(id, data) {
  const page = await getLandingPage();
  const cohortIndex = page.cohorts.findIndex((c) => c.id === id);
  if (cohortIndex === -1) return null;

  page.cohorts[cohortIndex] = { ...page.cohorts[cohortIndex], ...data };

  await ddbDocClient.send(
    new PutCommand({
      TableName: TABLE,
      Item: page,
    })
  );

  return page.cohorts[cohortIndex];
}

// Delete cohort
export async function deleteCohort(id) {
  const page = await getLandingPage();
  const cohortIndex = page.cohorts.findIndex((c) => c.id === id);
  if (cohortIndex === -1) return null;

  page.cohorts.splice(cohortIndex, 1);

  await ddbDocClient.send(
    new PutCommand({
      TableName: TABLE,
      Item: page,
    })
  );

  return { message: "Cohort deleted" };
}

// =============================
// Job Helpers (old style, fixed PK)
// =============================

export async function getJobs() {
  const page = await getLandingPage();
  return page.jobs || [];
}

export async function createJob(data) {
  const page = await getLandingPage();
  const newJob = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    applications: [],
    ...data,
  };

  page.jobs.push(newJob);
  page.lastUpdated = new Date().toISOString();

  await ddbDocClient.send(
    new PutCommand({
      TableName: TABLE,
      Item: page,
    })
  );

  return newJob;
}

export async function updateJob(jobId, data) {
  const page = await getLandingPage();
  const jobIndex = page.jobs.findIndex((j) => j.id === jobId);
  if (jobIndex === -1) return null;

  page.jobs[jobIndex] = { ...page.jobs[jobIndex], ...data };
  page.lastUpdated = new Date().toISOString();

  await ddbDocClient.send(
    new PutCommand({
      TableName: TABLE,
      Item: page,
    })
  );

  return page.jobs[jobIndex];
}

export async function updateJobStatus(jobId, isActive) {
  return updateJob(jobId, { isActive });
}

export async function deleteJob(jobId) {
  const page = await getLandingPage();
  const initialLength = page.jobs.length;

  page.jobs = page.jobs.filter((j) => j.id !== jobId);

  if (page.jobs.length === initialLength) return null;

  page.lastUpdated = new Date().toISOString();

  await ddbDocClient.send(
    new PutCommand({
      TableName: TABLE,
      Item: page,
    })
  );

  return { message: "Job deleted successfully" };
}

export async function applyToJob(jobId, application) {
  const page = await getLandingPage();
  const jobIndex = page.jobs.findIndex((j) => j.id === jobId);
  if (jobIndex === -1) return null;

  if (!page.jobs[jobIndex].applications) {
    page.jobs[jobIndex].applications = [];
  }

  page.jobs[jobIndex].applications.push({
    id: uuidv4(),
    ...application,
    appliedAt: new Date().toISOString(),
  });

  page.lastUpdated = new Date().toISOString();

  await ddbDocClient.send(
    new PutCommand({
      TableName: TABLE,
      Item: page,
    })
  );

  return { message: "Application submitted successfully" };
}

// =============================
// Newer Scan-based Helpers
// =============================

/** Get the latest LandingPage entry (by lastUpdated, descending) */
export async function getLatestLandingPage() {
  const result = await ddbDocClient.send(
    new ScanCommand({
      TableName: TABLE,
    })
  );

  if (!result.Items || result.Items.length === 0) return null;

  const sorted = result.Items.sort(
    (a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)
  );
  return sorted[0];
}

/** Get cohorts from latest landing page */
export async function getCohortsLatest() {
  const lp = await getLatestLandingPage();
  return lp ? lp.cohorts || [] : null;
}

/** Get jobs from latest landing page */
export async function getJobsLatest() {
  const lp = await getLatestLandingPage();
  return lp ? lp.jobs || [] : null;
}

/** Create a new job entry (latest-based) */
export async function createJobLatest(jobData) {
  const lp = (await getLatestLandingPage()) || { id: "landingPage", jobs: [] };

  const newJob = {
    id: `${Date.now()}`,
    ...jobData,
    createdAt: new Date().toISOString(),
    applications: [],
  };

  lp.jobs.push(newJob);
  lp.lastUpdated = new Date().toISOString();

  await ddbDocClient.send(
    new PutCommand({
      TableName: TABLE,
      Item: lp,
    })
  );

  return newJob;
}

/** Update an existing job (latest-based) */
export async function updateJobLatest(jobId, jobData) {
  const lp = await getLatestLandingPage();
  if (!lp) return null;

  const index = lp.jobs.findIndex((j) => j.id === jobId);
  if (index === -1) return null;

  lp.jobs[index] = { ...lp.jobs[index], ...jobData };
  lp.lastUpdated = new Date().toISOString();

  await ddbDocClient.send(
    new PutCommand({
      TableName: TABLE,
      Item: lp,
    })
  );

  return lp.jobs[index];
}

/** Update only job status (latest-based) */
export async function updateJobStatusLatest(jobId, isActive) {
  return updateJobLatest(jobId, { isActive });
}

/** Delete a job (latest-based) */
export async function deleteJobLatest(jobId) {
  const lp = await getLatestLandingPage();
  if (!lp) return null;

  const initialLength = lp.jobs.length;
  lp.jobs = lp.jobs.filter((j) => j.id !== jobId);
  if (lp.jobs.length === initialLength) return null;

  lp.lastUpdated = new Date().toISOString();
  await ddbDocClient.send(
    new PutCommand({
      TableName: TABLE,
      Item: lp,
    })
  );

  return { success: true };
}

/** Apply for a job (latest-based) */
export async function applyForJobLatest(jobId, application) {
  const lp = await getLatestLandingPage();
  if (!lp) return null;

  const job = lp.jobs.find((j) => j.id === jobId);
  if (!job) return null;

  job.applications = job.applications || [];
  job.applications.push({
    ...application,
    appliedAt: new Date().toISOString(),
  });

  lp.lastUpdated = new Date().toISOString();
  await ddbDocClient.send(
    new PutCommand({
      TableName: TABLE,
      Item: lp,
    })
  );

  return { success: true };
}

export default {
  // Old style
  getLandingPage,
  getCohorts,
  createCohort,
  updateCohort,
  deleteCohort,
  getJobs,
  createJob,
  updateJob,
  updateJobStatus,
  deleteJob,
  applyToJob,

  // Latest-based
  getLatestLandingPage,
  getCohortsLatest,
  getJobsLatest,
  createJobLatest,
  updateJobLatest,
  updateJobStatusLatest,
  deleteJobLatest,
  applyForJobLatest,
};
