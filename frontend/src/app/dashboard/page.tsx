"use client";
import useSWR from "swr";
import { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FiltersBar, { type Filters } from "@/components/dashboard/FiltersBar";
import ReportsList from "@/components/dashboard/ReportsList";
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
      { 
        label: "Active Outbreaks", 
        value: summary?.activeOutbreaks ?? "—",
        icon: "🚨",
        color: "from-red-500 to-pink-500",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/20"
      },
      {
        label: "Recent Field Reports",
        value: summary?.recentFieldReports ?? "—",
        icon: "📊",
        color: "from-blue-500 to-cyan-500",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20"
      },
      { 
        label: "Sensor Alerts", 
        value: summary?.sensorAlerts ?? "—",
        icon: "⚠️",
        color: "from-yellow-500 to-orange-500",
        bgColor: "bg-yellow-500/10",
        borderColor: "border-yellow-500/20"
      },
      { 
        label: "Areas at Risk", 
        value: summary?.areasAtRisk ?? "—",
        icon: "📍",
        color: "from-purple-500 to-indigo-500",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/20"
      },
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
    <div className="min-h-dvh p-4 md:p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-emerald-400/10 to-teal-600/10 rounded-full blur-3xl animate-float-reverse"></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-r from-pink-400/10 to-rose-600/10 rounded-full blur-3xl animate-float"></div>
      </div>

      <header className="relative z-10 flex items-center justify-between fade-up">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-white dark:via-blue-100 dark:to-white bg-clip-text text-transparent">
            District Dashboard
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Real-time health surveillance monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center text-xs rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 border border-emerald-500/20 animate-pulse">
            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-ping"></div>
            Live
          </span>
          <div className="hidden md:block text-xs text-slate-500 dark:text-slate-400">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </header>

      <section className="mt-6 relative z-10 fade-up" style={{ animationDelay: '0.1s' }}>
        <FiltersBar value={filters} onChange={setFilters} />
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6 relative z-10">
        {counters.map((c, index) => (
          <div
            key={c.label}
            className="group relative overflow-hidden rounded-2xl p-5 bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 fade-up"
            style={{ animationDelay: `${0.2 + index * 0.1}s` }}
          >
            {/* Gradient overlay on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${c.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
            
            {/* Animated border */}
            <div className={`absolute inset-0 rounded-2xl border-2 ${c.borderColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                  {c.icon}
                </span>
                <div className={`w-3 h-3 rounded-full ${c.bgColor} group-hover:animate-pulse`}></div>
              </div>
              
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                {c.label}
              </div>
              
              <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white group-hover:scale-105 transition-transform duration-300">
                {c.value}
              </div>
            </div>
            
            {/* Subtle glow effect */}
            <div className={`absolute -inset-1 bg-gradient-to-r ${c.color} rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500`}></div>
          </div>
        ))}
      </section>

      <section className="mt-8 relative z-10 fade-up" style={{ animationDelay: '0.6s' }}>
        <div className="transform hover:scale-[1.02] transition-transform duration-500">
          <GrafanaEmbed title="Sensor Overview (Grafana)" />
        </div>
      </section>

      <section className="mt-8 relative z-10 fade-up" style={{ animationDelay: '0.7s' }}>
        <div className="transform hover:scale-[1.01] transition-transform duration-500">
          <ReportsList regionFilter={filters.region} query={filters.query} />
        </div>
      </section>
    </div>
  );
}
