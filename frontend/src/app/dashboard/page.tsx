"use client";
import useSWR from "swr";
import { useMemo, useEffect } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import FiltersBar, { type Filters } from "@/components/dashboard/FiltersBar";
import ReportsList from "@/components/dashboard/ReportsList";
import GrafanaEmbed from "@/components/widgets/GrafanaEmbed";
import CreateAlertModal from "@/components/dashboard/CreateAlertModal";
import CreateReportModal from "@/components/dashboard/CreateReportModal";
import SummarizationModal from "@/components/dashboard/SummarizationModal";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/components/ui/Toast";

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((r) => r.json());

export default function DashboardPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const { addToast } = useToast();

  // Protection logic
  useEffect(() => {
    if (!isLoading && !user) {
      addToast({
        type: "error",
        title: "Access Denied",
        message: "Please log in to access the dashboard.",
      });
      router.push("/auth");
      return;
    }

    if (!isLoading && user && !user.isAuthenticated) {
      addToast({
        type: "warning",
        title: "Access Pending",
        message: "User not given access yet. Please wait for admin approval.",
        duration: 8000,
      });
      router.push("/profile");
      return;
    }
  }, [user, isLoading, router, addToast]);

  const { data: summary } = useSWR(
    user?.isAuthenticated ? "/api/data/summary" : null,
    fetcher,
    {
      refreshInterval: 30_000,
    }
  );
  // Note: map data is available but not currently used in the UI
  // const { data: map } = useSWR(
  //   user?.isAuthenticated ? "/api/data/map" : null,
  //   fetcher,
  //   {
  //     refreshInterval: 30_000,
  //   }
  // );

  const counters = useMemo(
    () => [
      { label: "Active Outbreaks", value: summary?.activeOutbreaks ?? "—" },
      {
        label: "Recent Field Reports",
        value: summary?.recentFieldReports ?? "—",
      },
      { label: "Sensor Alerts", value: summary?.sensorAlerts ?? "—" },
      { label: "Areas at Risk", value: summary?.areasAtRisk ?? "—" },
    ],
    [summary]
  );

  const [filters, setFilters] = useState<Filters>({
    query: "",
    region: "All Regions",
  });
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set());
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSummarizationModalOpen, setIsSummarizationModalOpen] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState("");
  const [summaryReportCount, setSummaryReportCount] = useState(0);
  const [isSendingToAuthorities, setIsSendingToAuthorities] = useState(false);
  const [isCreateReportOpen, setIsCreateReportOpen] = useState(false);

  const scrollToReports = () => {
    const reportsSection = document.getElementById("reports-section");
    if (reportsSection) {
      reportsSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleSummarizeReports = async () => {
    if (selectedReports.size === 0) {
      addToast({
        type: "warning",
        title: "No Reports Selected",
        message: "Please select at least one report to summarize.",
      });
      return;
    }

    setIsSummarizing(true);
    try {
      // First, get the selected reports data
      const response = await fetch("/api/data/reports");
      const data = await response.json();
      const selectedReportsData = data.items.filter((report: {
        id: string;
        symptoms?: string;
        title: string;
        location?: string;
        region: string;
      }) => 
        selectedReports.has(report.id)
      );

      // Combine all report texts for summarization
      const combinedText = selectedReportsData.map((report: {
        id: string;
        symptoms?: string;
        title: string;
        location?: string;
        region: string;
      }) => 
        `${report.symptoms || report.title} - Location: ${report.location || report.region} - ${report.symptoms || 'No additional details'}`
      ).join('. ');

      // Call the summarizer service
      const summarizeResponse = await fetch("http://localhost:8000/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: combinedText,
          max_length: 200,
          min_length: 100,
        }),
      });

      if (!summarizeResponse.ok) {
        throw new Error("Failed to summarize reports");
      }

      const summaryResult = await summarizeResponse.json();

      // Store the summary and show modal for review
      setGeneratedSummary(summaryResult.summary);
      setSummaryReportCount(selectedReports.size);
      setIsSummarizationModalOpen(true);

      addToast({
        type: "success",
        title: "Summary Generated",
        message: `Successfully generated summary from ${selectedReports.size} reports. Please review before sending.`,
        duration: 3000,
      });

    } catch (error) {
      console.error("Error summarizing reports:", error);
      addToast({
        type: "error",
        title: "Summarization Failed",
        message: "Failed to summarize reports. Please try again.",
        duration: 5000,
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSendSummarizedToAuthorities = async () => {
    setIsSendingToAuthorities(true);
    try {
      // Get the selected reports data again for sending
      const response = await fetch("/api/data/reports");
      const data = await response.json();
      const selectedReportsData = data.items.filter((report: {
        id: string;
        symptoms?: string;
        title: string;
        location?: string;
        region: string;
      }) => 
        selectedReports.has(report.id)
      );

      // Send summarized report to authorities
      const sendResponse = await fetch("/api/reports/send-summarized", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: generatedSummary,
          originalReports: selectedReportsData,
          reportCount: summaryReportCount,
        }),
      });

      if (!sendResponse.ok) {
        throw new Error("Failed to send summarized report");
      }

      // Clear selection and close modal
      setSelectedReports(new Set());
      setIsSummarizationModalOpen(false);
      setGeneratedSummary("");
      setSummaryReportCount(0);

    } catch (error) {
      console.error("Error sending summarized report:", error);
      throw error; // Re-throw to be handled by the modal
    } finally {
      setIsSendingToAuthorities(false);
    }
  };

  // Show loading state while checking authentication
  if (isLoading || !user || !user.isAuthenticated) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center bg-gradient-to-b from-cyan-400 via-sky-300 to-cyan-200"
      >
        <div className="text-center">
          <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600">
            {isLoading ? "Loading..." : "Checking access..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-dvh p-4 md:p-6 bg-gradient-to-b from-cyan-200/90 via-sky-200/80 to-cyan-200/90"
    >
      <header className="flex items-center justify-between mt-20">
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-800">
          Health-Care Workers Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsCreateReportOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg border border-emerald-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            ➕ Create Report
          </button>
          <button
            onClick={handleSummarizeReports}
            disabled={selectedReports.size === 0 || isSummarizing}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg border border-blue-700 disabled:border-gray-500 transition-colors flex items-center gap-2 shadow-sm disabled:cursor-not-allowed"
          >
            {isSummarizing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Summarizing...
              </>
            ) : (
              <>
                📝 Summarize Reports ({selectedReports.size})
              </>
            )}
          </button>
          <button
            onClick={() => setIsAlertModalOpen(true)}
            className="px-4 py-2 bg-red-500 hover:bg-red-700 text-white rounded-lg border border-red-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            🚨 Create Alert
          </button>
          <span className="inline-flex items-center text-xs rounded-full bg-emerald-600 text-white px-2 py-1 border border-emerald-700 shadow-sm">
            Live
          </span>
        </div>
      </header>

      <section className="mt-4">
        <FiltersBar
          value={filters}
          onChange={setFilters}
          onRegionChange={scrollToReports}
        />
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-4">
        {counters.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl p-4 bg-white/30 backdrop-blur-md border border-white/40 shadow-sm"
          >
            <div className="text-xs text-slate-600">{c.label}</div>
            <div className="text-2xl md:text-3xl font-semibold mt-1 text-slate-800">
              {c.value}
            </div>
          </div>
        ))}
      </section>

      <section className="mt-6">
        <GrafanaEmbed title="Sensor Overview (Grafana)" />
      </section>

      <section id="reports-section" className="mt-6">
        <ReportsList 
          regionFilter={filters.region} 
          query={filters.query}
          selectedReports={selectedReports}
          onSelectionChange={setSelectedReports}
        />
      </section>

      <CreateAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        onAlertCreated={() => {
          // Optionally refresh data or show success message
          addToast({
            type: "success",
            title: "Report Created",
            message:
              "Emergency report has been created and sent to higher authorities.",
          });
        }}
      />

      <CreateReportModal
        isOpen={isCreateReportOpen}
        onClose={() => setIsCreateReportOpen(false)}
        onCreated={() => {
          // trigger list refresh below
          const event = new CustomEvent('refresh-reports');
          window.dispatchEvent(event);
        }}
      />

      <SummarizationModal
        isOpen={isSummarizationModalOpen}
        onClose={() => {
          setIsSummarizationModalOpen(false);
          setGeneratedSummary("");
          setSummaryReportCount(0);
        }}
        summary={generatedSummary}
        originalReportCount={summaryReportCount}
        onSendToAuthorities={handleSendSummarizedToAuthorities}
        isSending={isSendingToAuthorities}
      />
    </div>
  );
}
