import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getUsersCollection, convertFirestoreUser } from "@/lib/firestore";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-me");

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

    // Fetch all users from Firestore
    const usersCollection = getUsersCollection();
    const snapshot = await usersCollection.orderBy('createdAt', 'desc').get();
    
    const users = snapshot.docs.map(doc => {
      const userData = convertFirestoreUser(doc);
      // Return only the fields we want to expose
      return {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        employeeId: userData.employeeId,
        designation: userData.designation,
        department: userData.department,
        region: userData.region,
        photoIdUrl: userData.photoIdUrl,
        isAuthenticated: userData.isAuthenticated,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      };
    });

    return NextResponse.json({ 
      ok: true, 
      users,
      total: users.length 
    });

  } catch (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
