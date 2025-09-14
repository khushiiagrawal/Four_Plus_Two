import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const title = url.searchParams.get("title") || "Sensor Overview";
    const base = process.env.GRAFANA_BASE_URL || "http://localhost:3001";

    const res = await fetch(`${base}/api/search?query=${encodeURIComponent(title)}`, {
      headers: { "Accept": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Grafana search failed: ${res.status}` }, { status: 502 });
    }

    const items: any[] = await res.json();
    const dash = items.find((i) => i.type === "dash-db" && i.title?.toLowerCase() === title.toLowerCase()) || items.find((i) => i.type === "dash-db");

    if (!dash || !dash.url) {
      return NextResponse.json({ error: "Dashboard not found" }, { status: 404 });
    }

    const embedUrl = `${base}${dash.url}?kiosk=tv&refresh=30s`;
    return NextResponse.json({ url: embedUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

