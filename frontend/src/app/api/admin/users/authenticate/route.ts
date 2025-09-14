import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getUsersCollection } from "@/lib/firestore";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-me");

export async function PATCH(req: NextRequest) {
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
    const { userId, isAuthenticated } = body;

    if (!userId || typeof isAuthenticated !== "boolean") {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    // Update user authentication status
    const usersCollection = getUsersCollection();
    const userDoc = await usersCollection.doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    await userDoc.ref.update({
      isAuthenticated,
      updatedAt: new Date()
    });

    return NextResponse.json({ 
      ok: true, 
      message: `User ${isAuthenticated ? 'approved' : 'rejected'} successfully` 
    });

  } catch (error) {
    console.error("Admin user authentication update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
