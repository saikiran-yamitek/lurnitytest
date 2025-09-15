const cdk = require("aws-cdk-lib");
const apigateway = require("aws-cdk-lib/aws-apigateway");

class ApiNestedStack extends cdk.NestedStack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const { lambdas } = props;

    // Create API Gateway
    this.api = new apigateway.RestApi(this, "LurnityLmsApi", { 
      restApiName: "LurnityLmsApi", 
      deployOptions: { stageName: process.env.STAGE || "dev" } 
    });

    // Move all your API Gateway routes here (exactly as they are in your original file)
    // --- Admin ---
    const adminRes = this.api.root.addResource("admin");
    adminRes.addResource("auth").addMethod("POST", new apigateway.LambdaIntegration(lambdas.adminAuthLambda));

    const usersRes = adminRes.addResource("users");
    usersRes.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listUsersLambda));
    const userIdRes = usersRes.addResource("{id}");
    userIdRes.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateUserLambda));
    userIdRes.addMethod("DELETE", new apigateway.LambdaIntegration(lambdas.deleteUserLambda));
    userIdRes.addMethod("PATCH", new apigateway.LambdaIntegration(lambdas.setUserLockLambda));

    // --- Employees ---
    const employeesRes = this.api.root.addResource("employees");
    employeesRes.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listEmployeesLambda));
    employeesRes.addMethod("POST", new apigateway.LambdaIntegration(lambdas.createEmployeeLambda));
    employeesRes.addResource("login").addMethod("POST", new apigateway.LambdaIntegration(lambdas.employeeLoginLambda));
    const empIdRes = employeesRes.addResource("{id}");
    empIdRes.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getEmployeeByIdLambda));
    empIdRes.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateEmployeeLambda));
    empIdRes.addMethod("DELETE", new apigateway.LambdaIntegration(lambdas.deleteEmployeeLambda));

    // --- LandingPage ---
    const landingPage = this.api.root.addResource("landingPage");
    landingPage.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getLatestLandingPageLambda));
    const cohorts = landingPage.addResource("cohorts");
    cohorts.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getCohortsLambda));
    cohorts.addMethod("POST", new apigateway.LambdaIntegration(lambdas.createCohortLambda));
    const cohortId = cohorts.addResource("{id}");
    cohortId.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateCohortLambda));
    cohortId.addMethod("DELETE", new apigateway.LambdaIntegration(lambdas.deleteCohortLambda));

    // --- Certificates ---
    const certificates = this.api.root.addResource("certificates");
    certificates.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listCertificatesLambda));
    certificates.addResource("generate").addMethod("POST", new apigateway.LambdaIntegration(lambdas.generateCertificateLambda));
    certificates.addResource("check-exists").addMethod("POST", new apigateway.LambdaIntegration(lambdas.checkCertificateExistsLambda));
    certificates.addResource("{id}").addMethod("GET", new apigateway.LambdaIntegration(lambdas.getCertificateByIdLambda));
    certificates.addResource("user").addResource("{userId}").addMethod("GET", new apigateway.LambdaIntegration(lambdas.listCertificatesByUserLambda));

    // --- Companies ---
    const companies = this.api.root.addResource("companies");
    companies.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getCompaniesLambda));
    companies.addMethod("POST", new apigateway.LambdaIntegration(lambdas.createCompanyLambda));
    companies.addResource("{id}").addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateCompanyLambda));

    // --- Feedback ---
    const feedback = this.api.root.addResource("feedback");
    feedback.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listFeedbacksLambda));
    feedback.addResource("submit").addMethod("POST", new apigateway.LambdaIntegration(lambdas.submitFeedbackLambda));
    feedback.addResource("{id}").addMethod("DELETE", new apigateway.LambdaIntegration(lambdas.deleteFeedbackLambda));

    // --- Placements ---
    const placements = this.api.root.addResource("placements");
    placements.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listPlacementsLambda));
    placements.addMethod("POST", new apigateway.LambdaIntegration(lambdas.createPlacementLambda));
    const placementId = placements.addResource("{id}");
    placementId.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getPlacementByIdLambda));
    placementId.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updatePlacementLambda));
    placementId.addMethod("DELETE", new apigateway.LambdaIntegration(lambdas.deletePlacementLambda));

    // --- Workshops ---
    const workshops = this.api.root.addResource("workshops");
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
    const courses = this.api.root.addResource("courses");
    courses.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listCoursesPublicLambda));
    courses.addMethod("POST", new apigateway.LambdaIntegration(lambdas.createCoursePublicLambda));
    const coursesId = courses.addResource("{id}");
    coursesId.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getCourseByIdPublicLambda));
    coursesId.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateCoursePublicLambda));
    coursesId.addMethod("DELETE", new apigateway.LambdaIntegration(lambdas.deleteCoursePublicLambda));

    // --- Demos ---
    const demos = this.api.root.addResource("demos");
    demos.addMethod("POST", new apigateway.LambdaIntegration(lambdas.createDemoLambda));
    demos.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listDemosLambda));
    demos.addResource("{id}").addResource("booked").addMethod("PUT", new apigateway.LambdaIntegration(lambdas.markDemoBookedLambda));

    // --- Transcribe ---
    const transcribe = this.api.root.addResource("transcribe");
    transcribe.addMethod("POST", new apigateway.LambdaIntegration(lambdas.transcribeLambda));

    // --- Tickets ---
    const tickets = this.api.root.addResource("tickets");
    tickets.addMethod("POST", new apigateway.LambdaIntegration(lambdas.createTicketLambda));
    tickets.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listTicketsLambda));
    const ticketId = tickets.addResource("{id}");
    ticketId.addMethod("PATCH", new apigateway.LambdaIntegration(lambdas.updateTicketLambda));

    // --- Rankings ---
    const rankings = this.api.root.addResource("rankings");
    rankings.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getRankingsLambda));

    // --- Progress ---
    const progress = this.api.root.addResource("progress");
    progress.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getProgressLambda));
    progress.addResource("watch").addMethod("POST", new apigateway.LambdaIntegration(lambdas.watchProgressLambda));

    // --- Auth endpoints ---
    const authRes = this.api.root.addResource("auth");
    authRes.addResource("login").addMethod("POST", new apigateway.LambdaIntegration(lambdas.authLoginLambda));
    authRes.addResource("google-login").addMethod("POST", new apigateway.LambdaIntegration(lambdas.authGoogleLoginLambda));

    // --- User API Gateway routes ---
    const userRes = this.api.root.addResource("user");
    userRes.addResource("register").addMethod("POST", new apigateway.LambdaIntegration(lambdas.registerUserLambda));
    userRes.addResource("homepage").addMethod("GET", new apigateway.LambdaIntegration(lambdas.homepageUserLambda));
    userRes.addResource("resume").addMethod("GET", new apigateway.LambdaIntegration(lambdas.getResumeDataLambda));
    userRes.addResource("completedSubcourses").addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateCompletedSubcoursesLambda));
    userRes.addResource("alert").addMethod("POST", new apigateway.LambdaIntegration(lambdas.setAlertLambda));
    
    const profileResource = userRes.addResource("profile");
    profileResource.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateProfileLambda));
    profileResource.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getProfileLambda));

    userRes.addResource("projects").addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateProjectsLambda));
    userRes.addResource("practiceResult").addMethod("POST", new apigateway.LambdaIntegration(lambdas.addPracticeResultLambda));
    userRes.addResource("practiceHistory").addMethod("GET", new apigateway.LambdaIntegration(lambdas.getPracticeHistoryLambda));
    
    const streakDataResource = userRes.addResource("streakData");
    streakDataResource.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getStreakDataLambda));
    streakDataResource.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateStreakDataLambda));

    userRes.addResource("courseCompletion").addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateCourseCompletionLambda));
    userRes.addResource("saveQuestion").addMethod("POST", new apigateway.LambdaIntegration(lambdas.saveQuestionLambda));
    userRes.addResource("savedQuestions").addMethod("GET", new apigateway.LambdaIntegration(lambdas.getSavedQuestionsLambda));
    userRes.addResource("save-key").addMethod("POST", new apigateway.LambdaIntegration(lambdas.saveKeyLambda));
    userRes.addResource("get-key").addMethod("POST", new apigateway.LambdaIntegration(lambdas.getKeyLambda));
    userRes.addResource("mock-questions").addMethod("POST", new apigateway.LambdaIntegration(lambdas.mockQuestionsLambda));

    // --- API routes for Judge0 key ---
    const apiRes = this.api.root.addResource("api");
    const keyRes = apiRes.addResource("key");
    keyRes.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getJudge0KeyLambda));
    keyRes.addMethod("POST", new apigateway.LambdaIntegration(lambdas.updateJudge0KeyLambda));
  }
}

module.exports = { ApiNestedStack };
