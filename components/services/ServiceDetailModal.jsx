"use client";

import React from "react";
import Modal from "../ui/Modal";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Wrench,
  Sparkles,
  Info,
  Calendar,
  Layers,
  FileText,
} from "lucide-react";
import { formatDuration, formatPrice, getCategoryMeta } from "../../lib/services";

export default function ServiceDetailModal({
  isOpen,
  onClose,
  service,
  onBookService,
}) {
  if (!service) return null;

  const categoryMeta = getCategoryMeta(service.category);
  const formattedPrice = formatPrice(service.basePrice);
  const formattedDuration = formatDuration(service.estimatedDurationMinutes);

  const handleBook = () => {
    if (onBookService) {
      onBookService(service);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={service.name}
      description={`Category: ${categoryMeta.label}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Top Highlight Summary Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant={categoryMeta.badgeVariant || "neutral"}
                size="md"
                dot
              >
                {categoryMeta.label}
              </Badge>
              <span className="text-xs text-slate-400 font-medium">
                Service ID: #{service.id}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium pt-0.5">
              {categoryMeta.tagline}
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Estimated Base Price
            </span>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {formattedPrice}
            </span>
            <span className="text-[11px] text-slate-500 block">
              Standard labor included
            </span>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Duration</span>
            </div>
            <p className="text-sm font-bold text-slate-900">{formattedDuration}</p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Warranty</span>
            </div>
            <p className="text-sm font-bold text-slate-900">6 Months / 10k km</p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>Quality Grade</span>
            </div>
            <p className="text-sm font-bold text-slate-900">100% OEM / OES</p>
          </div>
        </div>

        {/* Full Service Description */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Service Scope & Description</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {service.description || (
              <span className="text-slate-400 italic">
                Standard certified multi-point service procedure carried out by trained technicians.
              </span>
            )}
          </div>
        </div>

        {/* Standard Guaranteed Inclusions */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Standard Inclusions with Every Service</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50/60 border border-slate-200/70 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-slate-900">Digital Health Inspection</h5>
                <p className="text-[11px] text-slate-500">Comprehensive multi-point vehicle diagnostic check</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/60 border border-slate-200/70 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-slate-900">Certified Technicians</h5>
                <p className="text-[11px] text-slate-500">Serviced strictly according to OEM service intervals</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/60 border border-slate-200/70 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-slate-900">Genuine Replacement Parts</h5>
                <p className="text-[11px] text-slate-500">Only authorized brand spares and certified fluids used</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/60 border border-slate-200/70 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-slate-900">Doorstep Valet Assistance</h5>
                <p className="text-[11px] text-slate-500">Convenient vehicle pickup and delivery tracking</p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 17 Readiness Notice */}
        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-blue-800 leading-relaxed">
            Ready to schedule this service? In the next step, you will select your vehicle from your garage, choose an appointment date & time, and confirm your booking.
          </p>
        </div>

        {/* Modal Action Footer */}
        <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Close
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleBook}
            rightIcon={ArrowRight}
            className="w-full sm:w-auto shadow-sm"
          >
            Book This Service
          </Button>
        </div>
      </div>
    </Modal>
  );
}
