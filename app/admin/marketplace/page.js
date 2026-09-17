"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { adminMarketplaceApi } from "../../../lib/adminMarketplace";
import { useToast } from "../../../context/ToastContext";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import PageHeader from "../../../components/ui/PageHeader";
import EmptyState from "../../../components/ui/EmptyState";
import ErrorState from "../../../components/ui/ErrorState";
import { Skeleton } from "../../../components/ui/Skeleton";
import {
  Search,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Briefcase,
  Wrench,
  Clock,
  MapPin,
  Calendar,
  CreditCard,
  RotateCcw,
  History,
  ShieldCheck,
  TrendingUp,
  Car,
  User,
  ExternalLink,
  DollarSign,
  Layers,
  ArrowRightLeft,
  Phone,
  Mail,
  Check,
  Ban,
  FileText,
  Navigation,
} from "lucide-react";

// Currency Formatter
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

// Date Formatter
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

// Date-Time Formatter
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

// Service Request Status Badge
function getRequestStatusBadge(status) {
  switch (status) {
    case "SUBMITTED":
      return <Badge variant="neutral" size="sm" dot>Submitted</Badge>;
    case "MATCHING":
      return <Badge variant="info" size="sm" dot>Matching</Badge>;
    case "ACCEPTED":
      return <Badge variant="success" size="sm" dot>Accepted</Badge>;
    case "IN_PROGRESS":
      return <Badge variant="purple" size="sm" dot>In Progress</Badge>;
    case "COMPLETED":
      return <Badge variant="success" size="sm" dot>Completed</Badge>;
    case "CANCELLED":
      return <Badge variant="danger" size="sm" dot>Cancelled</Badge>;
    case "EXPIRED":
      return <Badge variant="warning" size="sm" dot>Expired</Badge>;
    default:
      return <Badge variant="neutral" size="sm">{status || "Unknown"}</Badge>;
  }
}

// Opportunity Status Badge
function getOpportunityStatusBadge(status) {
  switch (status) {
    case "WON":
      return <Badge variant="success" size="sm" dot>Won / Claimed</Badge>;
    case "ACCEPTED":
      return <Badge variant="info" size="sm" dot>Accepted</Badge>;
    case "BROADCASTED":
      return <Badge variant="neutral" size="sm" dot>Broadcasted</Badge>;
    case "VIEWED":
      return <Badge variant="neutral" size="sm" dot>Viewed</Badge>;
    case "LOST":
      return <Badge variant="danger" size="sm" dot>Lost</Badge>;
    case "EXPIRED":
      return <Badge variant="warning" size="sm" dot>Expired</Badge>;
    case "REJECTED":
      return <Badge variant="danger" size="sm" dot>Rejected</Badge>;
    default:
      return <Badge variant="neutral" size="sm">{status || "Unknown"}</Badge>;
  }
}

// Payment Status Badge
function getPaymentStatusBadge(status) {
  switch (status) {
    case "SUCCESS":
      return <Badge variant="success" size="sm" dot>Success</Badge>;
    case "PENDING":
      return <Badge variant="warning" size="sm" dot>Pending</Badge>;
    case "FAILED":
      return <Badge variant="danger" size="sm" dot>Failed</Badge>;
    default:
      return <Badge variant="neutral" size="sm">{status || "Unknown"}</Badge>;
  }
}

// Refund Status Badge
function getRefundStatusBadge(status) {
  switch (status) {
    case "SUCCESS":
      return <Badge variant="success" size="sm" dot>Processed</Badge>;
    case "PENDING":
    case "INITIATED":
      return <Badge variant="warning" size="sm" dot>Initiated</Badge>;
    case "FAILED":
      return <Badge variant="danger" size="sm" dot>Failed</Badge>;
    default:
      return <Badge variant="neutral" size="sm">{status || "Unknown"}</Badge>;
  }
}

function MarketplaceControlCenterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showError } = useToast();

  // URL state reading
  const initialSearch = searchParams.get("search") || "";
  const initialStatus = searchParams.get("status") || "ALL";
  const initialCity = searchParams.get("city") || "";
  const initialStartDate = searchParams.get("startDate") || "";
  const initialEndDate = searchParams.get("endDate") || "";
  const initialSort = searchParams.get("sort") || "createdAt";
  const initialDirection = searchParams.get("direction") || "DESC";
  const initialPage = parseInt(searchParams.get("page") || "0", 10);
  const initialSize = parseInt(searchParams.get("size") || "20", 10);
  const inspectId = searchParams.get("inspect") || null;

  // State
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [cityFilter, setCityFilter] = useState(initialCity);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [sortBy, setSortBy] = useState(initialSort);
  const [sortDir, setSortDir] = useState(initialDirection);
  const [page, setPage] = useState(isNaN(initialPage) ? 0 : initialPage);
  const [pageSize, setPageSize] = useState(isNaN(initialSize) ? 20 : initialSize);

  const [data, setData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // 360 Drawer / Modal state
  const [selectedSrId, setSelectedSrId] = useState(inspectId ? Number(inspectId) : null);
  const [srDetail, setSrDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailTab, setDetailTab] = useState("overview"); // overview, services, opportunities, payments, refunds, transfers, timeline, location
  const [extraPayments, setExtraPayments] = useState(null);
  const [extraRefunds, setExtraRefunds] = useState(null);

  const isSearching = search !== debouncedSearch;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // URL sync helper
  const updateUrlParams = useCallback(
    (newParams) => {
      const params = new URLSearchParams();
      if (newParams.search) params.set("search", newParams.search);
      if (newParams.status && newParams.status !== "ALL") params.set("status", newParams.status);
      if (newParams.city) params.set("city", newParams.city);
      if (newParams.startDate) params.set("startDate", newParams.startDate);
      if (newParams.endDate) params.set("endDate", newParams.endDate);
      if (newParams.sort && newParams.sort !== "createdAt") params.set("sort", newParams.sort);
      if (newParams.direction && newParams.direction !== "DESC") params.set("direction", newParams.direction);
      if (newParams.page && newParams.page > 0) params.set("page", newParams.page);
      if (newParams.size && newParams.size !== 20) params.set("size", newParams.size);
      if (newParams.inspect) params.set("inspect", newParams.inspect);

      const qs = params.toString();
      router.replace(`/admin/marketplace${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router]
  );

  // Fetch list and summary
  const loadMarketplaceData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const [listRes, summaryRes] = await Promise.all([
        adminMarketplaceApi.getServiceRequests({
          page,
          size: pageSize,
          search: debouncedSearch,
          status: statusFilter,
          city: cityFilter,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          sort: sortBy,
          direction: sortDir,
        }),
        adminMarketplaceApi.getSummary().catch(() => null),
      ]);

      setData(listRes);
      if (summaryRes) setSummary(summaryRes);
      setError(null);
    } catch (err) {
      console.error("Failed to load marketplace control center data:", err);
      setError(err.message || "Failed to load service requests.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [page, pageSize, debouncedSearch, statusFilter, cityFilter, startDate, endDate, sortBy, sortDir]);

  // Initial & reactive list loading
  useEffect(() => {
    let ignore = false;
    async function executeLoad() {
      await loadMarketplaceData();
      if (!ignore) {
        updateUrlParams({
          search: debouncedSearch,
          status: statusFilter,
          city: cityFilter,
          startDate,
          endDate,
          sort: sortBy,
          direction: sortDir,
          page,
          size: pageSize,
          inspect: selectedSrId,
        });
      }
    }
    executeLoad();
    return () => {
      ignore = true;
    };
  }, [loadMarketplaceData, debouncedSearch, statusFilter, cityFilter, startDate, endDate, sortBy, sortDir, page, pageSize, selectedSrId, updateUrlParams]);

  // Load 360 Detail when an SR is selected
  useEffect(() => {
    if (!selectedSrId) {
      return;
    }

    let ignore = false;

    async function fetchDetail() {
      try {
        const [detailRes, paymentsRes, refundsRes] = await Promise.all([
          adminMarketplaceApi.getServiceRequestDetail(selectedSrId),
          adminMarketplaceApi.getServiceRequestPayments(selectedSrId).catch(() => []),
          adminMarketplaceApi.getServiceRequestRefunds(selectedSrId).catch(() => []),
        ]);

        if (!ignore) {
          setSrDetail(detailRes);
          setExtraPayments(paymentsRes);
          setExtraRefunds(refundsRes);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to fetch 360 detail:", err);
          showError("Unable to load service request dossier: " + (err.message || "Unknown error"));
        }
      } finally {
        if (!ignore) {
          setIsLoadingDetail(false);
        }
      }
    }

    fetchDetail();
    return () => {
      ignore = true;
    };
  }, [selectedSrId, showError]);

  // Handler to open 360 Modal
  const handleOpen360 = (id) => {
    setIsLoadingDetail(true);
    setSelectedSrId(id);
    setSrDetail(null);
    setExtraPayments(null);
    setExtraRefunds(null);
    setDetailTab("overview");
    updateUrlParams({
      search: debouncedSearch,
      status: statusFilter,
      city: cityFilter,
      startDate,
      endDate,
      sort: sortBy,
      direction: sortDir,
      page,
      size: pageSize,
      inspect: id,
    });
  };

  // Handler to close 360 Modal
  const handleClose360 = () => {
    setSelectedSrId(null);
    setSrDetail(null);
    updateUrlParams({
      search: debouncedSearch,
      status: statusFilter,
      city: cityFilter,
      startDate,
      endDate,
      sort: sortBy,
      direction: sortDir,
      page,
      size: pageSize,
      inspect: undefined,
    });
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("ALL");
    setCityFilter("");
    setStartDate("");
    setEndDate("");
    setSortBy("createdAt");
    setSortDir("DESC");
    setPage(0);
  };

  // Manual refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadMarketplaceData(true);
  };

  // Sort toggle helper
  const handleSortToggle = (column) => {
    if (sortBy === column) {
      setSortDir((prev) => (prev === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(column);
      setSortDir("DESC");
    }
    setPage(0);
  };

  // Pagination calculation
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 0;
  const startRow = totalElements === 0 ? 0 : page * pageSize + 1;
  const endRow = Math.min((page + 1) * pageSize, totalElements);

  // Transfers filter helper from opportunities
  const transferredOpps = (srDetail?.opportunities || []).filter((o) => o.transferred);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="Global Marketplace & Service Request Control Center"
        subtitle="Platform-wide observability, matching oversight, fee audit, and service request 360° diagnostics."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Marketplace & Service Requests" },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
            Refresh
          </Button>
        }
      />

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Requests */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Requests</span>
            <span className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {summary ? Number(summary.totalServiceRequests ?? summary.totalRequests ?? 0).toLocaleString() : "—"}
            </span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Platform lifetime</span>
        </div>

        {/* Active & Matching */}
        <div className="bg-white rounded-xl p-4 border border-blue-200 bg-blue-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Matching / Active</span>
            <span className="p-2 bg-blue-100 rounded-lg text-blue-700">
              <Radio className="w-4 h-4 animate-pulse" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-900 tracking-tight">
              {summary ? Number(summary.matchingRequests ?? 0).toLocaleString() : "—"}
            </span>
          </div>
          <span className="text-xs text-blue-600 mt-1 block">In partner broadcast</span>
        </div>

        {/* Assigned & Won */}
        <div className="bg-white rounded-xl p-4 border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Assigned / Won</span>
            <span className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-900 tracking-tight">
              {summary ? Number(summary.assignedRequests ?? 0).toLocaleString() : "—"}
            </span>
          </div>
          <span className="text-xs text-emerald-600 mt-1 block">Claimed by workshops</span>
        </div>

        {/* Transferred */}
        <div className="bg-white rounded-xl p-4 border border-purple-200 bg-purple-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Transferred</span>
            <span className="p-2 bg-purple-100 rounded-lg text-purple-700">
              <ArrowRightLeft className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-900 tracking-tight">
              {summary ? Number(summary.transferredOpportunities ?? 0).toLocaleString() : "—"}
            </span>
          </div>
          <span className="text-xs text-purple-600 mt-1 block">Re-routed opportunities</span>
        </div>

        {/* Lost / Refunded */}
        <div className="bg-white rounded-xl p-4 border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Lost / Refunds</span>
            <span className="p-2 bg-amber-100 rounded-lg text-amber-700">
              <RotateCcw className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-900 tracking-tight">
              {summary ? Number(summary.totalRefunds ?? summary.refundsCount ?? 0).toLocaleString() : "—"}
            </span>
          </div>
          <span className="text-xs text-amber-700 mt-1 block font-medium">
            {summary ? formatCurrency(summary.totalRefundedAmount ?? 0) : "—"} refunded
          </span>
        </div>

        {/* Acceptance Fee Revenue */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Fee Revenue</span>
            <span className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700 tracking-tight">
              {summary ? formatCurrency(summary.totalAcceptanceRevenue ?? summary.totalRevenueCollected ?? 0) : "—"}
            </span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {summary ? `${Number(summary.totalSuccessfulPayments ?? summary.successfulPaymentsCount ?? 0).toLocaleString()} paid claims` : "—"}
          </span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search SR-XXXX, customer, phone, vehicle reg..."
              className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-white focus:bg-white"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {isSearching && (
              <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                Typing...
              </span>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="MATCHING">Matching (Live)</option>
              <option value="ACCEPTED">Accepted / Won</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>

          {/* City Filter */}
          <div className="md:col-span-2">
            <input
              type="text"
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setPage(0);
              }}
              placeholder="Filter by city..."
              className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Start Date */}
          <div className="md:col-span-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(0);
              }}
              className="w-full py-2 px-2.5 text-xs text-slate-700 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              title="Filter from date"
            />
          </div>

          {/* End Date */}
          <div className="md:col-span-2">
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(0);
              }}
              className="w-full py-2 px-2.5 text-xs text-slate-700 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              title="Filter to date"
            />
          </div>
        </div>

        {/* Action strip & active filters tag */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span>
              Showing <strong className="text-slate-800">{totalElements}</strong> matching service requests
            </span>
            {(statusFilter !== "ALL" || cityFilter || startDate || endDate || debouncedSearch) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-blue-600 hover:text-blue-800 font-medium ml-2 underline underline-offset-2"
              >
                Reset All Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
              className="py-1 px-2 border border-slate-200 rounded-md text-xs bg-white"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {error ? (
        <ErrorState
          title="Error Loading Control Center"
          message={error}
          onRetry={loadMarketplaceData}
        />
      ) : isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-6 w-24" />
          </div>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          ))}
        </div>
      ) : (data?.content || []).length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs">
          <EmptyState
            icon={Briefcase}
            title="No Service Requests Found"
            description="No customer service requests match your search criteria or filter configuration."
            action={
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Clear All Filters
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider select-none">
                  <tr>
                    <th
                      className="py-3.5 px-4 cursor-pointer hover:text-slate-900"
                      onClick={() => handleSortToggle("id")}
                    >
                      <div className="flex items-center gap-1">
                        <span>Reference</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Vehicle</th>
                    <th className="py-3.5 px-4">Services Requested</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th
                      className="py-3.5 px-4 cursor-pointer hover:text-slate-900"
                      onClick={() => handleSortToggle("totalEstimatedPrice")}
                    >
                      <div className="flex items-center gap-1">
                        <span>Est. Amount</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4">Assigned Partner</th>
                    <th className="py-3.5 px-4 text-center">Matched</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th
                      className="py-3.5 px-4 cursor-pointer hover:text-slate-900"
                      onClick={() => handleSortToggle("createdAt")}
                    >
                      <div className="flex items-center gap-1">
                        <span>Created</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.content.map((sr) => (
                    <tr
                      key={sr.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => handleOpen360(sr.id)}
                    >
                      {/* Reference */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-blue-600 flex items-center gap-1.5 group-hover:underline">
                          <span>{sr.requestReference || `SR-${sr.id}`}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          ID: #{sr.id}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">
                          {sr.customerName || "Customer #" + sr.customerId}
                        </div>
                        <div className="text-xs text-slate-500 truncate max-w-[140px]">
                          {sr.customerPhone || sr.customerEmail || "—"}
                        </div>
                      </td>

                      {/* Vehicle */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">
                          {sr.vehicleMake} {sr.vehicleModel}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <span className="font-mono">{sr.registrationNumber || "—"}</span>
                          {sr.vehicleYear && <span>({sr.vehicleYear})</span>}
                        </div>
                      </td>

                      {/* Services */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-1 max-w-[200px]">
                          {sr.serviceNames && sr.serviceNames.length > 0 ? (
                            <>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 truncate max-w-[140px]">
                                {sr.serviceNames[0]}
                              </span>
                              {sr.serviceNames.length > 1 && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700">
                                  +{sr.serviceNames.length - 1}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-slate-400">General Service</span>
                          )}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-xs font-medium text-slate-800 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{sr.city || "—"}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 block pl-4.5">
                          {sr.pincode || ""}
                        </span>
                      </td>

                      {/* Estimated Price */}
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-900">
                        {formatCurrency(sr.totalEstimatedPrice)}
                      </td>

                      {/* Assigned Workshop */}
                      <td className="py-3 px-4">
                        {sr.assignedWorkshopName ? (
                          <div className="flex items-center gap-1.5 text-emerald-700 font-medium text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate max-w-[130px]" title={sr.assignedWorkshopName}>
                              {sr.assignedWorkshopName}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Opportunity Count */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {sr.opportunityCount || 0} matched
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getRequestStatusBadge(sr.status)}
                      </td>

                      {/* Created At */}
                      <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-500">
                        <div>{formatDate(sr.createdAt)}</div>
                        <div className="text-[10px] text-slate-400">
                          {sr.createdAt ? new Date(sr.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                        </div>
                      </td>

                      {/* Action Button */}
                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => handleOpen360(sr.id)}
                          className="flex items-center gap-1 font-medium"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect 360°
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Responsive Cards View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
            {data.content.map((sr) => (
              <div
                key={sr.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-blue-600">
                      {sr.requestReference || `SR-${sr.id}`}
                    </span>
                    <h4 className="font-medium text-slate-900 text-sm mt-0.5">
                      {sr.vehicleMake} {sr.vehicleModel} ({sr.registrationNumber || "—"})
                    </h4>
                  </div>
                  {getRequestStatusBadge(sr.status)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Customer</span>
                    <span className="font-medium text-slate-800">{sr.customerName || "—"}</span>
                    <span className="block text-slate-500 text-[11px]">{sr.customerPhone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Location</span>
                    <span className="font-medium text-slate-800">{sr.city || "—"}</span>
                    <span className="block text-slate-500 text-[11px]">{sr.pincode}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Assigned Partner</span>
                    <span className="font-medium text-slate-800">
                      {sr.assignedWorkshopName || "Unassigned"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Total Est. Price</span>
                    <span className="font-bold text-slate-900">{formatCurrency(sr.totalEstimatedPrice)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    {sr.opportunityCount || 0} workshops matched
                  </span>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => handleOpen360(sr.id)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Inspect 360°
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Strip */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white px-4 py-3 rounded-xl border border-slate-200 text-xs shadow-xs">
            <div className="text-slate-600">
              Showing <span className="font-semibold text-slate-900">{startRow}</span> to{" "}
              <span className="font-semibold text-slate-900">{endRow}</span> of{" "}
              <span className="font-semibold text-slate-900">{totalElements}</span> requests
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="xs"
                onClick={() => setPage(0)}
                disabled={page === 0}
                title="First Page"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Prev
              </Button>

              <span className="px-3 py-1 font-medium text-slate-700 bg-slate-100 rounded-md">
                Page {page + 1} of {Math.max(1, totalPages)}
              </span>

              <Button
                variant="outline"
                size="xs"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Next
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => setPage(totalPages - 1)}
                disabled={page >= totalPages - 1}
                title="Last Page"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 360° SERVICE REQUEST DIAGNOSTIC DRAWER / MODAL                            */}
      {/* ========================================================================= */}
      {selectedSrId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={handleClose360}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 gap-3 shrink-0">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl shrink-0">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                      {srDetail?.requestReference || `SR-${selectedSrId}`}
                    </h3>
                    {srDetail && getRequestStatusBadge(srDetail.status)}
                    <span className="text-xs text-slate-500 font-mono">
                      ID: #{selectedSrId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Created on {formatDateTime(srDetail?.createdAt)} • Customer:{" "}
                    <strong className="text-slate-700">
                      {srDetail?.customerName || "Customer #" + (srDetail?.customerId || "—")}
                    </strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={handleClose360}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs Header */}
            <div className="flex overflow-x-auto border-b border-slate-200 bg-white px-4 shrink-0 no-scrollbar">
              {[
                { id: "overview", label: "Overview & Schedule", icon: Calendar },
                {
                  id: "services",
                  label: "Services Requested",
                  icon: Wrench,
                  count: srDetail?.items?.length,
                },
                {
                  id: "opportunities",
                  label: "Workshop Opportunities",
                  icon: Radio,
                  count: srDetail?.opportunities?.length,
                },
                {
                  id: "payments",
                  label: "Payment Audit",
                  icon: CreditCard,
                  count: extraPayments?.length,
                },
                {
                  id: "refunds",
                  label: "Refund Audit",
                  icon: RotateCcw,
                  count: extraRefunds?.length,
                },
                {
                  id: "transfers",
                  label: "Transfers",
                  icon: ArrowRightLeft,
                  count: transferredOpps.length,
                },
                {
                  id: "timeline",
                  label: "Audit Timeline",
                  icon: History,
                  count: srDetail?.timeline?.length,
                },
                { id: "location", label: "Location & Geofence", icon: MapPin },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = detailTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setDetailTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                      isActive
                        ? "border-blue-600 text-blue-600 bg-blue-50/20"
                        : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span
                        className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          isActive
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Modal Body / Tab Panes */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-slate-50/40">
              {isLoadingDetail ? (
                <div className="space-y-4 py-8">
                  <Skeleton className="h-8 w-64" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-32 rounded-xl" />
                    <Skeleton className="h-32 rounded-xl" />
                  </div>
                  <Skeleton className="h-48 rounded-xl" />
                </div>
              ) : !srDetail ? (
                <div className="py-12 text-center text-slate-500">
                  Failed to load details for this service request.
                </div>
              ) : (
                <>
                  {/* TAB 1: OVERVIEW & SCHEDULE */}
                  {detailTab === "overview" && (
                    <div className="space-y-5">
                      {/* Top Dossier Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Customer Card */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
                          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                            <User className="w-4 h-4 text-blue-600" />
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                              Customer Dossier
                            </h4>
                          </div>
                          <div className="text-xs space-y-1.5">
                            <div>
                              <span className="text-slate-400 block text-[11px]">Full Name</span>
                              <span className="font-semibold text-slate-900">
                                {srDetail.customerName || "Customer #" + srDetail.customerId}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[11px]">Phone</span>
                              <a
                                href={`tel:${srDetail.customerPhone}`}
                                className="font-mono text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3" />
                                {srDetail.customerPhone || "Not provided"}
                              </a>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[11px]">Email</span>
                              <span className="text-slate-700 truncate block">
                                {srDetail.customerEmail || "Not provided"}
                              </span>
                            </div>
                            <div className="pt-1">
                              <Link
                                href={`/admin/customers/${srDetail.customerId}`}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                              >
                                View Customer 360°
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        </div>

                        {/* Vehicle Card */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
                          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                            <Car className="w-4 h-4 text-emerald-600" />
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                              Vehicle Details
                            </h4>
                          </div>
                          <div className="text-xs space-y-1.5">
                            <div>
                              <span className="text-slate-400 block text-[11px]">Vehicle</span>
                              <span className="font-semibold text-slate-900">
                                {srDetail.vehicleMake} {srDetail.vehicleModel}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[11px]">Registration No</span>
                              <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800 inline-block">
                                {srDetail.registrationNumber || "Unregistered"}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[11px]">Model Year</span>
                              <span className="text-slate-700">{srDetail.vehicleYear || "—"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Assigned Workshop Card */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
                          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                            <CheckCircle2 className="w-4 h-4 text-purple-600" />
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                              Assigned Partner
                            </h4>
                          </div>
                          {srDetail.assignedWorkshopId ? (
                            <div className="text-xs space-y-1.5">
                              <div>
                                <span className="text-slate-400 block text-[11px]">Workshop Name</span>
                                <span className="font-semibold text-slate-900">
                                  {srDetail.assignedWorkshopName}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[11px]">Phone</span>
                                <span className="text-slate-700">{srDetail.assignedWorkshopPhone || "—"}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[11px]">City / Address</span>
                                <span className="text-slate-700">
                                  {srDetail.assignedWorkshopCity || srDetail.assignedWorkshopAddress || "—"}
                                </span>
                              </div>
                              <div className="pt-1">
                                <Link
                                  href={`/admin/workshops/${srDetail.assignedWorkshopId}`}
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 hover:text-purple-800"
                                >
                                  View Partner 360°
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-500 py-3 text-center">
                              <Radio className="w-6 h-6 mx-auto text-slate-300 mb-1" />
                              <span>Not yet assigned to a workshop</span>
                              <p className="text-[11px] text-slate-400 mt-1">
                                Currently broadcasting or pending workshop claim.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Schedule & Financial Summary Card */}
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            Schedule & Financial Summary
                          </h4>
                          <span className="text-xs font-semibold text-slate-900">
                            Total Est: <span className="text-blue-600 text-sm">{formatCurrency(srDetail.totalEstimatedPrice)}</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[11px]">Preferred Date</span>
                            <span className="font-medium text-slate-800">
                              {formatDate(srDetail.preferredDate)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Preferred Time Slot</span>
                            <span className="font-medium text-slate-800">
                              {srDetail.preferredTimeSlot || "Flexible"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Associated Booking ID</span>
                            <span className="font-mono text-slate-700">
                              {srDetail.bookingId ? `#BK-${srDetail.bookingId}` : "None"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Booking Status</span>
                            <span className="font-medium text-slate-700">
                              {srDetail.bookingStatus || "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Customer Notes */}
                        {srDetail.notes && (
                          <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-lg text-xs">
                            <span className="font-semibold text-amber-900 block mb-0.5">Customer Instructions / Notes:</span>
                            <p className="text-amber-800">{srDetail.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: SERVICES REQUESTED */}
                  {detailTab === "services" && (
                    <div className="space-y-4">
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Itemized Service Request Breakdown
                          </h4>
                          <span className="text-xs text-slate-500">
                            {srDetail.items?.length || 0} catalog services
                          </span>
                        </div>

                        {(srDetail.items || []).length === 0 ? (
                          <div className="p-6 text-center text-slate-500 text-xs">
                            No service items recorded for this request.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase tracking-wider">
                                <tr>
                                  <th className="py-2.5 px-4">Service</th>
                                  <th className="py-2.5 px-4">Category</th>
                                  <th className="py-2.5 px-4 text-center">Qty</th>
                                  <th className="py-2.5 px-4">Base Price</th>
                                  <th className="py-2.5 px-4">Discount Applied</th>
                                  <th className="py-2.5 px-4 text-right">Final Snapshot</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {srDetail.items.map((item) => (
                                  <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="py-3 px-4 font-semibold text-slate-900">
                                      {item.serviceName}
                                      {item.notes && (
                                        <span className="block text-[11px] font-normal text-slate-400">
                                          {item.notes}
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">
                                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                                        {item.serviceCategory || "General"}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-center font-medium text-slate-800">
                                      {item.quantity || 1}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">
                                      {formatCurrency(item.itemPriceSnapshot)}
                                    </td>
                                    <td className="py-3 px-4 text-emerald-600">
                                      {item.discountApplied && item.discountApplied > 0
                                        ? `-${formatCurrency(item.discountApplied)}`
                                        : "—"}
                                    </td>
                                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                                      {formatCurrency(item.finalPrice || item.itemPriceSnapshot)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="bg-slate-50 border-t border-slate-200 font-semibold text-slate-900">
                                <tr>
                                  <td colSpan={5} className="py-3 px-4 text-right uppercase text-xs">
                                    Total Estimated Order Price:
                                  </td>
                                  <td className="py-3 px-4 text-right text-sm text-blue-600 font-bold">
                                    {formatCurrency(srDetail.totalEstimatedPrice)}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: WORKSHOP OPPORTUNITIES */}
                  {detailTab === "opportunities" && (
                    <div className="space-y-4">
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                              Dispatched Workshop Opportunities
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              List of all workshops matched via geo-radius and notified for this customer request.
                            </p>
                          </div>
                          <span className="text-xs font-medium text-slate-600">
                            {srDetail.opportunities?.length || 0} workshops matched
                          </span>
                        </div>

                        {(srDetail.opportunities || []).length === 0 ? (
                          <div className="p-8 text-center text-slate-500 text-xs">
                            <Radio className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                            No workshop opportunities have been generated yet.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase tracking-wider">
                                <tr>
                                  <th className="py-2.5 px-4">Workshop</th>
                                  <th className="py-2.5 px-4">Distance</th>
                                  <th className="py-2.5 px-4">Opportunity Status</th>
                                  <th className="py-2.5 px-4 text-center">Fee Paid</th>
                                  <th className="py-2.5 px-4 text-center">Winner / Locked</th>
                                  <th className="py-2.5 px-4">Transferred</th>
                                  <th className="py-2.5 px-4">Timestamps</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {srDetail.opportunities.map((opp) => (
                                  <tr
                                    key={opp.id}
                                    className={`hover:bg-slate-50 transition-colors ${
                                      opp.isWinner ? "bg-emerald-50/30" : ""
                                    }`}
                                  >
                                    <td className="py-3 px-4">
                                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                        <span>{opp.workshopName}</span>
                                        {opp.isWinner && (
                                          <Badge variant="success" size="xs">Winner</Badge>
                                        )}
                                      </div>
                                      <div className="text-[11px] text-slate-500">
                                        {opp.workshopCity} • {opp.workshopPhone}
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 text-slate-600 font-medium">
                                      {opp.distanceKm ? `${opp.distanceKm} km` : "In range"}
                                    </td>
                                    <td className="py-3 px-4">
                                      {getOpportunityStatusBadge(opp.status)}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                      {opp.feePaid ? (
                                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                                          <Check className="w-3.5 h-3.5" />
                                          Paid ({formatCurrency(opp.feeAmount)})
                                        </span>
                                      ) : (
                                        <span className="text-slate-400">Unpaid</span>
                                      )}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                      {opp.isWinner ? (
                                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                                          <ShieldCheck className="w-4 h-4" />
                                          Unlocked
                                        </span>
                                      ) : (
                                        <span className="text-slate-400">—</span>
                                      )}
                                    </td>
                                    <td className="py-3 px-4">
                                      {opp.transferred ? (
                                        <Badge variant="purple" size="xs">Transferred</Badge>
                                      ) : (
                                        <span className="text-slate-400">No</span>
                                      )}
                                    </td>
                                    <td className="py-3 px-4 text-[11px] text-slate-500 space-y-0.5">
                                      <div>Dispatched: {formatDateTime(opp.createdAt)}</div>
                                      {opp.respondedAt && (
                                        <div className="text-slate-700">
                                          Responded: {formatDateTime(opp.respondedAt)}
                                        </div>
                                      )}
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

                  {/* TAB 4: PAYMENT AUDIT */}
                  {detailTab === "payments" && (
                    <div className="space-y-4">
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                              Opportunity Acceptance Fee Payments
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Audit trail of payments made by workshops trying to claim this lead.
                            </p>
                          </div>
                          <span className="text-xs font-semibold text-emerald-700">
                            {extraPayments?.length || 0} payment records
                          </span>
                        </div>

                        {(!extraPayments || extraPayments.length === 0) ? (
                          <div className="p-8 text-center text-slate-500 text-xs">
                            <CreditCard className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                            No acceptance fee payments recorded for this request.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase tracking-wider">
                                <tr>
                                  <th className="py-2.5 px-4">Transaction / Ref</th>
                                  <th className="py-2.5 px-4">Workshop</th>
                                  <th className="py-2.5 px-4">Amount</th>
                                  <th className="py-2.5 px-4">Status</th>
                                  <th className="py-2.5 px-4">Gateway Reference</th>
                                  <th className="py-2.5 px-4">Timestamps</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {extraPayments.map((p) => (
                                  <tr key={p.id} className="hover:bg-slate-50">
                                    <td className="py-3 px-4">
                                      <span className="font-mono font-semibold text-slate-900">
                                        {p.transactionId || `PAY-${p.id}`}
                                      </span>
                                      <span className="block text-[11px] text-slate-400">
                                        Type: {p.paymentType || "ACCEPTANCE_FEE"}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 font-medium text-slate-800">
                                      {p.workshopName || `Workshop #${p.workshopId}`}
                                    </td>
                                    <td className="py-3 px-4 font-bold text-slate-900">
                                      {formatCurrency(p.amount)}
                                    </td>
                                    <td className="py-3 px-4">
                                      {getPaymentStatusBadge(p.paymentStatus)}
                                    </td>
                                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                                      {p.gatewayPaymentId || "—"}
                                    </td>
                                    <td className="py-3 px-4 text-[11px] text-slate-500">
                                      <div>Initiated: {formatDateTime(p.createdAt)}</div>
                                      {p.paidAt && <div>Paid: {formatDateTime(p.paidAt)}</div>}
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

                  {/* TAB 5: REFUND AUDIT */}
                  {detailTab === "refunds" && (
                    <div className="space-y-4">
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                              Marketplace Refund Audit
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Automatic refunds generated in acceptance race conditions or cancellation scenarios.
                            </p>
                          </div>
                          <span className="text-xs font-semibold text-amber-700">
                            {extraRefunds?.length || 0} refunds
                          </span>
                        </div>

                        {(!extraRefunds || extraRefunds.length === 0) ? (
                          <div className="p-8 text-center text-slate-500 text-xs">
                            <RotateCcw className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                            No refunds recorded for this service request. No race condition losses occurred.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase tracking-wider">
                                <tr>
                                  <th className="py-2.5 px-4">Refund ID</th>
                                  <th className="py-2.5 px-4">Workshop</th>
                                  <th className="py-2.5 px-4">Amount</th>
                                  <th className="py-2.5 px-4">Reason</th>
                                  <th className="py-2.5 px-4">Status</th>
                                  <th className="py-2.5 px-4">Initiated By</th>
                                  <th className="py-2.5 px-4">Processed At</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {extraRefunds.map((r) => (
                                  <tr key={r.id} className="hover:bg-slate-50">
                                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                                      #REF-{r.id}
                                    </td>
                                    <td className="py-3 px-4 font-medium text-slate-800">
                                      {r.workshopName || `Workshop #${r.workshopId}`}
                                    </td>
                                    <td className="py-3 px-4 font-bold text-amber-700">
                                      {formatCurrency(r.amount)}
                                    </td>
                                    <td className="py-3 px-4 text-slate-700">
                                      {r.reason || "Race condition / second-payer refund"}
                                    </td>
                                    <td className="py-3 px-4">
                                      {getRefundStatusBadge(r.refundStatus)}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">
                                      {r.initiatedBy || "SYSTEM"}
                                    </td>
                                    <td className="py-3 px-4 text-[11px] text-slate-500">
                                      {formatDateTime(r.processedAt || r.createdAt)}
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

                  {/* TAB 6: TRANSFER HISTORY */}
                  {detailTab === "transfers" && (
                    <div className="space-y-4">
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                              Opportunity Transfer History
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Record of re-routing when a workshop cannot fulfill an accepted request.
                            </p>
                          </div>
                          <span className="text-xs font-medium text-purple-700">
                            {transferredOpps.length} transferred
                          </span>
                        </div>

                        {transferredOpps.length === 0 ? (
                          <div className="p-8 text-center text-slate-500 text-xs">
                            <ArrowRightLeft className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                            No transfers recorded for this service request.
                          </div>
                        ) : (
                          <div className="p-4 space-y-3">
                            {transferredOpps.map((opp) => (
                              <div
                                key={opp.id}
                                className="p-3.5 bg-purple-50/50 border border-purple-200 rounded-xl flex items-start gap-3"
                              >
                                <ArrowRightLeft className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
                                <div className="space-y-1 text-xs">
                                  <div className="font-semibold text-slate-900">
                                    Transferred from Workshop: {opp.workshopName}
                                  </div>
                                  <div className="text-slate-600">
                                    <strong>Reason:</strong> {opp.transferReason || "Partner capacity constraint / re-broadcast"}
                                  </div>
                                  <div className="text-[11px] text-slate-400">
                                    Recorded at: {formatDateTime(opp.respondedAt || opp.createdAt)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 7: AUDIT TIMELINE */}
                  {detailTab === "timeline" && (
                    <div className="space-y-4">
                      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
                          Chronological Marketplace Lifecycle Events
                        </h4>

                        {(!srDetail.timeline || srDetail.timeline.length === 0) ? (
                          <div className="text-center py-8 text-slate-500 text-xs">
                            No audit events logged for this request yet.
                          </div>
                        ) : (
                          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                            {srDetail.timeline.map((evt, idx) => (
                              <div key={evt.id || idx} className="relative group">
                                <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-white border-2 border-blue-600 group-hover:scale-110 transition-transform" />
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-xs text-slate-900">
                                      {evt.eventType}
                                    </span>
                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                      {evt.actorType}
                                    </span>
                                    <span className="text-[11px] text-slate-400">
                                      {formatDateTime(evt.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-600">
                                    {evt.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 8: LOCATION & GEOFENCE */}
                  {detailTab === "location" && (
                    <div className="space-y-4">
                      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                          <Navigation className="w-5 h-5 text-blue-600" />
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Customer Pickup & Service Location
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-2">
                            <div>
                              <span className="text-slate-400 block text-[11px]">Address</span>
                              <span className="font-medium text-slate-800">
                                {srDetail.pickupAddress || "Not specified"}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[11px]">City & Pincode</span>
                              <span className="font-medium text-slate-800">
                                {srDetail.city || "—"}, {srDetail.pincode || "—"}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <span className="text-slate-400 block text-[11px]">Latitude</span>
                              <span className="font-mono text-slate-700">
                                {srDetail.latitude ? srDetail.latitude.toString() : "Not geotagged"}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[11px]">Longitude</span>
                              <span className="font-mono text-slate-700">
                                {srDetail.longitude ? srDetail.longitude.toString() : "Not geotagged"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Matched Geofenced Workshops */}
                        <div className="pt-3 border-t border-slate-100">
                          <span className="text-xs font-semibold text-slate-700 block mb-2">
                            Workshops in Matching Radius:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {(srDetail.opportunities || []).map((opp) => (
                              <div
                                key={opp.id}
                                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs flex items-center justify-between"
                              >
                                <span className="font-medium text-slate-800 truncate mr-2">
                                  {opp.workshopName}
                                </span>
                                <span className="font-mono text-[11px] text-blue-600 shrink-0">
                                  {opp.distanceKm ? `${opp.distanceKm} km` : "Matched"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <span>
                Service Request Reference: <strong>{srDetail?.requestReference || `SR-${selectedSrId}`}</strong>
              </span>
              <Button variant="secondary" size="xs" onClick={handleClose360}>
                Close Dossier
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminMarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 max-w-7xl mx-auto p-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-6 gap-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      }
    >
      <MarketplaceControlCenterContent />
    </Suspense>
  );
}
