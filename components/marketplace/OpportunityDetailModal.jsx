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
  FileText,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  User,
} from "lucide-react";
import Modal from "../ui/Modal";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

export default function OpportunityDetailModal({
  isOpen,
  onClose,
  opportunity,
  onAccept,
  onTransfer,
}) {
  if (!opportunity) return null;

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
    latitude,
    longitude,
    preferredDate,
    preferredTimeSlot,
    customerNotes,
    customerProfile,
    customerDetailsUnlocked,
    createdAt,
  } = opportunity;

  const isUnlocked = Boolean(customerDetailsUnlocked);
  const isAvailable = status === "AVAILABLE" || status === "VIEWED";
  const isPendingPay = status === "ACCEPTED" || status === "PAYMENT_PENDING";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Opportunity #${requestReference || id}`}
      description="Service requirement specification and customer dispatch telemetry."
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Status & Fee Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Opportunity Status
            </span>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm font-extrabold text-slate-900">{status}</span>
              {isUnlocked && <Badge variant="success" size="sm" dot>Claimed & Won</Badge>}
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Acceptance Fee (Authoritative)
            </span>
            <span className="text-lg font-black font-mono text-blue-600">
              ₹{feeSnapshot !== undefined ? Number(feeSnapshot).toFixed(2) : "99.00"}
            </span>
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Car className="w-3.5 h-3.5 text-slate-600" />
            <span>Vehicle Specifications</span>
          </h4>
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
            <p className="text-base font-extrabold text-slate-900">
              {vehicleSummary || "Vehicle Information"}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Location</span>
                <span className="font-medium truncate">{city || "Local"} {pincode || ""}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Date</span>
                <span className="font-medium">{preferredDate || "Anytime"}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Slot</span>
                <span className="font-medium">{preferredTimeSlot || "Standard"}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Coordinates</span>
                <span className="font-mono text-[11px] truncate">
                  {latitude && longitude ? `${latitude}, ${longitude}` : "Approximate"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Requested Services Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-slate-600" />
              <span>Requested Services ({requestedServices.length})</span>
            </h4>
            {totalServiceAmount !== undefined && (
              <span className="text-xs font-bold text-slate-900">
                Total Est: <span className="font-mono text-emerald-700">₹{Number(totalServiceAmount).toFixed(2)}</span>
              </span>
            )}
          </div>
          <div className="border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100">
            {requestedServices.map((service, index) => (
              <div key={service.id || index} className="p-3 sm:p-3.5 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">{service.serviceName || service.name}</p>
                  <p className="text-[11px] text-slate-500">
                    Category: {service.serviceCategory || "General"} • {service.estimatedDurationMinutes || 60} mins
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold font-mono text-slate-900">
                    ₹{service.finalPrice !== undefined ? Number(service.finalPrice).toFixed(2) : Number(service.basePrice || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Notes */}
        {customerNotes && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>Customer Requirements / Notes</span>
            </h4>
            <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-slate-700 leading-relaxed italic">
              &quot;{customerNotes}&quot;
            </div>
          </div>
        )}

        {/* Customer Contact Information (Strict Masking Rules) */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-600" />
            <span>Customer Contact Details</span>
          </h4>

          {isUnlocked ? (
            /* Unlocked Details */
            <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <Unlock className="w-4 h-4 text-emerald-600" />
                  <span>Customer Contact Unlocked</span>
                </div>
                <Badge variant="success" size="sm">Confirmed Claim</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Customer Name</span>
                  <p className="font-bold text-slate-900 text-sm">{customerProfile?.name || "Customer"}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone Number</span>
                  <a
                    href={`tel:${customerProfile?.phone}`}
                    className="font-bold text-emerald-700 hover:underline flex items-center gap-1 text-sm font-mono"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{customerProfile?.phone}</span>
                  </a>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Email</span>
                  <a
                    href={`mailto:${customerProfile?.email}`}
                    className="text-slate-700 hover:underline truncate block"
                  >
                    {customerProfile?.email || "N/A"}
                  </a>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Service Address</span>
                  <p className="text-slate-700">{customerProfile?.address || "Address unavailable"}</p>
                </div>
              </div>
            </div>
          ) : (
            /* Masked Details */
            <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>Privacy Protected (Masked)</span>
                </div>
                <Badge variant="neutral" size="sm">Pre-Acceptance</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-400 font-mono">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Name</span>
                  <span>**********</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Phone</span>
                  <span>**********</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Email</span>
                  <span>**********</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Address</span>
                  <span>**********, {city}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 leading-relaxed flex items-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  Customer contact information is strictly protected under marketplace privacy guidelines. Details will automatically unlock once you confirm acceptance and pay the ₹{feeSnapshot || 99} lead fee.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>

          {(isAvailable || isPendingPay) && (
            <>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onTransfer && onTransfer(opportunity);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                Transfer / Decline
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAccept && onAccept(opportunity);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-xs"
              >
                <span>Accept & Pay ₹{feeSnapshot || 99}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {isUnlocked && (
            <a
              href={`tel:${customerProfile?.phone}`}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-xs"
            >
              <Phone className="w-4 h-4" />
              <span>Call Customer Now</span>
            </a>
          )}
        </div>
      </div>
    </Modal>
  );
}
