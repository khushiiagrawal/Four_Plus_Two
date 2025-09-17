import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, LEGAL_REPORTS_COLLECTION } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const legalReportsCollection = db.collection(LEGAL_REPORTS_COLLECTION);
    
    // Fetch all legal reports, sorted by most recent first
    const reports = await legalReportsCollection
      .find({})
      .sort({ sentAt: -1 })
      .limit(50)
      .toArray();

    // Transform the data to match the expected format
    const formattedReports = reports.map((report) => ({
      id: report._id.toString(),
      title: report.title,
      type: report.type,
      severity: report.severity,
      reportedBy: report.reportedBy,
      timestamp: report.timestamp,
      region: report.region,
      status: report.status,
      sentAt: report.sentAt,
      sentBy: report.sentBy,
      reportData: report.reportData,
      metadata: report.metadata
    }));

    return NextResponse.json({ 
      reports: formattedReports,
      count: formattedReports.length,
      ts: Date.now()
    }, { 
      headers: { "Cache-Control": "no-store" } 
    });
    
  } catch (error) {
    console.error("Error fetching legal reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch legal reports" },
      { status: 500 }
    );
  }
}
