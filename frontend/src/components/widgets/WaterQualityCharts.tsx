"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const CLEAN_PH_BASELINE = 7.1;
const CLEAN_TURBIDITY_BASELINE = 0.3;
const PH_RANGE = { min: 6.8, max: 7.4 };
const TURBIDITY_RANGE = { min: 0.1, max: 1.0 };

export default function WaterQualityCharts() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const timerRef = useRef<number | null>(null);
  const phRef = useRef<number>(7.1);
  const turbRef = useRef<number>(0.3);
  const timeRef = useRef<number>(0);
  const contaminationEventRef = useRef<number>(0);

  const generateRealisticData = useCallback(() => {
    timeRef.current += 1;
    const dailyCycle = Math.sin((timeRef.current * 0.1) * Math.PI / 12) * 0.05;

    if (contaminationEventRef.current <= 0 && Math.random() < 0.01) {
      contaminationEventRef.current = Math.floor(10 + Math.random() * 20);
    }

    if (contaminationEventRef.current > 0) {
      contaminationEventRef.current -= 1;
      const phContaminationDrift = (6.5 - phRef.current) * 0.02;
      phRef.current += phContaminationDrift;
      const turbContaminationDrift = (2.5 - turbRef.current) * 0.03;
      turbRef.current += turbContaminationDrift;
    } else {
      const phVariation = (Math.random() - 0.5) * 0.02;
      const phDrift = (CLEAN_PH_BASELINE - phRef.current) * 0.01;
      phRef.current += phDrift + phVariation + dailyCycle;

      const turbVariation = (Math.random() - 0.5) * 0.05;
      const turbDrift = (CLEAN_TURBIDITY_BASELINE - turbRef.current) * 0.02;
      turbRef.current += turbDrift + turbVariation;
    }

    phRef.current = Math.max(PH_RANGE.min, Math.min(PH_RANGE.max, phRef.current));
    turbRef.current = Math.max(TURBIDITY_RANGE.min, Math.min(TURBIDITY_RANGE.max, turbRef.current));

    const phNoise = (Math.random() - 0.5) * 0.02;
    const turbNoise = (Math.random() - 0.5) * 0.04;

    const finalPh = phRef.current + phNoise;
    const finalTurbidity = turbRef.current + turbNoise;

    setSamples((prev) => {
      const next = [
        ...prev,
        {
          ts: Date.now(),
          ph: Number(Math.max(PH_RANGE.min, Math.min(PH_RANGE.max, finalPh)).toFixed(2)),
          turbidity: Number(Math.max(TURBIDITY_RANGE.min, Math.min(TURBIDITY_RANGE.max, finalTurbidity)).toFixed(2))
        },
      ];
      return next.slice(-120);
    });
  }, []);

  useEffect(() => {
    generateRealisticData();
    timerRef.current = window.setInterval(generateRealisticData, 3000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [generateRealisticData]);

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
          tension: 0.4,
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
          tension: 0.4,
        },
      ],
    }),
    [labels, samples]
  );

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      tooltip: {
        mode: "nearest",
        intersect: false,
        callbacks: {
          label: function (context: { dataset: { label?: string }; parsed: { y: number } }) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (label === 'pH') {
              return `${label}: ${value} (Clean water: 6.8-7.4)`;
            } else if (label === 'Turbidity (NTU)') {
              return `${label}: ${value} (Clean water: <1.0 NTU)`;
            }
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: "rgba(148,163,184,0.15)" },
        title: { display: true, text: 'Time' }
      },
      y: {
        grid: { color: "rgba(148,163,184,0.15)" },
        title: { display: true, text: 'Value' }
      },
    },
  } as const;

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="rounded-2xl p-4 bg-white/30 backdrop-blur-md border border-white/40 shadow-sm h-64">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-slate-700">pH (units)</div>
          <div className="text-xs text-slate-500 bg-green-100 px-2 py-1 rounded">
            Clean Water Range: 6.8-7.4
          </div>
        </div>
        <Line data={phData} options={commonOptions} />
      </div>

      <div className="rounded-2xl p-4 bg-white/30 backdrop-blur-md border border-white/40 shadow-sm h-64">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-slate-700">Turbidity (NTU)</div>
          <div className="text-xs text-slate-500 bg-green-100 px-2 py-1 rounded">
            Clean Water: &lt;1.0 NTU
          </div>
        </div>
        <Line data={turbData} options={commonOptions} />
      </div>
    </div>
  );
}
