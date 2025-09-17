"use client";
import useSWR from "swr";
import { useMemo, useEffect } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import FiltersBar, { type Filters } from "@/components/dashboard/FiltersBar";
import ReportsList from "@/components/dashboard/ReportsList";
import GrafanaEmbed from "@/components/widgets/GrafanaEmbed";
import CreateAlertModal from "@/components/dashboard/CreateAlertModal";
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

  const scrollToReports = () => {
    const reportsSection = document.getElementById("reports-section");
    if (reportsSection) {
      reportsSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // Show loading state while checking authentication
  if (isLoading || !user || !user.isAuthenticated) {
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
          <p className="text-white/70">
            {isLoading ? "Loading..." : "Checking access..."}
          </p>
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
      <header className="flex items-center justify-between mt-20">
        <h1 className="text-2xl md:text-3xl font-semibold text-white">
          District Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsAlertModalOpen(true)}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg border border-red-500/30 transition-colors flex items-center gap-2"
          >
            🚨 Create Alert
          </button>
          <span className="inline-flex items-center text-xs rounded-full bg-emerald-500/15 text-emerald-300 px-2 py-1 border border-emerald-500/20">
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
            className="rounded-2xl p-4 bg-white/30 backdrop-blur border border-white/20 shadow-sm"
          >
            <div className="text-xs text-slate-200">{c.label}</div>
            <div className="text-2xl md:text-3xl font-semibold mt-1 text-white">
              {c.value}
            </div>
          </div>
        ))}
      </section>

      <section className="mt-6">
        <GrafanaEmbed title="Sensor Overview (Grafana)" />
      </section>

      <section id="reports-section" className="mt-6">
        <ReportsList regionFilter={filters.region} query={filters.query} />
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
              "Emergency report has been created and sent to legal authorities.",
          });
        }}
      />
    </div>
  );
}
