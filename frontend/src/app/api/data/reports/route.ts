import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyUserJwt } from "@/lib/jwt";

const regions = [
  "Assam",
  "Meghalaya",
  "Manipur",
  "Mizoram",
  "Tripura",
  "Nagaland",
  "Arunachal Pradesh",
  "Sikkim",
];

export async function GET(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await verifyUserJwt(token);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = Array.from({ length: 24 }).map((_, i) => ({
    id: `RPT-${(1000 + i).toString()}`,
    title: ["Suspected cholera", "Diarrheal cases", "Contaminated source", "IoT sensor anomaly"][i % 4],
    district: ["Kamrup", "Tinsukia", "East Khasi Hills", "Imphal West", "Aizawl", "West Tripura"][i % 6],
    region: regions[i % regions.length],
    type: ["outbreak", "report", "sensor"][i % 3],
    time: Date.now() - i * 60 * 60 * 1000,
  }));

  return NextResponse.json({ items, ts: Date.now() }, { headers: { "Cache-Control": "no-store" } });
}


