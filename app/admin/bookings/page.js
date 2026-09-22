"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { adminBookingsApi } from "../../../lib/adminBookings";
import { useToast } from "../../../context/ToastContext";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import PageHeader from "../../../components/ui/PageHeader";
import EmptyState from "../../../components/ui/EmptyState";
import ErrorState from "../../../components/ui/ErrorState";
import { Skeleton } from "../../../components/ui/Skeleton";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import {
  Calendar,
  Search,
  RefreshCw,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Ban,
  CheckCircle2,
  Clock,
  Car,
  User,
  Building2,
  AlertCircle,
  IndianRupee,
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

function BookingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useToast();

  const [summary, setSummary] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  });

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "ALL");
  const [startDate, setStartDate] = useState(searchParams.get("startDate") || "");
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Cancel Modal State
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const fetchBookings = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [summaryData, bookingsData] = await Promise.all([
        adminBookingsApi.getSummary(),
        adminBookingsApi.getBookings({
          page: pageInfo.page,
          size: pageInfo.size,
          search: search.trim() || undefined,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
      ]);

      setSummary(summaryData);
      setBookings(bookingsData.content || []);
      setPageInfo((prev) => ({
        ...prev,
        totalElements: bookingsData.totalElements || 0,
        totalPages: bookingsData.totalPages || 0,
      }));
      setError(null);
    } catch (err) {
      console.error("Failed to load admin bookings:", err);
      setError(err.message || "Failed to load bookings from administrative server.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [pageInfo.page, pageInfo.size, search, statusFilter, startDate, endDate]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const [summaryData, bookingsData] = await Promise.all([
          adminBookingsApi.getSummary(),
          adminBookingsApi.getBookings({
            page: pageInfo.page,
            size: pageInfo.size,
            search: search.trim() || undefined,
            status: statusFilter !== "ALL" ? statusFilter : undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
          }),
        ]);

        if (!ignore) {
          setSummary(summaryData);
          setBookings(bookingsData.content || []);
          setPageInfo((prev) => ({
            ...prev,
            totalElements: bookingsData.totalElements || 0,
            totalPages: bookingsData.totalPages || 0,
          }));
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load admin bookings:", err);
          setError(err.message || "Failed to load bookings from administrative server.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [pageInfo.page, pageInfo.size, search, statusFilter, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPageInfo((prev) => ({ ...prev, page: 0 }));
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setStartDate("");
    setEndDate("");
    setPageInfo((prev) => ({ ...prev, page: 0 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pageInfo.totalPages) {
      setPageInfo((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleSizeChange = (newSize) => {
    setPageInfo({ page: 0, size: newSize, totalElements: 0, totalPages: 0 });
  };

  const handleOpenCancelModal = (booking) => {
    setCancellingBooking(booking);
    setCancelReason("");
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    setIsSubmittingCancel(true);
    try {
      await adminBookingsApi.cancelBooking(cancellingBooking.id, cancelReason);
      showSuccess(`Booking #${cancellingBooking.bookingReference} has been cancelled.`);
      setCancellingBooking(null);
      fetchBookings(true);
    } catch (err) {
      showError(err.message || "Failed to cancel booking.");
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const isFiltered = search.trim() !== "" || statusFilter !== "ALL" || startDate !== "" || endDate !== "";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Bookings"
        description="Manage customer bookings, workshop assignments, and service fulfillment across the platform."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchBookings(true)}
            disabled={isLoading || isRefreshing}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </PageHeader>

      {/* KPI Summary Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Bookings</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
            {summary ? summary.totalBookings : "—"}
          </span>
          <span className="text-[10px] text-slate-400">All time</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-amber-600 block">Pending</span>
          <span className="text-2xl font-extrabold text-amber-700 mt-1 block">
            {summary ? summary.pendingBookings : "—"}
          </span>
          <span className="text-[10px] text-slate-400">Awaiting confirmation</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-blue-600 block">Confirmed</span>
          <span className="text-2xl font-extrabold text-blue-700 mt-1 block">
            {summary ? summary.confirmedBookings : "—"}
          </span>
          <span className="text-[10px] text-slate-400">Schedule locked</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-purple-600 block">In Progress</span>
          <span className="text-2xl font-extrabold text-purple-700 mt-1 block">
            {summary ? summary.inProgressBookings : "—"}
          </span>
          <span className="text-[10px] text-slate-400">In bay / inspection</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-emerald-600 block">Completed</span>
          <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">
            {summary ? summary.completedBookings : "—"}
          </span>
          <span className="text-[10px] text-slate-400">Service fulfilled</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-rose-600 block">Cancelled</span>
          <span className="text-2xl font-extrabold text-rose-700 mt-1 block">
            {summary ? summary.cancelledBookings : "—"}
          </span>
          <span className="text-[10px] text-slate-400">Voided orders</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-xs font-semibold text-slate-500 block">Active Revenue</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block truncate">
            {summary ? formatCurrency(summary.totalRevenue) : "—"}
          </span>
          <span className="text-[10px] text-slate-400">Non-cancelled volume</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference, customer, vehicle, workshop, service..."
              className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPageInfo((prev) => ({ ...prev, page: 0 }));
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Date Range: Start */}
          <div className="sm:col-span-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPageInfo((prev) => ({ ...prev, page: 0 }));
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              title="Filter from booking creation date"
            />
          </div>

          {/* Date Range: End */}
          <div className="sm:col-span-2">
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPageInfo((prev) => ({ ...prev, page: 0 }));
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              title="Filter to booking creation date"
            />
          </div>
        </form>

        {isFiltered && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>Filters active: Showing matched results</span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-blue-600 hover:text-blue-700 font-semibold text-xs transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-6 w-1/4" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="p-8">
            <ErrorState
              title="Error Loading Bookings"
              message={error}
              onRetry={() => fetchBookings()}
            />
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={Calendar}
              title={isFiltered ? "No matching bookings found" : "No bookings yet"}
              description={
                isFiltered
                  ? "No bookings matched your active search criteria. Try modifying or clearing your filters."
                  : "Customer bookings will appear here once customers start requesting services."
              }
            >
              {isFiltered && (
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  Clear Filters
                </Button>
              )}
            </EmptyState>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Booking</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Assigned Workshop</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Booking Reference & Schedule */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 font-mono">
                          {booking.bookingReference}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{formatDate(booking.bookingDate)}</span>
                          {booking.timeSlot && (
                            <span className="text-slate-400">• {booking.timeSlot}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">
                          {booking.customerName || "Customer #" + booking.customerId}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {booking.customerPhone || booking.customerEmail || "—"}
                        </span>
                      </div>
                    </td>

                    {/* Vehicle */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">
                          {booking.vehicleMake ? `${booking.vehicleMake} ${booking.vehicleModel}` : "—"}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500 uppercase">
                          {booking.vehicleRegistrationNumber || "—"}
                        </span>
                      </div>
                    </td>

                    {/* Service */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 truncate max-w-[180px]">
                          {booking.primaryServiceName || "Service"}
                        </span>
                        {booking.totalServicesCount > 1 && (
                          <span className="text-[10px] text-blue-600 font-semibold">
                            +{booking.totalServicesCount - 1} more service{booking.totalServicesCount > 2 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Workshop */}
                    <td className="py-3 px-4">
                      {booking.workshopName ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900 truncate max-w-[180px]">
                            {booking.workshopName}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {booking.workshopCity || "Partner"}
                          </span>
                        </div>
                      ) : (
                        <Badge variant="neutral" size="sm">
                          Matching...
                        </Badge>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 font-mono">
                        {formatCurrency(booking.totalAmount)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {getBookingStatusBadge(booking.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/bookings/${booking.id}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View 360° Booking Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                          <button
                            type="button"
                            onClick={() => handleOpenCancelModal(booking)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Cancel Booking"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!isLoading && !error && bookings.length > 0 && (
          <div className="p-4 bg-slate-50/60 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={pageInfo.size}
                onChange={(e) => handleSizeChange(Number(e.target.value))}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-slate-400">•</span>
              <span>
                Showing {pageInfo.page * pageInfo.size + 1} to{" "}
                {Math.min((pageInfo.page + 1) * pageInfo.size, pageInfo.totalElements)} of{" "}
                {pageInfo.totalElements} bookings
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handlePageChange(0)}
                disabled={pageInfo.page === 0}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="First Page"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(pageInfo.page - 1)}
                disabled={pageInfo.page === 0}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-3 py-1 text-xs font-semibold text-slate-700">
                Page {pageInfo.page + 1} of {Math.max(1, pageInfo.totalPages)}
              </span>
              <button
                type="button"
                onClick={() => handlePageChange(pageInfo.page + 1)}
                disabled={pageInfo.page >= pageInfo.totalPages - 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(pageInfo.totalPages - 1)}
                disabled={pageInfo.page >= pageInfo.totalPages - 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Last Page"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Cancel Booking</h3>
                <span className="text-xs text-slate-500 font-mono">
                  Ref: {cancellingBooking.bookingReference}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel this booking? This will update the booking state, release or cancel any associated workshop opportunities, write an immutable audit log, and notify the customer.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Cancellation Reason (Optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for administrative cancellation..."
                rows={3}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancellingBooking(null)}
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

export default function AdminBookingsPage() {
  return (
    <Suspense fallback={<div className="p-8"><Skeleton className="h-10 w-full" /></div>}>
      <BookingsContent />
    </Suspense>
  );
}
