import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

class DatabaseNestedStack extends cdk.NestedStack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Move all your DynamoDB tables here
    this.userTable = new dynamodb.Table(this, process.env.USER_TABLE_NAME, {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    this.userTable.addGlobalSecondaryIndex({
      indexName: "email-index",
      partitionKey: { name: "email", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    this.courseTable = new dynamodb.Table(this, process.env.COURSE_TABLE_NAME, {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.transactionTable = new dynamodb.Table(this, process.env.TRANSACTION_TABLE_NAME, {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    this.transactionTable.addGlobalSecondaryIndex({
      indexName: "userId-index",
      partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "date", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    this.ticketTable = new dynamodb.Table(this, process.env.TICKET_TABLE_NAME, {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.adminLoginTable = new dynamodb.Table(this, process.env.ADMIN_LOGIN_TABLE || "AdminLoginTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.landingPageTable = new dynamodb.Table(this, process.env.LANDING_PAGE_TABLE || "LandingPageTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.certificateTable = new dynamodb.Table(this, process.env.CERTIFICATE_TABLE_NAME || "CertificateTable", {
  partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
  removalPolicy: cdk.RemovalPolicy.DESTROY,
});

// Add GSI for user + subcourse
this.certificateTable.addGlobalSecondaryIndex({
  indexName: "user-subcourse-index",
  partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
  sortKey: { name: "subCourseTitle", type: dynamodb.AttributeType.STRING },
  projectionType: dynamodb.ProjectionType.ALL,
});
this.certificateTable.addGlobalSecondaryIndex({
  indexName: "userId-index",                 // ✅ This is what your Lambda expects
  partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
  projectionType: dynamodb.ProjectionType.ALL,  // Projects all attributes
});


    this.companyTable = new dynamodb.Table(this, process.env.COMPANY_TABLE_NAME || "CompanyTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.employeeTable = new dynamodb.Table(this, process.env.EMPLOYEE_TABLE_NAME || "EmployeeTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    this.employeeTable.addGlobalSecondaryIndex({
  indexName: "username-index",
  partitionKey: { name: "username", type: dynamodb.AttributeType.STRING },
  projectionType: dynamodb.ProjectionType.ALL,
});

    this.feedbackTable = new dynamodb.Table(this, process.env.FEEDBACK_TABLE_NAME || "FeedbackTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.placementTable = new dynamodb.Table(this, process.env.PLACEMENT_TABLE_NAME || "PlacementTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.workshopTable = new dynamodb.Table(this, process.env.WORKSHOP_TABLE_NAME || "WorkshopTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Forgot Password OTP table
this.forgotPasswordTable = new dynamodb.Table(this, process.env.FORGOT_TABLE_NAME || "ForgotPassword", {
  partitionKey: { name: "requestId", type: dynamodb.AttributeType.STRING },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  timeToLiveAttribute: "expiresAt", // TTL in epoch seconds
  removalPolicy: cdk.RemovalPolicy.DESTROY,
});


    this.demoTable = new dynamodb.Table(this, process.env.DEMO_TABLE_NAME || "DemoTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    this.demoOTPTable = new dynamodb.Table(this, process.env.DEMO_OTP_TABLE_NAME || "DemoOTPTable", {
  partitionKey: { name: "sessionId", type: dynamodb.AttributeType.STRING },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  timeToLiveAttribute: "ttl", // Automatically deletes expired OTPs
  removalPolicy: cdk.RemovalPolicy.DESTROY,
});
  }
}

export { DatabaseNestedStack };
