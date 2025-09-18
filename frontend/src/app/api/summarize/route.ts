import { NextRequest, NextResponse } from "next/server";

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const base = process.env.SUMMARIZER_URL || "http://localhost:8000/summarize";
    const res = await fetch(base, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json({ error: data?.detail || "summarizer error" }, { status: 502 });
    }
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "bad request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}


