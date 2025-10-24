import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

class ApiAdminStack extends cdk.NestedStack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const { lambdas } = props;

    // Create SEPARATE API Gateway for Admin
    this.adminApi = new apigateway.RestApi(this, "AdminApi", { 
      restApiName: "AdminApi", 
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

    // Add gateway responses
    this.adminApi.addGatewayResponse('Default4XX', {
      type: apigateway.ResponseType.DEFAULT_4XX,
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
        'Access-Control-Allow-Methods': "'GET,POST,PUT,PATCH,DELETE,OPTIONS'",
        'Access-Control-Allow-Headers': "'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token'"
      }
    });

    this.adminApi.addGatewayResponse('Default5XX', {
      type: apigateway.ResponseType.DEFAULT_5XX,
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
        'Access-Control-Allow-Methods': "'GET,POST,PUT,PATCH,DELETE,OPTIONS'",
        'Access-Control-Allow-Headers': "'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token'"
      }
    });

    // Create /api/admin routes
    const apiResource = this.adminApi.root.addResource("api");
    const adminRes = apiResource.addResource("admin");

    // Admin Auth
    adminRes.addResource("auth").addMethod("POST", new apigateway.LambdaIntegration(lambdas.adminAuthLambda));

    // Admin Users Management
    const usersRes = adminRes.addResource("users");
    usersRes.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listUsersLambda));
    const userIdRes = usersRes.addResource("{id}");
    userIdRes.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateUserLambda));
    userIdRes.addMethod("DELETE", new apigateway.LambdaIntegration(lambdas.deleteUserLambda));
    userIdRes.addMethod("PATCH", new apigateway.LambdaIntegration(lambdas.setUserLockLambda));
    const transactionsRes = userIdRes.addResource("transactions");
    transactionsRes.addMethod("POST", new apigateway.LambdaIntegration(lambdas.createTransactionLambda));

    // Admin Courses
    const adminCoursesRes = adminRes.addResource("courses");
    adminCoursesRes.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listCoursesPublicLambda));
    adminCoursesRes.addMethod("POST", new apigateway.LambdaIntegration(lambdas.createCoursePublicLambda));
    const adminCoursesIdRes = adminCoursesRes.addResource("{id}");
    adminCoursesIdRes.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getCourseByIdPublicLambda));
    adminCoursesIdRes.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateCoursePublicLambda));
    adminCoursesIdRes.addMethod("DELETE", new apigateway.LambdaIntegration(lambdas.deleteCoursePublicLambda));

    // Admin Video Upload
    const adminVideos = adminRes.addResource("videos");
    adminVideos.addResource("presigned-url").addMethod("POST", new apigateway.LambdaIntegration(lambdas.getPresignedUploadUrlLambda));

    // Output the Admin API URL
    new cdk.CfnOutput(this, "AdminApiUrl", {
      value: this.adminApi.url,
      description: "Admin API Gateway URL"
    });
  }
}

export { ApiAdminStack };
