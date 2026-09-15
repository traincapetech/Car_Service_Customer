"use client";

import React, { useState } from "react";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import {
  Car,
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  Search,
  Sparkles,
  ShieldAlert,
} from "lucide-react";

// Status configuration map
const JOB_STATUS_CONFIG = {
  ASSIGNED: {
    label: "Assigned",
    variant: "neutral",
    dot: true,
    pulse: false,
    description: "New booking assigned. Ready for partner confirmation.",
  },
  CONFIRMED: {
    label: "Confirmed",
    variant: "blue",
    dot: true,
    pulse: false,
    description: "Service appointment confirmed. Awaiting vehicle arrival.",
  },
  VEHICLE_RECEIVED: {
    label: "Vehicle Received",
    variant: "purple",
    dot: true,
    pulse: false,
    description: "Vehicle has checked in to the workshop intake bay.",
  },
  INSPECTION: {
    label: "Inspection",
    variant: "warning",
    dot: true,
    pulse: true,
    description: "Multi-point diagnostic inspection in progress.",
  },
  WORK_IN_PROGRESS: {
    label: "Work in Progress",
    variant: "blue",
    dot: true,
    pulse: true,
    description: "Certified technicians are servicing vehicle.",
  },
  READY_FOR_DELIVERY: {
    label: "Ready for Delivery",
    variant: "success",
    dot: true,
    pulse: true,
    description: "All work completed and quality checked. Ready for handover.",
  },
  COMPLETED: {
    label: "Completed",
    variant: "success",
    dot: false,
    pulse: false,
    description: "Service completed and vehicle released to customer.",
  },
  CANCELLED: {
    label: "Cancelled",
    variant: "danger",
    dot: false,
    pulse: false,
    description: "Booking was cancelled.",
  },
};

export default function WorkshopJobCard({
  job,
  onUpdateStatus,
  isUpdating = false,
}) {
  const [selectedTargetStatus, setSelectedTargetStatus] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);

  if (!job) return null;

  const currentConfig = JOB_STATUS_CONFIG[job.status] || {
    label: job.status,
    variant: "neutral",
    description: job.statusDescription || "",
  };

  const allowedTransitions = job.allowedTransitions || [];
  const profile = job.customerProfile;
  const isUnlocked = job.customerDetailsUnlocked;

  const handleTransitionClick = (nextStatus) => {
    if (nextStatus === "CANCELLED") {
      setShowCancelPrompt(true);
    } else {
      onUpdateStatus(job.id, nextStatus);
    }
  };

  const handleConfirmCancel = () => {
    onUpdateStatus(job.id, "CANCELLED", cancelReason || "Cancelled by workshop partner");
    setShowCancelPrompt(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all overflow-hidden flex flex-col justify-between">
      {/* CARD HEADER */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-800 bg-white px-2 py-1 rounded-lg border border-slate-200">
              {job.bookingReference || `JOB #${job.id}`}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Bay #{job.id}
            </span>
          </div>

          <Badge
            variant={currentConfig.variant}
            size="sm"
            dot={currentConfig.dot}
            pulse={currentConfig.pulse}
          >
            {currentConfig.label}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
            <Car className="w-4 h-4 text-slate-500" />
            <span>{job.vehicleSummary || "Registered Vehicle"}</span>
          </div>
          {job.estimatedCost != null && (
            <span className="font-bold text-slate-900 font-mono text-sm">
              ₹{Number(job.estimatedCost).toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* CARD BODY */}
      <div className="p-5 space-y-4 flex-1">
        {/* Status description */}
        <p className="text-xs text-slate-500 leading-relaxed">
          {job.statusDescription || currentConfig.description}
        </p>

        {/* Cancellation Reason if Cancelled */}
        {job.status === "CANCELLED" && job.cancellationReason && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
            <span className="font-bold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              Reason for Cancellation:
            </span>
            <p className="pl-4 italic">&ldquo;{job.cancellationReason}&rdquo;</p>
          </div>
        )}

        {/* Unlocked Customer Information */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <User className="w-3 h-3" />
              Customer Contact
            </span>
            {isUnlocked && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                Verified
              </span>
            )}
          </div>

          <div className="space-y-1 text-slate-700">
            <p className="font-bold text-slate-900">
              {profile?.name || "Customer"}
            </p>

            {profile?.phone && (
              <a
                href={`tel:${profile.phone}`}
                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold pt-0.5"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>{profile.phone}</span>
              </a>
            )}

            {(profile?.address || job.city) && (
              <p className="flex items-start gap-1.5 text-slate-500 text-[11px] pt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{profile?.address || job.city}</span>
              </p>
            )}
          </div>
        </div>

        {/* Schedule Timing */}
        <div className="flex items-center gap-4 text-xs text-slate-600">
          {job.scheduledDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{new Date(job.scheduledDate).toLocaleDateString()}</span>
            </div>
          )}
          {job.timeSlot && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{job.timeSlot}</span>
            </div>
          )}
        </div>

        {/* Services List */}
        {Array.isArray(job.requestedServices) && job.requestedServices.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Requested Services ({job.requestedServices.length})
            </span>
            <div className="space-y-1">
              {job.requestedServices.map((svc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-50 text-slate-700"
                >
                  <span className="font-medium truncate max-w-[200px]">
                    {svc.serviceName || svc.name}
                  </span>
                  {svc.finalPrice != null && (
                    <span className="font-mono text-slate-900 font-semibold text-[11px]">
                      ₹{Number(svc.finalPrice).toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer Notes */}
        {job.customerNotes && (
          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900">
            <span className="font-bold text-[10px] uppercase tracking-wider block text-amber-800">
              Customer Special Notes:
            </span>
            <p className="mt-0.5 italic text-slate-700">&ldquo;{job.customerNotes}&rdquo;</p>
          </div>
        )}

        {/* Inline Cancel Prompt */}
        {showCancelPrompt && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-2 text-xs">
            <span className="font-bold text-rose-900 block">
              Confirm Cancellation:
            </span>
            <input
              type="text"
              placeholder="Reason for cancellation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-rose-300 bg-white"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowCancelPrompt(false)}
                className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-800"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-3 py-1 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CARD FOOTER: ACTION BUTTONS */}
      <div className="p-5 border-t border-slate-100 bg-slate-50/30 space-y-2">
        {job.status === "ASSIGNED" && (
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              disabled={isUpdating}
              onClick={() => handleTransitionClick("CONFIRMED")}
              leftIcon={CheckCircle2}
            >
              Confirm Appointment
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isUpdating}
              onClick={() => handleTransitionClick("CANCELLED")}
              className="text-rose-600 hover:bg-rose-50 border-rose-200"
            >
              Decline
            </Button>
          </div>
        )}

        {job.status === "CONFIRMED" && (
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={isUpdating}
              onClick={() => handleTransitionClick("VEHICLE_RECEIVED")}
              leftIcon={Car}
            >
              Vehicle Received at Bay
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isUpdating}
              onClick={() => handleTransitionClick("CANCELLED")}
              className="text-rose-600 hover:bg-rose-50 border-rose-200"
            >
              Cancel
            </Button>
          </div>
        )}

        {job.status === "VEHICLE_RECEIVED" && (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isUpdating}
              onClick={() => handleTransitionClick("INSPECTION")}
              leftIcon={Search}
            >
              Begin Inspection
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isUpdating}
              onClick={() => handleTransitionClick("WORK_IN_PROGRESS")}
              leftIcon={Wrench}
            >
              Start Work
            </Button>
          </div>
        )}

        {job.status === "INSPECTION" && (
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            disabled={isUpdating}
            onClick={() => handleTransitionClick("WORK_IN_PROGRESS")}
            leftIcon={Wrench}
          >
            Inspection Done &rarr; Start Work
          </Button>
        )}

        {job.status === "WORK_IN_PROGRESS" && (
          <Button
            variant="primary"
            size="sm"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={isUpdating}
            onClick={() => handleTransitionClick("READY_FOR_DELIVERY")}
            leftIcon={CheckCircle2}
          >
            Mark Ready for Delivery
          </Button>
        )}

        {job.status === "READY_FOR_DELIVERY" && (
          <Button
            variant="primary"
            size="sm"
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
            disabled={isUpdating}
            onClick={() => handleTransitionClick("COMPLETED")}
            leftIcon={Sparkles}
          >
            Complete Service & Release Vehicle
          </Button>
        )}

        {job.status === "COMPLETED" && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Service Handover Completed</span>
          </div>
        )}

        {job.status === "CANCELLED" && (
          <div className="p-2.5 rounded-xl bg-slate-100 text-center text-xs font-bold text-slate-500">
            Job Terminated
          </div>
        )}
      </div>
    </div>
  );
}
