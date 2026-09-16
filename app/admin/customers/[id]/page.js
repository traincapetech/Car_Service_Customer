"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { adminApi } from "../../../../lib/admin";
import { useToast } from "../../../../context/ToastContext";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import PageHeader from "../../../../components/ui/PageHeader";
import ConfirmDialog from "../../../../components/ui/ConfirmDialog";
import EmptyState from "../../../../components/ui/EmptyState";
import ErrorState from "../../../../components/ui/ErrorState";
import { Skeleton } from "../../../../components/ui/Skeleton";
import {
  ArrowLeft,
  Users,
  Car,
  Calendar,
  ClipboardList,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Fuel,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Building2,
  Info,
  MapPin,
  ExternalLink,
} from "lucide-react";

// Date & Time formatting
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

// Currency formatting (INR)
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

// Booking status styling
function getBookingStatusBadge(status) {
  switch (status) {
    case "COMPLETED":
      return <Badge variant="success" size="sm" dot>Completed</Badge>;
    case "CONFIRMED":
      return <Badge variant="blue" size="sm" dot>Confirmed</Badge>;
    case "IN_PROGRESS":
      return <Badge variant="purple" size="sm" dot>In Progress</Badge>;
    case "PENDING":
      return <Badge variant="warning" size="sm" dot>Pending</Badge>;
    case "CANCELLED":
      return <Badge variant="danger" size="sm" dot>Cancelled</Badge>;
    default:
      return <Badge variant="neutral" size="sm">{status || "Unknown"}</Badge>;
  }
}

// Service request status styling
function getRequestStatusBadge(status) {
  switch (status) {
    case "COMPLETED":
      return <Badge variant="success" size="sm" dot>Completed</Badge>;
    case "MATCHED":
      return <Badge variant="blue" size="sm" dot>Matched</Badge>;
    case "IN_PROGRESS":
      return <Badge variant="purple" size="sm" dot>In Progress</Badge>;
    case "SUBMITTED":
      return <Badge variant="neutral" size="sm" dot>Submitted</Badge>;
    case "CANCELLED":
      return <Badge variant="danger" size="sm" dot>Cancelled</Badge>;
    case "EXPIRED":
      return <Badge variant="neutral" size="sm">Expired</Badge>;
    default:
      return <Badge variant="neutral" size="sm">{status || "Unknown"}</Badge>;
  }
}

export default function CustomerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params?.id;
  const toast = useToast();

  // Customer 360° detail state
  const [customer, setCustomer] = useState(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(true);
  const [customerError, setCustomerError] = useState(null);

  // Status mutation state
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Vehicles state
  const [vehicles, setVehicles] = useState([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [bookingsPage, setBookingsPage] = useState(0);
  const [bookingsTotalPages, setBookingsTotalPages] = useState(0);
  const [bookingsTotalCount, setBookingsTotalCount] = useState(0);
  const [bookingStatusFilter, setBookingStatusFilter] = useState("ALL");
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  // Service requests state
  const [serviceRequests, setServiceRequests] = useState([]);
  const [requestsPage, setRequestsPage] = useState(0);
  const [requestsTotalPages, setRequestsTotalPages] = useState(0);
  const [requestsTotalCount, setRequestsTotalCount] = useState(0);
  const [requestStatusFilter, setRequestStatusFilter] = useState("ALL");
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);

  // Active section tab
  const [activeTab, setActiveTab] = useState("overview");

  // Load customer 360 profile
  useEffect(() => {
    let ignore = false;

    async function initCustomer() {
      try {
        const data = await adminApi.getCustomer(customerId);
        if (!ignore) {
          setCustomer(data);
          if (data?.vehicles) {
            setVehicles(data.vehicles);
            setIsLoadingVehicles(false);
          }
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load customer profile:", err);
          setCustomerError(err.message || "Unable to load customer profile.");
        }
      } finally {
        if (!ignore) {
          setIsLoadingCustomer(false);
        }
      }
    }

    if (customerId) {
      initCustomer();
    }

    return () => {
      ignore = true;
    };
  }, [customerId]);

  // Load customer bookings
  useEffect(() => {
    let ignore = false;

    async function fetchBookings() {
      try {
        const data = await adminApi.getCustomerBookings(customerId, {
          page: bookingsPage,
          size: 5,
          status: bookingStatusFilter === "ALL" ? undefined : bookingStatusFilter,
          sort: "createdAt",
          direction: "DESC",
        });
        if (!ignore) {
          setBookings(data?.content || []);
          setBookingsTotalPages(data?.totalPages || 0);
          setBookingsTotalCount(data?.totalElements || 0);
        }
      } catch (err) {
        if (!ignore) {
          console.warn("Bookings fetch warning:", err.message);
        }
      } finally {
        if (!ignore) {
          setIsLoadingBookings(false);
        }
      }
    }

    if (customerId) {
      fetchBookings();
    }

    return () => {
      ignore = true;
    };
  }, [customerId, bookingsPage, bookingStatusFilter]);

  // Load customer service requests
  useEffect(() => {
    let ignore = false;

    async function fetchRequests() {
      try {
        const data = await adminApi.getCustomerServiceRequests(customerId, {
          page: requestsPage,
          size: 5,
          status: requestStatusFilter === "ALL" ? undefined : requestStatusFilter,
          direction: "DESC",
        });
        if (!ignore) {
          setServiceRequests(data?.content || []);
          setRequestsTotalPages(data?.totalPages || 0);
          setRequestsTotalCount(data?.totalElements || 0);
        }
      } catch (err) {
        if (!ignore) {
          console.warn("Service requests fetch warning:", err.message);
        }
      } finally {
        if (!ignore) {
          setIsLoadingRequests(false);
        }
      }
    }

    if (customerId) {
      fetchRequests();
    }

    return () => {
      ignore = true;
    };
  }, [customerId, requestsPage, requestStatusFilter]);

  // Manual refresh handler
  const handleManualRefresh = async () => {
    setIsLoadingCustomer(true);
    setIsLoadingBookings(true);
    setIsLoadingRequests(true);
    try {
      const [detailData, bookingsData, requestsData] = await Promise.all([
        adminApi.getCustomer(customerId),
        adminApi.getCustomerBookings(customerId, {
          page: bookingsPage,
          size: 5,
          status: bookingStatusFilter === "ALL" ? undefined : bookingStatusFilter,
          sort: "createdAt",
          direction: "DESC",
        }),
        adminApi.getCustomerServiceRequests(customerId, {
          page: requestsPage,
          size: 5,
          status: requestStatusFilter === "ALL" ? undefined : requestStatusFilter,
          direction: "DESC",
        }),
      ]);
      setCustomer(detailData);
      if (detailData?.vehicles) {
        setVehicles(detailData.vehicles);
        setIsLoadingVehicles(false);
      }
      setBookings(bookingsData?.content || []);
      setBookingsTotalPages(bookingsData?.totalPages || 0);
      setBookingsTotalCount(bookingsData?.totalElements || 0);
      setServiceRequests(requestsData?.content || []);
      setRequestsTotalPages(requestsData?.totalPages || 0);
      setRequestsTotalCount(requestsData?.totalElements || 0);
      toast.info("Customer dossier updated with latest records.");
    } catch (err) {
      toast.error(err.message || "Failed to refresh customer dossier");
    } finally {
      setIsLoadingCustomer(false);
      setIsLoadingBookings(false);
      setIsLoadingRequests(false);
    }
  };

  // Handle account status toggle (Activate / Deactivate)
  const handleConfirmStatusChange = async () => {
    if (!customer) return;
    const targetStatus = !customer.isActive;
    setIsUpdatingStatus(true);

    try {
      const updated = await adminApi.updateCustomerStatus(customer.id, targetStatus);
      setCustomer((prev) => ({
        ...prev,
        isActive: updated.isActive,
        updatedAt: updated.updatedAt,
      }));

      toast.success(
        targetStatus
          ? `Account for ${customer.name} reactivated successfully.`
          : `Account for ${customer.name} deactivated successfully.`
      );
      setStatusConfirmOpen(false);
    } catch (err) {
      console.error("Status update error:", err);
      toast.error(err.message || "Failed to update customer account status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (customerError) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customer Registry</span>
        </Link>
        <ErrorState
          title="Unable to load customer profile"
          description={customerError}
          onRetry={handleManualRefresh}
          isRetrying={isLoadingCustomer}
        />
      </div>
    );
  }

  if (isLoadingCustomer && !customer) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-48" />
        <div className="p-8 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-2xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
        <div className="h-80 bg-white rounded-2xl border border-slate-200/90 animate-pulse" />
      </div>
    );
  }

  const isCustomerActive = Boolean(customer?.isActive);

  return (
    <div className="space-y-6">
      {/* ================= TOP DOSSIER BREADCRUMB & BACK ================= */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors group"
        >
          <div className="p-1 rounded-lg bg-slate-100 group-hover:bg-slate-200 text-slate-600 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
          </div>
          <span>Back to Registry</span>
        </Link>

        <span className="text-xs text-slate-400 font-mono">
          Customer ID: <strong className="text-slate-700">#{customer?.id}</strong>
        </span>
      </div>

      {/* ================= CUSTOMER 360° HERO DOSSIER CARD ================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Avatar, Name, Email, Phone, Joined */}
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-xs border border-slate-800">
              {customer?.name
                ? customer.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : "CU"}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {customer?.name}
                </h1>
                {isCustomerActive ? (
                  <Badge variant="success" size="md" dot pulse>
                    Active Account
                  </Badge>
                ) : (
                  <Badge variant="danger" size="md" dot>
                    Deactivated Account
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium">{customer?.email}</span>
                </div>
                {customer?.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium">{customer.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Joined {formatDate(customer?.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Administrative Actions (Activate / Deactivate) */}
          <div className="flex items-center gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            {isCustomerActive ? (
              <Button
                variant="subtleDanger"
                size="md"
                onClick={() => setStatusConfirmOpen(true)}
                leftIcon={UserX}
                className="text-xs"
              >
                Deactivate Account
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={() => setStatusConfirmOpen(true)}
                leftIcon={UserCheck}
                className="text-xs"
              >
                Activate Account
              </Button>
            )}

            <Button
              variant="outline"
              size="md"
              onClick={handleManualRefresh}
              isLoading={isLoadingCustomer || isLoadingBookings || isLoadingRequests}
              leftIcon={RefreshCw}
              className="text-xs"
              title="Refresh dossier data"
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* ================= AUTHORITATIVE SUMMARY STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Vehicles Metric */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Registered Vehicles
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {customer?.totalVehicles ?? vehicles.length}
          </div>
          <p className="text-[11px] text-slate-400">Read-only garage records</p>
        </div>

        {/* Bookings Metric */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Bookings
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {customer?.totalBookings ?? 0}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 pt-0.5">
            <span className="text-emerald-700 font-bold">
              {customer?.completedBookings ?? 0} completed
            </span>
            <span>•</span>
            <span className="text-blue-700 font-medium">
              {customer?.confirmedBookings ?? 0} confirmed
            </span>
            <span>•</span>
            <span className="text-amber-700 font-medium">
              {customer?.pendingBookings ?? 0} pending
            </span>
          </div>
        </div>

        {/* Service Requests Metric */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Service Requests
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {customer?.totalServiceRequests ?? 0}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 pt-0.5">
            <span className="text-purple-700 font-bold">
              {customer?.matchedRequests ?? 0} matched
            </span>
            <span>•</span>
            <span className="text-slate-600 font-medium">
              {customer?.submittedRequests ?? 0} submitted
            </span>
            <span>•</span>
            <span className="text-emerald-700 font-medium">
              {customer?.completedRequests ?? 0} completed
            </span>
          </div>
        </div>
      </div>

      {/* ================= SECTION 1: CUSTOMER VEHICLES ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Customer Garage & Vehicles
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Administrative read-only view of customer registered automobiles.
            </p>
          </div>
          <Badge variant="neutral" size="sm">
            {vehicles.length} {vehicles.length === 1 ? "Vehicle" : "Vehicles"}
          </Badge>
        </div>

        {isLoadingVehicles ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((n) => (
              <div key={n} className="p-4 rounded-xl border border-slate-100 bg-slate-50 animate-pulse space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <EmptyState
            icon={Car}
            title="No vehicles registered"
            description="This customer has not registered any vehicles in their garage yet."
            compact
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      {v.make} {v.model}
                    </h3>
                    <span className="text-xs font-bold text-slate-500 font-mono">
                      {v.year}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-mono font-extrabold text-slate-800 shadow-2xs">
                    {v.registrationNumber}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {v.fuelType && (
                    <Badge variant="blue" size="sm">
                      {v.fuelType}
                    </Badge>
                  )}
                  {v.transmission && (
                    <Badge variant="purple" size="sm">
                      {v.transmission}
                    </Badge>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Registered</span>
                  <span className="font-medium text-slate-600">{formatDate(v.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= SECTION 2: BOOKING HISTORY ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Direct Booking History
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Workshop appointments with authoritative historical price snapshots.
            </p>
          </div>

          {/* Booking Status Filters */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setBookingStatusFilter(st);
                  setBookingsPage(0);
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all select-none ${
                  bookingStatusFilter === st
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {st === "ALL" ? "All" : st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {isLoadingBookings ? (
          <div className="space-y-2 py-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-14 bg-slate-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No bookings found"
            description={
              bookingStatusFilter === "ALL"
                ? "This customer has no booking history."
                : `No ${bookingStatusFilter.toLowerCase()} bookings found for this customer.`
            }
            compact
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-3">Reference</th>
                  <th className="py-3 px-3">Service</th>
                  <th className="py-3 px-3">Vehicle</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3 text-right">Price Snapshot</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {b.bookingReference}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{b.serviceName}</div>
                      {b.city && <div className="text-[11px] text-slate-400">{b.city}</div>}
                    </td>
                    <td className="py-3 px-3">
                      {b.vehicle ? (
                        <div className="text-slate-700">
                          <span className="font-medium">
                            {b.vehicle.make} {b.vehicle.model}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {b.vehicle.registrationNumber}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <div>{formatDate(b.bookingDate)}</div>
                      <div className="text-[10px] text-slate-400">{b.timeSlot || b.bookingTime}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(b.servicePriceSnapshot || b.totalAmount || b.estimatedPrice)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {getBookingStatusBadge(b.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Bookings Pagination Bar */}
            {bookingsTotalPages > 1 && (
              <div className="pt-4 flex items-center justify-between border-t border-slate-100 text-xs text-slate-500">
                <span>
                  Showing page {bookingsPage + 1} of {bookingsTotalPages} ({bookingsTotalCount} bookings)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={bookingsPage === 0}
                    onClick={() => setBookingsPage((p) => Math.max(0, p - 1))}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={bookingsPage >= bookingsTotalPages - 1}
                    onClick={() => setBookingsPage((p) => p + 1)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= SECTION 3: MARKETPLACE SERVICE REQUESTS ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-purple-600" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Marketplace Service Requests
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Dispatched RFQs broadcast to partner workshops across the marketplace.
            </p>
          </div>

          {/* Requests Status Filter */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            {["ALL", "SUBMITTED", "MATCHED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setRequestStatusFilter(st);
                  setRequestsPage(0);
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all select-none ${
                  requestStatusFilter === st
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {st === "ALL" ? "All" : st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {isLoadingRequests ? (
          <div className="space-y-2 py-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-14 bg-slate-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : serviceRequests.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No service requests found"
            description={
              requestStatusFilter === "ALL"
                ? "This customer has no marketplace service requests."
                : `No ${requestStatusFilter.toLowerCase()} service requests found for this customer.`
            }
            compact
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-3">Reference</th>
                  <th className="py-3 px-3">Requested Services</th>
                  <th className="py-3 px-3">Assigned Workshop</th>
                  <th className="py-3 px-3">Preferred Slot</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {serviceRequests.map((sr) => (
                  <tr key={sr.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {sr.requestReference}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">
                        {sr.requestedServices || "General Service"}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {sr.city} {sr.pincode && `• ${sr.pincode}`}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {sr.assignedWorkshopName ? (
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <Building2 className="w-3.5 h-3.5 text-blue-500" />
                          <span>{sr.assignedWorkshopName}</span>
                        </div>
                      ) : (
                        <span className="text-amber-600 font-medium text-[11px]">
                          Pending Assignment
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <div>{formatDate(sr.preferredDate)}</div>
                      <div className="text-[10px] text-slate-400">{sr.preferredTimeSlot || "Any time"}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(sr.totalAmount)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {getRequestStatusBadge(sr.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Requests Pagination Bar */}
            {requestsTotalPages > 1 && (
              <div className="pt-4 flex items-center justify-between border-t border-slate-100 text-xs text-slate-500">
                <span>
                  Showing page {requestsPage + 1} of {requestsTotalPages} ({requestsTotalCount} requests)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={requestsPage === 0}
                    onClick={() => setRequestsPage((p) => Math.max(0, p - 1))}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={requestsPage >= requestsTotalPages - 1}
                    onClick={() => setRequestsPage((p) => p + 1)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= ACCOUNT STATUS MUTATION CONFIRM DIALOG ================= */}
      <ConfirmDialog
        isOpen={statusConfirmOpen}
        onClose={() => setStatusConfirmOpen(false)}
        onConfirm={handleConfirmStatusChange}
        title={isCustomerActive ? "Deactivate customer account?" : "Reactivate customer account?"}
        description={
          isCustomerActive
            ? "This will prevent the customer from logging in and using the platform until the account is reactivated."
            : "This will restore full platform login and service access for this customer account."
        }
        confirmLabel={isCustomerActive ? "Deactivate Account" : "Reactivate Account"}
        confirmVariant={isCustomerActive ? "danger" : "primary"}
        isLoading={isUpdatingStatus}
      >
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
          <div>
            Target Customer: <strong className="text-slate-900">{customer?.name}</strong>
          </div>
          <div>
            Account Email: <span className="font-mono text-slate-700">{customer?.email}</span>
          </div>
        </div>
      </ConfirmDialog>
    </div>
  );
}
