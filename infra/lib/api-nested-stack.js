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

    // Add gateway responses with CORS headers for error responses
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

    // ADD /api PREFIX RESOURCE
    const apiResource = this.api.root.addResource("api");

    // --- Admin Routes ---
    const adminRes = apiResource.addResource("admin");
    adminRes.addResource("auth").addMethod("POST", new apigateway.LambdaIntegration(lambdas.adminAuthLambda));

    const usersRes = adminRes.addResource("users");
    usersRes.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listUsersLambda));
    const userIdRes = usersRes.addResource("{id}");
    userIdRes.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateUserLambda));
    userIdRes.addMethod("DELETE", new apigateway.LambdaIntegration(lambdas.deleteUserLambda));
    userIdRes.addMethod("PATCH", new apigateway.LambdaIntegration(lambdas.setUserLockLambda));

    // Admin Courses Resource
    const adminCoursesRes = adminRes.addResource("courses");
    adminCoursesRes.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listCoursesPublicLambda));
    adminCoursesRes.addMethod("POST", new apigateway.LambdaIntegration(lambdas.createCoursePublicLambda));
    const adminCoursesIdRes = adminCoursesRes.addResource("{id}");
    adminCoursesIdRes.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getCourseByIdPublicLambda));
    adminCoursesIdRes.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateCoursePublicLambda));
    adminCoursesIdRes.addMethod("DELETE", new apigateway.LambdaIntegration(lambdas.deleteCoursePublicLambda));

    // --- Employees ---
    const employeesRes = apiResource.addResource("employees");
    employeesRes.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listEmployeesLambda));
    employeesRes.addMethod("POST", new apigateway.LambdaIntegration(lambdas.createEmployeeLambda));
    employeesRes.addResource("login").addMethod("POST", new apigateway.LambdaIntegration(lambdas.employeeLoginLambda));
    const empIdRes = employeesRes.addResource("{id}");
    empIdRes.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getEmployeeByIdLambda));
    empIdRes.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateEmployeeLambda));
    empIdRes.addMethod("DELETE", new apigateway.LambdaIntegration(lambdas.deleteEmployeeLambda));

    // --- LandingPage ---
    const landingPage = apiResource.addResource("landingpage");
    landingPage.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getLatestLandingPageLambda));
    const cohorts = landingPage.addResource("cohorts");
    cohorts.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getCohortsLambda));
    cohorts.addMethod("POST", new apigateway.LambdaIntegration(lambdas.createCohortLambda));
    const cohortId = cohorts.addResource("{id}");
    cohortId.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateCohortLambda));
    cohortId.addMethod("DELETE", new apigateway.LambdaIntegration(lambdas.deleteCohortLambda));

    // --- Certificates ---
    const certificates = apiResource.addResource("certificates");
    certificates.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listCertificatesLambda));
    certificates.addResource("generate").addMethod("POST", new apigateway.LambdaIntegration(lambdas.generateCertificateLambda));
    certificates.addResource("check-exists").addMethod("POST", new apigateway.LambdaIntegration(lambdas.checkCertificateExistsLambda));
    certificates.addResource("{id}").addMethod("GET", new apigateway.LambdaIntegration(lambdas.getCertificateByIdLambda));
    certificates.addResource("user").addResource("{userId}").addMethod("GET", new apigateway.LambdaIntegration(lambdas.listCertificatesByUserLambda));

    // --- Companies ---
    const companies = apiResource.addResource("companies");
    companies.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getCompaniesLambda));
    companies.addMethod("POST", new apigateway.LambdaIntegration(lambdas.createCompanyLambda));
    companies.addResource("{id}").addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateCompanyLambda));

    // --- Feedback ---
    const feedback = apiResource.addResource("feedback");
    feedback.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listFeedbacksLambda));
    feedback.addResource("submit").addMethod("POST", new apigateway.LambdaIntegration(lambdas.submitFeedbackLambda));
    feedback.addResource("{id}").addMethod("DELETE", new apigateway.LambdaIntegration(lambdas.deleteFeedbackLambda));

    // --- Placements ---
    const placements = apiResource.addResource("placements");
    placements.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listPlacementsLambda));
    placements.addMethod("POST", new apigateway.LambdaIntegration(lambdas.createPlacementLambda));
    const placementId = placements.addResource("{id}");
    placementId.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getPlacementByIdLambda));
    placementId.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updatePlacementLambda));
    placementId.addMethod("DELETE", new apigateway.LambdaIntegration(lambdas.deletePlacementLambda));

    // --- Workshops ---
    const workshops = apiResource.addResource("workshops");
    workshops.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listWorkshopsLambda));
    workshops.addMethod("POST", new apigateway.LambdaIntegration(lambdas.createWorkshopLambda));
    workshops.addResource("user").addResource("{userId}").addMethod("GET", new apigateway.LambdaIntegration(lambdas.getUserWorkshopsLambda));
    workshops.addResource("incharge").addResource("{empId}").addMethod("GET", new apigateway.LambdaIntegration(lambdas.getWorkshopsByInchargeLambda));
    const workshopId = workshops.addResource("{id}");
    workshopId.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getWorkshopStudentsLambda));
    workshopId.addResource("students").addMethod("GET", new apigateway.LambdaIntegration(lambdas.getWorkshopStudentsLambda));

    const registerResource = workshopId.addResource("register");
    registerResource.addMethod("POST", new apigateway.LambdaIntegration(lambdas.registerStudentLambda));
    registerResource.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.registerStudentPutLambda));

    workshopId.addResource("attendance").addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateStudentAttendanceLambda));
    workshopId.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateWorkshopLambda));
    workshopId.addMethod("DELETE", new apigateway.LambdaIntegration(lambdas.deleteWorkshopLambda));

    // --- Public Courses ---
    const courses = apiResource.addResource("courses");
    courses.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listCoursesPublicLambda));
    courses.addMethod("POST", new apigateway.LambdaIntegration(lambdas.createCoursePublicLambda));
    const coursesId = courses.addResource("{id}");
    coursesId.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getCourseByIdPublicLambda));
    coursesId.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateCoursePublicLambda));
    coursesId.addMethod("DELETE", new apigateway.LambdaIntegration(lambdas.deleteCoursePublicLambda));

    // --- Demos ---
    const demos = apiResource.addResource("demos");
    demos.addMethod("POST", new apigateway.LambdaIntegration(lambdas.createDemoLambda));
    demos.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listDemosLambda));
    demos.addResource("{id}").addResource("booked").addMethod("PUT", new apigateway.LambdaIntegration(lambdas.markDemoBookedLambda));
    
    const demoBook = demos.addResource("book");
    demoBook.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listDemosLambda));
    demoBook.addMethod("POST", new apigateway.LambdaIntegration(lambdas.createDemoLambda));

    // --- Transcribe ---
    const transcribe = apiResource.addResource("transcribe");
    transcribe.addMethod("POST", new apigateway.LambdaIntegration(lambdas.transcribeLambda));

    // --- Tickets ---
    const tickets = apiResource.addResource("tickets");
    tickets.addMethod("POST", new apigateway.LambdaIntegration(lambdas.createTicketLambda));
    tickets.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listTicketsLambda));
    const ticketId = tickets.addResource("{id}");
    ticketId.addMethod("PATCH", new apigateway.LambdaIntegration(lambdas.updateTicketLambda));

    // --- Rankings ---
    const rankings = apiResource.addResource("rankings");
    rankings.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getRankingsLambda));

    // --- Progress ---
    const progress = apiResource.addResource("progress");
    progress.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getProgressLambda));
    progress.addResource("watch").addMethod("POST", new apigateway.LambdaIntegration(lambdas.watchProgressLambda));

    // --- Auth endpoints ---
    const authRes = apiResource.addResource("auth");
    authRes.addResource("login").addMethod("POST", new apigateway.LambdaIntegration(lambdas.authLoginLambda));
    authRes.addResource("google-login").addMethod("POST", new apigateway.LambdaIntegration(lambdas.authGoogleLoginLambda));

    // --- User API Gateway routes ---
    const userRes = apiResource.addResource("user");
    
    // Global user endpoints (no ID needed)
    userRes.addResource("register").addMethod("POST", new apigateway.LambdaIntegration(lambdas.registerUserLambda));
    userRes.addResource("homepage").addMethod("GET", new apigateway.LambdaIntegration(lambdas.homepageUserLambda));
    userRes.addResource("resume").addMethod("GET", new apigateway.LambdaIntegration(lambdas.getResumeDataLambda));
    userRes.addResource("alert").addMethod("POST", new apigateway.LambdaIntegration(lambdas.setAlertLambda));
    userRes.addResource("save-key").addMethod("POST", new apigateway.LambdaIntegration(lambdas.saveKeyLambda));
    userRes.addResource("get-key").addMethod("POST", new apigateway.LambdaIntegration(lambdas.getKeyLambda));
    userRes.addResource("mock-questions").addMethod("POST", new apigateway.LambdaIntegration(lambdas.mockQuestionsLambda));
    userRes.addResource("saveQuestion").addMethod("POST", new apigateway.LambdaIntegration(lambdas.saveQuestionLambda));
    userRes.addResource("savedQuestions").addMethod("GET", new apigateway.LambdaIntegration(lambdas.getSavedQuestionsLambda));

    // ✅ FIXED: User-specific endpoints under /user/{id}/
    const userSpecificRes = userRes.addResource("{id}");
    
    // Course completion under /user/{id}/courseCompletion
    userSpecificRes.addResource("courseCompletion").addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateCourseCompletionLambda));
    
    // Profile endpoints under /user/{id}/profile
    const profileResource = userSpecificRes.addResource("profile");
    profileResource.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateProfileLambda));
    profileResource.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getProfileLambda));

    // Other user-specific endpoints
    userSpecificRes.addResource("completedSubcourses").addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateCompletedSubcoursesLambda));
    userSpecificRes.addResource("projects").addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateProjectsLambda));
    userSpecificRes.addResource("practiceResult").addMethod("POST", new apigateway.LambdaIntegration(lambdas.addPracticeResultLambda));
    userSpecificRes.addResource("practiceHistory").addMethod("GET", new apigateway.LambdaIntegration(lambdas.getPracticeHistoryLambda));
    
    const streakDataResource = userSpecificRes.addResource("streakData");
    streakDataResource.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getStreakDataLambda));
    streakDataResource.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateStreakDataLambda));

    // --- Judge0 key routes ---
    const keyRes = apiResource.addResource("key");
    keyRes.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getJudge0KeyLambda));
    keyRes.addMethod("POST", new apigateway.LambdaIntegration(lambdas.updateJudge0KeyLambda));
  }
}

export { ApiNestedStack };
