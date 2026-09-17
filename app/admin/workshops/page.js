"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { adminApi } from "../../../lib/admin";
import { useToast } from "../../../context/ToastContext";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import PageHeader from "../../../components/ui/PageHeader";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import EmptyState from "../../../components/ui/EmptyState";
import ErrorState from "../../../components/ui/ErrorState";
import { Skeleton } from "../../../components/ui/Skeleton";
import {
  Building2,
  Search,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ShieldCheck,
  ShieldAlert,
  Clock,
  MapPin,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Briefcase,
  Wrench,
  Compass,
} from "lucide-react";

// Formatter for date
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

// Verification badge styling
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

function WorkshopRegistryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useToast();

  // Read URL query state with safe defaults
  const initialSearch = searchParams.get("search") || "";
  const initialStatus = searchParams.get("status") || "ALL";
  const initialVerification = searchParams.get("verification") || "ALL";
  const initialActivity = searchParams.get("activity") || "ALL";
  const initialSort = searchParams.get("sort") || "createdAt";
  const initialDirection = searchParams.get("direction") || "DESC";
  const initialPage = parseInt(searchParams.get("page") || "0", 10);
  const initialSize = parseInt(searchParams.get("size") || "20", 10);

  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [verificationFilter, setVerificationFilter] = useState(initialVerification);
  const [activityFilter, setActivityFilter] = useState(initialActivity);
  const [sortBy, setSortBy] = useState(initialSort);
  const [sortDir, setSortDir] = useState(initialDirection);
  const [page, setPage] = useState(isNaN(initialPage) ? 0 : initialPage);
  const [pageSize, setPageSize] = useState(isNaN(initialSize) ? 20 : initialSize);

  const [data, setData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status Change Dialog State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusTargetWorkshop, setStatusTargetWorkshop] = useState(null);
  const [statusTargetActive, setStatusTargetActive] = useState(false);
  const [statusReason, setStatusReason] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const isSearching = search !== debouncedSearch;

  // Debounce search input by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Sync state changes to browser URL query parameters
  const updateUrlParams = useCallback(
    (newParams) => {
      const params = new URLSearchParams();
      if (newParams.search) params.set("search", newParams.search);
      if (newParams.status && newParams.status !== "ALL") params.set("status", newParams.status);
      if (newParams.verification && newParams.verification !== "ALL") params.set("verification", newParams.verification);
      if (newParams.activity && newParams.activity !== "ALL") params.set("activity", newParams.activity);
      if (newParams.sort && newParams.sort !== "createdAt") params.set("sort", newParams.sort);
      if (newParams.direction && newParams.direction !== "DESC") params.set("direction", newParams.direction);
      if (newParams.page && newParams.page > 0) params.set("page", newParams.page);
      if (newParams.size && newParams.size !== 20) params.set("size", newParams.size);

      const qs = params.toString();
      router.replace(`/admin/workshops${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router]
  );

  // Load workshops asynchronously
  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const [listResult, summaryResult] = await Promise.all([
          adminApi.getWorkshops({
            page,
            size: pageSize,
            search: debouncedSearch,
            status: statusFilter,
            verificationStatus: verificationFilter,
            activity: activityFilter,
            sort: sortBy,
            direction: sortDir,
          }),
          adminApi.getWorkshopSummary().catch(() => null),
        ]);

        if (!ignore) {
          setData(listResult);
          if (summaryResult) {
            setSummary(summaryResult);
          }
          setError(null);
          updateUrlParams({
            search: debouncedSearch,
            status: statusFilter,
            verification: verificationFilter,
            activity: activityFilter,
            sort: sortBy,
            direction: sortDir,
            page,
            size: pageSize,
          });
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load workshop registry:", err);
          setError(err.message || "Failed to load workshops. Please try again.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [page, pageSize, debouncedSearch, statusFilter, verificationFilter, activityFilter, sortBy, sortDir, updateUrlParams]);

  // Fetch workshops for manual refresh or action callback
  const fetchWorkshops = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [listResult, summaryResult] = await Promise.all([
        adminApi.getWorkshops({
          page,
          size: pageSize,
          search: debouncedSearch,
          status: statusFilter,
          verificationStatus: verificationFilter,
          activity: activityFilter,
          sort: sortBy,
          direction: sortDir,
        }),
        adminApi.getWorkshopSummary().catch(() => null),
      ]);

      setData(listResult);
      if (summaryResult) {
        setSummary(summaryResult);
      }
    } catch (err) {
      setError(err.message || "Failed to load workshops. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(0);
    updateUrlParams({
      search: val,
      status: statusFilter,
      verification: verificationFilter,
      activity: activityFilter,
      sort: sortBy,
      direction: sortDir,
      page: 0,
      size: pageSize,
    });
  };

  const handleClearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
    setPage(0);
    updateUrlParams({
      search: "",
      status: statusFilter,
      verification: verificationFilter,
      activity: activityFilter,
      sort: sortBy,
      direction: sortDir,
      page: 0,
      size: pageSize,
    });
  };

  const handleStatusFilter = (st) => {
    setStatusFilter(st);
    setPage(0);
    updateUrlParams({
      search: debouncedSearch,
      status: st,
      verification: verificationFilter,
      activity: activityFilter,
      sort: sortBy,
      direction: sortDir,
      page: 0,
      size: pageSize,
    });
  };

  const handleVerificationFilter = (ver) => {
    setVerificationFilter(ver);
    setPage(0);
    updateUrlParams({
      search: debouncedSearch,
      status: statusFilter,
      verification: ver,
      activity: activityFilter,
      sort: sortBy,
      direction: sortDir,
      page: 0,
      size: pageSize,
    });
  };

  const handleActivityFilter = (act) => {
    setActivityFilter(act);
    setPage(0);
    updateUrlParams({
      search: debouncedSearch,
      status: statusFilter,
      verification: verificationFilter,
      activity: act,
      sort: sortBy,
      direction: sortDir,
      page: 0,
      size: pageSize,
    });
  };

  const handleSortChange = (newSort) => {
    let newDir = "ASC";
    if (sortBy === newSort) {
      newDir = sortDir === "ASC" ? "DESC" : "ASC";
    } else {
      newDir = newSort === "createdAt" ? "DESC" : "ASC";
    }
    setSortBy(newSort);
    setSortDir(newDir);
    setPage(0);
    updateUrlParams({
      search: debouncedSearch,
      status: statusFilter,
      verification: verificationFilter,
      activity: activityFilter,
      sort: newSort,
      direction: newDir,
      page: 0,
      size: pageSize,
    });
  };

  // Open Status Confirmation Modal
  const openStatusDialog = (workshop, targetActive) => {
    setStatusTargetWorkshop(workshop);
    setStatusTargetActive(targetActive);
    setStatusReason("");
    setStatusModalOpen(true);
  };

  // Confirm Status Change
  const handleConfirmStatusChange = async () => {
    if (!statusTargetWorkshop) return;
    if (!statusTargetActive && (!statusReason || !statusReason.trim())) {
      showError("A reason is required to deactivate or suspend a workshop.");
      return;
    }

    setIsUpdatingStatus(true);
    try {
      await adminApi.updateWorkshopStatus(
        statusTargetWorkshop.id,
        statusTargetActive,
        statusReason.trim()
      );
      showSuccess(
        `Workshop "${statusTargetWorkshop.businessName}" ${
          statusTargetActive ? "activated" : "deactivated"
        } successfully.`
      );
      setStatusModalOpen(false);
      fetchWorkshops();
    } catch (err) {
      showError(err.message || "Failed to update workshop status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Pagination calculation
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 0;
  const currentPage = data?.number || 0;
  const fromIndex = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const toIndex = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Workshops & Service Centres"
        description="Enterprise partner registry: monitor verified automotive facilities, fulfillment capacity, geographic radius, and marketplace performance."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Workshops" },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchWorkshops}
            disabled={isLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        }
      />

      {/* Aggregate KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Workshops
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {summary ? summary.totalWorkshops.toLocaleString() : totalElements.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Registered partner facilities</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Partners
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            {summary ? summary.activeWorkshops.toLocaleString() : "—"}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Eligible for marketplace jobs</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Review
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">
            {summary ? summary.pendingVerificationWorkshops.toLocaleString() : "—"}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Awaiting document verification</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Suspended / Inactive
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-2">
            {summary ? summary.suspendedOrInactiveWorkshops.toLocaleString() : "—"}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Excluded from dispatch engine</p>
        </div>
      </div>

      {/* Search & Filters Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3.5">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by workshop name, owner, phone, email, city, state, or pincode..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 placeholder:text-slate-400 transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {isSearching && (
              <div className="absolute right-8 top-1/2 -translate-y-1/2">
                <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />
              </div>
            )}
          </div>

          {/* Activity & Verification Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Verification Dropdown */}
            <select
              value={verificationFilter}
              onChange={(e) => handleVerificationFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">All Verifications</option>
              <option value="VERIFIED">Verified Only</option>
              <option value="PENDING">Pending Review</option>
              <option value="REJECTED">Rejected</option>
              <option value="SUSPENDED">Suspended</option>
            </select>

            {/* Activity Dropdown */}
            <select
              value={activityFilter}
              onChange={(e) => handleActivityFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">All Activity</option>
              <option value="HAS_ACTIVE_OPPORTUNITIES">Has Active Leads</option>
              <option value="HAS_ACCEPTED_OPPORTUNITIES">Has Accepted Leads</option>
              <option value="HAS_COMPLETED_JOBS">Has Completed Jobs</option>
              <option value="NO_ACTIVITY">No Marketplace Activity</option>
            </select>
          </div>
        </div>

        {/* Operational Status Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-400 mr-1.5">Status:</span>
          {["ALL", "ACTIVE", "INACTIVE"].map((st) => {
            const isActive = statusFilter === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => handleStatusFilter(st)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st === "ALL" ? "All Workshops" : st === "ACTIVE" ? "Active" : "Inactive"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Table / Mobile View */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="p-8">
            <ErrorState
              title="Error loading workshops"
              description={error}
              onRetry={fetchWorkshops}
            />
          </div>
        ) : !data || data.content.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Building2}
              title="No workshops found"
              description={
                search || statusFilter !== "ALL" || verificationFilter !== "ALL" || activityFilter !== "ALL"
                  ? "No registered workshops match your search query and filter criteria."
                  : "No automotive workshops or service centres are currently registered."
              }
              action={
                search || statusFilter !== "ALL" || verificationFilter !== "ALL" || activityFilter !== "ALL" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearch("");
                      setDebouncedSearch("");
                      setStatusFilter("ALL");
                      setVerificationFilter("ALL");
                      setActivityFilter("ALL");
                    }}
                  >
                    Reset All Filters
                  </Button>
                ) : null
              }
            />
          </div>
        ) : (
          <>
            {/* Desktop Information-Dense Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <th
                      className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                      onClick={() => handleSortChange("businessName")}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Workshop</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4">Owner / Contact</th>
                    <th
                      className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                      onClick={() => handleSortChange("city")}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Location & Radius</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4">Verification</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-center">Services</th>
                    <th className="py-3.5 px-4 text-center">Marketplace</th>
                    <th
                      className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                      onClick={() => handleSortChange("createdAt")}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Joined</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.content.map((ws) => (
                    <tr
                      key={ws.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Workshop Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {ws.businessName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <Link
                              href={`/admin/workshops/${ws.id}`}
                              className="font-bold text-slate-900 hover:text-blue-600 transition-colors inline-block"
                            >
                              {ws.businessName}
                            </Link>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                              <span>ID: #{ws.id}</span>
                              {ws.statusReason && (
                                <>
                                  <span>•</span>
                                  <span className="text-amber-600 truncate max-w-[140px]" title={ws.statusReason}>
                                    {ws.statusReason}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Owner / Contact */}
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-900">{ws.ownerName || "—"}</p>
                        <p className="text-[11px] text-slate-500">{ws.phone}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[150px]">{ws.email}</p>
                      </td>

                      {/* Location & Radius */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-slate-900 font-medium">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{ws.city}, {ws.state}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                          <Radio className="w-3 h-3 text-blue-500" />
                          <span className="bg-blue-50 text-blue-700 font-semibold px-1.5 py-0.5 rounded text-[10px]">
                            {ws.serviceRadiusKm} km coverage
                          </span>
                        </div>
                      </td>

                      {/* Verification Status */}
                      <td className="py-3.5 px-4">
                        {getVerificationBadge(ws.verificationStatus)}
                      </td>

                      {/* Operational Status */}
                      <td className="py-3.5 px-4">
                        {ws.isActive ? (
                          <Badge variant="success" size="sm" dot>Active</Badge>
                        ) : (
                          <Badge variant="danger" size="sm" dot>Inactive</Badge>
                        )}
                      </td>

                      {/* Capabilities Count */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full text-xs">
                          <Wrench className="w-3 h-3 text-slate-500" />
                          {ws.capabilitiesCount}
                        </span>
                      </td>

                      {/* Marketplace Activity */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-semibold text-slate-800">
                            {ws.acceptedOpportunitiesCount} / {ws.opportunitiesCount} leads
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {ws.completedJobsCount} completed
                          </span>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-slate-500">
                        {formatDate(ws.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openStatusDialog(ws, !ws.isActive)}
                            className={`text-xs h-7 px-2 ${
                              ws.isActive
                                ? "text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                : "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                            }`}
                          >
                            {ws.isActive ? "Deactivate" : "Activate"}
                          </Button>
                          <Link href={`/admin/workshops/${ws.id}`}>
                            <Button variant="outline" size="sm" className="text-xs h-7 px-2.5 flex items-center gap-1">
                              <span>360°</span>
                              <ChevronRight className="w-3 h-3 text-slate-400" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Cards */}
            <div className="block lg:hidden divide-y divide-slate-100">
              {data.content.map((ws) => (
                <div key={ws.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/admin/workshops/${ws.id}`}
                        className="font-bold text-slate-900 text-sm hover:text-blue-600"
                      >
                        {ws.businessName}
                      </Link>
                      <p className="text-xs text-slate-500">
                        Owner: {ws.ownerName || "—"} • #{ws.id}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getVerificationBadge(ws.verificationStatus)}
                      {ws.isActive ? (
                        <Badge variant="success" size="sm" dot>Active</Badge>
                      ) : (
                        <Badge variant="danger" size="sm" dot>Inactive</Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Location</span>
                      <span className="font-medium">{ws.city}, {ws.state}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Coverage Radius</span>
                      <span className="font-medium text-blue-600">{ws.serviceRadiusKm} km</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Capabilities</span>
                      <span className="font-medium">{ws.capabilitiesCount} services</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Marketplace</span>
                      <span className="font-medium">{ws.acceptedOpportunitiesCount} accepted ({ws.completedJobsCount} done)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-400">Joined {formatDate(ws.createdAt)}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openStatusDialog(ws, !ws.isActive)}
                        className={`text-xs h-7 px-2 ${
                          ws.isActive
                            ? "text-rose-600 hover:bg-rose-50"
                            : "text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        {ws.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Link href={`/admin/workshops/${ws.id}`}>
                        <Button variant="outline" size="sm" className="text-xs h-7 px-3 flex items-center gap-1">
                          <span>View 360°</span>
                          <ChevronRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="py-3 px-4 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>
                  Showing <strong className="text-slate-900">{fromIndex}–{toIndex}</strong> of{" "}
                  <strong className="text-slate-900">{totalElements}</strong> workshops
                </span>
                <span className="text-slate-300">|</span>
                <div className="flex items-center gap-1">
                  <span>Page size:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      const newSize = parseInt(e.target.value, 10);
                      setPageSize(newSize);
                      setPage(0);
                      updateUrlParams({
                        search: debouncedSearch,
                        status: statusFilter,
                        verification: verificationFilter,
                        activity: activityFilter,
                        sort: sortBy,
                        direction: sortDir,
                        page: 0,
                        size: newSize,
                      });
                    }}
                    className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-700"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              {/* Page Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 0 || isLoading}
                  onClick={() => {
                    const prev = Math.max(0, currentPage - 1);
                    setPage(prev);
                    updateUrlParams({
                      search: debouncedSearch,
                      status: statusFilter,
                      verification: verificationFilter,
                      activity: activityFilter,
                      sort: sortBy,
                      direction: sortDir,
                      page: prev,
                      size: pageSize,
                    });
                  }}
                  className="p-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="px-2 py-0.5 font-medium text-slate-700">
                  Page {currentPage + 1} of {Math.max(1, totalPages)}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= totalPages - 1 || isLoading}
                  onClick={() => {
                    const next = currentPage + 1;
                    setPage(next);
                    updateUrlParams({
                      search: debouncedSearch,
                      status: statusFilter,
                      verification: verificationFilter,
                      activity: activityFilter,
                      sort: sortBy,
                      direction: sortDir,
                      page: next,
                      size: pageSize,
                    });
                  }}
                  className="p-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Confirmation Dialog for Status Changes */}
      <ConfirmDialog
        isOpen={statusModalOpen}
        onClose={() => !isUpdatingStatus && setStatusModalOpen(false)}
        onConfirm={handleConfirmStatusChange}
        title={statusTargetActive ? "Activate Workshop" : "Deactivate Workshop"}
        description={
          statusTargetActive
            ? "Activating this workshop will restore its eligibility in the marketplace dispatch engine."
            : "Deactivating this workshop will exclude it from receiving new marketplace leads. Existing historical records, wallet balances, and completed jobs remain safe and immutable."
        }
        confirmLabel={statusTargetActive ? "Activate Workshop" : "Deactivate Workshop"}
        confirmVariant={statusTargetActive ? "primary" : "danger"}
        isLoading={isUpdatingStatus}
      >
        {statusTargetWorkshop && (
          <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Workshop</span>
              <span className="font-bold text-slate-900">{statusTargetWorkshop.businessName}</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-400 block font-medium">Current Status</span>
                <span className="font-semibold text-slate-700">
                  {statusTargetWorkshop.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">New Status</span>
                <span className={`font-bold ${statusTargetActive ? "text-emerald-600" : "text-rose-600"}`}>
                  {statusTargetActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
            </div>

            {!statusTargetActive && (
              <div className="pt-2 border-t border-slate-200">
                <label className="block font-semibold text-slate-700 mb-1">
                  Reason for Deactivation <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Provide audit rationale (e.g., SLA violation, partner request, quality inspection failure)..."
                  className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
            )}
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}

export default function AdminWorkshopsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      }
    >
      <WorkshopRegistryContent />
    </Suspense>
  );
}
