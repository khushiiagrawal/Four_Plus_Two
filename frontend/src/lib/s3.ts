import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

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

export async function uploadFileToS3(file: File, userId: string): Promise<string> {
  if (!s3Client || !hasS3Config) {
    console.warn('S3 configuration missing, skipping file upload');
    return `mock-s3-url-${userId}-${file.name}`;
  }

  const fileExtension = file.name.split('.').pop();
  const fileName = `user-documents/${userId}/${uuidv4()}.${fileExtension}`;
  
  const buffer = Buffer.from(await file.arrayBuffer());
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: buffer,
    ContentType: file.type,
    Metadata: {
      originalName: file.name,
      userId: userId,
    },
  });

  await s3Client.send(command);
  
  // Return the S3 URL
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
}

export { s3Client };
