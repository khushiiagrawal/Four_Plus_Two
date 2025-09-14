import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyUserJwt } from "@/lib/jwt";
import { jwtVerify } from "jose";

const PROTECTED_PREFIXES = ["/dashboard", "/api/data"] as const;
const ADMIN_PREFIXES = ["/api/admin"] as const;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Check if it's an admin route
  const isAdminRoute = ADMIN_PREFIXES.some((p) => pathname.startsWith(p));
  if (isAdminRoute) {
    // Skip auth check for admin login route
    if (pathname === "/api/admin/auth") {
      return NextResponse.next();
    }
    
    // Check admin token for other admin routes
    const adminToken = req.cookies.get("admin_token")?.value;
    if (!adminToken) {
      return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
    }
    
    try {
      const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-me");
      await jwtVerify(adminToken, JWT_SECRET);
      return NextResponse.next();
    } catch {
      return NextResponse.json({ error: "Invalid admin token" }, { status: 401 });
    }
  }

  // Check if it's a regular protected route
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL(`/auth?next=${encodeURIComponent(pathname)}`, req.url));
  }
  try {
    await verifyUserJwt(token);
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL(`/auth?next=${encodeURIComponent(pathname)}`, req.url));
    res.cookies.delete(AUTH_COOKIE_NAME);
    return res;
  }
}

export const config = { matcher: ["/dashboard/:path*", "/api/data/:path*", "/api/admin/:path*"] };


