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

  return (
    <div className="rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur border border-slate-200/60 dark:border-white/10 shadow-sm">
      <div className="p-4 border-b border-slate-200/60 dark:border-white/10">
        <h3 className="text-sm font-medium">Recent Field Reports</h3>
      </div>
      <ul className="divide-y divide-slate-200/60 dark:divide-white/10">
        {items.map((it) => (
          <li key={it.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{it.title}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {it.district}, {it.region}
              </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {new Date(it.time).toLocaleString()}
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="p-6 text-sm text-slate-500 dark:text-slate-400">
            No reports match current filters.
          </li>
        )}
      </ul>
    </div>
  );
}
