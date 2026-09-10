"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardContent, CardFooter } from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import {
  Car,
  Wrench,
  Calendar,
  Clock,
  ArrowRight,
  Eye,
  XCircle,
  ShieldCheck,
} from "lucide-react";
import { getBookingStatusMeta, formatBookingDate, formatSlotDisplay } from "../../lib/bookings";
import { formatPrice, getCategoryMeta } from "../../lib/services";

export default function BookingCard({
  booking,
  onCancelClick,
}) {
  if (!booking) return null;

  const statusMeta = getBookingStatusMeta(booking.status);
  const priceVal = booking.price != null ? booking.price : (booking.servicePriceSnapshot != null ? booking.servicePriceSnapshot : booking.estimatedPrice);
  const formattedPrice = formatPrice(priceVal);
  const serviceName = booking.serviceNameSnapshot || booking.service?.name || "Service Package";
  const categoryMeta = getCategoryMeta(booking.service?.category);
  const isCancellable = booking.status === "PENDING" || booking.status === "CONFIRMED";

  return (
    <Card
      hover
      className="flex flex-col justify-between overflow-hidden border border-slate-200/90 bg-white shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200"
      role="article"
      aria-labelledby={`booking-title-${booking.id}`}
    >
      <div>
        {/* Card Header: Reference & Status */}
        <CardHeader className="pb-3.5 border-b border-slate-100/90">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/70">
                {booking.bookingReference || `ID #${booking.id}`}
              </span>
              <span className="text-[11px] text-slate-400">
                {formatBookingDate(booking.createdAt)}
              </span>
            </div>

            <Badge variant={statusMeta.badgeVariant} size="sm" dot>
              {statusMeta.label}
            </Badge>
          </div>
        </CardHeader>

        {/* Card Content */}
        <CardContent className="py-4 space-y-3.5">
          {/* Service & Vehicle Info */}
          <div className="space-y-2">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0 mt-0.5">
                <Wrench className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4
                    id={`booking-title-${booking.id}`}
                    className="text-sm sm:text-base font-bold text-slate-900 truncate"
                  >
                    {serviceName}
                  </h4>
                  {booking.service?.category && (
                    <Badge variant={categoryMeta.badgeVariant || "neutral"} size="sm">
                      {categoryMeta.shortLabel}
                    </Badge>
                  )}
                </div>
                {booking.customerNotes && (
                  <p className="text-xs text-slate-500 line-clamp-1 italic mt-0.5">
                    &ldquo;{booking.customerNotes}&rdquo;
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5 pl-0.5">
              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 shrink-0">
                <Car className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {booking.vehicle
                    ? `${booking.vehicle.make} ${booking.vehicle.model}`
                    : "Registered Vehicle"}
                </p>
                {booking.vehicle?.registrationNumber && (
                  <span className="font-mono text-[11px] text-slate-500 font-medium">
                    {booking.vehicle.registrationNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Schedule Pill Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Date
                </span>
                <span className="text-xs font-semibold text-slate-800">
                  {formatBookingDate(booking.bookingDate)}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Time Slot
                </span>
                <span className="text-xs font-semibold text-slate-800 truncate block">
                  {formatSlotDisplay(booking.timeSlot || booking.bookingTime)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </div>

      {/* Card Footer: Price & CTAs */}
      <CardFooter className="pt-3 pb-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
            Locked Estimate
          </span>
          <p className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            {formattedPrice}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isCancellable && onCancelClick && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onCancelClick(booking)}
              className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
            >
              <XCircle className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
              Cancel
            </Button>
          )}

          <Link href={`/bookings/${booking.id}`}>
            <Button
              variant="primary"
              size="sm"
              className="text-xs font-semibold"
            >
              <Eye className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
              Details
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
