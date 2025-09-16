import { NextResponse } from "next/server";

const LEGAL_COOKIE_NAME = "legal_auth_token";

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Clear the legal auth cookie
  response.cookies.set(LEGAL_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
