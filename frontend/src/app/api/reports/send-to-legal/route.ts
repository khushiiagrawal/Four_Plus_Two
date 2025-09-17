import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyUserJwt } from "@/lib/jwt";
import { connectToDatabase, LEGAL_REPORTS_COLLECTION } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    const user = await verifyUserJwt(token);
    
    const body = await req.json();
    const { reportId, reportData } = body;
    
    if (!reportId || !reportData) {
      return NextResponse.json({ error: "Missing reportId or reportData" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const legalReportsCollection = db.collection(LEGAL_REPORTS_COLLECTION);
    
    // Create a legal report document
    const legalReport = {
      originalReportId: reportId,
      title: `Environmental Health Report - ${reportData.symptoms || 'Health Concern'}`,
      type: "Health Report",
      severity: "Medium", // Default severity, could be determined by symptoms
      reportedBy: `Field Worker (User: ${reportData.userID || 'Unknown'})`,
      timestamp: new Date().toISOString(),
      region: reportData.location || reportData.region || "Unknown Region",
      status: "Under Review",
      sentAt: new Date(),
      sentBy: user.email,
      reportData: {
        age: reportData.age,
        userID: reportData.userID,
        waterID: reportData.waterID,
        symptoms: reportData.symptoms,
        location: reportData.location,
        originalCreatedAt: reportData.createdAt
      },
      metadata: {
        source: "worker_dashboard",
        originalReportId: reportId
      }
    };

    const result = await legalReportsCollection.insertOne(legalReport);
    
    return NextResponse.json({ 
      success: true, 
      reportId: result.insertedId,
      message: "Report successfully sent to legal authorities"
    });
    
  } catch (error) {
    console.error("Error sending report to legal:", error);
    return NextResponse.json(
      { error: "Failed to send report to legal authorities" },
      { status: 500 }
    );
  }
}