# Authentication Setup Guide

This guide explains how to set up the complete authentication system with MongoDB and AWS S3.

## Prerequisites

1. **MongoDB**: Install MongoDB locally or use MongoDB Atlas
2. **AWS Account**: Set up an AWS account with S3 access
3. **Node.js**: Version 18 or higher

## Environment Variables

Create a `.env.local` file in the frontend directory with the following variables:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/aquashield

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=your-aws-region
S3_BUCKET_NAME=your-s3-bucket-name

# Next.js
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Setup Steps

### 1. MongoDB Setup

#### Local MongoDB:

1. Install MongoDB Community Edition
2. Start MongoDB service: `mongod`
3. The application will connect to `mongodb://localhost:27017/aquashield`

#### MongoDB Atlas (Cloud):

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string and update `MONGODB_URI`

### 2. AWS S3 Setup

1. **Create S3 Bucket:**

   - Go to AWS S3 Console
   - Create a new bucket with your desired name
   - Note the bucket name and region

2. **Create IAM User:**
   - Go to AWS IAM Console
   - Create a new user with programmatic access
   - Attach the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

3. **Get Credentials:**
   - Copy the Access Key ID and Secret Access Key
   - Update your `.env.local` file

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

```bash
npm run dev
```

## Authentication Flow

### Sign Up Process:

1. User fills out the registration form with all required details
2. System validates official email domain or invitation code
3. Password is hashed using bcrypt
4. Photo ID file (if provided) is uploaded to S3
5. User data is stored in MongoDB
6. JWT token is generated and set as a cookie
7. User is redirected to dashboard

### Login Process:

1. User provides email and password
2. System looks up user in MongoDB
3. Password is verified using bcrypt
4. JWT token is generated and set as a cookie
5. User is redirected to dashboard

## Security Features

- **Password Hashing**: Uses bcrypt with salt rounds of 12
- **JWT Tokens**: Secure tokens with 8-hour expiration
- **File Upload**: Secure S3 upload with unique file names
- **Domain Validation**: Restricts access to official email domains
- **Input Validation**: Comprehensive validation using Zod schemas
- **Error Handling**: Proper error handling and logging

## Database Schema

### Users Collection:

```javascript
{
  _id: ObjectId,
  id: "u-uuid",
  name: "John Doe",
  email: "john@gov.in",
  employeeId: "EMP001",
  designation: "Officer",
  department: "Water Resources",
  region: "Delhi",
  password: "hashed_password",
  photoIdUrl: "https://bucket.s3.region.amazonaws.com/path/to/file",
  invitationCode: "APPROVED-2025",
  role: "official",
  createdAt: Date,
  updatedAt: Date
}
```

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Error:**

   - Ensure MongoDB is running
   - Check connection string format
   - Verify network access (for Atlas)

2. **S3 Upload Error:**

   - Verify AWS credentials
   - Check bucket permissions
   - Ensure bucket exists in specified region

3. **JWT Verification Error:**
   - Check JWT_SECRET is set
   - Verify token hasn't expired
   - Clear cookies and try again

## API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

## Next Steps

1. Set up your MongoDB instance
2. Configure your AWS S3 bucket
3. Update the environment variables
4. Test the authentication flow
5. Deploy to production with secure environment variables
