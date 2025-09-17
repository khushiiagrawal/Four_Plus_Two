import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, Alert, ALERTS_COLLECTION } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET - Fetch all alerts
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    const alerts = await db
      .collection<Alert>(ALERTS_COLLECTION)
      .find({})
      .sort({ createdAt: -1 }) // Most recent first
      .toArray();

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

// POST - Create new alert
export async function POST(req: NextRequest) {
  try {
    const { title, description, location } = await req.json();

    // Validate required fields
    if (!title || !description || !location) {
      return NextResponse.json(
        { error: "Title, description, and location are required" },
        { status: 400 }
      );
    }

    // Determine alert type based on keywords in title/description
    const alertText = `${title} ${description}`.toLowerCase();
    let type: Alert["type"] = "info";
    
    if (alertText.includes("critical") || alertText.includes("emergency") || alertText.includes("urgent")) {
      type = "critical";
    } else if (alertText.includes("warning") || alertText.includes("alert") || alertText.includes("caution")) {
      type = "warning";
    }

    const { db } = await connectToDatabase();
    
    const newAlert: Omit<Alert, "_id"> = {
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      type,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection<Alert>(ALERTS_COLLECTION)
      .insertOne(newAlert);

    const createdAlert = {
      _id: result.insertedId.toString(),
      ...newAlert,
    };

    return NextResponse.json(createdAlert, { status: 201 });
  } catch (error) {
    console.error("Error creating alert:", error);
    return NextResponse.json(
      { error: "Failed to create alert" },
      { status: 500 }
    );
  }
}

// PATCH - Update alert status
export async function PATCH(req: NextRequest) {
  try {
    const { alertId, status } = await req.json();
    
    if (!alertId || !status) {
      return NextResponse.json(
        { error: "Alert ID and status are required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Update the alert status
    const result = await db
      .collection<Alert>(ALERTS_COLLECTION)
      .updateOne(
        { _id: new ObjectId(alertId) },
        { 
          $set: { 
            status: status,
            updatedAt: new Date()
          } 
        }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Alert not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: `Alert status updated to ${status}`,
      ts: Date.now()
    });
    
  } catch (error) {
    console.error("Error updating alert status:", error);
    return NextResponse.json(
      { error: "Failed to update alert status" },
      { status: 500 }
    );
  }
}
