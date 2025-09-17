import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyUserJwt } from "@/lib/jwt";
import { getReportsCollection, convertTimestamp } from "@/lib/firestore";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    await verifyUserJwt(token);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const reportsCollection = getReportsCollection();
    const snapshot = await reportsCollection
      .limit(50)
      .get();

    const items = snapshot.docs.map((doc) => {
      const data = doc.data();
      const now = Date.now();
      
      return {
        id: doc.id,
        title: data.symptoms || "Health Report",
        region: data.location || "Unknown Location",
        district: data.location || "Unknown District",
        type: "health_report",
        time: data.createdAt ? convertTimestamp(data.createdAt).getTime() : now,
        // Include additional Firestore data
        age: data.age,
        userID: data.userID,
        waterID: data.waterID,
        symptoms: data.symptoms,
        location: data.location,
        createdAt: data.createdAt ? convertTimestamp(data.createdAt) : new Date(now),
      };
    });

    return NextResponse.json({ items, ts: Date.now() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Error fetching reports from Firestore:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}


