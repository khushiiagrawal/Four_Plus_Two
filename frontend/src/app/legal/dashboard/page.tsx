"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useToast } from "@/components/ui/Toast";

interface Alert {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  message?: string;
  type: string;
  status: string;
  location?: string;
  region?: string;
  createdAt?: string;
  timestamp?: string;
  metadata?: {
    source?: string;
    reportData?: {
      age?: number;
      userID?: string;
      waterID?: string;
      symptoms?: string;
    };
  };
}

interface LegalReport {
  id: string;
  title: string;
  type: string;
  severity: string;
  reportedBy: string;
  timestamp: string;
  region: string;
  status: string;
  sentAt?: string;
  sentBy?: string;
  reportData?: {
    age?: number;
    userID?: string;
    waterID?: string;
    symptoms?: string;
    location?: string;
    originalCreatedAt?: Date;
  };
  metadata?: {
    source?: string;
    originalReportId?: string;
  };
}

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((r) => r.json());

export default function LegalDashboardPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking authentication
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Fetch alerts from API
  const { data: alertsFromAPI, error: alertsError } = useSWR(
    "/api/alerts",
    fetcher,
    {
      refreshInterval: 30_000, // Refresh every 30 seconds
    }
  );

  // Fetch legal reports from MongoDB
  const { data: legalReportsData, error: reportsError } = useSWR(
    "/api/legal-reports",
    fetcher,
    {
      refreshInterval: 30_000, // Refresh every 30 seconds
    }
  );

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/legal/logout", { method: "POST" });
      addToast({
        type: "success",
        title: "Logged Out",
        message: "You have been successfully logged out.",
      });
      router.push("/legal");
    } catch {
      addToast({
        type: "error",
        title: "Logout Error",
        message: "Failed to logout. Please try again.",
      });
    }
  };

  // Use real alerts from API, fallback to empty array
  const alertsData = alertsFromAPI || [];

  // Show error toast if there's an error fetching alerts or reports
  useEffect(() => {
    if (alertsError) {
      addToast({
        type: "error",
        title: "Error Loading Alerts",
        message: "Failed to load alerts from server.",
      });
    }
    if (reportsError) {
      addToast({
        type: "error",
        title: "Error Loading Reports",
        message: "Failed to load environmental reports from server.",
      });
    }
  }, [alertsError, reportsError, addToast]);

  // Use real reports from MongoDB, fallback to empty array
  const reportsData: LegalReport[] = legalReportsData?.reports || [];

  // Calculate dynamic metrics from actual data
  const activeAlerts = alertsData.filter(
    (a: Alert) => a.status === "active"
  ).length;
  const pendingReports = reportsData.filter(
    (r: LegalReport) => r.status === "Under Review"
  ).length;
  const highPriorityReports = reportsData.filter(
    (r: LegalReport) => r.severity === "High"
  ).length;
  const uniqueZones = [
    ...new Set([
      ...alertsData.map((a: Alert) => a.location),
      ...reportsData.map((r: LegalReport) => r.region),
    ]),
  ].filter((zone) => zone && zone !== "All Zones").length;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return "🚨";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "📢";
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "critical":
        return "border-red-500/50 bg-red-500/10";
      case "warning":
        return "border-yellow-500/50 bg-yellow-500/10";
      case "info":
        return "border-blue-500/50 bg-blue-500/10";
      default:
        return "border-gray-500/50 bg-gray-500/10";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High":
        return "text-red-400 bg-red-500/10";
      case "Medium":
        return "text-yellow-400 bg-yellow-500/10";
      case "Low":
        return "text-green-400 bg-green-500/10";
      default:
        return "text-gray-400 bg-gray-500/10";
    }
  };

  if (isLoading) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center"
        style={{
          background:
            "linear-gradient(to bottom, #25404c, #1f4a5e, #1e485c, #1e4558, #1d4254, #1c3e50, #1b3b4b, #1b3745, #193440, #18303c)",
        }}
      >
        <div className="text-center">
          <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse mx-auto mb-4" />
          <p className="text-white/70">Loading Legal Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-dvh p-4 md:p-6"
      style={{
        background:
          "linear-gradient(to bottom, #25404c, #1f4a5e, #1e485c, #1e4558, #1d4254, #1c3e50, #1b3b4b, #1b3745, #193440, #18303c)",
      }}
    >
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-white">
            Legal Authorities Dashboard
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Environmental Monitoring & Compliance Oversight
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center text-xs rounded-full bg-red-500/15 text-red-300 px-3 py-1 border border-red-500/20">
            🔒 Secure Access
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg border border-red-500/30 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl p-4 bg-white/30 backdrop-blur border border-white/20 shadow-sm">
          <div className="text-xs text-slate-200">Active Alerts</div>
          <div className="text-2xl md:text-3xl font-semibold mt-1 text-white">
            {activeAlerts}
          </div>
        </div>
        <div className="rounded-2xl p-4 bg-white/30 backdrop-blur border border-white/20 shadow-sm">
          <div className="text-xs text-slate-200">Pending Reports</div>
          <div className="text-2xl md:text-3xl font-semibold mt-1 text-white">
            {pendingReports}
          </div>
        </div>
        <div className="rounded-2xl p-4 bg-white/30 backdrop-blur border border-white/20 shadow-sm">
          <div className="text-xs text-slate-200">High Priority</div>
          <div className="text-2xl md:text-3xl font-semibold mt-1 text-white">
            {highPriorityReports}
          </div>
        </div>
        <div className="rounded-2xl p-4 bg-white/30 backdrop-blur border border-white/20 shadow-sm">
          <div className="text-xs text-slate-200">Zones Monitored</div>
          <div className="text-2xl md:text-3xl font-semibold mt-1 text-white">
            {uniqueZones}
          </div>
        </div>
      </section>

      {/* Real-time Alerts Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            🚨 Real-time Alerts
          </h2>
          <span className="text-xs text-slate-400">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
        <div className="space-y-3">
          {!alertsFromAPI && !alertsError ? (
            // Loading state
            <div className="rounded-xl p-4 bg-white/20 backdrop-blur border border-white/10 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 animate-pulse" />
                <div className="flex-1">
                  <div className="w-3/4 h-4 bg-white/20 rounded animate-pulse mb-2" />
                  <div className="w-full h-3 bg-white/20 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ) : alertsData.length === 0 ? (
            // No alerts state
            <div className="rounded-xl p-8 bg-white/20 backdrop-blur border border-white/10 shadow-sm text-center">
              <div className="text-4xl mb-2">🔕</div>
              <p className="text-white/70">No alerts at this time</p>
              <p className="text-white/50 text-xs mt-1">
                All systems are operating normally
              </p>
            </div>
          ) : (
            alertsData.map((alert: Alert) => (
              <div
                key={alert._id || alert.id}
                className={`rounded-xl p-4 backdrop-blur border ${getAlertColor(
                  alert.type
                )} shadow-sm`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-xl">{getAlertIcon(alert.type)}</span>
                    <div className="flex-1">
                      <h3 className="font-medium text-white text-sm">
                        {alert.title}
                      </h3>
                      <p className="text-slate-300 text-xs mt-1">
                        {alert.description || alert.message}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span>📍 {alert.location || alert.region}</span>
                        <span>
                          🕒{" "}
                          {alert.createdAt
                            ? new Date(alert.createdAt).toLocaleString()
                            : alert.timestamp}
                        </span>
                        {alert.metadata?.source === "health_report" && (
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                            Health Report
                          </span>
                        )}
                      </div>
                      {alert.metadata?.reportData && (
                        <div className="mt-2 p-2 bg-slate-500/10 rounded-lg">
                          <div className="text-xs text-slate-300 font-medium mb-1">
                            Health Report Details:
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-xs text-slate-400">
                            {alert.metadata.reportData.age && (
                              <div>👤 Age: {alert.metadata.reportData.age}</div>
                            )}
                            {alert.metadata.reportData.userID && (
                              <div>
                                🆔 User: {alert.metadata.reportData.userID}
                              </div>
                            )}
                            {alert.metadata.reportData.waterID && (
                              <div>
                                💧 Water: {alert.metadata.reportData.waterID}
                              </div>
                            )}
                            {alert.metadata.reportData.symptoms && (
                              <div className="col-span-2">
                                🩺 Symptoms:{" "}
                                {alert.metadata.reportData.symptoms}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium capitalize
                  ${
                    alert.status === "active"
                      ? "bg-red-500/20 text-red-300"
                      : alert.status === "investigating"
                      ? "bg-yellow-500/20 text-yellow-300"
                      : "bg-green-500/20 text-green-300"
                  }`}
                  >
                    {alert.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Reports Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            📋 Environmental Reports
          </h2>
          <button className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg border border-blue-500/30 text-sm transition-colors">
            View All Reports
          </button>
        </div>
        <div className="space-y-3">
          {!legalReportsData && !reportsError ? (
            // Loading state
            <div className="rounded-xl p-4 bg-white/20 backdrop-blur border border-white/10 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 animate-pulse" />
                <div className="flex-1">
                  <div className="w-3/4 h-4 bg-white/20 rounded animate-pulse mb-2" />
                  <div className="w-full h-3 bg-white/20 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ) : reportsData.length === 0 ? (
            // No reports state
            <div className="rounded-xl p-8 bg-white/20 backdrop-blur border border-white/10 shadow-sm text-center">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-white/70">No environmental reports yet</p>
              <p className="text-white/50 text-xs mt-1">
                Reports will appear here when sent from the field dashboard
              </p>
            </div>
          ) : (
            reportsData.map((report: LegalReport) => (
              <div
                key={report.id}
                className="rounded-xl p-4 bg-white/20 backdrop-blur border border-white/10 shadow-sm hover:bg-white/25 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-white text-sm">
                        {report.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(
                          report.severity
                        )}`}
                      >
                        {report.severity}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-slate-300">
                      <div>
                        <span className="text-slate-400">Type:</span>{" "}
                        {report.type}
                      </div>
                      <div>
                        <span className="text-slate-400">Reporter:</span>{" "}
                        {report.reportedBy}
                      </div>
                      <div>
                        <span className="text-slate-400">Region:</span>{" "}
                        {report.region}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span>🕒 {report.timestamp}</span>
                      {report.sentAt && (
                        <span>
                          📤 Sent: {new Date(report.sentAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {report.reportData && (
                      <div className="mt-2 p-2 bg-slate-500/10 rounded-lg">
                        <div className="text-xs text-slate-300 font-medium mb-1">
                          Health Report Details:
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-xs text-slate-400">
                          {report.reportData.age && (
                            <div>👤 Age: {report.reportData.age}</div>
                          )}
                          {report.reportData.waterID && (
                            <div>💧 Water: {report.reportData.waterID}</div>
                          )}
                          {report.reportData.symptoms && (
                            <div className="col-span-2">
                              🩺 Symptoms: {report.reportData.symptoms}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium
                    ${
                      report.status === "Under Review"
                        ? "bg-yellow-500/20 text-yellow-300"
                        : report.status === "Approved"
                        ? "bg-green-500/20 text-green-300"
                        : "bg-blue-500/20 text-blue-300"
                    }`}
                    >
                      {report.status}
                    </span>
                    <button className="px-3 py-1 bg-slate-600/30 hover:bg-slate-600/40 text-slate-300 rounded text-xs transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
