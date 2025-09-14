"use client";
import { useEffect, useRef } from "react";

export default function QualityGauge({ value }: { value: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const w = (canvas.width = 320);
    const h = (canvas.height = 180);
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillRect(0, 0, w, h);

    // Gauge arc
    const cx = w / 2,
      cy = h - 10,
      r = 90;
    const start = Math.PI,
      end = 2 * Math.PI;
    ctx.lineWidth = 16;
    ctx.strokeStyle = "#e2e8f0";
    ctx.beginPath();
    ctx.arc(cx, cy, r, start, end);
    ctx.stroke();

    // Value arc
    const pct = Math.max(0, Math.min(100, value)) / 100;
    const hue = 140 * pct; // green to cyan
    ctx.strokeStyle = `hsl(${hue}, 80%, 45%)`;
    ctx.beginPath();
    ctx.arc(cx, cy, r, start, start + (end - start) * pct);
    ctx.stroke();

    // Needle
    const ang = start + (end - start) * pct;
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(ang) * (r - 10), cy + Math.sin(ang) * (r - 10));
    ctx.stroke();

    // Label
    ctx.fillStyle = "#0f172a";
    ctx.font = "600 24px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(`${value}%`, cx, cy - 20);
  }, [value]);

  return <canvas ref={ref} className="w-full" />;
}
