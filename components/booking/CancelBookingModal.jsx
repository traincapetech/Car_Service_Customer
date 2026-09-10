"use client";

import React, { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { AlertTriangle } from "lucide-react";
import { bookingsApi } from "../../lib/bookings";
import { useToast } from "../../context/ToastContext";

export default function CancelBookingModal({
  isOpen,
  onClose,
  booking,
  onCancelled,
}) {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!booking) return null;

  const handleConfirmCancel = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const updated = await bookingsApi.cancelBooking(booking.id);
      toast.success(
        `Booking ${booking.bookingReference || "#" + booking.id} has been cancelled.`
      );
      if (onCancelled) {
        onCancelled(updated);
      }
      onClose();
    } catch (err) {
      setError(err.message || "Failed to cancel booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      title="Cancel Service Booking"
      description="Please review cancellation details below."
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200/80 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-rose-100 text-rose-600 shrink-0">
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="space-y-1 text-xs text-rose-800">
            <p className="font-bold text-rose-950">
              Are you sure you want to cancel this appointment?
            </p>
            <p className="leading-relaxed">
              Booking{" "}
              <span className="font-mono font-bold">
                {booking.bookingReference || "#" + booking.id}
              </span>{" "}
              will be marked as cancelled. The scheduled workshop bay will be released.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-xs text-rose-900">
            {error}
          </div>
        )}

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-600">
          <div className="flex justify-between">
            <span className="text-slate-400">Vehicle:</span>
            <span className="font-semibold text-slate-800">
              {booking.vehicle ? `${booking.vehicle.make} ${booking.vehicle.model}` : "Vehicle"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Scheduled:</span>
            <span className="font-semibold text-slate-800">
              {booking.bookingDate} ({booking.timeSlot || booking.bookingTime})
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Keep Booking
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleConfirmCancel}
            isLoading={isSubmitting}
          >
            Cancel Booking
          </Button>
        </div>
      </div>
    </Modal>
  );
}
