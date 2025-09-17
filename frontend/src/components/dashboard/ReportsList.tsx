"use client";
import useSWR from "swr";
import { useMemo, useState } from "react";
import { useToast } from "@/components/ui/Toast";

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((r) => r.json());

export default function ReportsList({
  regionFilter,
  query,
}: {
  regionFilter: string;
  query: string;
}) {
  const { addToast } = useToast();
  const [sendingReports, setSendingReports] = useState<Set<string>>(new Set());
  const [removedReports, setRemovedReports] = useState<Set<string>>(new Set());
  const { data, error } = useSWR("/api/data/reports", fetcher, {
    refreshInterval: 30_000,
  });
  const items = useMemo(() => {
    const all = (data?.items ?? []) as Array<{
      id: string;
      title: string;
      region: string;
      district: string;
      type: string;
      time: number;
      age?: number;
      userID?: string;
      waterID?: string;
      symptoms?: string;
      location?: string;
      createdAt?: Date;
    }>;

    return all.filter(
      (it) =>
        !removedReports.has(it.id) &&
        (regionFilter === "All Regions" || it.region === regionFilter) &&
        (!query ||
          it.title.toLowerCase().includes(query.toLowerCase()) ||
          it.district.toLowerCase().includes(query.toLowerCase()) ||
          it.symptoms?.toLowerCase().includes(query.toLowerCase()) ||
          it.location?.toLowerCase().includes(query.toLowerCase()))
    );
  }, [data, regionFilter, query, removedReports]);

  const sendReportToLegal = async (report: {
    id: string;
    title: string;
    region: string;
    district: string;
    type: string;
    time: number;
    age?: number;
    userID?: string;
    waterID?: string;
    symptoms?: string;
    location?: string;
    createdAt?: Date;
  }) => {
    if (sendingReports.has(report.id)) return;

    setSendingReports((prev) => new Set(prev).add(report.id));

    try {
      const response = await fetch("/api/reports/send-to-legal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId: report.id,
          reportData: {
            age: report.age,
            userID: report.userID,
            waterID: report.waterID,
            symptoms: report.symptoms,
            location: report.location,
            region: report.region,
            createdAt: report.createdAt,
            title: report.title,
          },
        }),
      });

      const result = await response.json();

      if (response.ok) {
        addToast({
          type: "success",
          title: "Report Sent",
          message:
            "Health report has been successfully sent to legal authorities.",
          duration: 5000,
        });
        setRemovedReports((prev) => new Set(prev).add(report.id));
      } else {
        throw new Error(result.error || "Failed to send report");
      }
    } catch (error) {
      console.error("Error sending report:", error);
      addToast({
        type: "error",
        title: "Send Failed",
        message:
          "Failed to send report to legal authorities. Please try again.",
        duration: 5000,
      });
    } finally {
      setSendingReports((prev) => {
        const newSet = new Set(prev);
        newSet.delete(report.id);
        return newSet;
      });
    }
  };

  return (
    <div className="rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur border border-slate-200/60 dark:border-white/10 shadow-sm">
      <div className="p-4 border-b border-slate-200/60 dark:border-white/10">
        <h3 className="text-sm font-medium">Health Reports</h3>
        {error && (
          <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-xs">
            API Error: {error.message || "Failed to fetch reports"}
          </div>
        )}
      </div>
      <ul className="divide-y divide-slate-200/60 dark:divide-white/10">
        {items.map((it) => (
          <li key={it.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  {it.symptoms || it.title}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  📍 {it.location || it.region}
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {it.age && <span>👤 Age: {it.age}</span>}
                  {it.userID && <span>🆔 User: {it.userID}</span>}
                  {it.waterID && <span>💧 Water: {it.waterID}</span>}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 ml-4">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(it.time).toLocaleString()}
                </div>
                <button
                  onClick={() => sendReportToLegal(it)}
                  disabled={sendingReports.has(it.id)}
                  className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 disabled:bg-gray-600/20 text-blue-300 disabled:text-gray-400 rounded-lg border border-blue-500/30 disabled:border-gray-500/30 text-xs transition-colors flex items-center gap-1"
                >
                  {sendingReports.has(it.id) ? (
                    <>
                      <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>📤 Send Report</>
                  )}
                </button>
              </div>
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="p-6 text-sm text-slate-500 dark:text-slate-400 text-center">
            <div className="text-4xl mb-2">📋</div>
            <div>No health reports found</div>
            <div className="text-xs mt-1">
              Try adjusting your filters or check back later
            </div>
          </li>
        )}
      </ul>
    </div>
  );
}
