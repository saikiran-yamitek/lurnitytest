import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

class ApiNestedStack extends cdk.NestedStack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const { lambdas } = props;

    // Create API Gateway with enhanced CORS configuration
    this.api = new apigateway.RestApi(this, "LurnityLmsApi", { 
      restApiName: "LurnityLmsApi", 
      deployOptions: { stageName: process.env.STAGE || "dev" },
      defaultCorsPreflightOptions: {
        allowOrigins: ['*'],
        allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowHeaders: [
          'Content-Type',
          'Authorization', 
          'X-Amz-Date', 
          'X-Api-Key', 
          'X-Amz-Security-Token',
          'X-Amz-User-Agent'
        ],
        allowCredentials: false,
        maxAge: cdk.Duration.days(1)
      }
    });

    // Add gateway responses with CORS headers
    this.api.addGatewayResponse('Default4XX', {
      type: apigateway.ResponseType.DEFAULT_4XX,
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
        'Access-Control-Allow-Methods': "'GET,POST,PUT,PATCH,DELETE,OPTIONS'",
        'Access-Control-Allow-Headers': "'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token'"
      }
    });

    this.api.addGatewayResponse('Default5XX', {
      type: apigateway.ResponseType.DEFAULT_5XX,
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
        'Access-Control-Allow-Methods': "'GET,POST,PUT,PATCH,DELETE,OPTIONS'",
        'Access-Control-Allow-Headers': "'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token'"
      }
    });

    // ✅ Helper function - disables auto-permission creation
    const integrate = (lambda) => {
      return new apigateway.LambdaIntegration(lambda, {
        proxy: true,
        allowTestInvoke: false // Cuts auto-permissions by 50%
      });
    };

    // ADD /api PREFIX RESOURCE
    const apiResource = this.api.root.addResource("api");

    // --- Admin Routes ---
    const adminRes = apiResource.addResource("admin");
    adminRes.addResource("auth").addMethod("POST", integrate(lambdas.adminAuthLambda));

    const usersRes = adminRes.addResource("users");
    usersRes.addMethod("GET", integrate(lambdas.listUsersLambda));
    const userIdRes = usersRes.addResource("{id}");
    userIdRes.addMethod("PUT", integrate(lambdas.updateUserLambda));
    userIdRes.addMethod("DELETE", integrate(lambdas.deleteUserLambda));
    userIdRes.addMethod("PATCH", integrate(lambdas.setUserLockLambda));
    const transactionsRes = userIdRes.addResource("transactions");
    transactionsRes.addMethod("POST", integrate(lambdas.createTransactionLambda));

    // Admin Courses Resource
    const adminCoursesRes = adminRes.addResource("courses");
    adminCoursesRes.addMethod("GET", integrate(lambdas.listCoursesPublicLambda));
    adminCoursesRes.addMethod("POST", integrate(lambdas.createCoursePublicLambda));
    const adminCoursesIdRes = adminCoursesRes.addResource("{id}");
    adminCoursesIdRes.addMethod("GET", integrate(lambdas.getCourseByIdPublicLambda));
    adminCoursesIdRes.addMethod("PUT", integrate(lambdas.updateCoursePublicLambda));
    adminCoursesIdRes.addMethod("DELETE", integrate(lambdas.deleteCoursePublicLambda));

    // --- Employees ---
    const employeesRes = apiResource.addResource("employees");
    employeesRes.addMethod("GET", integrate(lambdas.listEmployeesLambda));
    employeesRes.addMethod("POST", integrate(lambdas.createEmployeeLambda));
    employeesRes.addResource("login").addMethod("POST", integrate(lambdas.employeeLoginLambda));
    const empIdRes = employeesRes.addResource("{id}");
    empIdRes.addMethod("GET", integrate(lambdas.getEmployeeByIdLambda));
    empIdRes.addMethod("PUT", integrate(lambdas.updateEmployeeLambda));
    empIdRes.addMethod("DELETE", integrate(lambdas.deleteEmployeeLambda));

    // --- LandingPage ---
    const landingPage = apiResource.addResource("landingpage");
    landingPage.addMethod("GET", integrate(lambdas.getLatestLandingPageLambda));
    
    const jobs = landingPage.addResource("jobs");
    jobs.addMethod("GET", integrate(lambdas.getJobsLambda));
    jobs.addMethod("POST", integrate(lambdas.createJobLambda));
    
    const jobId = jobs.addResource("{jobId}");
    jobId.addMethod("PUT", integrate(lambdas.updateJobLambda));
    jobId.addMethod("DELETE", integrate(lambdas.deleteJobLambda));
    jobId.addResource("status").addMethod("PATCH", integrate(lambdas.updateJobStatusLambda));
    jobId.addResource("apply").addMethod("POST", integrate(lambdas.applyForJobLambda));

    const cohorts = landingPage.addResource("cohorts");
    cohorts.addMethod("GET", integrate(lambdas.getCohortsLambda));
    cohorts.addMethod("POST", integrate(lambdas.createCohortLambda));
    const cohortId = cohorts.addResource("{id}");
    cohortId.addMethod("PUT", integrate(lambdas.updateCohortLambda));
    cohortId.addMethod("DELETE", integrate(lambdas.deleteCohortLambda));

    // --- Certificates ---
    const certificates = apiResource.addResource("certificates");
    certificates.addMethod("GET", integrate(lambdas.listCertificatesLambda));
    certificates.addResource("generate").addMethod("POST", integrate(lambdas.generateCertificateLambda));
    certificates.addResource("check-exists").addMethod("POST", integrate(lambdas.checkCertificateExistsLambda));
    certificates.addResource("{id}").addMethod("GET", integrate(lambdas.getCertificateByIdLambda));
    certificates.addResource("user").addResource("{userId}").addMethod("GET", integrate(lambdas.listCertificatesByUserLambda));

    // --- Companies ---
    const companies = apiResource.addResource("companies");
    companies.addMethod("GET", integrate(lambdas.getCompaniesLambda));
    companies.addMethod("POST", integrate(lambdas.createCompanyLambda));
    companies.addResource("{id}").addMethod("PUT", integrate(lambdas.updateCompanyLambda));

    // --- Feedback ---
    const feedback = apiResource.addResource("feedback");
    feedback.addMethod("GET", integrate(lambdas.listFeedbacksLambda));
    feedback.addResource("submit").addMethod("POST", integrate(lambdas.submitFeedbackLambda));
    feedback.addResource("{id}").addMethod("DELETE", integrate(lambdas.deleteFeedbackLambda));

    // --- Placements ---
    const placements = apiResource.addResource("placements");
    placements.addMethod("GET", integrate(lambdas.listPlacementsLambda));
    placements.addMethod("POST", integrate(lambdas.createPlacementLambda));
    const placementId = placements.addResource("{id}");
    placementId.addMethod("GET", integrate(lambdas.getPlacementByIdLambda));
    placementId.addMethod("PUT", integrate(lambdas.updatePlacementLambda));
    placementId.addMethod("DELETE", integrate(lambdas.deletePlacementLambda));
    placementId.addResource("complete").addMethod("PUT", integrate(lambdas.completePlacementLambda));
    placementId.addResource("revoke").addMethod("PUT", integrate(lambdas.revokePlacementLambda));
    placementId.addResource("register").addMethod("POST", integrate(lambdas.registerStudentPlacementLambda));
    placementId.addResource("status").addMethod("PUT", integrate(lambdas.updateStudentStatusLambda));
    placementId.addResource("students").addMethod("GET", integrate(lambdas.getPlacementStudentsLambda));

    // --- Workshops ---
    const workshops = apiResource.addResource("workshops");
    workshops.addMethod("GET", integrate(lambdas.listWorkshopsLambda));
    workshops.addMethod("POST", integrate(lambdas.createWorkshopLambda));
    workshops.addResource("user").addResource("{userId}").addMethod("GET", integrate(lambdas.getUserWorkshopsLambda));
    workshops.addResource("incharge").addResource("{empId}").addMethod("GET", integrate(lambdas.getWorkshopsByInchargeLambda));
    const workshopId = workshops.addResource("{id}");
    workshopId.addMethod("GET", integrate(lambdas.getWorkshopStudentsLambda));
    workshopId.addResource("students").addMethod("GET", integrate(lambdas.getWorkshopStudentsLambda));
    
    const registerResource = workshopId.addResource("register");
    registerResource.addMethod("POST", integrate(lambdas.registerStudentLambda));
    registerResource.addMethod("PUT", integrate(lambdas.registerStudentPutLambda));
    
    workshopId.addResource("attendance").addMethod("PUT", integrate(lambdas.updateStudentAttendanceLambda));
    workshopId.addMethod("PUT", integrate(lambdas.updateWorkshopLambda));
    workshopId.addMethod("DELETE", integrate(lambdas.deleteWorkshopLambda));

    // --- Public Courses ---
    const courses = apiResource.addResource("courses");
    courses.addMethod("GET", integrate(lambdas.listCoursesPublicLambda));
    courses.addMethod("POST", integrate(lambdas.createCoursePublicLambda));
    const coursesId = courses.addResource("{id}");
    coursesId.addMethod("GET", integrate(lambdas.getCourseByIdPublicLambda));
    coursesId.addMethod("PUT", integrate(lambdas.updateCoursePublicLambda));
    coursesId.addMethod("DELETE", integrate(lambdas.deleteCoursePublicLambda));

    // --- Demos ---
    const demos = apiResource.addResource("demos");
    demos.addMethod("POST", integrate(lambdas.createDemoLambda));
    demos.addMethod("GET", integrate(lambdas.listDemosLambda));
    demos.addResource("{id}").addResource("booked").addMethod("PUT", integrate(lambdas.markDemoBookedLambda));
    
    const demoBook = demos.addResource("book");
    demoBook.addMethod("GET", integrate(lambdas.listDemosLambda));
    demoBook.addMethod("POST", integrate(lambdas.createDemoLambda));
    demos.addResource("send-otp").addMethod("POST", integrate(lambdas.sendDemoOTPLambda));
    demos.addResource("verify-otp").addMethod("POST", integrate(lambdas.verifyDemoOTPLambda));

    // --- Tickets ---
    const tickets = apiResource.addResource("tickets");
    tickets.addMethod("POST", integrate(lambdas.createTicketLambda));
    tickets.addMethod("GET", integrate(lambdas.listTicketsLambda));
    const ticketId = tickets.addResource("{id}");
    ticketId.addMethod("PATCH", integrate(lambdas.updateTicketLambda));
    ticketId.addMethod("DELETE", integrate(lambdas.deleteTicketLambda));

    // --- Rankings ---
    const rankings = apiResource.addResource("rankings");
    rankings.addMethod("GET", integrate(lambdas.getRankingsLambda));

    // --- Progress ---
    const progress = apiResource.addResource("progress");
    progress.addMethod("GET", integrate(lambdas.getProgressLambda));
    progress.addResource("watch").addMethod("POST", integrate(lambdas.watchProgressLambda));

    // --- Auth endpoints ---
    const authRes = apiResource.addResource("auth");
    authRes.addResource("login").addMethod("POST", integrate(lambdas.authLoginLambda));
    authRes.addResource("google-login").addMethod("POST", integrate(lambdas.authGoogleLoginLambda));

    // --- User API Gateway routes ---
    const userRes = apiResource.addResource("user");
    
    userRes.addResource("register").addMethod("POST", integrate(lambdas.registerUserLambda));
    userRes.addResource("homepage").addMethod("GET", integrate(lambdas.homepageUserLambda));
    userRes.addResource("alert").addMethod("PUT", integrate(lambdas.setAlertLambda));
    userRes.addResource("save-key").addMethod("POST", integrate(lambdas.saveKeyLambda));
    userRes.addResource("get-key").addMethod("POST", integrate(lambdas.getKeyLambda));
    userRes.addResource("mock-questions").addMethod("POST", integrate(lambdas.mockQuestionsLambda));
    userRes.addResource("saveQuestion").addMethod("POST", integrate(lambdas.saveQuestionLambda));
    
    const forgotRes = userRes.addResource("forgot-password");
    forgotRes.addResource("request").addMethod("POST", integrate(lambdas.forgotPasswordRequestLambda));
    forgotRes.addResource("verify").addMethod("POST", integrate(lambdas.forgotPasswordVerifyLambda));
    forgotRes.addResource("reset").addMethod("POST", integrate(lambdas.forgotPasswordResetLambda));

    userRes.addResource("send-register-otp").addMethod("POST", integrate(lambdas.sendRegisterOTPLambda));
    userRes.addResource("verify-register-otp").addMethod("POST", integrate(lambdas.verifyRegisterOTPLambda));

    const userSpecificRes = userRes.addResource("{id}");
    userSpecificRes.addResource("courseCompletion").addMethod("PUT", integrate(lambdas.updateCourseCompletionLambda));
    
    const profileResource = userSpecificRes.addResource("profile");
    profileResource.addMethod("PUT", integrate(lambdas.updateProfileLambda));
    profileResource.addMethod("GET", integrate(lambdas.getProfileLambda));

    userSpecificRes.addResource("completedSubcourses").addMethod("PUT", integrate(lambdas.updateCompletedSubcoursesLambda));
    userSpecificRes.addResource("projects").addMethod("POST", integrate(lambdas.updateProjectsLambda));
    userSpecificRes.addResource("practiceResult").addMethod("POST", integrate(lambdas.addPracticeResultLambda));
    
    const practiceHistoryRes = userSpecificRes.addResource("practiceHistory");
    practiceHistoryRes.addMethod("GET", integrate(lambdas.getPracticeHistoryLambda));
    practiceHistoryRes.addMethod("POST", integrate(lambdas.getPracticeHistoryLambda));

    const streakDataResource = userSpecificRes.addResource("streakData");
    streakDataResource.addMethod("GET", integrate(lambdas.getStreakDataLambda));
    streakDataResource.addMethod("PUT", integrate(lambdas.updateStreakDataLambda));
    
    userSpecificRes.addResource("savedQuestions").addMethod("GET", integrate(lambdas.getSavedQuestionsLambda));
    userSpecificRes.addResource("resume").addMethod("GET", integrate(lambdas.getResumeDataLambda));

    // --- Judge0 key routes ---
    const keyRes = apiResource.addResource("key");
    keyRes.addMethod("GET", integrate(lambdas.getJudge0KeyLambda));
    keyRes.addMethod("POST", integrate(lambdas.updateJudge0KeyLambda));
  }
}

export { ApiNestedStack };
