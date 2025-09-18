"use client";
import { useEffect } from "react";
import { useToast } from "@/components/ui/Toast";
import { FormattedMessage, useIntl } from "react-intl";

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

interface ReportDetailsModalProps {
  report: LegalReport | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (reportId: string, newStatus: string) => void;
}

export default function ReportDetailsModal({ report, isOpen, onClose, onStatusUpdate }: ReportDetailsModalProps) {
  const { addToast } = useToast();
  const intl = useIntl();
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !report) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      case "Medium":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "Low":
        return "text-green-400 bg-green-500/10 border-green-500/20";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Under Review":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "Approved":
        return "text-green-400 bg-green-500/10 border-green-500/20";
      case "Rejected":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      default:
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    }
  };

  const handleExport = () => {
    if (!report) return;
    try {
      const dataToExport = {
        ...report,
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: "application/json;charset=utf-8",
      });

      const safeTitle = (report.title || "report")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const filename = `${safeTitle || "report"}-${report.id}.json`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      addToast({
        type: "success",
        title: intl.formatMessage({ id: "report.exported.title", defaultMessage: "Report exported" }),
        message: intl.formatMessage({ id: "report.exported.message", defaultMessage: "Saved as {filename}" }, { filename }),
      });
    } catch (e) {
      addToast({
        type: "error",
        title: intl.formatMessage({ id: "report.exported.error.title", defaultMessage: "Export failed" }),
        message: intl.formatMessage({ id: "common.tryAgain", defaultMessage: "Could not complete the action. Please try again." }),
      });
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!report) return;
    
    try {
      const response = await fetch("/api/authorities-reports", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId: report.id,
          status: newStatus,
        }),
      });

      if (response.ok) {
        addToast({
          type: "success",
          title: intl.formatMessage({ id: "report.status.updated.title", defaultMessage: "Status Updated" }),
          message: intl.formatMessage({ id: "report.status.updated.message", defaultMessage: "Report status changed to {status}" }, { status: newStatus }),
        });
        
        // Call the parent callback to refresh the data
        if (onStatusUpdate) {
          onStatusUpdate(report.id, newStatus);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        addToast({
          type: "error",
          title: intl.formatMessage({ id: "report.status.updateFailed.title", defaultMessage: "Update Failed" }),
          message: errorData.error || intl.formatMessage({ id: "report.status.updateFailed.message", defaultMessage: "Failed to update report status" }),
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        title: intl.formatMessage({ id: "report.status.updateFailed.title", defaultMessage: "Update Failed" }),
        message: intl.formatMessage({ id: "common.networkError", defaultMessage: "Network error. Please try again." }),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div 
          className="rounded-2xl border border-white/20 bg-white/30 backdrop-blur shadow-2xl"
          style={{
            background: "linear-gradient(to bottom, #25404c, #1f4a5e, #1e485c, #1e4558, #1d4254, #1c3e50, #1b3b4b, #1b3745, #193440, #18303c)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-xl font-semibold text-white"><FormattedMessage id="report.details.title" defaultMessage="Report Details" /></h2>
              <p className="text-slate-300 text-sm mt-1"><FormattedMessage id="report.details.subtitle" defaultMessage="Environmental Compliance Report" /></p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Report Title and Status */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-medium text-white">{report.title}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(report.severity)}`}>
                  {report.severity} <FormattedMessage id="report.priority" defaultMessage="Priority" />
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(report.status)}`}>
                  {report.status}
                </span>
              </div>
            </div>

            {/* Report Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="p-3 bg-white/10 rounded-lg">
                  <div className="text-xs text-slate-400 mb-1"><FormattedMessage id="report.fields.type" defaultMessage="Report Type" /></div>
                  <div className="text-white font-medium">{report.type}</div>
                </div>
                <div className="p-3 bg-white/10 rounded-lg">
                  <div className="text-xs text-slate-400 mb-1"><FormattedMessage id="report.fields.reportedBy" defaultMessage="Reported By" /></div>
                  <div className="text-white font-medium">{report.reportedBy}</div>
                </div>
                <div className="p-3 bg-white/10 rounded-lg">
                  <div className="text-xs text-slate-400 mb-1"><FormattedMessage id="report.fields.region" defaultMessage="Region" /></div>
                  <div className="text-white font-medium">{report.region}</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-white/10 rounded-lg">
                  <div className="text-xs text-slate-400 mb-1"><FormattedMessage id="report.fields.id" defaultMessage="Report ID" /></div>
                  <div className="text-white font-mono text-sm">{report.id}</div>
                </div>
                <div className="p-3 bg-white/10 rounded-lg">
                  <div className="text-xs text-slate-400 mb-1"><FormattedMessage id="report.fields.created" defaultMessage="Created" /></div>
                  <div className="text-white font-medium">{report.timestamp}</div>
                </div>
                {report.sentAt && (
                  <div className="p-3 bg-white/10 rounded-lg">
                    <div className="text-xs text-slate-400 mb-1"><FormattedMessage id="report.fields.sentToLegal" defaultMessage="Sent to Legal" /></div>
                    <div className="text-white font-medium">{new Date(report.sentAt).toLocaleString()}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Health Report Data */}
            {report.reportData && (
              <div className="space-y-3">
                <h4 className="text-lg font-medium text-white flex items-center gap-2">
                  🩺 <FormattedMessage id="report.health.details" defaultMessage="Health Report Details" />
                </h4>
                <div className="p-4 bg-slate-500/10 rounded-lg border border-slate-500/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {report.reportData.age && (
                      <div>
                        <div className="text-xs text-slate-400 mb-1">👤 <FormattedMessage id="report.health.age" defaultMessage="Patient Age" /></div>
                        <div className="text-white font-medium">{report.reportData.age} years</div>
                      </div>
                    )}
                    {report.reportData.userID && (
                      <div>
                        <div className="text-xs text-slate-400 mb-1">🆔 <FormattedMessage id="report.health.userId" defaultMessage="User ID" /></div>
                        <div className="text-white font-mono text-sm">{report.reportData.userID}</div>
                      </div>
                    )}
                    {report.reportData.waterID && (
                      <div>
                        <div className="text-xs text-slate-400 mb-1">💧 <FormattedMessage id="report.health.waterId" defaultMessage="Water Source ID" /></div>
                        <div className="text-white font-mono text-sm">{report.reportData.waterID}</div>
                      </div>
                    )}
                    {report.reportData.location && (
                      <div>
                        <div className="text-xs text-slate-400 mb-1">📍 <FormattedMessage id="report.health.location" defaultMessage="Location" /></div>
                        <div className="text-white font-medium">{report.reportData.location}</div>
                      </div>
                    )}
                    {report.reportData.symptoms && (
                      <div className="md:col-span-2">
                        <div className="text-xs text-slate-400 mb-1">🩺 <FormattedMessage id="report.health.symptoms" defaultMessage="Reported Symptoms" /></div>
                        <div className="text-white font-medium">{report.reportData.symptoms}</div>
                      </div>
                    )}
                    {report.reportData.originalCreatedAt && (
                      <div className="md:col-span-2">
                        <div className="text-xs text-slate-400 mb-1">📅 <FormattedMessage id="report.health.originalDate" defaultMessage="Original Report Date" /></div>
                        <div className="text-white font-medium">
                          {new Date(report.reportData.originalCreatedAt).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Metadata */}
            {report.metadata && (
              <div className="space-y-3">
                <h4 className="text-lg font-medium text-white flex items-center gap-2">
                  📊 <FormattedMessage id="report.meta.title" defaultMessage="Additional Information" />
                </h4>
                <div className="p-4 bg-slate-500/10 rounded-lg border border-slate-500/20">
                  <div className="space-y-2">
                    {report.metadata.source && (
                      <div>
                        <div className="text-xs text-slate-400 mb-1"><FormattedMessage id="report.meta.source" defaultMessage="Source" /></div>
                        <div className="text-white font-medium capitalize">{report.metadata.source.replace('_', ' ')}</div>
                      </div>
                    )}
                    {report.metadata.originalReportId && (
                      <div>
                        <div className="text-xs text-slate-400 mb-1"><FormattedMessage id="report.meta.originalId" defaultMessage="Original Report ID" /></div>
                        <div className="text-white font-mono text-sm">{report.metadata.originalReportId}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                {report.status === "Under Review" && (
                  <button
                    onClick={() => handleStatusUpdate("Completed")}
                    className="px-4 py-2 bg-green-600/30 hover:bg-green-600/40 text-green-300 rounded-lg transition-colors"
                  >
                    ✓ <FormattedMessage id="report.actions.markCompleted" defaultMessage="Mark as Completed" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-600/30 hover:bg-slate-600/40 text-slate-300 rounded-lg transition-colors"
                >
                  <FormattedMessage id="common.close" defaultMessage="Close" />
                </button>
                <button onClick={handleExport} className="px-4 py-2 bg-blue-600/30 hover:bg-blue-600/40 text-blue-300 rounded-lg transition-colors">
                  <FormattedMessage id="report.actions.export" defaultMessage="Export Report" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
