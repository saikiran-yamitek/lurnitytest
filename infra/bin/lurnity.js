#!/usr/bin/env node
import path from "path";
import { fileURLToPath } from "url";
import * as cdk from "aws-cdk-lib";
import dotenv from "dotenv";
import { LurnityLmsStack } from "../lib/lurnitylms-stack.js";

// Recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend .env file
dotenv.config({ path: path.join(__dirname, "../../backend/.env") });

const app = new cdk.App();

new LurnityLmsStack(app, "LurnityLmsStack", {
  env: { region: process.env.CDK_DEFAULT_REGION || "ap-south-1" },
});
