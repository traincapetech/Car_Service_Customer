"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import CustomerShell from "../../../components/layout/CustomerShell";
import PageHeader from "../../../components/ui/PageHeader";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import ErrorState from "../../../components/ui/ErrorState";
import { BookingDetailsSkeleton } from "../../../components/booking/BookingSkeleton";
import CancelBookingModal from "../../../components/booking/CancelBookingModal";
import { bookingsApi, getBookingStatusMeta, formatBookingDate, formatSlotDisplay } from "../../../lib/bookings";
import { formatPrice, formatDuration, getCategoryMeta } from "../../../lib/services";
import {
  Car,
  Wrench,
  Calendar,
  Clock,
  ArrowLeft,
  XCircle,
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Info,
} from "lucide-react";

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.id;

  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadBooking() {
      if (!bookingId) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await bookingsApi.getBooking(bookingId);
        if (!ignore) {
          setBooking(data);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Unable to locate booking record.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadBooking();

    return () => {
      ignore = true;
    };
  }, [bookingId]);

  const handleBookingCancelled = (updatedBooking) => {
    setBooking(updatedBooking);
  };

  if (isLoading) {
    return (
      <CustomerShell>
        <BookingDetailsSkeleton />
      </CustomerShell>
    );
  }

  if (error || !booking) {
    return (
      <CustomerShell>
        <ErrorState
          title="Booking Not Found"
          description={error || "The requested service appointment could not be retrieved."}
          onRetry={() => router.push("/bookings")}
          retryLabel="Back to My Bookings"
        />
      </CustomerShell>
    );
  }

  const statusMeta = getBookingStatusMeta(booking.status);
  const categoryMeta = getCategoryMeta(booking.service?.category);
  const priceVal =
    booking.price != null
      ? booking.price
      : booking.servicePriceSnapshot != null
      ? booking.servicePriceSnapshot
      : booking.estimatedPrice;
  const isCancellable = booking.status === "PENDING" || booking.status === "CONFIRMED";

  return (
    <CustomerShell>
      {/* PAGE HEADER */}
      <PageHeader
        title={`Booking ${booking.bookingReference || "#" + booking.id}`}
        description="Comprehensive service bay telemetry, appointment schedule, and locked package estimates."
        badge={
          <Badge variant={statusMeta.badgeVariant} size="md" dot>
            {statusMeta.label}
          </Badge>
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "My Bookings", href: "/bookings" },
          { label: booking.bookingReference || `ID #${booking.id}` },
        ]}
        actions={
          <Link href="/bookings">
            <Button variant="outline" size="sm" leftIcon={ArrowLeft}>
              Back to Bookings
            </Button>
          </Link>
        }
      />

      {/* CANCELLATION NOTICE IF CANCELLED */}
      {booking.status === "CANCELLED" && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-900">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-sm block">Appointment Cancelled</span>
            <p className="mt-0.5 text-rose-700">
              This booking was cancelled{" "}
              {booking.cancelledAt ? `on ${formatBookingDate(booking.cancelledAt)}` : ""}. Workshop bay reservation has been revoked.
            </p>
          </div>
        </div>
      )}

      {/* MAIN DETAILS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Core Specs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Package Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Service Package
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    {booking.serviceNameSnapshot || booking.service?.name}
                  </h3>
                </div>
              </div>
              <Badge variant={categoryMeta.badgeVariant || "neutral"} size="sm">
                {categoryMeta.shortLabel}
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {booking.service?.description ||
                "Certified multi-point vehicle service inspection, oil & filter renewal, and OEM diagnostics."}
            </p>

            {booking.customerNotes && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Your Special Instructions:
                </span>
                <p className="text-slate-600 italic pl-5">&ldquo;{booking.customerNotes}&rdquo;</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Genuine OEM Spares</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>6-Month / 10k km Warranty</span>
              </div>
            </div>
          </div>

          {/* Vehicle Information Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Registered Vehicle
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {booking.vehicle ? `${booking.vehicle.make} ${booking.vehicle.model}` : "Vehicle"}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Registration</span>
                <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
                  {booking.vehicle?.registrationNumber || "N/A"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Model Year</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {booking.vehicle?.year || "N/A"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Vehicle ID</span>
                <span className="font-mono text-slate-700 text-sm mt-0.5 block">
                  #{booking.vehicle?.id}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Schedule, Price Snapshot & Actions */}
        <div className="space-y-6">
          {/* Schedule Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Workshop Schedule
            </h4>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Scheduled Date
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatBookingDate(booking.bookingDate)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Service Arrival Window
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatSlotDisplay(booking.timeSlot || booking.bookingTime)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-2 text-[11px] text-blue-900">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Please ensure your vehicle is available 30 minutes before arrival window if doorstep valet pickup was requested.
              </span>
            </div>
          </div>

          {/* Locked Price Snapshot Card */}
          <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Price Snapshot
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                Locked at Booking
              </span>
            </div>

            <p className="text-3xl font-black tracking-tight text-white">
              {formatPrice(priceVal)}
            </p>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Price snapshot is permanently preserved in our ledger and is immune to future catalog price fluctuations.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            {isCancellable && (
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsCancelModalOpen(true)}
                className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                Cancel Appointment
              </Button>
            )}

            <Link href="/services" className="block">
              <Button variant="outline" size="md" className="w-full">
                Browse Service Packages
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* CANCEL MODAL */}
      <CancelBookingModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        booking={booking}
        onCancelled={handleBookingCancelled}
      />
    </CustomerShell>
  );
}
