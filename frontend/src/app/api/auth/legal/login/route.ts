import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

const LEGAL_CREDENTIALS = {
  username: process.env.LEGAL_USERNAME,
  password: process.env.LEGAL_PASSWORD
};

const LEGAL_COOKIE_NAME = "legal_auth_token";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    // Validate credentials
    if (username !== LEGAL_CREDENTIALS.username || password !== LEGAL_CREDENTIALS.password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create JWT token for legal authorities
    const JWT_SECRET = new TextEncoder().encode(
      process.env.JWT_SECRET || "dev-secret-change-me"
    );
    
    const token = await new SignJWT({ 
      type: "legal", 
      username: username,
      iat: Math.floor(Date.now() / 1000)
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(JWT_SECRET);

    const response = NextResponse.json({ success: true });
    
    // Set secure cookie
    response.cookies.set(LEGAL_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Legal auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
