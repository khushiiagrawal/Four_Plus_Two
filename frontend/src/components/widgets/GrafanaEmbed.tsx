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
  const { data, error } = useSWR(src ? null : `/api/grafana/url?title=Sensor%20Overview`, (u) => fetch(u, { cache: "no-store" }).then((r) => r.json()));
  const resolved = data?.url as string | undefined;
  const rawSrc = src || resolved || process.env.NEXT_PUBLIC_GRAFANA_EMBED_URL;

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
  const embedSrc = rawSrc ? withDefaults(rawSrc) : "";

  // Show error state if Grafana is not available
  if (error || !rawSrc) {
    return (
      <div className="rounded-2xl bg-white/40 backdrop-blur border border-white/50 shadow-sm p-4">
        <h3 className="text-sm font-medium mb-2 text-slate-800">{title}</h3>
        <div className="w-full overflow-hidden rounded-xl border border-slate-300/60 bg-slate-50 flex items-center justify-center" style={{ height: typeof height === "number" ? `${height}px` : height }}>
          <div className="text-center p-8">
            <div className="text-4xl mb-4">📊</div>
            <h4 className="text-lg font-medium text-slate-700 mb-2">Grafana Dashboard Unavailable</h4>
            <p className="text-sm text-slate-600 mb-4">
              The Grafana monitoring dashboard is currently not accessible.
            </p>
            <p className="text-xs text-slate-500">
              Please ensure Grafana is running on localhost:3001 or configure NEXT_PUBLIC_GRAFANA_EMBED_URL
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/40 backdrop-blur border border-white/50 shadow-sm p-4">
      <h3 className="text-sm font-medium mb-2 text-slate-800">{title}</h3>
      <div className="w-full overflow-hidden rounded-xl border border-slate-300/60">
        <iframe
          src={embedSrc}
          title={title}
          style={{ width: "100%", height: typeof height === "number" ? `${height}px` : height }}
          frameBorder="0"
          allowFullScreen
        />
      </div>
      <div className="text-xs text-slate-600 mt-2">
        Grafana is embedded. Configure NEXT_PUBLIC_GRAFANA_EMBED_URL for a specific dashboard.
      </div>
    </div>
  );
}


