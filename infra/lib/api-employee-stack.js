import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

class ApiEmployeeStack extends cdk.NestedStack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const { lambdas } = props;

    // Create SEPARATE API Gateway for Employees
    this.employeeApi = new apigateway.RestApi(this, "EmployeeApi", { 
      restApiName: "EmployeeApi", 
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
    this.employeeApi.addGatewayResponse('Default4XX', {
      type: apigateway.ResponseType.DEFAULT_4XX,
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
        'Access-Control-Allow-Methods': "'GET,POST,PUT,PATCH,DELETE,OPTIONS'",
        'Access-Control-Allow-Headers': "'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token'"
      }
    });

    this.employeeApi.addGatewayResponse('Default5XX', {
      type: apigateway.ResponseType.DEFAULT_5XX,
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
        'Access-Control-Allow-Methods': "'GET,POST,PUT,PATCH,DELETE,OPTIONS'",
        'Access-Control-Allow-Headers': "'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token'"
      }
    });

    // Create /api/employees routes
    const apiResource = this.employeeApi.root.addResource("api");
    const employeesRes = apiResource.addResource("employees");
    
    // Employee routes
    employeesRes.addMethod("GET", new apigateway.LambdaIntegration(lambdas.listEmployeesLambda));
    employeesRes.addMethod("POST", new apigateway.LambdaIntegration(lambdas.createEmployeeLambda));
    employeesRes.addResource("login").addMethod("POST", new apigateway.LambdaIntegration(lambdas.employeeLoginLambda));
    
    const empIdRes = employeesRes.addResource("{id}");
    empIdRes.addMethod("GET", new apigateway.LambdaIntegration(lambdas.getEmployeeByIdLambda));
    empIdRes.addMethod("PUT", new apigateway.LambdaIntegration(lambdas.updateEmployeeLambda));
    empIdRes.addMethod("DELETE", new apigateway.LambdaIntegration(lambdas.deleteEmployeeLambda));

    // Output the Employee API URL
    new cdk.CfnOutput(this, "EmployeeApiUrl", {
      value: this.employeeApi.url,
      description: "Employee API Gateway URL"
    });
  }
}

export { ApiEmployeeStack };
