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
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Wrench,
  Compass,
  Radio,
  Store,
  Wallet,
  CreditCard,
  RotateCcw,
  History,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Car,
  Activity,
  User,
} from "lucide-react";

// Currency formatter
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

// Date formatter
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

// Date-time formatter
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

// Verification badge
function getVerificationBadge(status) {
  switch (status) {
    case "VERIFIED":
      return <Badge variant="success" size="sm" dot>Verified</Badge>;
    case "PENDING":
      return <Badge variant="warning" size="sm" dot>Pending Review</Badge>;
    case "REJECTED":
      return <Badge variant="danger" size="sm" dot>Rejected</Badge>;
    case "SUSPENDED":
      return <Badge variant="purple" size="sm" dot>Suspended</Badge>;
    default:
      return <Badge variant="neutral" size="sm">{status || "Unknown"}</Badge>;
  }
}

// Opportunity status badge
function getOpportunityBadge(status) {
  switch (status) {
    case "ACCEPTED":
    case "ASSIGNED":
    case "COMPLETED":
      return <Badge variant="success" size="xs">{status}</Badge>;
    case "PAID":
    case "CUSTOMER_DETAILS_UNLOCKED":
      return <Badge variant="blue" size="xs">{status}</Badge>;
    case "AVAILABLE":
    case "VIEWED":
      return <Badge variant="warning" size="xs">{status}</Badge>;
    case "TRANSFERRED":
      return <Badge variant="purple" size="xs">{status}</Badge>;
    case "LOST":
    case "EXPIRED":
    case "CANCELLED":
    case "DECLINED":
      return <Badge variant="danger" size="xs">{status}</Badge>;
    default:
      return <Badge variant="neutral" size="xs">{status}</Badge>;
  }
}

// Booking status badge
function getBookingStatusBadge(status) {
  switch (status) {
    case "COMPLETED":
      return <Badge variant="success" size="xs">Completed</Badge>;
    case "CONFIRMED":
      return <Badge variant="blue" size="xs">Confirmed</Badge>;
    case "IN_PROGRESS":
      return <Badge variant="purple" size="xs">In Progress</Badge>;
    case "PENDING":
      return <Badge variant="warning" size="xs">Pending</Badge>;
    case "CANCELLED":
      return <Badge variant="danger" size="xs">Cancelled</Badge>;
    default:
      return <Badge variant="neutral" size="xs">{status}</Badge>;
  }
}

export default function AdminWorkshop360Page() {
  const params = useParams();
  const router = useRouter();
  const workshopId = params?.id;
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState("overview");

  // Workshop Detail state
  const [workshop, setWorkshop] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sub-resource states
  const [opportunities, setOpportunities] = useState([]);
  const [isLoadingOpportunities, setIsLoadingOpportunities] = useState(false);
  const [oppStatusFilter, setOppStatusFilter] = useState("ALL");

  const [bookings, setBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [bookingStatusFilter, setBookingStatusFilter] = useState("ALL");

  const [payments, setPayments] = useState([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);

  const [refunds, setRefunds] = useState([]);
  const [isLoadingRefunds, setIsLoadingRefunds] = useState(false);

  const [walletDetails, setWalletDetails] = useState(null);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);

  const [auditEvents, setAuditEvents] = useState([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  // Operational Status Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetActive, setTargetActive] = useState(false);
  const [statusReason, setStatusReason] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Verification Review Modal
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [targetVerification, setTargetVerification] = useState("VERIFIED");
  const [verificationReason, setVerificationReason] = useState("");
  const [isUpdatingVerification, setIsUpdatingVerification] = useState(false);

  // Load workshop details asynchronously
  useEffect(() => {
    let ignore = false;

    async function loadWorkshop() {
      try {
        const data = await adminApi.getWorkshop(workshopId);
        if (!ignore) {
          setWorkshop(data);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load workshop details.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    if (workshopId) {
      loadWorkshop();
    }

    return () => {
      ignore = true;
    };
  }, [workshopId]);

  // Fetch Workshop for manual refresh or post-mutation
  const fetchWorkshop = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getWorkshop(workshopId);
      setWorkshop(data);
    } catch (err) {
      setError(err.message || "Failed to load workshop details.");
    } finally {
      setIsLoading(false);
    }
  };

  // Tab change handler
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === "marketplace" && !opportunities) setIsLoadingOpportunities(true);
    if (tabId === "bookings" && !bookings) setIsLoadingBookings(true);
    if (tabId === "payments" && !payments) setIsLoadingPayments(true);
    if (tabId === "refunds" && !refunds) setIsLoadingRefunds(true);
    if (tabId === "wallet" && !walletDetails) setIsLoadingWallet(true);
    if (tabId === "audit" && !auditEvents) setIsLoadingAudit(true);
  };

  // Lazy sub-resource fetchers
  useEffect(() => {
    let ignore = false;
    if (activeTab === "marketplace" && workshopId) {
      adminApi
        .getWorkshopOpportunities(workshopId, {
          page: 0,
          size: 20,
          status: oppStatusFilter === "ALL" ? undefined : oppStatusFilter,
        })
        .then((res) => {
          if (!ignore) setOpportunities(res?.content || []);
        })
        .catch((err) => console.warn("Failed to load opportunities:", err.message))
        .finally(() => {
          if (!ignore) setIsLoadingOpportunities(false);
        });
    }
    return () => {
      ignore = true;
    };
  }, [activeTab, workshopId, oppStatusFilter]);

  useEffect(() => {
    let ignore = false;
    if (activeTab === "bookings" && workshopId) {
      adminApi
        .getWorkshopBookings(workshopId, {
          page: 0,
          size: 20,
          status: bookingStatusFilter === "ALL" ? undefined : bookingStatusFilter,
        })
        .then((res) => {
          if (!ignore) setBookings(res?.content || []);
        })
        .catch((err) => console.warn("Failed to load bookings:", err.message))
        .finally(() => {
          if (!ignore) setIsLoadingBookings(false);
        });
    }
    return () => {
      ignore = true;
    };
  }, [activeTab, workshopId, bookingStatusFilter]);

  useEffect(() => {
    let ignore = false;
    if (activeTab === "payments" && workshopId) {
      adminApi
        .getWorkshopPayments(workshopId)
        .then((res) => {
          if (!ignore) setPayments(res || []);
        })
        .catch((err) => console.warn("Failed to load payments:", err.message))
        .finally(() => {
          if (!ignore) setIsLoadingPayments(false);
        });
    }
    return () => {
      ignore = true;
    };
  }, [activeTab, workshopId]);

  useEffect(() => {
    let ignore = false;
    if (activeTab === "refunds" && workshopId) {
      adminApi
        .getWorkshopRefunds(workshopId)
        .then((res) => {
          if (!ignore) setRefunds(res || []);
        })
        .catch((err) => console.warn("Failed to load refunds:", err.message))
        .finally(() => {
          if (!ignore) setIsLoadingRefunds(false);
        });
    }
    return () => {
      ignore = true;
    };
  }, [activeTab, workshopId]);

  useEffect(() => {
    let ignore = false;
    if (activeTab === "wallet" && workshopId) {
      Promise.all([
        adminApi.getWorkshopWallet(workshopId).catch(() => null),
        fetch(`/api/v1/admin/wallets/${workshopId}/transactions?page=0&size=20`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        })
          .then((r) => r.json())
          .then((res) => res?.data?.content || [])
          .catch(() => []),
      ])
        .then(([wData, txData]) => {
          if (!ignore) {
            if (wData) setWalletDetails(wData);
            setWalletTransactions(txData);
          }
        })
        .finally(() => {
          if (!ignore) setIsLoadingWallet(false);
        });
    }
    return () => {
      ignore = true;
    };
  }, [activeTab, workshopId]);

  useEffect(() => {
    let ignore = false;
    if (activeTab === "audit" && workshopId) {
      adminApi
        .getWorkshopAuditEvents(workshopId)
        .then((res) => {
          if (!ignore) setAuditEvents(res || []);
        })
        .catch((err) => console.warn("Failed to load audit events:", err.message))
        .finally(() => {
          if (!ignore) setIsLoadingAudit(false);
        });
    }
    return () => {
      ignore = true;
    };
  }, [activeTab, workshopId]);

  // Operational Status update handler
  const handleConfirmStatusChange = async () => {
    if (!targetActive && (!statusReason || !statusReason.trim())) {
      showError("A reason is required to deactivate a workshop.");
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const updated = await adminApi.updateWorkshopStatus(
        workshopId,
        targetActive,
        statusReason.trim()
      );
      setWorkshop(updated);
      showSuccess(`Workshop ${targetActive ? "activated" : "deactivated"} successfully.`);
      setStatusModalOpen(false);
    } catch (err) {
      showError(err.message || "Failed to update status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Verification status update handler
  const handleConfirmVerificationChange = async () => {
    if (
      (targetVerification === "REJECTED" || targetVerification === "SUSPENDED") &&
      (!verificationReason || !verificationReason.trim())
    ) {
      showError(`A reason is required to ${targetVerification.toLowerCase()} a workshop.`);
      return;
    }

    setIsUpdatingVerification(true);
    try {
      const updated = await adminApi.updateWorkshopVerification(
        workshopId,
        targetVerification,
        verificationReason.trim()
      );
      setWorkshop(updated);
      showSuccess(`Workshop verification updated to ${targetVerification}.`);
      setVerificationModalOpen(false);
    } catch (err) {
      showError(err.message || "Failed to update verification.");
    } finally {
      setIsUpdatingVerification(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-xl" />
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (error || !workshop) {
    return (
      <div className="p-8">
        <ErrorState
          title="Workshop not found"
          description={error || "The requested workshop does not exist or has been removed."}
          onRetry={fetchWorkshop}
        />
        <div className="mt-4">
          <Link href="/admin/workshops">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Workshop Registry</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: "overview", label: "Overview", icon: Building2 },
    { id: "capabilities", label: `Capabilities (${workshop.capabilities?.length || 0})`, icon: Wrench },
    { id: "coverage", label: "Location & Coverage", icon: Compass },
    { id: "marketplace", label: `Marketplace (${workshop.totalOpportunities || 0})`, icon: Store },
    { id: "bookings", label: `Bookings (${workshop.totalBookings || 0})`, icon: Calendar },
    { id: "wallet", label: "Wallet & Topups", icon: Wallet },
    { id: "payments", label: "Fee Payments", icon: CreditCard },
    { id: "refunds", label: "Refunds", icon: RotateCcw },
    { id: "audit", label: "Audit Trail", icon: History },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/workshops"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Workshop Registry</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={fetchWorkshop}
              className="flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3 text-slate-400" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Workshop Profile Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 font-bold text-lg flex items-center justify-center shrink-0">
              {workshop.businessName?.charAt(0).toUpperCase() || "W"}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900">{workshop.businessName}</h1>
                {getVerificationBadge(workshop.verificationStatus)}
                {workshop.isActive ? (
                  <Badge variant="success" size="sm" dot>Active</Badge>
                ) : (
                  <Badge variant="danger" size="sm" dot>Inactive</Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                <span>Workshop ID: #{workshop.id}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {workshop.city}, {workshop.state}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Radio className="w-3 h-3 text-blue-500" />
                  {workshop.serviceRadiusKm} km coverage
                </span>
                <span>•</span>
                <span>Joined {formatDate(workshop.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant={workshop.isActive ? "subtleDanger" : "outline"}
              size="sm"
              onClick={() => {
                setTargetActive(!workshop.isActive);
                setStatusReason("");
                setStatusModalOpen(true);
              }}
              className="text-xs"
            >
              {workshop.isActive ? "Deactivate Facility" : "Activate Facility"}
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setTargetVerification(
                  workshop.verificationStatus === "VERIFIED" ? "SUSPENDED" : "VERIFIED"
                );
                setVerificationReason("");
                setVerificationModalOpen(true);
              }}
              className="text-xs flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Review Verification</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Wallet Balance
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatCurrency(workshop.walletBalance)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Available for lead unlock</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Opportunities
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {workshop.totalOpportunities}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {workshop.acceptedOpportunities} accepted ({workshop.unlockedOpportunities} unlocked)
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Acceptance Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-600 mt-2">
            {workshop.acceptanceRate}%
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Lead conversion ratio</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Completed Jobs
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">
            {workshop.completedJobs}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Fulfilled automotive services</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 overflow-x-auto">
          <nav className="flex space-x-1 p-2 min-w-max" aria-label="Tabs">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business Information Card */}
                <div className="border border-slate-200 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Business & Contact Profile</span>
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Business Name</span>
                      <span className="font-semibold text-slate-900">{workshop.businessName}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Owner / Primary Contact</span>
                      <span className="font-semibold text-slate-900">{workshop.ownerName || "—"}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Phone</span>
                      <span className="font-semibold text-slate-900">{workshop.phone}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Email</span>
                      <span className="font-semibold text-slate-900">{workshop.email}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Verification Status</span>
                      <span>{getVerificationBadge(workshop.verificationStatus)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Operational Status</span>
                      <span>
                        {workshop.isActive ? (
                          <Badge variant="success" size="xs">Active</Badge>
                        ) : (
                          <Badge variant="danger" size="xs">Inactive</Badge>
                        )}
                      </span>
                    </div>
                    {workshop.statusReason && (
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Latest Reason</span>
                        <span className="font-medium text-amber-700 text-right">{workshop.statusReason}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">Registered Date</span>
                      <span className="text-slate-900">{formatDate(workshop.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Location & Coordinates Card */}
                <div className="border border-slate-200 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>Facility Location & Dispatch Radius</span>
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Street Address</span>
                      <span className="font-semibold text-slate-900 text-right max-w-[220px]">
                        {workshop.address}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">City</span>
                      <span className="font-semibold text-slate-900">{workshop.city}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">State</span>
                      <span className="font-semibold text-slate-900">{workshop.state}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Pincode</span>
                      <span className="font-semibold text-slate-900">{workshop.pincode}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Latitude / Longitude</span>
                      <span className="font-mono text-slate-800">
                        {workshop.latitude ? `${workshop.latitude}, ${workshop.longitude}` : "Not mapped"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">Service Radius</span>
                      <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded text-xs">
                        {workshop.serviceRadiusKm} km
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SERVICES & CAPABILITIES */}
          {activeTab === "capabilities" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Supported Services & Capabilities</h3>
                  <p className="text-xs text-slate-500">
                    Services from the central catalog linked to this workshop facility. Read-only model.
                  </p>
                </div>
                <Badge variant="neutral" size="sm">
                  {workshop.capabilities?.length || 0} active capabilities
                </Badge>
              </div>

              {(!workshop.capabilities || workshop.capabilities.length === 0) ? (
                <EmptyState
                  icon={Wrench}
                  title="No capabilities attached"
                  description="This workshop has not linked any specific service catalog items yet."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {workshop.capabilities.map((cap) => (
                    <div
                      key={cap.id}
                      className="border border-slate-200 rounded-lg p-3.5 space-y-2 hover:border-slate-300 transition-colors bg-white"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-slate-900 text-xs">{cap.name}</h4>
                        <Badge variant="blue" size="xs">
                          {cap.category || "GENERAL"}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {cap.description || "Full standard maintenance package for registered vehicle classes."}
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="font-bold text-slate-900">
                          {formatCurrency(cap.basePrice)}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{cap.estimatedDurationMinutes || 120} mins</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LOCATION & COVERAGE */}
          {activeTab === "coverage" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visual Coverage Card */}
                <div className="lg:col-span-1 border border-blue-200 bg-blue-50/50 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-blue-950">Marketplace Dispatch Zone</h3>
                  </div>

                  <div className="bg-white border border-blue-100 rounded-lg p-4 space-y-3 text-center">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                      Primary Base City
                    </span>
                    <p className="text-xl font-extrabold text-slate-900">{workshop.city}</p>
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto my-1">
                      ↓
                    </div>
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                      Enforced Haversine Radius
                    </span>
                    <p className="text-2xl font-black text-blue-600">
                      {workshop.serviceRadiusKm} km
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Customer requests originating within this circular perimeter are matched dynamically to this workshop.
                  </p>
                </div>

                {/* Geography Rules Card */}
                <div className="lg:col-span-2 border border-slate-200 rounded-xl p-5 space-y-4 bg-white">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-slate-700" />
                    <span>Geographic Eligibility & Matching Architecture</span>
                  </h3>

                  <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
                      <span className="font-bold text-slate-900 block">Rule 1: Coordinate Distance Check</span>
                      <p>
                        When GPS coordinates are captured on the customer service request, the platform computes
                        Haversine spherical distance between the customer location and ({workshop.latitude || "N/A"}, {workshop.longitude || "N/A"}).
                        Matching requires distance ≤ {workshop.serviceRadiusKm} km.
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
                      <span className="font-bold text-slate-900 block">Rule 2: Fallback City Isolation</span>
                      <p>
                        If coordinate calculations are not available, matching falls back to an exact case-insensitive
                        city match (&quot;{workshop.city}&quot;). Requests in unrelated cities or states are strictly isolated.
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
                      <span className="font-bold text-slate-900 block">Rule 3: Full Service Coverage</span>
                      <p>
                        The workshop must support 100% of the services requested by the customer. Missing capabilities disqualify
                        the workshop from receiving the lead.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MARKETPLACE OPPORTUNITIES */}
          {activeTab === "marketplace" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Opportunity & Lead History</h3>
                  <p className="text-xs text-slate-500">
                    Marketplace dispatch leads matched to this workshop. Contact details are masked per privacy rules until unlocked.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Filter status:</span>
                  <select
                    value={oppStatusFilter}
                    onChange={(e) => {
                      setOppStatusFilter(e.target.value);
                      setIsLoadingOpportunities(true);
                    }}
                    className="text-xs border border-slate-200 rounded px-2 py-1 bg-white"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="PAID">Paid / Unlocked</option>
                    <option value="TRANSFERRED">Transferred</option>
                    <option value="LOST">Lost</option>
                  </select>
                </div>
              </div>

              {isLoadingOpportunities ? (
                <div className="space-y-2 py-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded" />
                  ))}
                </div>
              ) : opportunities.length === 0 ? (
                <EmptyState
                  icon={Store}
                  title="No opportunities found"
                  description="No marketplace leads match the selected criteria for this workshop."
                />
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                        <th className="py-2.5 px-3">Lead Ref</th>
                        <th className="py-2.5 px-3">Vehicle</th>
                        <th className="py-2.5 px-3">Services</th>
                        <th className="py-2.5 px-3 text-right">Job Amount</th>
                        <th className="py-2.5 px-3 text-right">Platform Fee</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Dispatched</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {opportunities.map((opp) => (
                        <tr key={opp.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                            {opp.requestReference}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">
                            {opp.vehicleInfo || "—"}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 truncate max-w-[200px]" title={opp.servicesSummary}>
                            {opp.servicesSummary || "Standard Service"}
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                            {formatCurrency(opp.totalAmount)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-blue-600 font-semibold">
                            {formatCurrency(opp.feeSnapshot)}
                          </td>
                          <td className="py-2.5 px-3">
                            {getOpportunityBadge(opp.status)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">
                            {formatDate(opp.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: BOOKINGS */}
          {activeTab === "bookings" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Assigned Bookings</h3>
                  <p className="text-xs text-slate-500">
                    Customer scheduled appointments fulfilled at this workshop.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Filter status:</span>
                  <select
                    value={bookingStatusFilter}
                    onChange={(e) => {
                      setBookingStatusFilter(e.target.value);
                      setIsLoadingBookings(true);
                    }}
                    className="text-xs border border-slate-200 rounded px-2 py-1 bg-white"
                  >
                    <option value="ALL">All Bookings</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              {isLoadingBookings ? (
                <div className="space-y-2 py-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded" />
                  ))}
                </div>
              ) : bookings.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="No bookings assigned"
                  description="No customer bookings are currently linked to this workshop."
                />
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                        <th className="py-2.5 px-3">Booking Ref</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Vehicle</th>
                        <th className="py-2.5 px-3">Service</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Scheduled Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                            {b.bookingReference}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-medium text-slate-900 block">{b.customerName}</span>
                            <span className="text-[11px] text-slate-400">{b.customerPhone}</span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">
                            {b.vehicleModel} ({b.vehiclePlate})
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {b.serviceName}
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                            {formatCurrency(b.totalAmount)}
                          </td>
                          <td className="py-2.5 px-3">
                            {getBookingStatusBadge(b.status)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">
                            {formatDate(b.bookingDate)} {b.timeSlot ? `(${b.timeSlot})` : ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: WALLET & TRANSACTIONS */}
          {activeTab === "wallet" && (
            <div className="space-y-6">
              {/* Wallet Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4">
                  <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
                    Current Balance
                  </span>
                  <p className="text-2xl font-bold text-emerald-700 mt-1">
                    {formatCurrency(walletDetails?.balance || workshop.walletBalance)}
                  </p>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    Wallet Status: {walletDetails?.status || workshop.walletStatus || "ACTIVE"}
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-white">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Total Credits
                  </span>
                  <p className="text-xl font-bold text-slate-900 mt-1">
                    {formatCurrency(workshop.totalWalletCredits)}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Topups & adjustments</p>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-white">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Total Debits
                  </span>
                  <p className="text-xl font-bold text-slate-900 mt-1">
                    {formatCurrency(workshop.totalWalletDebits)}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Lead acceptance fees paid</p>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Wallet Transactions History</h3>
                {isLoadingWallet ? (
                  <Skeleton className="h-48 w-full rounded-lg" />
                ) : walletTransactions.length === 0 ? (
                  <EmptyState
                    icon={Wallet}
                    title="No wallet transactions"
                    description="No transaction entries recorded for this workshop wallet."
                  />
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3 text-right">Amount</th>
                          <th className="py-2.5 px-3 text-right">Balance After</th>
                          <th className="py-2.5 px-3">Reference</th>
                          <th className="py-2.5 px-3">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {walletTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 text-slate-500">{formatDateTime(tx.createdAt)}</td>
                            <td className="py-2.5 px-3">
                              {tx.type === "CREDIT" ? (
                                <Badge variant="success" size="xs">+ CREDIT</Badge>
                              ) : (
                                <Badge variant="danger" size="xs">- DEBIT</Badge>
                              )}
                            </td>
                            <td className={`py-2.5 px-3 text-right font-bold ${tx.type === "CREDIT" ? "text-emerald-600" : "text-slate-900"}`}>
                              {tx.type === "CREDIT" ? "+" : "-"}{formatCurrency(tx.amount)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-700 font-mono">
                              {formatCurrency(tx.balanceAfter)}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                              {tx.referenceType || "TOPUP"} (#{tx.referenceId || "—"})
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 max-w-[240px] truncate">
                              {tx.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: PAYMENTS */}
          {activeTab === "payments" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Platform Fee Payments</h3>
                <p className="text-xs text-slate-500">
                  Authoritative record of platform fees paid by this partner for lead unlocks. Immutable financial data.
                </p>
              </div>

              {isLoadingPayments ? (
                <Skeleton className="h-48 w-full rounded-lg" />
              ) : payments.length === 0 ? (
                <EmptyState
                  icon={CreditCard}
                  title="No fee payments recorded"
                  description="This workshop has not made direct or wallet platform fee payments yet."
                />
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                        <th className="py-2.5 px-3">Payment ID</th>
                        <th className="py-2.5 px-3">Opportunity ID</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                        <th className="py-2.5 px-3">Method</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Razorpay Ref</th>
                        <th className="py-2.5 px-3">Paid Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {payments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                            #{p.id}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">
                            #{p.opportunityId}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                            {formatCurrency(p.amount)}
                          </td>
                          <td className="py-2.5 px-3">
                            <Badge variant="neutral" size="xs">{p.paymentMethod}</Badge>
                          </td>
                          <td className="py-2.5 px-3">
                            {p.paymentStatus === "SUCCESS" ? (
                              <Badge variant="success" size="xs">Success</Badge>
                            ) : p.paymentStatus === "FAILED" ? (
                              <Badge variant="danger" size="xs">Failed</Badge>
                            ) : (
                              <Badge variant="warning" size="xs">{p.paymentStatus}</Badge>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                            {p.razorpayPaymentId || p.razorpayOrderId || "—"}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">
                            {formatDateTime(p.paidAt || p.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: REFUNDS */}
          {activeTab === "refunds" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Platform Fee Refunds</h3>
                <p className="text-xs text-slate-500">
                  Refunds issued for transferred or cancelled marketplace leads. Immutable financial records.
                </p>
              </div>

              {isLoadingRefunds ? (
                <Skeleton className="h-48 w-full rounded-lg" />
              ) : refunds.length === 0 ? (
                <EmptyState
                  icon={RotateCcw}
                  title="No refunds issued"
                  description="No lead acceptance fees have been refunded for this workshop."
                />
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                        <th className="py-2.5 px-3">Refund ID</th>
                        <th className="py-2.5 px-3">Payment ID</th>
                        <th className="py-2.5 px-3 text-right">Refund Amount</th>
                        <th className="py-2.5 px-3">Reason</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Gateway Ref</th>
                        <th className="py-2.5 px-3">Initiated At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {refunds.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                            #{r.id}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">
                            #{r.paymentId}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                            {formatCurrency(r.refundAmount)}
                          </td>
                          <td className="py-2.5 px-3">
                            <Badge variant="blue" size="xs">{r.refundReason}</Badge>
                          </td>
                          <td className="py-2.5 px-3">
                            {r.refundStatus === "PROCESSED" ? (
                              <Badge variant="success" size="xs">Processed</Badge>
                            ) : (
                              <Badge variant="warning" size="xs">{r.refundStatus}</Badge>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                            {r.razorpayRefundId || "—"}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">
                            {formatDateTime(r.initiatedAt || r.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 9: AUDIT TRAIL */}
          {activeTab === "audit" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Administrative & Marketplace Audit Trail</h3>
                <p className="text-xs text-slate-500">
                  Immutable event stream logging status transitions, verification changes, and fulfillment events.
                </p>
              </div>

              {isLoadingAudit ? (
                <Skeleton className="h-48 w-full rounded-lg" />
              ) : auditEvents.length === 0 ? (
                <EmptyState
                  icon={History}
                  title="No audit events found"
                  description="No audit events recorded for this workshop yet."
                />
              ) : (
                <div className="space-y-3">
                  {auditEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="border border-slate-200 rounded-lg p-3 bg-white space-y-1.5 text-xs hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="purple" size="xs">
                            {evt.eventType}
                          </Badge>
                          <span className="font-semibold text-slate-900">{evt.description}</span>
                        </div>
                        <span className="text-[11px] text-slate-400">{formatDateTime(evt.createdAt)}</span>
                      </div>
                      {evt.metadataJson && (
                        <pre className="bg-slate-50 border border-slate-100 rounded p-2 text-[11px] font-mono text-slate-700 overflow-x-auto">
                          {evt.metadataJson}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Operational Status Modal */}
      <ConfirmDialog
        isOpen={statusModalOpen}
        onClose={() => !isUpdatingStatus && setStatusModalOpen(false)}
        onConfirm={handleConfirmStatusChange}
        title={targetActive ? "Activate Workshop" : "Deactivate Workshop"}
        description={
          targetActive
            ? "Activating this facility will immediately make it eligible for marketplace matching and job assignments."
            : "Deactivating this facility will prevent it from receiving any new marketplace opportunities or bookings. Existing records remain safe."
        }
        confirmLabel={targetActive ? "Activate Facility" : "Deactivate Facility"}
        confirmVariant={targetActive ? "primary" : "danger"}
        isLoading={isUpdatingStatus}
      >
        <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Facility</span>
            <span className="font-bold text-slate-900">{workshop.businessName}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-slate-400 block font-medium">Current Status</span>
              <span className="font-semibold text-slate-700">
                {workshop.isActive ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Target Status</span>
              <span className={`font-bold ${targetActive ? "text-emerald-600" : "text-rose-600"}`}>
                {targetActive ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
          </div>

          {!targetActive && (
            <div className="pt-2 border-t border-slate-200">
              <label className="block font-semibold text-slate-700 mb-1">
                Reason for Deactivation <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Explain why this workshop is being deactivated (audit mandatory)..."
                className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          )}
        </div>
      </ConfirmDialog>

      {/* Verification Review Modal */}
      <ConfirmDialog
        isOpen={verificationModalOpen}
        onClose={() => !isUpdatingVerification && setVerificationModalOpen(false)}
        onConfirm={handleConfirmVerificationChange}
        title="Review Workshop Verification"
        description="Update official partner verification credentials and facility onboarding status."
        confirmLabel={`Set to ${targetVerification}`}
        confirmVariant={targetVerification === "VERIFIED" ? "primary" : "danger"}
        isLoading={isUpdatingVerification}
      >
        <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Facility</span>
            <span className="font-bold text-slate-900">{workshop.businessName}</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Verification Status
            </label>
            <select
              value={targetVerification}
              onChange={(e) => setTargetVerification(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="VERIFIED">VERIFIED (Approved for marketplace operations)</option>
              <option value="PENDING">PENDING (Documentation in review)</option>
              <option value="REJECTED">REJECTED (Application rejected)</option>
              <option value="SUSPENDED">SUSPENDED (Temporarily suspended for non-compliance)</option>
            </select>
          </div>

          {(targetVerification === "REJECTED" || targetVerification === "SUSPENDED") && (
            <div className="pt-2 border-t border-slate-200">
              <label className="block font-semibold text-slate-700 mb-1">
                Reason for {targetVerification} <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={verificationReason}
                onChange={(e) => setVerificationReason(e.target.value)}
                placeholder="Explain the rejection or suspension rationale..."
                className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          )}
        </div>
      </ConfirmDialog>
    </div>
  );
}
