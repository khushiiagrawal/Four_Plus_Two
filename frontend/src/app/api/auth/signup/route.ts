import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { authCookie, signUserJwt, type AppUser } from "@/lib/jwt";
import { getUsersCollection } from "@/lib/firestore";
import { uploadFileToS3 } from "@/lib/s3";

const SignupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  employeeId: z.string().min(3),
  designation: z.string().min(2),
  department: z.string().min(2),
  region: z.string().min(2),
  password: z.string().min(8),
  invitationCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const payload = Object.fromEntries(form.entries());
    const photoIdFile = form.get("photoId") as File | null;
    
    const parse = SignupSchema.safeParse({
      name: payload.name,
      email: payload.email,
      employeeId: payload.employeeId,
      designation: payload.designation,
      department: payload.department,
      region: payload.region,
      password: payload.password,
      invitationCode: payload.invitationCode,
    });

    if (!parse.success) {
      return NextResponse.json({ error: parse.error.flatten() }, { status: 400 });
    }

    // Email validation (basic format check only)
    // Removed domain restrictions - anyone can sign up now

    // Check if user already exists
    const usersCollection = getUsersCollection();
    const emailQuery = await usersCollection.where('email', '==', parse.data.email).limit(1).get();
    const employeeIdQuery = await usersCollection.where('employeeId', '==', parse.data.employeeId).limit(1).get();
    
    const existingUser = !emailQuery.empty || !employeeIdQuery.empty;

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or employee ID already exists" },
        { status: 409 }
      );
    }

    // Generate user ID and hash password
    const userId = "u-" + uuidv4();
    const hashedPassword = await bcrypt.hash(parse.data.password, 12);

    // Upload photo ID to S3 if provided
    let photoIdUrl: string | undefined;
    if (photoIdFile && photoIdFile.size > 0) {
      try {
        photoIdUrl = await uploadFileToS3(photoIdFile, userId);
      } catch (error) {
        console.error("Error uploading file to S3:", error);
        return NextResponse.json(
          { error: "Failed to upload photo ID. Please try again." },
          { status: 500 }
        );
      }
    }

    // Create user document
    const newUser = {
      id: userId,
      name: parse.data.name,
      email: parse.data.email,
      employeeId: parse.data.employeeId,
      designation: parse.data.designation,
      department: parse.data.department,
      region: parse.data.region,
      password: hashedPassword,
      photoIdUrl,
      invitationCode: parse.data.invitationCode,
      role: "official" as const,
      isAuthenticated: false, // Default to false, admin must approve
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save user to Firestore
    try {
      await usersCollection.doc(userId).set(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      return NextResponse.json(
        { error: "Failed to create user account" },
        { status: 500 }
      );
    }

    // Create JWT payload (without sensitive data)
    const userForJwt: AppUser = {
      id: userId,
      name: newUser.name,
      email: newUser.email,
      employeeId: newUser.employeeId,
      designation: newUser.designation,
      department: newUser.department,
      region: newUser.region,
      photoIdUrl: newUser.photoIdUrl,
      role: "official",
      isAuthenticated: newUser.isAuthenticated,
    };

    const token = await signUserJwt(userForJwt);
    const res = NextResponse.json({ 
      ok: true, 
      user: userForJwt,
      message: "Account created successfully" 
    });
    
    res.cookies.set(authCookie.name, token, authCookie.options);
    return res;

  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}


