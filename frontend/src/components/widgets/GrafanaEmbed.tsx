"use client";

import React from "react";

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
  const embedSrc =
    src ||
    process.env.NEXT_PUBLIC_GRAFANA_EMBED_URL ||
    "http://localhost:3001/d/sensor-overview";

  return (
    <div className="rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur border border-slate-200/60 dark:border-white/10 shadow-sm p-4">
      <h3 className="text-sm font-medium mb-2">{title}</h3>
      <div className="w-full overflow-hidden rounded-xl border border-slate-200/60 dark:border-white/10">
        <iframe
          src={embedSrc}
          title={title}
          style={{ width: "100%", height: typeof height === "number" ? `${height}px` : height }}
          frameBorder="0"
          allowFullScreen
        />
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
        Grafana is embedded. Configure NEXT_PUBLIC_GRAFANA_EMBED_URL for a specific dashboard.
      </div>
    </div>
  );
}


