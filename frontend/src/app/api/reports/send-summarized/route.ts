import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

interface OriginalReport {
  id: string;
  symptoms?: string;
  title: string;
  location?: string;
  region: string;
  time: number;
}

export async function POST(request: NextRequest) {
  try {
    const { summary, originalReports, reportCount } = await request.json();

    if (!summary || !originalReports || !reportCount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection("summarized_reports");

    const summarizedReport = {
      id: `summarized_${Date.now()}`,
      title: `Summarized Report - ${reportCount} Reports`,
      type: "Summarized Health Reports",
      severity: "Medium", // Default severity for summarized reports
      reportedBy: "System (AI Summarized)",
      timestamp: new Date().toISOString(),
      region: originalReports[0]?.region || "Multiple Regions",
      status: "Under Review",
      summary: summary,
      originalReportCount: reportCount,
      originalReports: originalReports.map((report: OriginalReport) => ({
        id: report.id,
        title: report.symptoms || report.title,
        location: report.location || report.region,
        timestamp: report.time,
      })),
      createdAt: new Date(),
      metadata: {
        source: "ai_summarized",
        summarizationDate: new Date().toISOString(),
      },
    };

    await collection.insertOne(summarizedReport);

    return NextResponse.json({
      success: true,
      message: "Summarized report sent to authorities successfully",
      reportId: summarizedReport.id,
    });

  } catch (error) {
    console.error("Error sending summarized report:", error);
    return NextResponse.json(
      { error: "Failed to send summarized report" },
      { status: 500 }
    );
  }
}
