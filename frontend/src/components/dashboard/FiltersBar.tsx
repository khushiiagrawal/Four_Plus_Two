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
    <div className="flex flex-col md:flex-row gap-2 md:items-center">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onBlur={() => onChange({ query: q, region: r })}
        placeholder="Search reports..."
        className="flex-1 rounded-xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-2 outline-none"
      />
      <select
        value={r}
        onChange={(e) => {
          setR(e.target.value);
          onChange({ query: q, region: e.target.value });
        }}
        className="rounded-xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-2"
      >
        {regions.map((rr) => (
          <option key={rr} value={rr}>
            {rr}
          </option>
        ))}
      </select>
    </div>
  );
}
