import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyUserJwt } from "@/lib/jwt";
import { jwtVerify } from "jose";

const PROTECTED_PREFIXES = ["/dashboard", "/api/data"] as const;
const ADMIN_PREFIXES = ["/api/admin"] as const;
const LEGAL_PREFIXES = ["/legal/dashboard"] as const;
const LEGAL_COOKIE_NAME = "legal_auth_token";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Check if it's a legal authorities route
  const isLegalRoute = LEGAL_PREFIXES.some((p) => pathname.startsWith(p));
  if (isLegalRoute) {
    const legalToken = req.cookies.get(LEGAL_COOKIE_NAME)?.value;
    if (!legalToken) {
      return NextResponse.redirect(new URL(`/legal?next=${encodeURIComponent(pathname)}`, req.url));
    }
    
    try {
      const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-me");
      const { payload } = await jwtVerify(legalToken, JWT_SECRET);
      if (payload.type !== "legal") {
        throw new Error("Invalid token type");
      }
      return NextResponse.next();
    } catch {
      const res = NextResponse.redirect(new URL(`/legal?next=${encodeURIComponent(pathname)}`, req.url));
      res.cookies.delete(LEGAL_COOKIE_NAME);
      return res;
    }
  }
  
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

export const config = { matcher: ["/dashboard/:path*", "/api/data/:path*", "/api/admin/:path*", "/legal/dashboard/:path*"] };


