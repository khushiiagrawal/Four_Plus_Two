import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyUserJwt, AppUser } from "@/lib/jwt";
import { getUsersCollection, convertFirestoreUser } from "@/lib/firestore";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    
    if (!token) {
      return NextResponse.json({ error: "No token found" }, { status: 401 });
    }

    try {
      const payload = await verifyUserJwt(token);
      const jwtUser = (payload as { user: AppUser }).user;
      
      // Fetch fresh user data from database to get current authentication status
      const usersCollection = getUsersCollection();
      const userDoc = await usersCollection.doc(jwtUser.id).get();
      
      if (!userDoc.exists) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      
      const dbUser = convertFirestoreUser(userDoc);
      
      if (!dbUser) {
        return NextResponse.json({ error: "User data not found" }, { status: 404 });
      }
      
      // Create updated user object with fresh data from database
      const user: AppUser = {
        id: dbUser.id,
        name: dbUser.name || "",
        email: dbUser.email || "",
        employeeId: dbUser.employeeId || "",
        designation: dbUser.designation || "",
        department: dbUser.department || "",
        region: dbUser.region || "",
        photoIdUrl: dbUser.photoIdUrl,
        role: "official",
        isAuthenticated: dbUser.isAuthenticated || false, // Use fresh data from database
      };
      
      return NextResponse.json({ 
        ok: true, 
        user 
      });
    } catch {
      
      // If token is expired, clear the cookie completely
      const res = NextResponse.json({ error: "Token expired" }, { status: 401 });
      res.cookies.set(AUTH_COOKIE_NAME, '', {
        httpOnly: true,
        sameSite: "lax" as const,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0, // Expire immediately
      });
      return res;
    }
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
