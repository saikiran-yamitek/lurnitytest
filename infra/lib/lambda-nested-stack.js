import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LambdaNestedStack extends cdk.NestedStack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const { lambdaEnv } = props;

    // Lambda paths
    const adminLambdaPath = path.join(__dirname, "..", "..", "backend", "routes", "admin");
    const adminAuthLambdaPath = path.join(__dirname, "..", "..", "backend", "routes", "adminAuth");
    const landingPageLambdaPath = path.join(__dirname, "..", "..", "backend", "routes", "landingPage");
    const certificatesLambdaPath = path.join(__dirname, "..", "..", "backend", "routes", "certificates");
    const companiesLambdaPath = path.join(__dirname, "..", "..", "backend", "routes", "companies");
    const employeesLambdaPath = path.join(__dirname, "..", "..", "backend", "routes", "employees");
    const feedbackLambdaPath = path.join(__dirname, "..", "..", "backend", "routes", "feedback");
    const placementLambdaPath = path.join(__dirname, "..", "..", "backend", "routes", "placement");
    const workshopLambdaPath = path.join(__dirname, "..", "..", "backend", "routes", "workshop");
    const coursesLambdaPath = path.join(__dirname, "..", "..", "backend", "routes", "courses");
    const demoLambdaPath = path.join(__dirname, "..", "..", "backend", "routes", "demo");
    const ticketsLambdaPath = path.join(__dirname, "..", "..", "backend", "routes", "tickets");
    const rankingsLambdaPath = path.join(__dirname, "..", "..", "backend", "routes", "rankings");
    const progressLambdaPath = path.join(__dirname, "..", "..", "backend", "routes", "progress");
    const userLambdaPath = path.join(__dirname, "..", "..", "backend", "routes", "user");
    const transcribeLambdaPath = path.join(__dirname, "..", "..", "backend", "routes", "transcribe");

    // Unified makeLambda function for consistent Lambda creation
    // Unified makeLambda function for consistent Lambda creation
  const makeLambda = (idSuffix, filename, assetPath) =>
  new lambdaNodejs.NodejsFunction(this, idSuffix, {
    entry: path.join(assetPath, `${filename}.js`),
    handler: "handler", // your handler must be exported as: export const handler = ...
    runtime: lambda.Runtime.NODEJS_18_X,
    environment: lambdaEnv,
    timeout: cdk.Duration.seconds(30),
    memorySize: 512,
    bundling: {
      minify: false,
      sourceMap: false,
      target: "es2020",
      format: "esm",                // produce ESM bundle
      mainFields: ["module", "main"],
      externalModules: ["aws-sdk"], // keep AWS SDK external (Lambda provides it)
      // Inject a banner that creates a require() for dynamic requires (async_hooks etc.)
      esbuildArgs: {
        "--banner:js": "import { createRequire } from 'module'; globalThis.require = createRequire(import.meta.url);"
      },
      // Use local bundling (no Docker). CDK by default will try local bundling when possible.
      // We DON'T override local.tryBundle here (so Docker won't be forced).
      commandHooks: {
        beforeBundling: () => [],
        beforeInstall: () => [],
        // afterBundling runs locally; write package.json into the actual outputDir
        afterBundling: (inputDir, outputDir) => {
          // Build the safe command to write package.json to the outputDir
          const pkgPath = path.join(outputDir, "package.json");
          const content = JSON.stringify({ type: "module" });

          // escape backslashes for Windows cmd
          const safePkgPath = pkgPath.replace(/\\/g, "\\\\");
          const safeContent = content.replace(/"/g, '\\"');

          // Use node to write the file; pass file path + content as argv to avoid quoting issues
          return [
            `node -e "require('fs').writeFileSync(process.argv[1], process.argv[2])" "${safePkgPath}" "${safeContent}"`
          ];
        }
      }
    },
  });






    // Admin lambdas
    this.listUsersLambda = makeLambda("ListUsersLambda", "listUsers", adminLambdaPath);
    this.updateUserLambda = makeLambda("UpdateUserLambda", "updateUser", adminLambdaPath);
    this.deleteUserLambda = makeLambda("DeleteUserLambda", "deleteUser", adminLambdaPath);
    this.exportUsersCsvLambda = makeLambda("ExportUsersCsvLambda", "exportUsersCsv", adminLambdaPath);
    this.createTransactionLambda = makeLambda("CreateTransactionLambda", "createTransaction", adminLambdaPath);
    this.listUserTransactionsLambda = makeLambda("ListUserTransactionsLambda", "listUserTransactions", adminLambdaPath);
    this.generateReceiptLambda = makeLambda("GenerateReceiptLambda", "generateReceipt", adminLambdaPath);
    this.listCoursesLambda = makeLambda("ListCoursesLambda", "listCourses", adminLambdaPath);
    this.createCourseLambda = makeLambda("CreateCourseLambda", "createCourse", adminLambdaPath);
    this.updateCourseLambda = makeLambda("UpdateCourseLambda", "updateCourse", adminLambdaPath);
    this.deleteCourseLambda = makeLambda("DeleteCourseLambda", "deleteCourse", adminLambdaPath);
    this.getStatsLambda = makeLambda("GetStatsLambda", "getStats", adminLambdaPath);
    this.deleteTicketLambda = makeLambda("DeleteTicketLambda", "deleteTicket", adminLambdaPath);
    this.setUserLockLambda = makeLambda("SetUserLockLambda", "setUserLock", adminLambdaPath);
    this.adminAuthLambda = makeLambda("AdminAuthLambda", "adminAuth", adminAuthLambdaPath);

    // Landing page lambdas
    this.getCohortsLambda = makeLambda("GetCohortsLambda", "getCohorts", landingPageLambdaPath);
    this.createCohortLambda = makeLambda("CreateCohortLambda", "createCohort", landingPageLambdaPath);
    this.updateCohortLambda = makeLambda("UpdateCohortLambda", "updateCohort", landingPageLambdaPath);
    this.deleteCohortLambda = makeLambda("DeleteCohortLambda", "deleteCohort", landingPageLambdaPath);

    // Certificate lambdas
    this.generateCertificateLambda = makeLambda("GenerateCertificateLambda", "generateCertificate", certificatesLambdaPath);
    this.listCertificatesLambda = makeLambda("ListCertificatesLambda", "listCertificates", certificatesLambdaPath);
    this.getCertificateByIdLambda = makeLambda("GetCertificateByIdLambda", "getCertificateById", certificatesLambdaPath);
    this.listCertificatesByUserLambda = makeLambda("ListCertificatesByUserLambda", "listCertificatesByUser", certificatesLambdaPath);
    this.checkCertificateExistsLambda = makeLambda("CheckCertificateExistsLambda", "checkCertificateExists", certificatesLambdaPath);

    // Company lambdas
    this.getCompaniesLambda = makeLambda("GetCompaniesLambda", "getCompanies", companiesLambdaPath);
    this.createCompanyLambda = makeLambda("CreateCompanyLambda", "createCompany", companiesLambdaPath);
    this.updateCompanyLambda = makeLambda("UpdateCompanyLambda", "updateCompany", companiesLambdaPath);

    // Employee lambdas
    this.createEmployeeLambda = makeLambda("CreateEmployeeLambda", "createEmployee", employeesLambdaPath);
    this.listEmployeesLambda = makeLambda("ListEmployeesLambda", "getAllEmployees", employeesLambdaPath);
    this.getEmployeeByIdLambda = makeLambda("GetEmployeeByIdLambda", "getEmployeeById", employeesLambdaPath);
    this.updateEmployeeLambda = makeLambda("UpdateEmployeeLambda", "updateEmployee", employeesLambdaPath);
    this.deleteEmployeeLambda = makeLambda("DeleteEmployeeLambda", "deleteEmployee", employeesLambdaPath);
    this.employeeLoginLambda = makeLambda("EmployeeLoginLambda", "login", employeesLambdaPath);

    // Feedback lambdas
    this.submitFeedbackLambda = makeLambda("SubmitFeedbackLambda", "submitFeedback", feedbackLambdaPath);
    this.listFeedbacksLambda = makeLambda("ListFeedbacksLambda", "listFeedbacks", feedbackLambdaPath);
    this.deleteFeedbackLambda = makeLambda("DeleteFeedbackLambda", "deleteFeedback", feedbackLambdaPath);

    // Placement lambdas
    this.createPlacementLambda = makeLambda("CreatePlacementLambda", "createPlacement", placementLambdaPath);
    this.listPlacementsLambda = makeLambda("ListPlacementsLambda", "listPlacements", placementLambdaPath);
    this.getPlacementByIdLambda = makeLambda("GetPlacementByIdLambda", "getPlacementById", placementLambdaPath);
    this.updatePlacementLambda = makeLambda("UpdatePlacementLambda", "updatePlacement", placementLambdaPath);
    this.deletePlacementLambda = makeLambda("DeletePlacementLambda", "deletePlacement", placementLambdaPath);
    // New Placement-related Lambdas
this.updateStudentStatusLambda = makeLambda("UpdateStudentStatusLambda", "updateStudentStatus", placementLambdaPath);
this.revokePlacementLambda = makeLambda("RevokePlacementLambda", "revokePlacement", placementLambdaPath);
this.registerStudentPlacementLambda = makeLambda("RegisterStudentPlacementLambda", "registerStudent", placementLambdaPath);
this.getPlacementStudentsLambda = makeLambda("GetPlacementStudentsLambda", "getPlacementStudents", placementLambdaPath);
this.completePlacementLambda = makeLambda("CompletePlacementLambda", "completePlacement", placementLambdaPath);


    // Workshop lambdas
    this.listWorkshopsLambda = makeLambda("ListWorkshopsLambda", "listWorkshops", workshopLambdaPath);
    this.createWorkshopLambda = makeLambda("CreateWorkshopLambda", "createWorkshop", workshopLambdaPath);
    this.registerStudentLambda = makeLambda("RegisterStudentLambda", "registerStudent", workshopLambdaPath);
    this.getUserWorkshopsLambda = makeLambda("GetUserWorkshopsLambda", "getUserWorkshops", workshopLambdaPath);
    this.getWorkshopStudentsLambda = makeLambda("GetWorkshopStudentsLambda", "getWorkshopStudents", workshopLambdaPath);
    this.deleteWorkshopLambda = makeLambda("DeleteWorkshopLambda", "deleteWorkshop", workshopLambdaPath);
    this.getWorkshopsByInchargeLambda = makeLambda("GetWorkshopsByInchargeLambda", "getWorkshopsByIncharge", workshopLambdaPath);
    this.updateStudentAttendanceLambda = makeLambda("UpdateStudentAttendanceLambda", "updateStudentAttendance", workshopLambdaPath);
    this.registerStudentPutLambda = makeLambda("RegisterStudentPutLambda", "registerStudentPut", workshopLambdaPath);
    this.updateWorkshopLambda = makeLambda("UpdateWorkshopLambda", "updateWorkshop", workshopLambdaPath);

    // Course lambdas
    this.createCoursePublicLambda = makeLambda("CreateCoursePublicLambda", "createCourse", coursesLambdaPath);
    this.listCoursesPublicLambda = makeLambda("ListCoursesPublicLambda", "listCourses", coursesLambdaPath);
    this.getCourseByIdPublicLambda = makeLambda("GetCourseByIdPublicLambda", "getCourseById", coursesLambdaPath);
    this.updateCoursePublicLambda = makeLambda("UpdateCoursePublicLambda", "updateCourse", coursesLambdaPath);
    this.deleteCoursePublicLambda = makeLambda("DeleteCoursePublicLambda", "deleteCourse", coursesLambdaPath);

    // Demo lambdas - NOW USING UNIFIED APPROACH
    // Replace raw lambda.Function with NodejsFunction bundling (ESM)
this.createDemoLambda = makeLambda("CreateDemoLambda", "createDemo", demoLambdaPath);

    this.listDemosLambda = makeLambda("ListDemosLambda", "listDemos", demoLambdaPath);
    this.markDemoBookedLambda = makeLambda("MarkDemoBookedLambda", "markDemoBooked", demoLambdaPath);

    // Transcribe lambda
    this.transcribeLambda = makeLambda("TranscribeLambda", "transcribe", transcribeLambdaPath);

    // Ticket lambdas
    this.createTicketLambda = makeLambda("CreateTicketLambda", "createTicket", ticketsLambdaPath);
    this.listTicketsLambda = makeLambda("ListTicketsLambda", "listTickets", ticketsLambdaPath);
    this.updateTicketLambda = makeLambda("UpdateTicketLambda", "updateTicket", ticketsLambdaPath);

    // Rankings lambda
    this.getRankingsLambda = makeLambda("GetRankingsLambda", "getRankings", rankingsLambdaPath);

    // Progress lambdas
    this.getProgressLambda = makeLambda("GetProgressLambda", "getProgress", progressLambdaPath);
    this.watchProgressLambda = makeLambda("WatchProgressLambda", "watch", progressLambdaPath);

    // Landing page jobs lambdas
    this.getJobsLambda = makeLambda("GetJobsLambda", "getJobs", landingPageLambdaPath);
    this.createJobLambda = makeLambda("CreateJobLambda", "createJob", landingPageLambdaPath);
    this.updateJobLambda = makeLambda("UpdateJobLambda", "updateJob", landingPageLambdaPath);
    this.updateJobStatusLambda = makeLambda("UpdateJobStatusLambda", "updateJobStatus", landingPageLambdaPath);
    this.deleteJobLambda = makeLambda("DeleteJobLambda", "deleteJob", landingPageLambdaPath);
    this.applyForJobLambda = makeLambda("ApplyForJobLambda", "applyForJob", landingPageLambdaPath);
    this.getLatestLandingPageLambda = makeLambda("GetLatestLandingPageLambda", "getLatestLandingPage", landingPageLambdaPath);

    // User lambdas
    this.registerUserLambda = makeLambda("RegisterUserLambda", "register", userLambdaPath);
    this.homepageUserLambda = makeLambda("HomepageUserLambda", "homepage", userLambdaPath);
    this.getResumeDataLambda = makeLambda("GetResumeDataLambda", "getResumeData", userLambdaPath);
    this.updateCompletedSubcoursesLambda = makeLambda("UpdateCompletedSubcoursesLambda", "updateCompletedSubcourses", userLambdaPath);
    this.setAlertLambda = makeLambda("SetAlertLambda", "setAlert", userLambdaPath);
    this.updateProfileLambda = makeLambda("UpdateProfileLambda", "updateProfile", userLambdaPath);
    this.getProfileLambda = makeLambda("GetProfileLambda", "getProfile", userLambdaPath);
    this.updateProjectsLambda = makeLambda("UpdateProjectsLambda", "updateProjects", userLambdaPath);
    this.addPracticeResultLambda = makeLambda("AddPracticeResultLambda", "addPracticeResult", userLambdaPath);
    this.getPracticeHistoryLambda = makeLambda("GetPracticeHistoryLambda", "getPracticeHistory", userLambdaPath);
    this.getStreakDataLambda = makeLambda("GetStreakDataLambda", "getStreakData", userLambdaPath);
    this.updateStreakDataLambda = makeLambda("UpdateStreakDataLambda", "updateStreakData", userLambdaPath);
    this.updateCourseCompletionLambda = makeLambda("UpdateCourseCompletionLambda", "updateCourseCompletion", userLambdaPath);
    this.saveQuestionLambda = makeLambda("SaveQuestionLambda", "saveQuestion", userLambdaPath);
    this.getSavedQuestionsLambda = makeLambda("GetSavedQuestionsLambda", "getSavedQuestions", userLambdaPath);

    // Judge0 lambdas
    this.getJudge0KeyLambda = makeLambda("GetJudge0KeyLambda", "getJudge0Key", userLambdaPath);
    this.updateJudge0KeyLambda = makeLambda("UpdateJudge0KeyLambda", "updateJudge0Key", userLambdaPath);

    // Key and mock lambdas
    this.saveKeyLambda = makeLambda("SaveKeyLambda", "saveKey", userLambdaPath);
    this.getKeyLambda = makeLambda("GetKeyLambda", "getKey", userLambdaPath);
    this.mockQuestionsLambda = makeLambda("MockQuestionsLambda", "mockQuestions", userLambdaPath);

    // Forgot-password lambdas (dual OTP)
this.forgotPasswordRequestLambda = makeLambda("ForgotPasswordRequestLambda", "forgotRequest", userLambdaPath);
this.forgotPasswordVerifyLambda = makeLambda("ForgotPasswordVerifyLambda", "forgotVerify", userLambdaPath);
this.forgotPasswordResetLambda = makeLambda("ForgotPasswordResetLambda", "forgotReset", userLambdaPath);


    // Auth lambdas
    this.authLoginLambda = makeLambda("AuthLoginLambda", "login", userLambdaPath);
    this.authGoogleLoginLambda = makeLambda("AuthGoogleLoginLambda", "googleLogin", userLambdaPath);
  }
}

export { LambdaNestedStack };
