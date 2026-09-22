"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { adminBookingsApi } from "../../../../lib/adminBookings";
import { useToast } from "../../../../context/ToastContext";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import PageHeader from "../../../../components/ui/PageHeader";
import EmptyState from "../../../../components/ui/EmptyState";
import ErrorState from "../../../../components/ui/ErrorState";
import { Skeleton } from "../../../../components/ui/Skeleton";
import {
  Calendar,
  Clock,
  Car,
  User,
  Building2,
  MapPin,
  IndianRupee,
  Wrench,
  Ban,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ArrowLeft,
  RefreshCw,
  Navigation,
  FileText,
  Phone,
  Mail,
  ShieldCheck,
  Briefcase,
  Layers,
} from "lucide-react";

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return "—";
  const num = Number(amount);
  if (isNaN(num)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function getBookingStatusBadge(status) {
  switch (status) {
    case "CONFIRMED":
      return <Badge variant="blue" size="sm" dot>Confirmed</Badge>;
    case "IN_PROGRESS":
      return <Badge variant="purple" size="sm" dot>In Progress</Badge>;
    case "COMPLETED":
      return <Badge variant="success" size="sm" dot>Completed</Badge>;
    case "PENDING":
      return <Badge variant="warning" size="sm" dot>Pending</Badge>;
    case "CANCELLED":
      return <Badge variant="danger" size="sm" dot>Cancelled</Badge>;
    default:
      return <Badge variant="neutral" size="sm">{status || "Unknown"}</Badge>;
  }
}

function getOpportunityStatusBadge(status) {
  switch (status) {
    case "ACCEPTED":
    case "CUSTOMER_DETAILS_UNLOCKED":
    case "ASSIGNED":
    case "COMPLETED":
      return <Badge variant="success" size="sm">Won / Claimed</Badge>;
    case "AVAILABLE":
      return <Badge variant="blue" size="sm">Broadcasted</Badge>;
    case "TRANSFERRED":
      return <Badge variant="purple" size="sm">Transferred</Badge>;
    case "LOST":
    case "EXPIRED":
      return <Badge variant="neutral" size="sm">Unclaimed</Badge>;
    default:
      return <Badge variant="neutral" size="sm">{status}</Badge>;
  }
}

export default function AdminBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Cancel Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const fetchBooking = useCallback(async () => {
    if (!params.id) return;
    setIsRefreshing(true);
    try {
      const data = await adminBookingsApi.getBookingDetail(params.id);
      setBooking(data);
      setError(null);
    } catch (err) {
      console.error("Failed to load booking dossier:", err);
      setError(err.message || "Failed to load booking details.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [params.id]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const data = await adminBookingsApi.getBookingDetail(params.id);
        if (!ignore) {
          setBooking(data);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load booking dossier:", err);
          setError(err.message || "Failed to load booking details.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    if (params.id) {
      load();
    }
    return () => {
      ignore = true;
    };
  }, [params.id]);

  const handleConfirmCancel = async () => {
    if (!booking) return;
    setIsSubmittingCancel(true);
    try {
      await adminBookingsApi.cancelBooking(booking.id, cancelReason);
      showSuccess(`Booking #${booking.bookingReference} has been cancelled.`);
      setCancelModalOpen(false);
      fetchBooking(true);
    } catch (err) {
      showError(err.message || "Failed to cancel booking.");
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200">
        <ErrorState
          title="Failed to Load Booking"
          message={error || "Booking not found."}
          onRetry={() => fetchBooking()}
        />
      </div>
    );
  }

  const isCancellable = booking.status === "PENDING" || booking.status === "CONFIRMED";

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="space-y-3">
        <Link
          href="/admin/bookings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Bookings</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
                  {booking.bookingReference}
                </h1>
                {getBookingStatusBadge(booking.status)}
              </div>
              <span className="text-xs text-slate-500">
                Created on {formatDateTime(booking.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchBooking(true)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>

            {isCancellable && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setCancelModalOpen(true)}
                className="flex items-center gap-1.5"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Cancel Booking</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Top Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Amount</span>
          <span className="text-xl font-extrabold text-slate-900 font-mono mt-1 block">
            {formatCurrency(booking.totalAmount)}
          </span>
          <span className="text-[10px] text-slate-400">Order total snapshot</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Scheduled Date</span>
          <span className="text-base font-bold text-slate-900 mt-1 block">
            {formatDate(booking.bookingDate)}
          </span>
          <span className="text-[10px] text-slate-400">
            {booking.timeSlot || booking.bookingTime || "No specific slot"}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Service Stage</span>
          <span className="text-base font-bold text-slate-900 mt-1 block">
            {booking.currentJobStatus || booking.status}
          </span>
          <span className="text-[10px] text-slate-400">
            {booking.currentJobReference ? `Job: ${booking.currentJobReference}` : "Pre-intake"}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Service Request Ref</span>
          <span className="text-sm font-bold text-slate-900 font-mono mt-1 block truncate">
            {booking.serviceRequestReference || "N/A"}
          </span>
          <span className="text-[10px] text-slate-400">Marketplace tracking</span>
        </div>
      </div>

      {/* 2-Column Dossier Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Customer, Vehicle, Location */}
        <div className="lg:col-span-4 space-y-6">
          {/* Customer Information Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Customer
                </h2>
              </div>
              {booking.customerId && (
                <Link
                  href={`/admin/customers/${booking.customerId}`}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>Dossier</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Name</span>
                <span className="font-semibold text-slate-900">{booking.customerName || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email</span>
                <span className="font-mono text-slate-900">{booking.customerEmail || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone</span>
                <span className="font-mono text-slate-900">{booking.customerPhone || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Registered</span>
                <span>{formatDate(booking.customerCreatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Vehicle Information Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Car className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Vehicle
              </h2>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Vehicle</span>
                <span className="font-semibold text-slate-900">
                  {booking.vehicleMake ? `${booking.vehicleMake} ${booking.vehicleModel}` : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Registration</span>
                <span className="font-mono font-bold text-slate-900 uppercase">
                  {booking.vehicleRegistrationNumber || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Year</span>
                <span>{booking.vehicleYear || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fuel Type</span>
                <span>{booking.vehicleFuelType || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Transmission</span>
                <span>{booking.vehicleTransmission || "—"}</span>
              </div>
            </div>
          </div>

          {/* Schedule & Service Location Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Location & Schedule
              </h2>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">City</span>
                <span className="font-semibold text-slate-900">{booking.city || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Address</span>
                <span className="text-right text-slate-900 max-w-[200px]">{booking.address || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pincode</span>
                <span className="font-mono text-slate-900">{booking.pincode || "—"}</span>
              </div>
              {booking.customerNotes && (
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 block">Customer Notes:</span>
                  <p className="text-xs text-slate-700 italic bg-slate-50 p-2 rounded-lg">
                    &ldquo;{booking.customerNotes}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Requested Services & Workshop Routing Pipeline */}
        <div className="lg:col-span-8 space-y-6">
          {/* Itemized Services Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Requested Services Line Items
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-semibold">
                {booking.services ? booking.services.length : 0} item{booking.services?.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-4">Service Item</th>
                    <th className="py-2.5 px-4 text-right">Base Price</th>
                    <th className="py-2.5 px-4 text-right">Discount</th>
                    <th className="py-2.5 px-4 text-right">Final Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {booking.services && booking.services.length > 0 ? (
                    booking.services.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4 font-semibold text-slate-900">
                          {item.serviceName}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-600">
                          {formatCurrency(item.basePrice)}
                        </td>
                        <td className="py-2.5 px-4 text-right text-slate-500">
                          {item.discountType && item.discountType !== "NO_DISCOUNT" ? (
                            <span className="text-emerald-600 font-medium">
                              -{formatCurrency(item.discountValue)}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(item.finalPrice)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-400">
                        No service line items recorded.
                      </td>
                    </tr>
                  )}
                  <tr className="bg-slate-50/80 font-bold text-slate-900 border-t border-slate-200">
                    <td colSpan={3} className="py-3 px-4 text-right">
                      Grand Total Amount:
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-sm text-blue-600">
                      {formatCurrency(booking.totalAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Workshop Routing & Matching Visibility (Requirement 9) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden space-y-4 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-600" />
                <div>
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Workshop Routing Engine Visibility
                  </h2>
                  <span className="text-[11px] text-slate-400">
                    Nearby geosearch & opportunity dispatch decisions
                  </span>
                </div>
              </div>
              {booking.assignedWorkshopName && (
                <Badge variant="success" size="sm" dot>
                  Workshop Assigned
                </Badge>
              )}
            </div>

            {/* Assigned Workshop Highlight */}
            {booking.assignedWorkshopName ? (
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">
                      {booking.assignedWorkshopName}
                    </span>
                    <span className="text-xs text-slate-500">
                      {booking.assignedWorkshopCity} {booking.assignedWorkshopAddress && `• ${booking.assignedWorkshopAddress}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {booking.assignedWorkshopId && (
                    <Link
                      href={`/admin/workshops/${booking.assignedWorkshopId}`}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1"
                    >
                      <span>Workshop Profile</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </Link>
                  )}
                  {booking.currentJobId && (
                    <Link
                      href={`/admin/workshop-jobs/${booking.currentJobId}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-blue-600 transition-colors flex items-center gap-1"
                    >
                      <span>View Operational Job</span>
                      <ExternalLink className="w-3 h-3 text-blue-400" />
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 text-xs text-amber-800 flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  This booking has not been claimed by a workshop yet. The marketplace routing engine is evaluating eligible nearby partners.
                </span>
              </div>
            )}

            {/* Matched Nearby Workshop Opportunities Table */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-700 block">
                Broadcasted Opportunities ({booking.routingOpportunities?.length || 0})
              </span>

              {booking.routingOpportunities && booking.routingOpportunities.length > 0 ? (
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                        <th className="py-2 px-3">Workshop</th>
                        <th className="py-2 px-3">City</th>
                        <th className="py-2 px-3">Distance</th>
                        <th className="py-2 px-3">Lead Fee</th>
                        <th className="py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {booking.routingOpportunities.map((opp) => (
                        <tr key={opp.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-semibold text-slate-900">
                            {opp.workshopName || "Workshop #" + opp.workshopId}
                          </td>
                          <td className="py-2 px-3 text-slate-500">{opp.workshopCity || "—"}</td>
                          <td className="py-2 px-3 font-mono">
                            {opp.distanceKm ? `${opp.distanceKm} km` : "Within radius"}
                          </td>
                          <td className="py-2 px-3 font-mono font-semibold">
                            {formatCurrency(opp.feeSnapshot || opp.leadFee)}
                          </td>
                          <td className="py-2 px-3">
                            {getOpportunityStatusBadge(opp.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-400">
                  No workshop opportunity broadcasts recorded for this booking yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Cancel Booking</h3>
                <span className="text-xs text-slate-500 font-mono">
                  Ref: {booking.bookingReference}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel this booking? This action updates the booking status to CANCELLED, releases any workshop opportunity broadcasts, records an immutable audit trail, and notifies the customer.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Cancellation Reason (Optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation..."
                rows={3}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancelModalOpen(false)}
                disabled={isSubmittingCancel}
              >
                Go Back
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmCancel}
                isLoading={isSubmittingCancel}
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
