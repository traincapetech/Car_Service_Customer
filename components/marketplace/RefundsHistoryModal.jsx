"use client";

import React from "react";
import { RotateCcw, ShieldCheck, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import Modal from "../ui/Modal";
import Badge from "../ui/Badge";

export default function RefundsHistoryModal({
  isOpen,
  onClose,
  refunds = [],
  isLoading = false,
}) {
  const getReasonLabel = (reason) => {
    switch (reason) {
      case "OPPORTUNITY_ALREADY_ASSIGNED":
        return "Opportunity Claimed by Another Workshop";
      case "CUSTOMER_CANCELLED":
        return "Customer Cancelled Request";
      case "SERVICE_UNAVAILABLE":
        return "Service Unavailable";
      case "DUPLICATE_PAYMENT":
        return "Duplicate Payment";
      case "MANUAL_ADMIN_REFUND":
        return "Manual Platform Adjustment";
      default:
        return reason || "Auto Refund";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Workshop Refunds Audit Ledger"
      description="Record of all automated and processed refunds credited to your workshop account."
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-500">
            <span className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin inline-block mb-2" />
            <p>Loading refund records from platform ledger...</p>
          </div>
        ) : refunds.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <RotateCcw className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">No Refunds on Record</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When an opportunity is claimed by another workshop during a race condition, your acceptance fee will be automatically credited back here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden max-h-[60vh] overflow-y-auto">
            {refunds.map((ref) => (
              <div
                key={ref.id}
                className="p-4 bg-white hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">
                      RFND-#{ref.id}
                    </span>
                    <Badge
                      variant={ref.refundStatus === "SUCCESS" ? "success" : "blue"}
                      size="sm"
                    >
                      {ref.refundStatus}
                    </Badge>
                  </div>
                  <p className="font-semibold text-slate-700">
                    {getReasonLabel(ref.refundReason)}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Opportunity #{ref.opportunityId} • Payment #{ref.paymentId}
                    {ref.processedAt ? ` • Processed: ${new Date(ref.processedAt).toLocaleString()}` : ""}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base font-black font-mono text-emerald-600">
                    +₹{Number(ref.refundAmount || 0).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Credited to Wallet
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-500">
            Total Records: <strong className="text-slate-900">{refunds.length}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
