"use client";
import useSWR from "swr";
import { useMemo } from "react";

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((r) => r.json());

export default function ReportsList({
  regionFilter,
  query,
}: {
  regionFilter: string;
  query: string;
}) {
  const { data } = useSWR("/api/data/reports", fetcher, {
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
    }>;
    return all.filter(
      (it) =>
        (regionFilter === "All Regions" || it.region === regionFilter) &&
        (!query ||
          it.title.toLowerCase().includes(query.toLowerCase()) ||
          it.district.toLowerCase().includes(query.toLowerCase()))
    );
  }, [data, regionFilter, query]);

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'outbreak': return '🚨';
      case 'report': return '📋';
      case 'sensor': return '📡';
      default: return '📊';
    }
  };

  const getReportColor = (type: string) => {
    switch (type) {
      case 'outbreak': return 'from-red-500 to-pink-500';
      case 'report': return 'from-blue-500 to-cyan-500';
      case 'sensor': return 'from-yellow-500 to-orange-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 shadow-lg hover:shadow-2xl transition-all duration-500">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10 p-6 border-b border-slate-200/60 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm">
            📊
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Field Reports</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Live updates every 30 seconds</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{items.length} reports</span>
          </div>
        </div>
      </div>
      
      <ul className="relative z-10 divide-y divide-slate-200/60 dark:divide-white/10">
        {items.map((it, index) => (
          <li 
            key={it.id} 
            className="group/item relative overflow-hidden p-4 hover:bg-white/50 dark:hover:bg-white/5 transition-all duration-300 fade-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getReportColor(it.type)} flex items-center justify-center text-white text-lg group-hover/item:scale-110 transition-transform duration-300`}>
                  {getReportIcon(it.type)}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors">
                    {it.title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <span>📍</span>
                    {it.district}, {it.region}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                  {new Date(it.time).toLocaleTimeString()}
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full group-hover/item:animate-pulse"></div>
              </div>
            </div>
            
            {/* Hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl">
              📭
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No reports match current filters.
            </p>
          </li>
        )}
      </ul>
    </div>
  );
}
