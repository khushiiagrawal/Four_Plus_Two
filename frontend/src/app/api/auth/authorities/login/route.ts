import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

const AUTHORITIES_CREDENTIALS = {
  username: process.env.AUTHORITIES_USERNAME,
  password: process.env.AUTHORITIES_PASSWORD
};

const AUTHORITIES_COOKIE_NAME = "authorities_auth_token";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    // Validate credentials
    if (username !== AUTHORITIES_CREDENTIALS.username || password !== AUTHORITIES_CREDENTIALS.password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create JWT token for authorities
    const JWT_SECRET = new TextEncoder().encode(
      process.env.JWT_SECRET || "dev-secret-change-me"
    );
    
    const token = await new SignJWT({ 
      type: "authorities", 
      username: username,
      iat: Math.floor(Date.now() / 1000)
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(JWT_SECRET);

    const response = NextResponse.json({ success: true });
    
    // Set secure cookie
    response.cookies.set(AUTHORITIES_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Authorities auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
