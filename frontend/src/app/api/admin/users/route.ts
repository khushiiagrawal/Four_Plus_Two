import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getUsersCollection } from "@/lib/mongodb";

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

    // Fetch all users from MongoDB
    const usersCollection = await getUsersCollection();
    const users = await usersCollection
      .find({}, {
        projection: {
          _id: 0,
          id: 1,
          name: 1,
          email: 1,
          employeeId: 1,
          designation: 1,
          department: 1,
          region: 1,
          photoIdUrl: 1,
          createdAt: 1,
          updatedAt: 1
        }
      })
      .sort({ createdAt: -1 })
      .toArray();

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
