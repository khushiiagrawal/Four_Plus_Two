import { NextResponse } from "next/server";

const AUTHORITIES_COOKIE_NAME = "authorities_auth_token";

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Clear the authorities auth cookie
  response.cookies.set(AUTHORITIES_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
