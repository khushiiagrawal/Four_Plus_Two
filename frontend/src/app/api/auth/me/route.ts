import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyUserJwt, AppUser } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    
    if (!token) {
      return NextResponse.json({ error: "No token found" }, { status: 401 });
    }

    try {
      const payload = await verifyUserJwt(token);
      const user = (payload as { user: AppUser }).user;
      
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
