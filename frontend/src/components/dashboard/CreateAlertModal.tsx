"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/Toast";

const alertSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description too long"),
  location: z
    .string()
    .min(1, "Location is required")
    .max(100, "Location too long"),
});

type AlertFormData = z.infer<typeof alertSchema>;

interface CreateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAlertCreated?: () => void;
}

export default function CreateAlertModal({
  isOpen,
  onClose,
  onAlertCreated,
}: CreateAlertModalProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = "unset";
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const form = useForm<AlertFormData>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
    },
  });

  const onSubmit = async (data: AlertFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create alert");
      }

      addToast({
        type: "success",
        title: "Report Sent",
        message: "Report has been successfully sent to higher authorities.",
      });

      form.reset();
      onClose();
      onAlertCreated?.();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to send alert. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      onClose();
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-auto">
        <div 
          className="rounded-xl sm:rounded-2xl border border-white/20 bg-white/30 backdrop-blur shadow-lg p-4 sm:p-6"
          style={{
            background: "linear-gradient(to bottom, #25404c, #1f4a5e, #1e485c, #1e4558, #1d4254, #1c3e50, #1b3b4b, #1b3745, #193440, #18303c)",
          }}
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
              🚨 Send Emergency Report
            </h2>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-white/70 hover:text-white transition-colors disabled:opacity-50 text-lg sm:text-xl"
            >
              ✕
            </button>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Report Title *
              </label>
              <input
                {...form.register("title")}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 placeholder:text-white/50 text-white text-sm sm:text-base"
                placeholder="e.g., Critical Pollution Level Alert"
                disabled={isSubmitting}
              />
              {form.formState.errors.title && (
                <p className="text-red-400 text-xs mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Description *
              </label>
              <textarea
                {...form.register("description")}
                rows={3}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 resize-none placeholder:text-white/50 text-white text-sm sm:text-base"
                placeholder="Describe the emergency situation, severity, and any immediate actions required..."
                disabled={isSubmitting}
              />
              {form.formState.errors.description && (
                <p className="text-red-400 text-xs mt-1">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Location *
              </label>
              <input
                {...form.register("location")}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 placeholder:text-white/50 text-white text-sm sm:text-base"
                placeholder="e.g., Industrial Zone A, Sector 12"
                disabled={isSubmitting}
              />
              {form.formState.errors.location && (
                <p className="text-red-400 text-xs mt-1">
                  {form.formState.errors.location.message}
                </p>
              )}
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 sm:p-3">
              <p className="text-xs sm:text-sm text-amber-200">
                ⚠️ This report will be immediately sent to higher authorities and
                district officials. Please ensure all information is
                accurate and the situation requires immediate attention.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-50 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-700 hover:to-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isSubmitting ? "Sending..." : "Send Alert"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
