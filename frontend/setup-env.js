#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("🔧 Authentication Setup Helper");
console.log("This script will help you set up your environment variables.\n");

const questions = [
  {
    key: "JWT_SECRET",
    question: "Enter a secure JWT secret (or press Enter for auto-generated): ",
    default: () => require("crypto").randomBytes(64).toString("hex"),
  },
  {
    key: "MONGODB_URI",
    question:
      "Enter MongoDB URI (default: mongodb://localhost:27017/aquashield): ",
    default: "mongodb://localhost:27017/aquashield",
  },
  {
    key: "AWS_ACCESS_KEY_ID",
    question: "Enter your AWS Access Key ID: ",
    required: true,
  },
  {
    key: "AWS_SECRET_ACCESS_KEY",
    question: "Enter your AWS Secret Access Key: ",
    required: true,
  },
  {
    key: "AWS_REGION",
    question: "Enter your AWS Region (e.g., us-east-1): ",
    required: true,
  },
  {
    key: "S3_BUCKET_NAME",
    question: "Enter your S3 Bucket Name: ",
    required: true,
  },
];

const envVars = {
  NEXT_PUBLIC_BASE_URL: "http://localhost:3000",
};

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question.question, (answer) => {
      if (!answer && question.required) {
        console.log(`❌ ${question.key} is required!`);
        return askQuestion(question).then(resolve);
      }

      if (!answer && question.default) {
        answer =
          typeof question.default === "function"
            ? question.default()
            : question.default;
      }

      resolve(answer);
    });
  });
}

async function setup() {
  try {
    for (const question of questions) {
      const answer = await askQuestion(question);
      envVars[question.key] = answer;
    }

    // Create .env.local content
    const envContent = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    const envPath = path.join(__dirname, ".env.local");

    // Check if .env.local already exists
    if (fs.existsSync(envPath)) {
      const overwrite = await new Promise((resolve) => {
        rl.question(
          "\n⚠️  .env.local already exists. Overwrite? (y/N): ",
          (answer) => {
            resolve(
              answer.toLowerCase() === "y" || answer.toLowerCase() === "yes"
            );
          }
        );
      });

      if (!overwrite) {
        console.log("❌ Setup cancelled.");
        process.exit(0);
      }
    }

    // Write .env.local file
    fs.writeFileSync(envPath, envContent);

    console.log("\n✅ Environment variables have been saved to .env.local");
    console.log("\n📋 Next steps:");
    console.log("1. Make sure MongoDB is running");
    console.log("2. Verify your S3 bucket exists and has proper permissions");
    console.log("3. Run: npm run dev");
    console.log(
      "\n📖 For detailed setup instructions, see: AUTHENTICATION_SETUP.md"
    );
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
  } finally {
    rl.close();
  }
}

setup();
