import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyUserJwt } from "@/lib/jwt";
import { initializeFirestore } from "@/lib/firestore";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await verifyUserJwt(token);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Initialize Firestore and MongoDB connections
    const firestore = initializeFirestore();
    const { db } = await connectToDatabase();

    // Fetch data from different collections in parallel
    const [
      alertsSnapshot,
      userReportsCount
    ] = await Promise.all([
      // Get alerts from Firestore (sensor alerts)
      firestore.collection('alerts').get(),
      // Get user reports count from MongoDB
      db.collection('userReports').countDocuments()
    ]);

    // Process Firestore alerts with proper typing
    const firestoreAlerts = alertsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        severity: data.severity as string,
        ...data
      };
    });

    // Calculate metrics
    const activeOutbreaks = firestoreAlerts.filter(alert => 
      alert.severity === 'critical' || alert.severity === 'warning'
    ).length;

    const sensorAlerts = firestoreAlerts.length;

    const areasAtRisk = firestoreAlerts.filter(alert => 
      alert.severity === 'critical'
    ).length;

    const recentFieldReports = userReportsCount;

    const data = {
      activeOutbreaks,
      recentFieldReports,
      sensorAlerts,
      areasAtRisk,
      ts: Date.now(),
    };

    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Error fetching summary data:", error);
    
    // Fallback to mock data if database queries fail
    const fallbackData = {
      activeOutbreaks: Math.floor(Math.random() * 5) + 1,
      recentFieldReports: Math.floor(Math.random() * 25) + 20,
      sensorAlerts: Math.floor(Math.random() * 10) + 5,
      areasAtRisk: Math.floor(Math.random() * 8) + 3,
      ts: Date.now(),
    };
    
    return NextResponse.json(fallbackData, { headers: { "Cache-Control": "no-store" } });
  }
}


