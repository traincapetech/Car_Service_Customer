"use client";

import React, { useState } from "react";
import { SendHorizontal, AlertTriangle } from "lucide-react";
import Modal from "../ui/Modal";
import Alert from "../ui/Alert";
import { marketplaceApi } from "../../lib/marketplace";
import { useToast } from "../../context/ToastContext";

const STANDARD_REASONS = [
  { value: "WORKSHOP_AT_CAPACITY", label: "Workshop at capacity" },
  { value: "PARTS_UNAVAILABLE", label: "Parts unavailable" },
  { value: "OUTSIDE_SERVICE_RADIUS", label: "Outside service radius" },
  { value: "SPECIALIZED_EQUIPMENT_REQUIRED", label: "Specialized equipment required" },
  { value: "OTHER", label: "Other operational constraints" },
];

export default function TransferOpportunityModal({
  isOpen,
  onClose,
  opportunity,
  onTransferSuccess,
}) {
  const toast = useToast();

  const [selectedReason, setSelectedReason] = useState(STANDARD_REASONS[0].value);
  const [customNotes, setCustomNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!opportunity) return null;

  const handleTransfer = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await marketplaceApi.transferOpportunity(opportunity.id, selectedReason, customNotes);
      toast?.success("Opportunity transferred and re-matching initiated.");
      onClose();
      onTransferSuccess && onTransferSuccess(opportunity.id);
    } catch (err) {
      console.error("Transfer error:", err);
      setError(err.message || "Failed to transfer opportunity. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transfer this service request?"
      description="This will release this opportunity for re-matching with another eligible workshop. You will no longer be the assigned workshop."
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {error && (
          <Alert variant="danger" title="Transfer Error">
            {error}
          </Alert>
        )}

        <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-2 text-xs text-amber-900 leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Transferring will release this lead back to the matching engine. Your workshop will be permanently excluded from receiving this request again.
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">
            Reason for Transfer
          </label>
          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            disabled={isSubmitting}
            className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium disabled:opacity-50"
          >
            {STANDARD_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">
            Additional Notes (Optional)
          </label>
          <textarea
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            disabled={isSubmitting}
            placeholder="Add any operational details or reason notes for platform dispatch..."
            rows={3}
            className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none disabled:opacity-50"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleTransfer}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all shadow-xs disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Transferring...</span>
              </>
            ) : (
              <>
                <SendHorizontal className="w-3.5 h-3.5" />
                <span>Transfer Request</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

