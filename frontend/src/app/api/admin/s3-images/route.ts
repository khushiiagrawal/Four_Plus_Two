import { NextRequest, NextResponse } from "next/server";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// Check if all S3 environment variables are present
const hasS3Config = process.env.AWS_ACCESS_KEY_ID && 
                   process.env.AWS_SECRET_ACCESS_KEY && 
                   process.env.AWS_REGION && 
                   process.env.S3_BUCKET_NAME;

const s3Client = hasS3Config ? new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
}) : null;

const BUCKET_NAME = process.env.S3_BUCKET_NAME || '';

export async function GET(req: NextRequest) {
  try {
    // Check admin authentication
    const adminToken = req.cookies.get("admin_token")?.value;
    
    if (!adminToken) {
      return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
    }

    try {
      await jwtVerify(adminToken, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid admin token" }, { status: 401 });
    }

    // Check if S3 is configured
    if (!s3Client || !hasS3Config) {
      return NextResponse.json({ 
        error: "S3 configuration missing",
        images: [] 
      }, { status: 200 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(req.url);
    const prefix = searchParams.get('prefix') || 'user-documents/'; // Default to user documents folder
    const maxKeys = parseInt(searchParams.get('maxKeys') || '100');

    // List all objects in the S3 bucket with the specified prefix
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: maxKeys,
    });

    const listResponse = await s3Client.send(listCommand);
    
    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      return NextResponse.json({ 
        message: "No images found",
        images: [],
        total: 0
      });
    }

    // Generate pre-signed URLs for each object
    const imagePromises = listResponse.Contents.map(async (object) => {
      if (!object.Key) return null;

      // Skip folders (objects ending with '/')
      if (object.Key.endsWith('/')) return null;

      // Only process image files
      const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(object.Key);
      if (!isImage) return null;

      try {
        const getObjectCommand = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: object.Key,
        });

        // Generate pre-signed URL with 1-hour expiry
        const signedUrl = await getSignedUrl(s3Client, getObjectCommand, {
          expiresIn: 3600, // 1 hour in seconds
        });

        return {
          key: object.Key,
          fileName: object.Key.split('/').pop() || object.Key,
          signedUrl,
          size: object.Size || 0,
          lastModified: object.LastModified?.toISOString() || null,
          userId: object.Key.includes('user-documents/') ? 
                  object.Key.split('/')[1] : null, // Extract user ID from path
        };
      } catch (error) {
        console.error(`Error generating signed URL for ${object.Key}:`, error);
        return null;
      }
    });

    // Wait for all promises to resolve and filter out null values
    const images = (await Promise.all(imagePromises)).filter(Boolean);

    return NextResponse.json({
      success: true,
      images,
      total: images.length,
      bucket: BUCKET_NAME,
      prefix,
      message: `Found ${images.length} images`
    });

  } catch (error) {
    console.error("S3 images API error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch S3 images",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// Optional: POST endpoint to generate signed URL for a specific file
export async function POST(req: NextRequest) {
  try {
    // Check admin authentication
    const adminToken = req.cookies.get("admin_token")?.value;
    
    if (!adminToken) {
      return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
    }

    try {
      await jwtVerify(adminToken, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid admin token" }, { status: 401 });
    }

    const body = await req.json();
    const { key, expiresIn = 3600 } = body;

    if (!key) {
      return NextResponse.json({ error: "Object key is required" }, { status: 400 });
    }

    // Check if S3 is configured
    if (!s3Client || !hasS3Config) {
      return NextResponse.json({ 
        error: "S3 configuration missing" 
      }, { status: 500 });
    }

    const getObjectCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, getObjectCommand, {
      expiresIn,
    });

    return NextResponse.json({
      success: true,
      key,
      signedUrl,
      expiresIn,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
    });

  } catch (error) {
    console.error("S3 signed URL generation error:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate signed URL",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
