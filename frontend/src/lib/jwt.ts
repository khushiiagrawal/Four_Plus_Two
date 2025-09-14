import { SignJWT, jwtVerify } from "jose";
import type { JWTPayload } from "jose";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  designation: string;
  department: string;
  region: string;
  photoIdUrl?: string;
  role: "official";
};

const encoder = new TextEncoder();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_ISSUER = "aquashield";

export async function signUserJwt(user: AppUser, expiresInSec = 60 * 60 * 8) {
  const jwt = await new SignJWT({ user } as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setExpirationTime(expiresInSec)
    .sign(encoder.encode(JWT_SECRET));
  return jwt;
}

export async function verifyUserJwt(token: string) {
  const { payload } = await jwtVerify(token, encoder.encode(JWT_SECRET), {
    issuer: JWT_ISSUER,
  });
  return payload as JWTPayload & { user: AppUser };
}

export const AUTH_COOKIE_NAME = "aquashield_token";

export const authCookie = {
  name: AUTH_COOKIE_NAME,
  options: {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  },
};


