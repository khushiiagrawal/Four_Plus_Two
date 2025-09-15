"use client";

import React from "react";
import useSWR from "swr";

type GrafanaEmbedProps = {
  src?: string;
  title?: string;
  height?: number | string;
};

export default function GrafanaEmbed({
  src,
  title = "Sensor Overview (Grafana)",
  height = 520,
}: GrafanaEmbedProps) {
  const { data } = useSWR(src ? null : `/api/grafana/url?title=Sensor%20Overview`, (u) => fetch(u, { cache: "no-store" }).then((r) => r.json()));
  const resolved = data?.url as string | undefined;
  const rawSrc = src || resolved || process.env.NEXT_PUBLIC_GRAFANA_EMBED_URL || "http://localhost:3001/dashboards";

  // Ensure kiosk + auto-refresh defaults are present
  const withDefaults = (u: string) => {
    const hasKiosk = u.includes("kiosk=");
    const hasRefresh = u.includes("refresh=");
    if (hasKiosk && hasRefresh) return u;
    const sep = u.includes("?") ? "&" : "?";
    const params: string[] = [];
    if (!hasKiosk) params.push("kiosk=tv");
    if (!hasRefresh) params.push("refresh=30s");
    return `${u}${sep}${params.join("&")}`;
  };
  const embedSrc = withDefaults(rawSrc);

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 shadow-lg hover:shadow-2xl transition-all duration-500">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-lg group-hover:scale-110 transition-transform duration-300">
              📊
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Real-time sensor data visualization</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Live</span>
          </div>
        </div>
        
        <div className="relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-white/10 shadow-inner group-hover:shadow-lg transition-shadow duration-500">
          {/* Loading shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-500"></div>
          
          <iframe
            src={embedSrc}
            title={title}
            style={{ width: "100%", height: typeof height === "number" ? `${height}px` : height }}
            frameBorder="0"
            allowFullScreen
            className="relative z-10"
          />
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>⚡</span>
            Auto-refresh enabled
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Grafana embedded dashboard
          </div>
        </div>
      </div>
    </div>
  );
}


