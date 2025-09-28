"use client";
import useSWR from "swr";
import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { FormattedMessage, useIntl, IntlShape } from "react-intl";

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

// Function to translate dynamic alert content
const translateAlertContent = (title: string, shortSummary: string, intl: IntlShape) => {
  // Translate alert titles
  let translatedTitle = title;
  if (title === "CRITICAL Water Quality Alert") {
    translatedTitle = intl.formatMessage({ id: "alerts.dynamic.criticalWaterQuality" });
  } else if (title === "Water Quality Warning") {
    translatedTitle = intl.formatMessage({ id: "alerts.dynamic.waterQualityWarning" });
  } else if (title === "Cholera breakout") {
    translatedTitle = intl.formatMessage({ id: "alerts.dynamic.choleraBreakout" });
  } else if (title === "Water contamination") {
    translatedTitle = intl.formatMessage({ id: "alerts.dynamic.waterContamination" });
  }

  // Translate alert descriptions
  let translatedSummary = shortSummary;
  
  // Handle contamination risk with high temperature
  if (shortSummary.includes("Contamination risk detected: High temperature")) {
    const tempMatch = shortSummary.match(/High temperature \((\d+\.?\d*)°C\)/);
    const temp = tempMatch ? tempMatch[1] : "0";
    const risks = "Class A: Gastrointestinal diseases (e.g., cholera, diarrhea); Class B: Kidney diseases; Class C: Dental problems (Fluorosis, corrosion); Class D: Cardiovascular problems or Diabetes; Class F: Convulsions (from Ammonia); Class G: Bladder cancer (from Chlorides)";
    translatedSummary = intl.formatMessage(
      { id: "alerts.dynamic.contaminationRiskHighTemp" },
      { temp, risks }
    );
  }
  // Handle contamination risk with high humidity and temperature
  else if (shortSummary.includes("Contamination risk detected: High humidity")) {
    const humidityMatch = shortSummary.match(/High humidity \((\d+\.?\d*)%\)/);
    const tempMatch = shortSummary.match(/High temperature \((\d+\.?\d*)°C\)/);
    const humidity = humidityMatch ? humidityMatch[1] : "0";
    const temp = tempMatch ? tempMatch[1] : "0";
    const risks = "Class A: Gastrointestinal diseases (e.g., cholera, diarrhea); Class B: Kidney diseases; Class C: Dental problems (Fluorosis, corrosion); Class D: Cardiovascular problems or Diabetes; Class F: Convulsions (from Ammonia); Class G: Bladder cancer (from Chlorides)";
    translatedSummary = intl.formatMessage(
      { id: "alerts.dynamic.contaminationRiskHighHumTemp" },
      { humidity, temp, risks }
    );
  }
  // Handle temperature and humidity warning
  else if (shortSummary.includes("Temperature too high") && shortSummary.includes("Humidity too high")) {
    const tempMatch = shortSummary.match(/Temperature too high: (\d+)°C/);
    const humidityMatch = shortSummary.match(/Humidity too high: (\d+)%/);
    const temp = tempMatch ? tempMatch[1] : "0";
    const humidity = humidityMatch ? humidityMatch[1] : "0";
    translatedSummary = intl.formatMessage(
      { id: "alerts.dynamic.tempHumidityHigh" },
      { temp, humidity }
    );
  }
  // Handle cholera cases rising
  else if (shortSummary.includes("Cholera cases rising")) {
    translatedSummary = intl.formatMessage({ id: "alerts.dynamic.choleraRising" });
  }
  // Handle chemical waste contamination
  else if (shortSummary.includes("Potential water contamination with chemical waste")) {
    translatedSummary = intl.formatMessage({ id: "alerts.dynamic.chemicalWaste" });
  }

  return { translatedTitle, translatedSummary };
};

export default function RealTimeAlerts() {
  const { addToast } = useToast();
  const intl = useIntl();
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
        title: intl.formatMessage({ id: "dashboard.realtimeAlerts.alertSent" }),
        message: intl.formatMessage({ id: "dashboard.realtimeAlerts.alertSentMessage" }),
        duration: 4000,
      });
    } catch (error) {
      console.error("Error sending alert to users:", error);

      // Show error toast
      addToast({
        type: "error",
        title: intl.formatMessage({ id: "dashboard.realtimeAlerts.alertFailed" }),
        message:
          error instanceof Error
            ? error.message
            : intl.formatMessage({ id: "dashboard.realtimeAlerts.alertFailedMessage" }),
        duration: 5000,
      });
    } finally {
      setAlertingStates((prev) => ({ ...prev, [alertId]: false }));
    }
  };

  if (isLoading) {
    return (
      <section className="mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-800 flex items-center gap-2">
            <FormattedMessage
              id="dashboard.realtimeAlerts.title"
              defaultMessage="Real Time Alerts From Water Body"
            />
          </h2>
          <span className="text-xs text-slate-500">
            <FormattedMessage
              id="dashboard.realtimeAlerts.loading"
              defaultMessage="Loading alerts..."
            />
          </span>
        </div>
        <div className="rounded-xl sm:rounded-2xl border border-white/50 bg-white/40 backdrop-blur-md shadow-lg p-4 sm:p-6">
          <div className="flex items-center justify-center py-6 sm:py-8">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-300 animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-800 flex items-center gap-2">
            <FormattedMessage
              id="dashboard.realtimeAlerts.title"
              defaultMessage="Real Time Alerts From Water Body"
            />
          </h2>
          <span className="text-xs text-red-500">
            <FormattedMessage
              id="dashboard.realtimeAlerts.error"
              defaultMessage="Error loading alerts"
            />
          </span>
        </div>
        <div className="rounded-xl sm:rounded-2xl border border-red-200 bg-red-50/40 backdrop-blur-md shadow-lg p-4 sm:p-6">
          <p className="text-red-600 text-center text-sm sm:text-base">
            <FormattedMessage
              id="dashboard.realtimeAlerts.errorMessage"
              defaultMessage="Failed to load alerts. Please try again later."
            />
          </p>
        </div>
      </section>
    );
  }

  const alerts: FirestoreAlert[] = data?.alerts || [];

  return (
    <section className="mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-800 flex items-center gap-2">
          <FormattedMessage
            id="dashboard.realtimeAlerts.title"
            defaultMessage="Real Time Alerts From Water Body"
          />
        </h2>
        <span className="text-xs text-slate-500">
          <FormattedMessage
            id="dashboard.realtimeAlerts.count"
            defaultMessage="{count} alerts"
            values={{ count: alerts.length }}
          /> • <FormattedMessage
            id="dashboard.realtimeAlerts.autoRefresh"
            defaultMessage="Auto-refreshing"
          />
        </span>
      </div>

      <div className="rounded-xl sm:rounded-2xl border border-white/50 bg-white/40 backdrop-blur-md shadow-lg overflow-hidden">
        {alerts.length === 0 ? (
          <div className="p-6 sm:p-8 text-center">
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🌊</div>
            <p className="text-sm sm:text-base text-slate-600">
              <FormattedMessage
                id="dashboard.realtimeAlerts.noAlerts"
                defaultMessage="No alerts at this time"
              />
            </p>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              <FormattedMessage
                id="dashboard.realtimeAlerts.monitoringActive"
                defaultMessage="Water quality monitoring is active"
              />
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/20">
            {alerts.map((alert) => {
              const { translatedTitle, translatedSummary } = translateAlertContent(alert.title, alert.shortSummary, intl);
              return (
              <div
                key={alert.id}
                className="p-3 sm:p-4 hover:bg-white/20 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Alert Header */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-base sm:text-lg">
                        {getSeverityIcon(alert.severity)}
                      </span>
                      <h3 className="font-medium text-slate-800 truncate text-sm sm:text-base">
                        {translatedTitle}
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
                    <p className="text-slate-700 text-xs sm:text-sm mb-3 leading-relaxed">
                      {translatedSummary}
                    </p>

                    {/* Alert Metadata */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-500">
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
                  <div className="flex-shrink-0 w-full sm:w-auto">
                    <button
                      onClick={() => handleAlertUser(alert)}
                      disabled={alertingStates[alert.id]}
                      className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white rounded-lg border border-red-600 disabled:border-red-400 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:cursor-not-allowed text-xs sm:text-sm font-medium"
                    >
                      {alertingStates[alert.id] ? (
                        <>
                          <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <FormattedMessage
                            id="dashboard.realtimeAlerts.alerting"
                            defaultMessage="Alerting..."
                          />
                        </>
                      ) : (
                        <>📢 <FormattedMessage
                          id="alerts.actions.alertUser"
                          defaultMessage="Alert User"
                        /></>
                      )}
                    </button>
                  </div>
                </div>

                {/* Long Summary (if available) */}
                {alert.longSummary && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs sm:text-sm text-slate-600 hover:text-slate-800 transition-colors">
                      <FormattedMessage
                        id="dashboard.realtimeAlerts.viewDetails"
                        defaultMessage="View detailed analysis"
                      />
                    </summary>
                    <div className="mt-2 p-2 sm:p-3 bg-white/30 rounded-lg border border-white/40">
                      <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono">
                        {alert.longSummary}
                      </pre>
                    </div>
                  </details>
                )}
              </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
