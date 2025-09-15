"use client";
import { useState } from "react";

export type Filters = { query: string; region: string };

const regions = [
  "All Regions",
  "Assam",
  "Meghalaya",
  "Manipur",
  "Mizoram",
  "Tripura",
  "Nagaland",
  "Arunachal Pradesh",
  "Sikkim",
];

export default function FiltersBar({
  value,
  onChange,
}: {
  value: Filters;
  onChange: (v: Filters) => void;
}) {
  const [q, setQ] = useState(value.query);
  const [r, setR] = useState(value.region);
  return (
    <div className="flex flex-col md:flex-row gap-3 md:items-center">
      <div className="relative flex-1 group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm"></div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onBlur={() => onChange({ query: q, region: r })}
          placeholder="Search reports..."
          className="relative w-full rounded-xl border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-white/10 backdrop-blur-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-300">
          🔍
        </div>
      </div>
      
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm"></div>
        <select
          value={r}
          onChange={(e) => {
            setR(e.target.value);
            onChange({ query: q, region: e.target.value });
          }}
          className="relative rounded-xl border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-white/10 backdrop-blur-xl px-4 py-3 pr-8 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
        >
          {regions.map((rr) => (
            <option key={rr} value={rr}>
              {rr}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-300 pointer-events-none">
          📍
        </div>
      </div>
    </div>
  );
}
