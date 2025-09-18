import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyUserJwt } from "@/lib/jwt";
import { initializeFirestore } from "@/lib/firestore";
import { getMessaging } from "firebase-admin/messaging";

// Define the alert interface matching the Android schema
interface AlertData {
  id: string;
  waterSource?: string | null;
  title: string;
  shortSummary: string;
  longSummary?: string | null;
  timestamp: number;
  severity: "critical" | "warning" | "info";
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    await verifyUserJwt(token);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const alertData: AlertData = await req.json();

    // Validate required fields
    if (!alertData.id || !alertData.title || !alertData.shortSummary) {
      return NextResponse.json(
        { error: "Missing required fields: id, title, shortSummary" },
        { status: 400 }
      );
    }

    // Initialize Firebase services
    initializeFirestore(); // This initializes the Firebase app if not already done
    const messaging = getMessaging();

    // Prepare FCM message with data that matches Android schema
    const fcmMessage = {
      topic: "alerts", // Using the same topic as in your functions
      notification: {
        title: alertData.title,
        body: alertData.shortSummary,
      },
      data: {
        type: "water_quality_alert",
        alertId: alertData.id,
        id: alertData.id,
        waterSource: alertData.waterSource || "",
        title: alertData.title,
        shortSummary: alertData.shortSummary,
        longSummary: alertData.longSummary || "",
        timestamp: alertData.timestamp.toString(),
        severity: alertData.severity,
      },
      android: {
        priority: alertData.severity === "critical" ? "high" as const : "normal" as const,
        notification: {
          channelId: "water_quality_alerts",
          priority: alertData.severity === "critical" ? "high" as const : "default" as const,
          defaultSound: true,
          defaultVibrateTimings: true,
        },
      },
    };

    // Send FCM notification
    const messageId = await messaging.send(fcmMessage);

    console.log("FCM notification sent successfully:", messageId);
    console.log("Alert data sent:", alertData);

    return NextResponse.json({ 
      success: true, 
      messageId,
      alertId: alertData.id 
    });

  } catch (error) {
    console.error("Error sending FCM notification:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("messaging")) {
        return NextResponse.json(
          { error: "Failed to initialize messaging service" },
          { status: 500 }
        );
      }
      if (error.message.includes("topic")) {
        return NextResponse.json(
          { error: "Invalid FCM topic" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to send alert notification" },
      { status: 500 }
    );
  }
}
