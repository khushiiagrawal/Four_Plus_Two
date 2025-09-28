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

// Clean water baseline values (WHO standards)
const CLEAN_PH_BASELINE = 7.1;
const CLEAN_TURBIDITY_BASELINE = 0.3;

// Realistic ranges for clean water
const PH_RANGE = { min: 6.8, max: 7.4 }; // Clean water pH range
const TURBIDITY_RANGE = { min: 0.1, max: 1.0 }; // Clean water turbidity range

export default function WaterQualityCharts() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const timerRef = useRef<number | null>(null);
  
  // Realistic water quality sensor state
  const phRef = useRef<number>(7.1); // Start with clean water pH
  const turbRef = useRef<number>(0.3); // Start with low turbidity
  const timeRef = useRef<number>(0); // Time counter for periodic patterns
  const contaminationEventRef = useRef<number>(0); // Contamination event counter
  
  const generateRealisticData = useCallback(() => {
    timeRef.current += 1;
    
    // Simulate natural daily patterns (morning/evening variations)
    const dailyCycle = Math.sin((timeRef.current * 0.1) * Math.PI / 12) * 0.05; // 12-hour cycle
    
    // Very rare contamination events (1% chance every 20 readings = ~1 minute)
    if (contaminationEventRef.current <= 0 && Math.random() < 0.01) {
      contaminationEventRef.current = Math.floor(10 + Math.random() * 20); // 10-30 readings duration
    }
    
    if (contaminationEventRef.current > 0) {
      // During contamination event - gradual drift towards contaminated values
      contaminationEventRef.current -= 1;
      
      // pH becomes slightly acidic during contamination
      const phContaminationDrift = (6.5 - phRef.current) * 0.02;
      phRef.current += phContaminationDrift;
      
      // Turbidity increases during contamination
      const turbContaminationDrift = (2.5 - turbRef.current) * 0.03;
      turbRef.current += turbContaminationDrift;
    } else {
      // Normal clean water conditions - very stable with tiny variations
      
      // pH: Very small random variations around baseline
      const phVariation = (Math.random() - 0.5) * 0.02; // ±0.01 pH units
      const phDrift = (CLEAN_PH_BASELINE - phRef.current) * 0.01; // Gentle return to baseline
      phRef.current += phDrift + phVariation + dailyCycle;
      
      // Turbidity: Small variations around baseline
      const turbVariation = (Math.random() - 0.5) * 0.05; // ±0.025 NTU
      const turbDrift = (CLEAN_TURBIDITY_BASELINE - turbRef.current) * 0.02; // Gentle return to baseline
      turbRef.current += turbDrift + turbVariation;
    }
    
    // Ensure values stay within realistic clean water ranges
    phRef.current = Math.max(PH_RANGE.min, Math.min(PH_RANGE.max, phRef.current));
    turbRef.current = Math.max(TURBIDITY_RANGE.min, Math.min(TURBIDITY_RANGE.max, turbRef.current));
    
    // Add very small sensor noise (±0.01 for pH, ±0.02 for turbidity)
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
      return next.slice(-120); // Keep last 120 readings (6 minutes at 3-second intervals)
    });
  }, []);

  useEffect(() => {
    generateRealisticData();
    // Update every 3 seconds (realistic sensor sampling rate)
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
          tension: 0.4, // Smoother curves
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
          tension: 0.4, // Smoother curves
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
          label: function(context: { dataset: { label?: string }; parsed: { y: number } }) {
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
        title: {
          display: true,
          text: 'Time'
        }
      },
      y: { 
        grid: { color: "rgba(148,163,184,0.15)" },
        title: {
          display: true,
          text: 'Value'
        }
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


