#!/usr/bin/env node
const path = require("path");
const cdk = require("aws-cdk-lib");
const dotenv = require("dotenv");
const { LurnityLmsStack } = require("../lib/lurnitylms-stack");

// Load backend .env file
dotenv.config({ path: path.join(__dirname, "../../backend/.env") });

const app = new cdk.App();

new LurnityLmsStack(app, "LurnityLmsStack", {
  env: { region: process.env.CDK_DEFAULT_REGION || "ap-south-1" },
});
