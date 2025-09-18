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

    // Helper function to add OPTIONS method with CORS
    const addOptionsMethod = (resource) => {
      resource.addMethod("OPTIONS", new apigateway.MockIntegration({
        integrationResponses: [{
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Headers': "'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token'",
            'method.response.header.Access-Control-Allow-Origin': "'*'",
            'method.response.header.Access-Control-Allow-Methods': "'GET,POST,PUT,PATCH,DELETE,OPTIONS'"
          },
          responseTemplates: {
            'application/json': '{"statusCode": 200}'
          }
        }],
        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        requestTemplates: {
          'application/json': '{"statusCode": 200}'
        }
      }), {
        methodResponses: [{
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Headers': true,
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Methods': true
          }
        }]
      });
    };

    // --- Admin Routes ---
    const adminRes = apiResource.addResource("admin");
    adminRes.addResource("auth").addMethod("POST", new apigateway.LambdaIntegration(lambdas.adminAuthLambda));
    addOptionsMethod(adminRes.addResource("auth"));

    // Users resource
    const usersRes = adminRes.addResource("users");
    usersRes.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listUsersLambda));
    addOptionsMethod(usersRes);

    const userIdRes = usersRes.addResource("{id}");
    userIdRes.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateUserLambda));
    userIdRes.addMethod("DELETE", new apigateway.LambdaIntegration(lambdas.deleteUserLambda));
    userIdRes.addMethod("PATCH", new apigateway.LambdaIntegration(lambdas.setUserLockLambda));
    addOptionsMethod(userIdRes);

    // ✅ ADD MISSING TRANSACTIONS ENDPOINT
    const transactionsRes = userIdRes.addResource("transactions");
    transactionsRes.addMethod("POST", new apigateway.LambdaIntegration(lambdas.logTransactionLambda));
    addOptionsMethod(transactionsRes);

    // Admin Courses Resource
    const adminCoursesRes = adminRes.addResource("courses");
    adminCoursesRes.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listCoursesPublicLambda));
    adminCoursesRes.addMethod("POST", new apigateway.LambdaIntegration(lambdas.createCoursePublicLambda));
    addOptionsMethod(adminCoursesRes);
    
    const adminCoursesIdRes = adminCoursesRes.addResource("{id}");
    adminCoursesIdRes.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getCourseByIdPublicLambda));
    adminCoursesIdRes.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateCoursePublicLambda));
    adminCoursesIdRes.addMethod("DELETE", new apigateway.LambdaIntegration(lambdas.deleteCoursePublicLambda));
    addOptionsMethod(adminCoursesIdRes);

    // --- Employees ---
    const employeesRes = apiResource.addResource("employees");
    employeesRes.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listEmployeesLambda));
    employeesRes.addMethod("POST", new apigateway.LambdaIntegration(lambdas.createEmployeeLambda));
    addOptionsMethod(employeesRes);
    
    const employeeLoginRes = employeesRes.addResource("login");
    employeeLoginRes.addMethod("POST", new apigateway.LambdaIntegration(lambdas.employeeLoginLambda));
    addOptionsMethod(employeeLoginRes);
    
    const empIdRes = employeesRes.addResource("{id}");
    empIdRes.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getEmployeeByIdLambda));
    empIdRes.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateEmployeeLambda));
    empIdRes.addMethod("DELETE", new apigateway.LambdaIntegration(lambdas.deleteEmployeeLambda));
    addOptionsMethod(empIdRes);

    // --- LandingPage ---
    const landingPage = apiResource.addResource("landingpage");
    landingPage.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getLatestLandingPageLambda));
    addOptionsMethod(landingPage);
    
    const cohorts = landingPage.addResource("cohorts");
    cohorts.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getCohortsLambda));
    cohorts.addMethod("POST", new apigateway.LambdaIntegration(lambdas.createCohortLambda));
    addOptionsMethod(cohorts);
    
    const cohortId = cohorts.addResource("{id}");
    cohortId.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateCohortLambda));
    cohortId.addMethod("DELETE", new apigateway.LambdaIntegration(lambdas.deleteCohortLambda));
    addOptionsMethod(cohortId);

    // --- Certificates ---
    const certificates = apiResource.addResource("certificates");
    certificates.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listCertificatesLambda));
    addOptionsMethod(certificates);
    
    const generateCertRes = certificates.addResource("generate");
    generateCertRes.addMethod("POST", new apigateway.LambdaIntegration(lambdas.generateCertificateLambda));
    addOptionsMethod(generateCertRes);
    
    const checkExistsRes = certificates.addResource("check-exists");
    checkExistsRes.addMethod("POST", new apigateway.LambdaIntegration(lambdas.checkCertificateExistsLambda));
    addOptionsMethod(checkExistsRes);
    
    const certIdRes = certificates.addResource("{id}");
    certIdRes.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getCertificateByIdLambda));
    addOptionsMethod(certIdRes);
    
    const certUserRes = certificates.addResource("user").addResource("{userId}");
    certUserRes.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listCertificatesByUserLambda));
    addOptionsMethod(certUserRes);

    // --- Companies ---
    const companies = apiResource.addResource("companies");
    companies.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getCompaniesLambda));
    companies.addMethod("POST", new apigateway.LambdaIntegration(lambdas.createCompanyLambda));
    addOptionsMethod(companies);
    
    const companyIdRes = companies.addResource("{id}");
    companyIdRes.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateCompanyLambda));
    addOptionsMethod(companyIdRes);

    // --- Feedback ---
    const feedback = apiResource.addResource("feedback");
    feedback.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listFeedbacksLambda));
    addOptionsMethod(feedback);
    
    const submitFeedbackRes = feedback.addResource("submit");
    submitFeedbackRes.addMethod("POST", new apigateway.LambdaIntegration(lambdas.submitFeedbackLambda));
    addOptionsMethod(submitFeedbackRes);
    
    const feedbackIdRes = feedback.addResource("{id}");
    feedbackIdRes.addMethod("DELETE", new apigateway.LambdaIntegration(lambdas.deleteFeedbackLambda));
    addOptionsMethod(feedbackIdRes);

    // --- Placements ---
    const placements = apiResource.addResource("placements");
    placements.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listPlacementsLambda));
    placements.addMethod("POST", new apigateway.LambdaIntegration(lambdas.createPlacementLambda));
    addOptionsMethod(placements);
    
    const placementId = placements.addResource("{id}");
    placementId.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getPlacementByIdLambda));
    placementId.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updatePlacementLambda));
    placementId.addMethod("DELETE", new apigateway.LambdaIntegration(lambdas.deletePlacementLambda));
    addOptionsMethod(placementId);

    // --- Workshops ---
    const workshops = apiResource.addResource("workshops");
    workshops.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listWorkshopsLambda));
    workshops.addMethod("POST", new apigateway.LambdaIntegration(lambdas.createWorkshopLambda));
    addOptionsMethod(workshops);
    
    const workshopUserRes = workshops.addResource("user").addResource("{userId}");
    workshopUserRes.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getUserWorkshopsLambda));
    addOptionsMethod(workshopUserRes);
    
    const workshopInchargeRes = workshops.addResource("incharge").addResource("{empId}");
    workshopInchargeRes.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getWorkshopsByInchargeLambda));
    addOptionsMethod(workshopInchargeRes);
    
    const workshopId = workshops.addResource("{id}");
    workshopId.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getWorkshopStudentsLambda));
    workshopId.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateWorkshopLambda));
    workshopId.addMethod("DELETE", new apigateway.LambdaIntegration(lambdas.deleteWorkshopLambda));
    addOptionsMethod(workshopId);
    
    const workshopStudentsRes = workshopId.addResource("students");
    workshopStudentsRes.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getWorkshopStudentsLambda));
    addOptionsMethod(workshopStudentsRes);

    const registerResource = workshopId.addResource("register");
    registerResource.addMethod("POST", new apigateway.LambdaIntegration(lambdas.registerStudentLambda));
    registerResource.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.registerStudentPutLambda));
    addOptionsMethod(registerResource);

    const attendanceRes = workshopId.addResource("attendance");
    attendanceRes.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateStudentAttendanceLambda));
    addOptionsMethod(attendanceRes);

    // --- Public Courses ---
    const courses = apiResource.addResource("courses");
    courses.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listCoursesPublicLambda));
    courses.addMethod("POST", new apigateway.LambdaIntegration(lambdas.createCoursePublicLambda));
    addOptionsMethod(courses);
    
    const coursesId = courses.addResource("{id}");
    coursesId.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getCourseByIdPublicLambda));
    coursesId.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateCoursePublicLambda));
    coursesId.addMethod("DELETE", new apigateway.LambdaIntegration(lambdas.deleteCoursePublicLambda));
    addOptionsMethod(coursesId);

    // --- Demos ---
    const demos = apiResource.addResource("demos");
    demos.addMethod("POST", new apigateway.LambdaIntegration(lambdas.createDemoLambda));
    demos.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listDemosLambda));
    addOptionsMethod(demos);
    
    const demoIdRes = demos.addResource("{id}").addResource("booked");
    demoIdRes.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.markDemoBookedLambda));
    addOptionsMethod(demoIdRes);
    
    const demoBook = demos.addResource("book");
    demoBook.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listDemosLambda));
    demoBook.addMethod("POST", new apigateway.LambdaIntegration(lambdas.createDemoLambda));
    addOptionsMethod(demoBook);

    // --- Transcribe ---
    const transcribe = apiResource.addResource("transcribe");
    transcribe.addMethod("POST", new apigateway.LambdaIntegration(lambdas.transcribeLambda));
    addOptionsMethod(transcribe);

    // --- Tickets ---
    const tickets = apiResource.addResource("tickets");
    tickets.addMethod("POST", new apigateway.LambdaIntegration(lambdas.createTicketLambda));
    tickets.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listTicketsLambda));
    addOptionsMethod(tickets);
    
    const ticketId = tickets.addResource("{id}");
    ticketId.addMethod("PATCH", new apigateway.LambdaIntegration(lambdas.updateTicketLambda));
    addOptionsMethod(ticketId);

    // --- Rankings ---
    const rankings = apiResource.addResource("rankings");
    rankings.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getRankingsLambda));
    addOptionsMethod(rankings);

    // --- Progress ---
    const progress = apiResource.addResource("progress");
    progress.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getProgressLambda));
    addOptionsMethod(progress);
    
    const watchProgressRes = progress.addResource("watch");
    watchProgressRes.addMethod("POST", new apigateway.LambdaIntegration(lambdas.watchProgressLambda));
    addOptionsMethod(watchProgressRes);

    // --- Auth endpoints ---
    const authRes = apiResource.addResource("auth");
    const loginRes = authRes.addResource("login");
    loginRes.addMethod("POST", new apigateway.LambdaIntegration(lambdas.authLoginLambda));
    addOptionsMethod(loginRes);
    
    const googleLoginRes = authRes.addResource("google-login");
    googleLoginRes.addMethod("POST", new apigateway.LambdaIntegration(lambdas.authGoogleLoginLambda));
    addOptionsMethod(googleLoginRes);

    // --- User API Gateway routes ---
    const userRes = apiResource.addResource("user");
    const registerRes = userRes.addResource("register");
    registerRes.addMethod("POST", new apigateway.LambdaIntegration(lambdas.registerUserLambda));
    addOptionsMethod(registerRes);
    
    const homepageRes = userRes.addResource("homepage");
    homepageRes.addMethod("GET", new apigateway.LambdaIntegration(lambdas.homepageUserLambda));
    addOptionsMethod(homepageRes);
    
    const resumeRes = userRes.addResource("resume");
    resumeRes.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getResumeDataLambda));
    addOptionsMethod(resumeRes);
    
    const completedSubcoursesRes = userRes.addResource("completedSubcourses");
    completedSubcoursesRes.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateCompletedSubcoursesLambda));
    addOptionsMethod(completedSubcoursesRes);
    
    const alertRes = userRes.addResource("alert");
    alertRes.addMethod("POST", new apigateway.LambdaIntegration(lambdas.setAlertLambda));
    addOptionsMethod(alertRes);
    
    const profileResource = userRes.addResource("profile");
    profileResource.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateProfileLambda));
    profileResource.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getProfileLambda));
    addOptionsMethod(profileResource);

    const projectsRes = userRes.addResource("projects");
    projectsRes.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateProjectsLambda));
    addOptionsMethod(projectsRes);
    
    const practiceResultRes = userRes.addResource("practiceResult");
    practiceResultRes.addMethod("POST", new apigateway.LambdaIntegration(lambdas.addPracticeResultLambda));
    addOptionsMethod(practiceResultRes);
    
    const practiceHistoryRes = userRes.addResource("practiceHistory");
    practiceHistoryRes.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getPracticeHistoryLambda));
    addOptionsMethod(practiceHistoryRes);
    
    const streakDataResource = userRes.addResource("streakData");
    streakDataResource.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getStreakDataLambda));
    streakDataResource.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateStreakDataLambda));
    addOptionsMethod(streakDataResource);

    const courseCompletionRes = userRes.addResource("courseCompletion");
    courseCompletionRes.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateCourseCompletionLambda));
    addOptionsMethod(courseCompletionRes);
    
    const saveQuestionRes = userRes.addResource("saveQuestion");
    saveQuestionRes.addMethod("POST", new apigateway.LambdaIntegration(lambdas.saveQuestionLambda));
    addOptionsMethod(saveQuestionRes);
    
    const savedQuestionsRes = userRes.addResource("savedQuestions");
    savedQuestionsRes.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getSavedQuestionsLambda));
    addOptionsMethod(savedQuestionsRes);
    
    const saveKeyRes = userRes.addResource("save-key");
    saveKeyRes.addMethod("POST", new apigateway.LambdaIntegration(lambdas.saveKeyLambda));
    addOptionsMethod(saveKeyRes);
    
    const getKeyRes = userRes.addResource("get-key");
    getKeyRes.addMethod("POST", new apigateway.LambdaIntegration(lambdas.getKeyLambda));
    addOptionsMethod(getKeyRes);
    
    const mockQuestionsRes = userRes.addResource("mock-questions");
    mockQuestionsRes.addMethod("POST", new apigateway.LambdaIntegration(lambdas.mockQuestionsLambda));
    addOptionsMethod(mockQuestionsRes);

    // --- Judge0 key routes ---
    const keyRes = apiResource.addResource("key");
    keyRes.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getJudge0KeyLambda));
    keyRes.addMethod("POST", new apigateway.LambdaIntegration(lambdas.updateJudge0KeyLambda));
    addOptionsMethod(keyRes);
  }
}

export { ApiNestedStack };
