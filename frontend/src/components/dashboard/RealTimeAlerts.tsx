"use client";
import useSWR from "swr";
import { useState } from "react";
import { useToast } from "@/components/ui/Toast";

// Define the Firestore alert interface
interface FirestoreAlert {
  id: string;
  waterSource?: string | null;
  title: string;
  shortSummary: string;
  longSummary?: string | null;
  timestamp: number;
  severity: "critical" | "warning" | "info";
}

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((r) => r.json());

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "bg-red-500/20 border-red-500/40 text-red-800";
    case "warning":
      return "bg-yellow-500/20 border-yellow-500/40 text-yellow-800";
    case "info":
    default:
      return "bg-blue-500/20 border-blue-500/40 text-blue-800";
  }
};

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case "critical":
      return "🚨";
    case "warning":
      return "⚠️";
    case "info":
    default:
      return "ℹ️";
  }
};

const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export default function RealTimeAlerts() {
  const { addToast } = useToast();
  const [alertingStates, setAlertingStates] = useState<Record<string, boolean>>(
    {}
  );

  const { data, error, isLoading } = useSWR("/api/firestore/alerts", fetcher, {
    refreshInterval: 30_000, // Refresh every 30 seconds
  });

  const handleAlertUser = async (alert: FirestoreAlert) => {
    const alertId = alert.id;
    setAlertingStates((prev) => ({ ...prev, [alertId]: true }));

    try {
      // Send FCM notification via API
      const response = await fetch("/api/fcm/send-alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: alert.id,
          waterSource: alert.waterSource,
          title: alert.title,
          shortSummary: alert.shortSummary,
          longSummary: alert.longSummary,
          timestamp: alert.timestamp,
          severity: alert.severity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send alert");
      }

      const result = await response.json();
      console.log("FCM notification sent successfully:", result);

      // Show success toast
      addToast({
        type: "success",
        title: "Alert Sent",
        message: "Users have been notified about this water quality alert.",
        duration: 4000,
      });
    } catch (error) {
      console.error("Error sending alert to users:", error);

      // Show error toast
      addToast({
        type: "error",
        title: "Alert Failed",
        message:
          error instanceof Error
            ? error.message
            : "Failed to send alert notification. Please try again.",
        duration: 5000,
      });
    } finally {
      setAlertingStates((prev) => ({ ...prev, [alertId]: false }));
    }
  };

  if (isLoading) {
    return (
      <section className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            Real Time Alerts From Water Body
          </h2>
          <span className="text-xs text-slate-500">Loading alerts...</span>
        </div>
        <div className="rounded-2xl border border-white/50 bg-white/40 backdrop-blur-md shadow-lg p-6">
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 rounded-full bg-slate-300 animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            Real Time Alerts From Water Body
          </h2>
          <span className="text-xs text-red-500">Error loading alerts</span>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50/40 backdrop-blur-md shadow-lg p-6">
          <p className="text-red-600 text-center">
            Failed to load alerts. Please try again later.
          </p>
        </div>
      </section>
    );
  }

  const alerts: FirestoreAlert[] = data?.alerts || [];

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          Real Time Alerts From Water Body
        </h2>
        <span className="text-xs text-slate-500">
          {alerts.length} alert{alerts.length !== 1 ? "s" : ""} •
          Auto-refreshing
        </span>
      </div>

      <div className="rounded-2xl border border-white/50 bg-white/40 backdrop-blur-md shadow-lg overflow-hidden">
        {alerts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">🌊</div>
            <p className="text-slate-600">No alerts at this time</p>
            <p className="text-slate-500 text-sm mt-1">
              Water quality monitoring is active
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/20">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 hover:bg-white/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Alert Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">
                        {getSeverityIcon(alert.severity)}
                      </span>
                      <h3 className="font-medium text-slate-800 truncate">
                        {alert.title}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(
                          alert.severity
                        )}`}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>

                    {/* Alert Summary */}
                    <p className="text-slate-700 text-sm mb-3 leading-relaxed">
                      {alert.shortSummary}
                    </p>

                    {/* Alert Metadata */}
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        🕒 {formatTimestamp(alert.timestamp)}
                      </span>
                      {alert.waterSource && (
                        <span className="flex items-center gap-1">
                          📍 {alert.waterSource}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Alert User Button */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleAlertUser(alert)}
                      disabled={alertingStates[alert.id]}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white rounded-lg border border-red-600 disabled:border-red-400 transition-colors flex items-center gap-2 shadow-sm disabled:cursor-not-allowed text-sm font-medium"
                    >
                      {alertingStates[alert.id] ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Alerting...
                        </>
                      ) : (
                        <>📢 Alert User</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Long Summary (if available) */}
                {alert.longSummary && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-slate-600 hover:text-slate-800 transition-colors">
                      View detailed analysis
                    </summary>
                    <div className="mt-2 p-3 bg-white/30 rounded-lg border border-white/40">
                      <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono">
                        {alert.longSummary}
                      </pre>
                    </div>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
