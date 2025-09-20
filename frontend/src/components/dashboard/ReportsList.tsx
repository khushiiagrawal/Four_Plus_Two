"use client";
import useSWR, { mutate as globalMutate } from "swr";
import { useMemo, useState, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";
import { FormattedMessage, useIntl, IntlShape } from "react-intl";

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((r) => r.json());

// Function to translate health report symptoms
const translateHealthSymptoms = (symptoms: string, intl: IntlShape) => {
  if (!symptoms) return symptoms;
  
  // Split symptoms by comma and translate each one
  const symptomList = symptoms.split(',').map(s => s.trim());
  const translatedSymptoms = symptomList.map(symptom => {
    // Map common symptoms to translation keys
    switch (symptom.toLowerCase()) {
      case 'constipation':
        return intl.formatMessage({ id: "symptoms.constipation" });
      case 'fever':
        return intl.formatMessage({ id: "symptoms.fever" });
      case 'stomach cramps':
        return intl.formatMessage({ id: "symptoms.stomachCramps" });
      case 'vomiting':
        return intl.formatMessage({ id: "symptoms.vomiting" });
      case 'headache':
        return intl.formatMessage({ id: "symptoms.headache" });
      case 'skin rash':
        return intl.formatMessage({ id: "symptoms.skinRash" });
      case 'nausea':
        return intl.formatMessage({ id: "symptoms.nausea" });
      case 'diarrhea':
        return intl.formatMessage({ id: "symptoms.diarrhea" });
      default:
        return symptom; // Return original if no translation found
    }
  });
  
  return translatedSymptoms.join(', ');
};

// Function to translate location
const translateLocation = (location: string, intl: IntlShape) => {
  if (!location) return location;
  
  if (location.toLowerCase() === 'unknown location') {
    return intl.formatMessage({ id: "healthReports.unknownLocation" });
  }
  
  return location; // Return original for known locations
};

export default function ReportsList({
  regionFilter,
  query,
  selectedReports,
  onSelectionChange,
}: {
  regionFilter: string;
  query: string;
  selectedReports: Set<string>;
  onSelectionChange: (selectedIds: Set<string>) => void;
}) {
  const { addToast } = useToast();
  const intl = useIntl();
  const [sendingReports, setSendingReports] = useState<Set<string>>(new Set());
  const [removedReports, setRemovedReports] = useState<Set<string>>(new Set());
  const key = "/api/data/reports";
  const { data, error, mutate } = useSWR(key, fetcher, {
    refreshInterval: 30_000,
  });

  // Listen for a cross-component refresh event dispatched after creating a report
  // to immediately update list without waiting for interval.
  useEffect(() => {
    function handler() {
      mutate();
      globalMutate(key);
    }
    window.addEventListener('refresh-reports', handler);
    return () => {
      window.removeEventListener('refresh-reports', handler);
    };
  }, [mutate]);
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
      const response = await fetch("/api/reports/send-to-authorities", {
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
          title: intl.formatMessage({ id: "healthReports.reportSent" }),
          message: intl.formatMessage({ id: "healthReports.reportSentMessage" }),
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
        title: intl.formatMessage({ id: "healthReports.sendFailed" }),
        message: intl.formatMessage({ id: "healthReports.sendFailedMessage" }),
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
    <div className="rounded-2xl bg-white/40 backdrop-blur border border-white/50 shadow-sm">
      <div className="p-4 border-b border-slate-200/60 dark:border-white/10">
        <h3 className="text-sm font-medium text-slate-800">
          <FormattedMessage
            id="healthReports.title"
            defaultMessage="Health Reports"
          />
        </h3>
        {error && (
          <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-xs">
            <FormattedMessage
              id="healthReports.apiError"
              defaultMessage="API Error: {error}"
              values={{ error: error.message || intl.formatMessage({ id: "healthReports.failedToFetch" }) }}
            />
          </div>
        )}
      </div>
      <ul className="divide-y divide-slate-200/60">
        {items.map((it) => (
          <li key={it.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={selectedReports.has(it.id)}
                  onChange={(e) => {
                    const newSelection = new Set(selectedReports);
                    if (e.target.checked) {
                      newSelection.add(it.id);
                    } else {
                      newSelection.delete(it.id);
                    }
                    onSelectionChange(newSelection);
                  }}
                  className="mt-1 w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-800">
                    {translateHealthSymptoms(it.symptoms || it.title, intl)}
                  </div>
                <div className="text-xs text-slate-600 mt-1">
                  📍 {translateLocation(it.location || it.region, intl)}
                </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                    {it.age && <span>👤 Age: {it.age}</span>}
                    {it.userID && <span>🆔 User: {it.userID}</span>}
                    {it.waterID && <span>💧 Water: {it.waterID}</span>}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 ml-4">
                <div className="text-xs text-slate-700 font-medium">
                  {new Date(it.time).toLocaleString()}
                </div>
                <button
                  onClick={() => sendReportToLegal(it)}
                  disabled={sendingReports.has(it.id)}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-400 text-white disabled:text-gray-300 rounded-lg border border-blue-700 disabled:border-gray-500 text-xs transition-colors flex items-center gap-1 shadow-sm"
                >
                  {sendingReports.has(it.id) ? (
                    <>
                      <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      <FormattedMessage
                        id="healthReports.sending"
                        defaultMessage="Sending..."
                      />
                    </>
                  ) : (
                    <>📤 <FormattedMessage
                      id="healthReports.sendReport"
                      defaultMessage="Send Report"
                    /></>
                  )}
                </button>
              </div>
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="p-6 text-sm text-slate-600 text-center">
            <div className="text-4xl mb-2">📋</div>
            <div>
              <FormattedMessage
                id="healthReports.noReports"
                defaultMessage="No health reports found"
              />
            </div>
            <div className="text-xs mt-1">
              <FormattedMessage
                id="healthReports.tryFilters"
                defaultMessage="Try adjusting your filters or check back later"
              />
            </div>
          </li>
        )}
      </ul>
    </div>
  );
}
