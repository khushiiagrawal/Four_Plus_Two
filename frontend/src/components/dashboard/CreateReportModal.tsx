"use client";
import { useState } from "react";
import { useToast } from "@/components/ui/Toast";

type ReportPayload = {
  symptoms: string;
  location: string;
  description?: string;
  waterSource?: string;
  age?: number;
  symptomStartTimestamp?: number;
};

export default function CreateReportModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { addToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [age, setAge] = useState<string>("");
  const [symptoms, setSymptoms] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [waterSource, setWaterSource] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [symptomStartTimestamp, setSymptomStartTimestamp] = useState<string>("");

  if (!isOpen) return null;

  const reset = () => {
    setAge("");
    setSymptoms("");
    setLocation("");
    setWaterSource("");
    setDescription("");
    setSymptomStartTimestamp("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms || !location) {
      addToast({
        type: "warning",
        title: "Missing Fields",
        message: "Please fill symptoms and location.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const body: ReportPayload = {
        symptoms,
        location,
        description,
        waterSource: waterSource || undefined,
      };
      if (age) body.age = Number(age);
      if (symptomStartTimestamp) body.symptomStartTimestamp = new Date(symptomStartTimestamp).getTime();

      const res = await fetch("/api/data/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create report");
      }

      addToast({
        type: "success",
        title: "Report Created",
        message: "Your report has been created.",
      });
      reset();
      onCreated();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not create report.";
      addToast({
        type: "error",
        title: "Create Failed",
        message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-xl rounded-2xl border border-white/40 bg-white/90 backdrop-blur p-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
          <h3 className="text-base font-semibold text-slate-800">Create Health Report</h3>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-900">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1 text-slate-700">Symptoms</label>
              <input
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full rounded-xl border border-slate-300/70 bg-white px-3 py-2 outline-none text-slate-800"
                placeholder="Fever, diarrhea, ..."
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-slate-700">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-slate-300/70 bg-white px-3 py-2 outline-none text-slate-800"
                placeholder="Village / Area"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-slate-700">Age (optional)</label>
              <input
                type="number"
                min={0}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full rounded-xl border border-slate-300/70 bg-white px-3 py-2 outline-none text-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-slate-700">Water Source (optional)</label>
              <input
                value={waterSource}
                onChange={(e) => setWaterSource(e.target.value)}
                className="w-full rounded-xl border border-slate-300/70 bg-white px-3 py-2 outline-none text-slate-800"
                placeholder="Well-12 / Tap-3"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1 text-slate-700">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-300/70 bg-white px-3 py-2 outline-none text-slate-800"
              rows={3}
              placeholder="Any additional notes"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-slate-700">Symptom Start (optional)</label>
            <input
              type="datetime-local"
              value={symptomStartTimestamp}
              onChange={(e) => setSymptomStartTimestamp(e.target.value)}
              className="w-full rounded-xl border border-slate-300/70 bg-white px-3 py-2 outline-none text-slate-800"
            />
          </div>
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl border border-cyan-700 bg-cyan-600 text-white hover:bg-cyan-700 disabled:bg-gray-400 disabled:border-gray-500"
            >
              {submitting ? "Creating..." : "Create Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


