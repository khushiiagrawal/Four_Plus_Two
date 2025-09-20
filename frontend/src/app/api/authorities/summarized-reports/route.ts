import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("summarized_reports");

    // Get all summarized reports, sorted by creation date (newest first)
    const reports = await collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(50) // Limit to 50 most recent reports
      .toArray();

    return NextResponse.json({
      success: true,
      reports: reports,
      count: reports.length,
    });

  } catch (error) {
    console.error("Error fetching summarized reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch summarized reports" },
      { status: 500 }
    );
  }
}

