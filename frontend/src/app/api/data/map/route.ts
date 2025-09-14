import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyUserJwt } from "@/lib/jwt";

type Point = { id: string; lat: number; lng: number; type: "outbreak" | "sensor" | "water"; intensity?: number };

export async function GET(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await verifyUserJwt(token);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Approx northeast India bounding box
  const points: Point[] = Array.from({ length: 20 }).map((_, i) => ({
    id: String(i + 1),
    lat: 26 + Math.random() * 6, // 26-32
    lng: 88 + Math.random() * 8, // 88-96
    type: (['outbreak', 'sensor', 'water'] as const)[Math.floor(Math.random() * 3)],
    intensity: Math.random(),
  }));

  return NextResponse.json({ points, ts: Date.now() }, { headers: { "Cache-Control": "no-store" } });
}


