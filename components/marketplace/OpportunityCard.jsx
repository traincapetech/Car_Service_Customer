"use client";

import React from "react";
import {
  Car,
  Wrench,
  Calendar,
  Clock,
  MapPin,
  Lock,
  Unlock,
  Phone,
  Mail,
  ArrowRight,
  SendHorizontal,
  DollarSign,
  AlertCircle,
  FileText,
  ShieldAlert,
} from "lucide-react";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

export default function OpportunityCard({
  opportunity,
  onViewDetails,
  onAccept,
  onTransfer,
}) {
  const {
    id,
    requestReference,
    status,
    feeSnapshot,
    vehicleSummary,
    requestedServices = [],
    totalServiceAmount,
    city,
    pincode,
    preferredDate,
    preferredTimeSlot,
    customerNotes,
    customerProfile,
    customerDetailsUnlocked,
    createdAt,
  } = opportunity;

  // Format creation date
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "Just now";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Recent";
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "AVAILABLE":
        return <Badge variant="warning" size="sm" dot pulse>New Lead</Badge>;
      case "VIEWED":
        return <Badge variant="blue" size="sm" dot>Viewed</Badge>;
      case "ACCEPTED":
      case "PAYMENT_PENDING":
        return <Badge variant="blue" size="sm" dot pulse>Payment Pending</Badge>;
      case "CUSTOMER_DETAILS_UNLOCKED":
        return <Badge variant="success" size="sm" dot>Won & Unlocked</Badge>;
      case "LOST":
        return <Badge variant="danger" size="sm">Lost (Claimed)</Badge>;
      case "TRANSFERRED":
        return <Badge variant="purple" size="sm">Transferred</Badge>;
      case "CANCELLED":
        return <Badge variant="neutral" size="sm">Cancelled</Badge>;
      case "EXPIRED":
        return <Badge variant="neutral" size="sm">Expired</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  const isUnlocked = Boolean(customerDetailsUnlocked);
  const isAvailable = status === "AVAILABLE" || status === "VIEWED";
  const isPendingPay = status === "ACCEPTED" || status === "PAYMENT_PENDING";
  const isLost = status === "LOST";

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 shadow-2xs hover:shadow-md flex flex-col justify-between overflow-hidden ${
        isUnlocked
          ? "border-emerald-200 ring-1 ring-emerald-500/20"
          : isLost
          ? "border-rose-200 bg-rose-50/20"
          : "border-slate-200/90 hover:border-slate-300"
      }`}
    >
      {/* Top Header Row */}
      <div className="p-4 sm:p-5 pb-3.5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs shrink-0">
            {requestReference || `OPP-${id}`}
          </span>
          <span className="text-[11px] text-slate-500 font-medium shrink-0">
            • {formatTimeAgo(createdAt)}
          </span>
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      {/* Main Body */}
      <div className="p-4 sm:p-5 space-y-4 flex-1">
        {/* Vehicle Information */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Car className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-900 truncate">
              {vehicleSummary || "Vehicle Information"}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {city ? `${city} ${pincode || ""}`.trim() : "Local Service Area"}
              </span>
            </div>
          </div>
        </div>

        {/* Requested Services Tags */}
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
            Requested Services ({requestedServices.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {requestedServices.length > 0 ? (
              requestedServices.map((srv, idx) => (
                <span
                  key={srv.id || idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200/60"
                >
                  <Wrench className="w-3 h-3 text-slate-500" />
                  <span>{srv.serviceName || srv.name}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">General Maintenance</span>
            )}
          </div>
        </div>

        {/* Schedule & Notes */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate font-medium">{preferredDate || "Flexible Date"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate font-medium">{preferredTimeSlot || "Morning / Afternoon"}</span>
          </div>
        </div>

        {customerNotes && (
          <div className="text-xs text-slate-600 bg-amber-50/70 border border-amber-200/60 rounded-xl p-2.5 flex items-start gap-2">
            <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="line-clamp-2 italic text-[11px] leading-relaxed">
              &quot;{customerNotes}&quot;
            </p>
          </div>
        )}

        {/* Customer Privacy Section */}
        <div className="pt-2 border-t border-slate-100">
          {isUnlocked ? (
            /* Unlocked state: Customer Contact details visible */
            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Customer Contact (Unlocked)</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Name</span>
                  <span className="font-semibold">{customerProfile?.name || "Customer"}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone</span>
                  <a
                    href={`tel:${customerProfile?.phone}`}
                    className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{customerProfile?.phone}</span>
                  </a>
                </div>
              </div>
              {customerProfile?.address && (
                <p className="text-[11px] text-slate-600 truncate">
                  <span className="font-bold text-slate-500">Address: </span>
                  {customerProfile.address}
                </p>
              )}
            </div>
          ) : isLost ? (
            /* Lost race condition state */
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>Opportunity Claimed by Competitor</span>
              </div>
              <p className="text-[11px] text-rose-700 leading-tight">
                Another workshop completed payment first. Any debited acceptance fee was automatically refunded to your wallet.
              </p>
            </div>
          ) : (
            /* Masked privacy state before payment */
            <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Customer Contact (Masked)</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-md">
                  Protected
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 font-mono">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Name</span>
                  <span>**********</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Phone</span>
                  <span>**********</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 italic">
                Customer details will be unlocked after successful acceptance payment.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Financial Breakdown & Action Buttons */}
      <div className="p-4 sm:p-5 pt-3.5 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Estimated Value & Lead Fee */}
        <div>
          {totalServiceAmount !== undefined && (
            <p className="text-xs text-slate-500">
              Est. Service Value:{" "}
              <span className="font-bold font-mono text-slate-900">
                ₹{Number(totalServiceAmount).toFixed(2)}
              </span>
            </p>
          )}
          <p className="text-xs font-semibold text-slate-700">
            Acceptance Fee:{" "}
            <span className="font-bold font-mono text-blue-600">
              ₹{feeSnapshot !== undefined ? Number(feeSnapshot).toFixed(2) : "99.00"}
            </span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => onViewDetails && onViewDetails(opportunity)}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            Details
          </button>

          {(isAvailable || isPendingPay) && (
            <>
              <button
                type="button"
                onClick={() => onTransfer && onTransfer(opportunity)}
                className="px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
                title="Transfer to another workshop"
              >
                Transfer
              </button>

              <button
                type="button"
                onClick={() => onAccept && onAccept(opportunity)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 transition-all shadow-xs"
              >
                <span>Accept & Pay ₹{feeSnapshot || 99}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {isUnlocked && (
            <a
              href={`tel:${customerProfile?.phone}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Customer</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
