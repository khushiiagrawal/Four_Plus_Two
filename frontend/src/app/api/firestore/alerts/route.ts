import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyUserJwt } from "@/lib/jwt";
import { initializeFirestore } from "@/lib/firestore";

// Define the Firestore alert interface based on the sensor ingest route
interface FirestoreAlert {
  id: string;
  waterSource?: string | null;
  title: string;
  shortSummary: string;
  longSummary?: string | null;
  timestamp: number;
  severity: "critical" | "warning" | "info";
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    await verifyUserJwt(token);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const firestore = initializeFirestore();
    
    // Fetch alerts from Firestore, ordered by timestamp (newest first)
    const alertsSnapshot = await firestore
      .collection('alerts')
      .orderBy('timestamp', 'desc')
      .limit(50) // Limit to most recent 50 alerts
      .get();

    const alerts: FirestoreAlert[] = alertsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        waterSource: data.waterSource || null,
        title: data.title || "Water Quality Alert",
        shortSummary: data.shortSummary || "Alert from water quality monitoring",
        longSummary: data.longSummary || null,
        timestamp: data.timestamp || Date.now(),
        severity: data.severity || "info",
      };
    });

    return NextResponse.json({ alerts }, { 
      headers: { "Cache-Control": "no-store" } 
    });
  } catch (error) {
    console.error("Error fetching Firestore alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}
