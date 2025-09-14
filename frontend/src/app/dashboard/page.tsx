"use client";
import useSWR from "swr";
import { useMemo, useEffect } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import FiltersBar, { type Filters } from "@/components/dashboard/FiltersBar";
import ReportsList from "@/components/dashboard/ReportsList";
import QualityGauge from "@/components/widgets/QualityGauge";
import GrafanaEmbed from "@/components/widgets/GrafanaEmbed";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/components/ui/Toast";

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((r) => r.json());

export default function DashboardPage() {
  const { user, isLoading, refreshUser } = useUser();
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

  const { data: summary } = useSWR(user?.isAuthenticated ? "/api/data/summary" : null, fetcher, {
    refreshInterval: 30_000,
  });
  const { data: map } = useSWR(user?.isAuthenticated ? "/api/data/map" : null, fetcher, {
    refreshInterval: 30_000,
  });

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

  // Show loading state while checking authentication
  if (isLoading || !user || !user.isAuthenticated) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {isLoading ? "Loading..." : "Checking access..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh p-4 md:p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-semibold">
          District Dashboard
        </h1>
        <span className="inline-flex items-center text-xs rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-1 border border-emerald-500/20">
          Live
        </span>
      </header>

      <section className="mt-4">
        <FiltersBar value={filters} onChange={setFilters} />
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-4">
        {counters.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl p-4 bg-white/70 dark:bg-white/5 backdrop-blur border border-slate-200/60 dark:border-white/10 shadow-sm"
          >
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {c.label}
            </div>
            <div className="text-2xl md:text-3xl font-semibold mt-1">
              {c.value}
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <div className="lg:col-span-2">
          <GrafanaEmbed title="Sensor Overview (Grafana)" />
        </div>
        <div className="rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur border border-slate-200/60 dark:border-white/10 shadow-sm p-4">
          <h3 className="text-sm font-medium">Water Quality</h3>
          <QualityGauge value={Math.round((Math.random() * 0.4 + 0.6) * 100)} />
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Live updates every 30s
          </div>
        </div>
      </section>

      <section className="mt-6">
        <ReportsList regionFilter={filters.region} query={filters.query} />
      </section>
    </div>
  );
}
