#!/usr/bin/env node

// Test script to verify MongoDB and S3 connections
require("dotenv").config({ path: ".env.local" });

async function testMongoDB() {
  console.log("🔍 Testing MongoDB connection...");
  try {
    const { MongoClient } = require("mongodb");
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    await client.db().admin().ping();
    console.log("✅ MongoDB connection successful");
    await client.close();
    return true;
  } catch (error) {
    console.log("❌ MongoDB connection failed:", error.message);
    return false;
  }
}

async function testS3() {
  console.log("🔍 Testing S3 connection...");
  try {
    const { S3Client, HeadBucketCommand } = require("@aws-sdk/client-s3");

    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const command = new HeadBucketCommand({
      Bucket: process.env.S3_BUCKET_NAME,
    });

    await s3Client.send(command);
    console.log("✅ S3 connection successful");
    return true;
  } catch (error) {
    console.log("❌ S3 connection failed:", error.message);
    console.log("   Make sure your bucket exists and credentials are correct");
    return false;
  }
}

async function testAll() {
  console.log("🧪 Testing Authentication Setup\n");

  // Check environment variables
  const requiredVars = [
    "MONGODB_URI",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_REGION",
    "S3_BUCKET_NAME",
  ];

  console.log("🔍 Checking environment variables...");
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.log("❌ Missing environment variables:", missingVars.join(", "));
    console.log("   Please run: node setup-env.js");
    process.exit(1);
  }
  console.log("✅ All environment variables are set\n");

  // Test connections
  const mongoOk = await testMongoDB();
  const s3Ok = await testS3();

  console.log("\n📊 Connection Test Results:");
  console.log(`   MongoDB: ${mongoOk ? "✅" : "❌"}`);
  console.log(`   S3: ${s3Ok ? "✅" : "❌"}`);

  if (mongoOk && s3Ok) {
    console.log(
      "\n🎉 All connections successful! Your authentication system is ready."
    );
    console.log("   You can now run: npm run dev");
  } else {
    console.log(
      "\n⚠️  Some connections failed. Please check your configuration."
    );
    console.log("   See AUTHENTICATION_SETUP.md for troubleshooting.");
  }
}

testAll().catch(console.error);
