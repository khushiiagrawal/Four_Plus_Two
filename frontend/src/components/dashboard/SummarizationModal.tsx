"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useToast } from "@/components/ui/Toast";

interface SummarizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: string;
  originalReportCount: number;
  onSendToAuthorities: () => void;
  isSending: boolean;
}

export default function SummarizationModal({
  isOpen,
  onClose,
  summary,
  originalReportCount,
  onSendToAuthorities,
  isSending,
}: SummarizationModalProps) {
  const { addToast } = useToast();
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

  const handleClose = () => {
    if (!isSending) {
      onClose();
    }
  };

  const handleSendToAuthorities = async () => {
    try {
      await onSendToAuthorities();
      addToast({
        type: "success",
        title: "Report Sent",
        message: `Successfully sent summarized report (${originalReportCount} reports) to authorities.`,
        duration: 5000,
      });
      onClose();
    } catch (error) {
      addToast({
        type: "error",
        title: "Send Failed",
        message: "Failed to send summarized report to authorities. Please try again.",
        duration: 5000,
      });
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
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
      <div className="relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div 
          className="rounded-2xl border border-white/20 bg-white/30 backdrop-blur shadow-lg p-6"
          style={{
            background: "linear-gradient(to bottom, #25404c, #1f4a5e, #1e485c, #1e4558, #1d4254, #1c3e50, #1b3b4b, #1b3745, #193440, #18303c)",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              🤖 AI Summary Preview
            </h2>
            <button
              onClick={handleClose}
              disabled={isSending}
              className="text-white/70 hover:text-white transition-colors disabled:opacity-50"
            >
              ✕
            </button>
          </div>

          {/* Summary Info */}
          <div className="mb-4 p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg">
            <div className="text-sm text-blue-200 flex items-center gap-2">
              <span>📊</span>
              <span>Summarized from {originalReportCount} health reports</span>
            </div>
          </div>

          {/* AI Summary Content */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-3">
              Generated Summary:
            </label>
            <div className="bg-white/10 border border-white/20 rounded-xl p-4 min-h-[200px]">
              <p className="text-white leading-relaxed whitespace-pre-wrap">
                {summary}
              </p>
            </div>
          </div>

          {/* Warning Notice */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-6">
            <p className="text-xs text-amber-200">
              ⚠️ This summary will be sent to higher authorities and district officials. 
              Please review the content carefully before sending.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSending}
              className="flex-1 px-4 py-2 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              Close
            </button>
            <button
              onClick={handleSendToAuthorities}
              disabled={isSending}
              className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  📤 Send to Authorities
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

