import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, LEGAL_REPORTS_COLLECTION } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
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

    // Custom sort: Under Review first, then Completed, both sorted by most recent
    formattedReports.sort((a, b) => {
      // Define status priority
      const statusPriority = {
        "Under Review": 1,
        "Completed": 2,
        "Approved": 3,
        "Rejected": 4
      };
      
      const aPriority = statusPriority[a.status as keyof typeof statusPriority] || 999;
      const bPriority = statusPriority[b.status as keyof typeof statusPriority] || 999;
      
      // First sort by status priority
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // Then sort by sentAt (most recent first)
      const aDate = new Date(a.sentAt || a.timestamp).getTime();
      const bDate = new Date(b.sentAt || b.timestamp).getTime();
      return bDate - aDate;
    });

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

export async function PATCH(req: NextRequest) {
  try {
    const { reportId, status } = await req.json();
    
    if (!reportId || !status) {
      return NextResponse.json(
        { error: "Report ID and status are required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const legalReportsCollection = db.collection(LEGAL_REPORTS_COLLECTION);
    
    // Update the report status
    const result = await legalReportsCollection.updateOne(
      { _id: new ObjectId(reportId) },
      { 
        $set: { 
          status: status,
          updatedAt: new Date().toISOString()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: `Report status updated to ${status}`,
      ts: Date.now()
    });
    
  } catch (error) {
    console.error("Error updating report status:", error);
    return NextResponse.json(
      { error: "Failed to update report status" },
      { status: 500 }
    );
  }
}
