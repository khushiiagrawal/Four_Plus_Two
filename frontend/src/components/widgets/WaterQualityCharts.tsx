"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip);

type Sample = { ts: number; ph: number; turbidity: number };

export default function WaterQualityCharts() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const timerRef = useRef<number | null>(null);
  const phRef = useRef<number>(7.2);
  const turbRef = useRef<number>(0.8);
  const spikeCooldownRef = useRef<number>(0);

  const generateOnce = () => {
    // Occasional spike logic
    if (spikeCooldownRef.current > 0) {
      spikeCooldownRef.current -= 1;
    } else if (Math.random() < 0.05) {
      // trigger a spike lasting 3-6 intervals
      spikeCooldownRef.current = Math.floor(3 + Math.random() * 3);
      // ph spike up or down
      const phSpike = (Math.random() < 0.5 ? -1 : 1) * (0.6 + Math.random() * 0.6);
      phRef.current = Math.max(5.6, Math.min(8.8, phRef.current + phSpike));
      // turbidity spike upward
      turbRef.current = Math.min(8.0, turbRef.current + 2.0 + Math.random() * 3.0);
    } else {
      // Random walk drift toward nominal values
      const phDrift = (7.2 - phRef.current) * 0.05 + (Math.random() - 0.5) * 0.05;
      phRef.current = Math.max(6.0, Math.min(8.8, phRef.current + phDrift));
      const turbDrift = (0.9 - turbRef.current) * 0.08 + (Math.random() - 0.5) * 0.08;
      turbRef.current = Math.max(0.2, Math.min(6.0, turbRef.current + turbDrift));
    }

    setSamples((prev) => {
      const next = [
        ...prev,
        { ts: Date.now(), ph: Number(phRef.current.toFixed(2)), turbidity: Number(turbRef.current.toFixed(2)) },
      ];
      return next.slice(-120);
    });
  };

  useEffect(() => {
    generateOnce();
    timerRef.current = window.setInterval(generateOnce, 3000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  const labels = useMemo(() => samples.map((s) => new Date(s.ts).toLocaleTimeString()), [samples]);

  const phData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "pH",
          data: samples.map((s) => s.ph),
          borderColor: "#06b6d4",
          backgroundColor: "rgba(6, 182, 212, 0.25)",
          pointRadius: 0,
          tension: 0.3,
        },
      ],
    }),
    [labels, samples]
  );

  const turbData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Turbidity (NTU)",
          data: samples.map((s) => s.turbidity),
          borderColor: "#22c55e",
          backgroundColor: "rgba(34, 197, 94, 0.25)",
          pointRadius: 0,
          tension: 0.3,
        },
      ],
    }),
    [labels, samples]
  );

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true }, tooltip: { mode: "nearest", intersect: false } },
    scales: {
      x: { grid: { color: "rgba(148,163,184,0.15)" } },
      y: { grid: { color: "rgba(148,163,184,0.15)" } },
    },
  } as const;

  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4">
      <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-white/30 backdrop-blur-md border border-white/40 shadow-sm h-56 sm:h-64">
        <div className="text-sm font-medium text-slate-700 mb-2">pH (units)</div>
        <Line data={phData} options={commonOptions} />
      </div>
      <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-white/30 backdrop-blur-md border border-white/40 shadow-sm h-56 sm:h-64">
        <div className="text-sm font-medium text-slate-700 mb-2">Turbidity (NTU)</div>
        <Line data={turbData} options={commonOptions} />
      </div>
    </div>
  );
}


