import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyUserJwt } from "@/lib/jwt";

const PROTECTED_PREFIXES = ["/api/data"] as const;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
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

export const config = { matcher: ["/api/data/:path*"] };


