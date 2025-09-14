import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { authCookie, signUserJwt, type AppUser } from "@/lib/jwt";
import { getUsersCollection, convertFirestoreUser } from "@/lib/firestore";
import { User } from "@/types/user";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    // Basic validation
    if (password.length < 8) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Find user in Firestore
    const usersCollection = getUsersCollection();
    const userQuery = await usersCollection.where('email', '==', email).limit(1).get();
    
    if (userQuery.empty) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    
    const userDoc = userQuery.docs[0];
    const user = convertFirestoreUser(userDoc) as User | null;

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Check if user is authenticated (approved by admin)
    if (!user.isAuthenticated) {
      return NextResponse.json({ 
        error: "User not given access yet. Please wait for admin approval.",
        requiresApproval: true 
      }, { status: 403 });
    }

    // Create JWT payload (without sensitive data)
    const userForJwt: AppUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      employeeId: user.employeeId,
      designation: user.designation,
      department: user.department,
      region: user.region,
      photoIdUrl: user.photoIdUrl,
      role: "official",
      isAuthenticated: user.isAuthenticated,
    };

    // Update last login time
    await userDoc.ref.update({
      updatedAt: new Date()
    });

    const token = await signUserJwt(userForJwt);
    const res = NextResponse.json({ 
      ok: true, 
      user: userForJwt,
      message: "Login successful" 
    });
    
    res.cookies.set(authCookie.name, token, authCookie.options);
    return res;

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}


