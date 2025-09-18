import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyUserJwt } from "@/lib/jwt";
import { getUserReportsCollection, convertTimestamp } from "@/lib/firestore";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    await verifyUserJwt(token);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userReportsCollection = getUserReportsCollection();
    const snapshot = await userReportsCollection
      .orderBy('reportTimestamp', 'desc')
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
        time: data.reportTimestamp || now,
        // Include additional Firestore data from userReports
        age: data.age,
        userID: data.userId,
        waterID: data.waterSource,
        symptoms: data.symptoms,
        location: data.location,
        createdAt: data.reportTimestamp ? new Date(data.reportTimestamp) : new Date(now),
        description: data.description,
        symptomStartTimestamp: data.symptomStartTimestamp,
      };
    });

    return NextResponse.json({ items, ts: Date.now() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Error fetching userReports from Firestore:", error);
    return NextResponse.json(
      { error: "Failed to fetch user reports" },
      { status: 500 }
    );
  }
}


export async function POST(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let payload: any;
  try {
    payload = await verifyUserJwt(token);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      age,
      userId,
      waterSource,
      symptoms,
      location,
      description,
      symptomStartTimestamp,
      reportTimestamp,
      region,
    } = body || {};

    // Basic validation
    if (!symptoms || !location) {
      return NextResponse.json({ error: "symptoms and location are required" }, { status: 400 });
    }

    const now = Date.now();
    const doc: Record<string, any> = {
      userId: userId || payload.user?.id,
      symptoms,
      location,
      description: description || '',
      region: region || payload.user?.region || 'Unknown',
      symptomStartTimestamp: symptomStartTimestamp || now,
      reportTimestamp: reportTimestamp || now,
      createdAt: now,
      updatedAt: now,
    };
    if (typeof age === 'number') doc.age = age;
    if (waterSource != null && waterSource !== '') doc.waterSource = waterSource;

    const col = getUserReportsCollection();
    const ref = await col.add(doc as any);

    return NextResponse.json({ id: ref.id, ...doc }, { status: 201 });
  } catch (error) {
    console.error("Error creating user report:", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}

