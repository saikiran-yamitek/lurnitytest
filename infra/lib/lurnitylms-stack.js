import path from "path";
import { fileURLToPath } from "url"; // <-- required for ES module __dirname
import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam"; // 👈 added
import dotenv from "dotenv";
import { DatabaseNestedStack } from "./database-nested-stack.js";
import { LambdaNestedStack } from "./lambda-nested-stack.js";
import { ApiNestedStack } from "./api-nested-stack.js";

// Recreate __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend .env file
dotenv.config({ path: path.join(__dirname, "../../backend/.env") });

class LurnityLmsStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // S3 Bucket
    const assetBucket = new s3.Bucket(this, process.env.S3_BUCKET, {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Database nested stack
    const databaseStack = new DatabaseNestedStack(this, 'DatabaseNestedStack');

    // Lambda environment variables
    const lambdaEnv = {
      REGION: process.env.AWS_REGION,
      USER_TABLE_NAME: databaseStack.userTable.tableName,
      COURSE_TABLE_NAME: databaseStack.courseTable.tableName,
      TRANSACTION_TABLE_NAME: databaseStack.transactionTable.tableName,
      TICKET_TABLE_NAME: databaseStack.ticketTable.tableName,
      LANDING_PAGE_TABLE: databaseStack.landingPageTable.tableName,
      CERTIFICATE_TABLE_NAME: databaseStack.certificateTable.tableName,
      ADMIN_LOGIN_TABLE: databaseStack.adminLoginTable.tableName,
      COMPANY_TABLE_NAME: databaseStack.companyTable.tableName,
      EMPLOYEE_TABLE_NAME: databaseStack.employeeTable.tableName,
      FEEDBACK_TABLE_NAME: databaseStack.feedbackTable.tableName,
      PLACEMENT_TABLE_NAME: databaseStack.placementTable.tableName,
      WORKSHOP_TABLE_NAME: databaseStack.workshopTable.tableName,
      DEMO_TABLE_NAME: databaseStack.demoTable.tableName,
      S3_BUCKET: assetBucket.bucketName,
      JWT_SECRET: process.env.JWT_SECRET,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      JUDGE0_API_KEY: process.env.JUDGE0_API_KEY,
      STAGE: process.env.STAGE,
      NODE_ENV: process.env.NODE_ENV,
      LOG_LEVEL: process.env.LOG_LEVEL,
      ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET || "admin-secret-key",
    };

    // Lambda nested stack
    const lambdaStack = new LambdaNestedStack(this, 'LambdaNestedStack', {
      lambdaEnv
    });

    // API nested stack
    const apiStack = new ApiNestedStack(this, 'ApiNestedStack', {
      lambdas: lambdaStack
    });

    // Grant permissions (same as original code)
    [lambdaStack.listUsersLambda, lambdaStack.updateUserLambda, lambdaStack.deleteUserLambda, lambdaStack.exportUsersCsvLambda, lambdaStack.setUserLockLambda].forEach(l => databaseStack.userTable.grantFullAccess(l));
    [lambdaStack.createTransactionLambda, lambdaStack.listUserTransactionsLambda].forEach(l => { databaseStack.transactionTable.grantFullAccess(l); databaseStack.userTable.grantFullAccess(l); });
    [lambdaStack.listCoursesLambda, lambdaStack.createCourseLambda, lambdaStack.updateCourseLambda, lambdaStack.deleteCourseLambda].forEach(l => databaseStack.courseTable.grantFullAccess(l));
    [lambdaStack.deleteTicketLambda].forEach(l => databaseStack.ticketTable.grantFullAccess(l));
    [lambdaStack.exportUsersCsvLambda, lambdaStack.generateReceiptLambda].forEach(l => assetBucket.grantReadWrite(l));
    databaseStack.adminLoginTable.grantFullAccess(lambdaStack.adminAuthLambda);
    [lambdaStack.getCohortsLambda, lambdaStack.createCohortLambda, lambdaStack.updateCohortLambda, lambdaStack.deleteCohortLambda, lambdaStack.getJobsLambda, lambdaStack.createJobLambda, lambdaStack.updateJobLambda, lambdaStack.updateJobStatusLambda, lambdaStack.deleteJobLambda, lambdaStack.applyForJobLambda, lambdaStack.getLatestLandingPageLambda].forEach(l => databaseStack.landingPageTable.grantFullAccess(l));
    [lambdaStack.generateCertificateLambda, lambdaStack.listCertificatesLambda, lambdaStack.getCertificateByIdLambda, lambdaStack.listCertificatesByUserLambda, lambdaStack.checkCertificateExistsLambda].forEach(l => {
  databaseStack.certificateTable.grantFullAccess(l);
  databaseStack.userTable.grantFullAccess(l);
  databaseStack.courseTable.grantFullAccess(l);

  // ✅ Add GSI query permission
  l.addToRolePolicy(new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    actions: ["dynamodb:Query"],
    resources: [
      `${databaseStack.certificateTable.tableArn}/index/*`  // allow all GSIs
    ]
  }));
});

    [lambdaStack.getCompaniesLambda, lambdaStack.createCompanyLambda, lambdaStack.updateCompanyLambda].forEach(l => databaseStack.companyTable.grantFullAccess(l));

    // ✅ Employee Lambdas - add index permissions
    [
      lambdaStack.createEmployeeLambda,
      lambdaStack.listEmployeesLambda,
      lambdaStack.getEmployeeByIdLambda,
      lambdaStack.updateEmployeeLambda,
      lambdaStack.deleteEmployeeLambda,
      lambdaStack.employeeLoginLambda
    ].forEach(l => {
      databaseStack.employeeTable.grantFullAccess(l);
      l.addToRolePolicy(new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["dynamodb:Query"],
        resources: [
          `${databaseStack.employeeTable.tableArn}/index/*`
        ]
      }));
    });

    [lambdaStack.submitFeedbackLambda, lambdaStack.listFeedbacksLambda, lambdaStack.deleteFeedbackLambda].forEach(l => {
      databaseStack.feedbackTable.grantFullAccess(l);
      databaseStack.userTable.grantFullAccess(l);
    });

    [lambdaStack.createPlacementLambda, lambdaStack.listPlacementsLambda, lambdaStack.getPlacementByIdLambda, lambdaStack.updatePlacementLambda, lambdaStack.deletePlacementLambda].forEach(l => {
      databaseStack.placementTable.grantFullAccess(l);
      databaseStack.userTable.grantFullAccess(l);
      databaseStack.companyTable.grantFullAccess(l);
    });

    // New placement lambdas
[
  lambdaStack.updateStudentStatusLambda,
  lambdaStack.revokePlacementLambda,
  lambdaStack.registerStudentPlacementLambda,
  lambdaStack.getPlacementStudentsLambda,
  lambdaStack.completePlacementLambda
].forEach(l => {
  databaseStack.placementTable.grantFullAccess(l);
  databaseStack.userTable.grantFullAccess(l);
  databaseStack.companyTable.grantFullAccess(l); // only if needed
});


    [
      lambdaStack.listWorkshopsLambda,
      lambdaStack.createWorkshopLambda,
      lambdaStack.registerStudentLambda,
      lambdaStack.getUserWorkshopsLambda,
      lambdaStack.getWorkshopStudentsLambda,
      lambdaStack.deleteWorkshopLambda,
      lambdaStack.getWorkshopsByInchargeLambda,
      lambdaStack.updateStudentAttendanceLambda,
      lambdaStack.registerStudentPutLambda,
      lambdaStack.updateWorkshopLambda
    ].forEach(l => {
      databaseStack.workshopTable.grantFullAccess(l);
    });
    [lambdaStack.listWorkshopsLambda, lambdaStack.getUserWorkshopsLambda, lambdaStack.getWorkshopStudentsLambda].forEach(l => databaseStack.userTable.grantReadData(l));

    [lambdaStack.createCoursePublicLambda, lambdaStack.listCoursesPublicLambda, lambdaStack.getCourseByIdPublicLambda, lambdaStack.updateCoursePublicLambda, lambdaStack.deleteCoursePublicLambda].forEach(l => {
      databaseStack.courseTable.grantFullAccess(l);
    });

    [lambdaStack.createDemoLambda, lambdaStack.listDemosLambda, lambdaStack.markDemoBookedLambda].forEach(l => {
      databaseStack.demoTable.grantFullAccess(l);
    });

    [lambdaStack.createTicketLambda, lambdaStack.listTicketsLambda, lambdaStack.updateTicketLambda].forEach(l => {
      databaseStack.ticketTable.grantFullAccess(l);
      databaseStack.userTable.grantFullAccess(l);
    });

    [lambdaStack.getRankingsLambda].forEach(l => {
      databaseStack.placementTable.grantFullAccess(l);
      databaseStack.workshopTable.grantFullAccess(l);
      databaseStack.userTable.grantFullAccess(l);
    });

    [lambdaStack.getProgressLambda, lambdaStack.watchProgressLambda].forEach(l => {
      databaseStack.userTable.grantFullAccess(l);
    });

    [
      lambdaStack.registerUserLambda,
      lambdaStack.homepageUserLambda,
      lambdaStack.getResumeDataLambda,
      lambdaStack.updateCompletedSubcoursesLambda,
      lambdaStack.setAlertLambda,
      lambdaStack.updateProfileLambda,
      lambdaStack.getProfileLambda,
      lambdaStack.updateProjectsLambda,
      lambdaStack.addPracticeResultLambda,
      lambdaStack.getPracticeHistoryLambda,
      lambdaStack.getStreakDataLambda,
      lambdaStack.updateStreakDataLambda,
      lambdaStack.updateCourseCompletionLambda,
      lambdaStack.saveQuestionLambda,
      lambdaStack.getSavedQuestionsLambda,
      lambdaStack.authLoginLambda,
      lambdaStack.authGoogleLoginLambda,
      lambdaStack.getJudge0KeyLambda,
      lambdaStack.updateJudge0KeyLambda,
      lambdaStack.saveKeyLambda,
      lambdaStack.getKeyLambda,
      lambdaStack.mockQuestionsLambda,
    ].forEach(l => databaseStack.userTable.grantFullAccess(l));

    [lambdaStack.transcribeLambda].forEach(l => {
      assetBucket.grantReadWrite(l);
      databaseStack.userTable.grantFullAccess(l);
    });
  }
}

export { LurnityLmsStack };
