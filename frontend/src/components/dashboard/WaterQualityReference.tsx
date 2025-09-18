"use client";

export default function WaterQualityReference() {
  return (
    <div className="mb-4 rounded-xl border border-white/50 bg-white/30 backdrop-blur-md shadow-sm p-3">
      <div className="flex items-center justify-center text-center">
        <div className="text-sm text-slate-700">
          <span className="font-semibold text-slate-800">
            💧 Quick Reference:
          </span>{" "}
          <span className="text-green-700">
            ✅ Safe: pH 6.5-8.5, Turbidity &lt;1 NTU, DO &gt;6 mg/L
          </span>{" "}
          <span className="mx-2">•</span>{" "}
          <span className="text-yellow-700">
            ⚠️ Warning: pH 6.0-6.5/8.5-9.0, Turbidity 1-4 NTU, DO 4-6 mg/L
          </span>{" "}
          <span className="mx-2">•</span>{" "}
          <span className="text-red-700">
            🚨 Danger: pH &lt;6.0/&gt;9.0, Turbidity &gt;4 NTU, DO &lt;4 mg/L
          </span>
        </div>
      </div>
    </div>
  );
}
