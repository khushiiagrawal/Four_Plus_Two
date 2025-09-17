import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyUserJwt } from "@/lib/jwt";
import { connectToDatabase, AUTHORITIES_REPORTS_COLLECTION } from "@/lib/mongodb";

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
    const authoritiesReportsCollection = db.collection(AUTHORITIES_REPORTS_COLLECTION);
    
    // Create an authorities report document
    const authoritiesReport = {
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

    const result = await authoritiesReportsCollection.insertOne(authoritiesReport);
    
    return NextResponse.json({ 
      success: true, 
      reportId: result.insertedId,
      message: "Report successfully sent to higher authorities"
    });
    
  } catch (error) {
    console.error("Error sending report to authorities:", error);
    return NextResponse.json(
      { error: "Failed to send report to higher authorities" },
      { status: 500 }
    );
  }
}
