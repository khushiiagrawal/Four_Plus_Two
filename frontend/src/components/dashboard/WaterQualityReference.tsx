"use client";
import { FormattedMessage } from "react-intl";

export default function WaterQualityReference() {
  return (
    <div className="mb-4 rounded-xl border border-white/50 bg-white/30 backdrop-blur-md shadow-sm p-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center text-center gap-2 sm:gap-0">
        <div className="text-xs sm:text-sm text-slate-700">
          <span className="font-semibold text-slate-800">
            💧 <FormattedMessage
              id="dashboard.quickReference.title"
              defaultMessage="Quick Reference"
            />:
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm">
          <span className="text-green-700">
            ✅ <FormattedMessage
              id="dashboard.quickReference.safe"
              defaultMessage="Safe: pH 6.5-8.5, Turbidity <1 NTU, DO >6 mg/L"
            />
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="text-yellow-700">
            ⚠️ <FormattedMessage
              id="dashboard.quickReference.warning"
              defaultMessage="Warning: pH 6.0-6.5/8.5-9.0, Turbidity 1-4 NTU, DO 4-6 mg/L"
            />
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="text-red-700">
            🚨 <FormattedMessage
              id="dashboard.quickReference.danger"
              defaultMessage="Danger: pH <6.0/>9.0, Turbidity >4 NTU, DO <4 mg/L"
            />
          </span>
        </div>
      </div>
    </div>
  );
}
