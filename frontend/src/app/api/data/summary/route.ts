import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyUserJwt } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await verifyUserJwt(token);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mocked summary data
  const data = {
    activeOutbreaks: Math.floor(Math.random() * 5) + 1,
    recentFieldReports: Math.floor(Math.random() * 25) + 20,
    sensorAlerts: Math.floor(Math.random() * 10) + 5,
    areasAtRisk: Math.floor(Math.random() * 8) + 3,
    ts: Date.now(),
  };
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}


