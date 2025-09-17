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
  onRegionChange,
}: {
  value: Filters;
  onChange: (v: Filters) => void;
  onRegionChange?: () => void;
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
        className="flex-1 rounded-xl border border-white/50 bg-white/30 px-3 py-2 outline-none text-slate-800 placeholder-slate-500"
      />
      <select
        value={r}
        onChange={(e) => {
          setR(e.target.value);
          onChange({ query: q, region: e.target.value });
          // Auto-scroll to reports section when region changes
          if (onRegionChange) {
            onRegionChange();
          }
        }}
        className="rounded-xl border border-white/50 bg-white/30 px-3 py-2 text-slate-800"
      >
        {regions.map((rr) => (
          <option
            key={rr}
            value={rr}
            style={{ color: "#1e293b", backgroundColor: "white" }}
          >
            {rr}
          </option>
        ))}
      </select>
    </div>
  );
}
