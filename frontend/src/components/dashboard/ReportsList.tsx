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
        (regionFilter === "All Regions" || it.region === regionFilter) &&
        (!query ||
          it.title.toLowerCase().includes(query.toLowerCase()) ||
          it.district.toLowerCase().includes(query.toLowerCase()) ||
          it.symptoms?.toLowerCase().includes(query.toLowerCase()) ||
          it.location?.toLowerCase().includes(query.toLowerCase()))
    );
  }, [data, regionFilter, query]);

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
              <div className="text-xs text-slate-500 dark:text-slate-400 ml-4">
                {new Date(it.time).toLocaleString()}
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
