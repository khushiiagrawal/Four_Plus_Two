import { NextRequest, NextResponse } from "next/server";
import { authCookie, signUserJwt, type AppUser } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email, password } = body as { email?: string; password?: string };

  if (!email || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  // Mocked official check: only accept official domains
  const isOfficial = /(@gov\.in|@nic\.in|@health\.in|@official\.in|@example\.gov)$/i.test(
    email,
  );
  if (!isOfficial || password.length < 8) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const user: AppUser = {
    id: "u-" + Math.random().toString(36).slice(2, 8),
    name: email.split("@")[0] || "Official",
    email,
    role: "official",
  };

  const token = await signUserJwt(user);
  const res = NextResponse.json({ ok: true, user });
  res.cookies.set(authCookie.name, token, authCookie.options);
  return res;
}


