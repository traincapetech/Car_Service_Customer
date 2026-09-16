"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { adminApi } from "../../../lib/admin";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import PageHeader from "../../../components/ui/PageHeader";
import EmptyState from "../../../components/ui/EmptyState";
import ErrorState from "../../../components/ui/ErrorState";
import { Skeleton } from "../../../components/ui/Skeleton";
import {
  Users,
  Search,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ShieldCheck,
  UserCheck,
  RefreshCw,
  Eye,
} from "lucide-react";

// Formatter for customer registration date
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

// Generate consistent avatar color based on customer id
function getAvatarColor(id = 0) {
  const colors = [
    "bg-blue-100 text-blue-700 border-blue-200",
    "bg-indigo-100 text-indigo-700 border-indigo-200",
    "bg-emerald-100 text-emerald-700 border-emerald-200",
    "bg-purple-100 text-purple-700 border-purple-200",
    "bg-amber-100 text-amber-700 border-amber-200",
    "bg-cyan-100 text-cyan-700 border-cyan-200",
  ];
  return colors[Math.abs(Number(id)) % colors.length] || colors[0];
}

function CustomerRegistryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL query state with safe defaults
  const initialSearch = searchParams.get("search") || "";
  const initialStatus = searchParams.get("status") || "ALL";
  const initialSort = searchParams.get("sort") || "createdAt";
  const initialDirection = searchParams.get("direction") || "DESC";
  const initialPage = parseInt(searchParams.get("page") || "0", 10);
  const initialSize = parseInt(searchParams.get("size") || "20", 10);

  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [sortBy, setSortBy] = useState(initialSort);
  const [sortDir, setSortDir] = useState(initialDirection);
  const [page, setPage] = useState(isNaN(initialPage) ? 0 : initialPage);
  const [pageSize, setPageSize] = useState(isNaN(initialSize) ? 20 : initialSize);

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Purely computed search indicator - no setState in effect needed
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
      if (newParams.sort) params.set("sort", newParams.sort);
      if (newParams.direction) params.set("direction", newParams.direction);
      if (newParams.page > 0) params.set("page", newParams.page.toString());
      if (newParams.size && newParams.size !== 20) params.set("size", newParams.size.toString());

      const qs = params.toString();
      router.replace(`/admin/customers${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router]
  );

  // Fetch customers asynchronously
  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const result = await adminApi.getCustomers({
          page,
          size: pageSize,
          search: debouncedSearch,
          status: statusFilter,
          sort: sortBy,
          direction: sortDir,
        });

        if (!ignore) {
          setData(result);
          setError(null);
          updateUrlParams({
            search: debouncedSearch,
            status: statusFilter,
            sort: sortBy,
            direction: sortDir,
            page,
            size: pageSize,
          });
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load customer registry:", err);
          setError(err.message || "Unable to load customer directory.");
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
  }, [page, pageSize, debouncedSearch, statusFilter, sortBy, sortDir, updateUrlParams]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const result = await adminApi.getCustomers({
        page,
        size: pageSize,
        search: debouncedSearch,
        status: statusFilter,
        sort: sortBy,
        direction: sortDir,
      });
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message || "Unable to load customer directory.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle column header sorting
  const handleSortClick = (field) => {
    setIsLoading(true);
    if (sortBy === field) {
      setSortDir((prev) => (prev === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(field);
      setSortDir("ASC");
    }
    setPage(0);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleClearSearch = () => {
    setIsLoading(true);
    setSearch("");
    setDebouncedSearch("");
    setPage(0);
  };

  // Handle status filter change
  const handleStatusChange = (newStatus) => {
    setIsLoading(true);
    setStatusFilter(newStatus);
    setPage(0);
  };

  // Reset all filters to default
  const handleResetFilters = () => {
    setIsLoading(true);
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("ALL");
    setSortBy("createdAt");
    setSortDir("DESC");
    setPage(0);
  };

  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 0;
  const customers = data?.content || [];

  // Range calculation: e.g. "1–20 of 4,306"
  const startRange = totalElements === 0 ? 0 : page * pageSize + 1;
  const endRange = Math.min((page + 1) * pageSize, totalElements);

  // Render sort indicator icon
  const renderSortIndicator = (field) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500" />;
    }
    return sortDir === "ASC" ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
    );
  };

  return (
    <div className="space-y-6">
      {/* ================= PAGE HEADER & BREADCRUMBS ================= */}
      <PageHeader
        title="Customer Registry"
        description="Manage customer accounts, vehicles, bookings and service activity across the platform."
        breadcrumbs={[
          { label: "Admin Console", href: "/admin/dashboard" },
          { label: "Customers" },
        ]}
        badge={
          <Badge variant="blue" size="sm">
            Live Registry
          </Badge>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            isLoading={isLoading}
            leftIcon={RefreshCw}
            className="text-xs"
          >
            Refresh
          </Button>
        }
      />

      {/* ================= KPI SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Customers
            </span>
            <div className="text-2xl font-black text-slate-900">
              {isLoading && !data ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                totalElements.toLocaleString("en-IN")
              )}
            </div>
            <p className="text-[11px] text-slate-400">Authoritative platform registry</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Status
            </span>
            <div className="text-2xl font-black text-emerald-600">
              {statusFilter === "ACTIVE"
                ? totalElements.toLocaleString("en-IN")
                : statusFilter === "INACTIVE"
                ? "0 (Filtered)"
                : "Live System"}
            </div>
            <p className="text-[11px] text-slate-400">Verified platform credentials</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Showing Range
            </span>
            <div className="text-2xl font-black text-slate-900">
              {isLoading && !data ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                `${startRange}–${endRange}`
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Page {page + 1} of {Math.max(1, totalPages)}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ================= CONTROLS: SEARCH & STATUS FILTER ================= */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Server-side Search Input */}
          <div className="relative flex-1 max-w-lg">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search customers by name, email, or phone..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-2xs"
              />
              {isSearching ? (
                <span className="absolute right-3.5 text-xs text-blue-600 font-medium">...</span>
              ) : search ? (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}
            </div>
          </div>

          {/* Status Filter Chips (ALL, ACTIVE, INACTIVE) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 self-start md:self-auto shrink-0">
            {[
              { id: "ALL", label: "All Customers" },
              { id: "ACTIVE", label: "Active" },
              { id: "INACTIVE", label: "Inactive" },
            ].map((tab) => {
              const isCurrent = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleStatusChange(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all select-none ${
                    isCurrent
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filter Indicators / Results Meta */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 gap-2">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-slate-800">{startRange}–{endRange}</strong> of{" "}
              <strong className="text-slate-800">{totalElements.toLocaleString("en-IN")}</strong>{" "}
              customers
            </span>
            {(debouncedSearch || statusFilter !== "ALL") && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-blue-600 hover:text-blue-800 font-semibold underline underline-offset-2 ml-1"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setIsLoading(true);
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-600"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* ================= DATA TABLE / SKELETON / ERROR / EMPTY ================= */}
      {error ? (
        <ErrorState
          title="Unable to load customer registry"
          description={error}
          onRetry={handleRefresh}
          isRetrying={isLoading}
        />
      ) : isLoading && !data ? (
        /* Loading Skeleton Table */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-1/3">
                  <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-24 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      ) : customers.length === 0 ? (
        /* Empty State */
        <EmptyState
          icon={Users}
          title="No customers found"
          description={
            debouncedSearch || statusFilter !== "ALL"
              ? "No customers match your current search or filter criteria. Try clearing search or switching status tab."
              : "There are currently no customer accounts in the registry."
          }
          action={
            (debouncedSearch || statusFilter !== "ALL") && (
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Clear Filters
              </Button>
            )
          }
        />
      ) : (
        /* Main Responsive Table */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {/* Desktop Table View */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 select-none">
                  {/* Customer (Sortable) */}
                  <th
                    scope="col"
                    className="py-3.5 px-4 cursor-pointer hover:text-slate-800 transition-colors group"
                    onClick={() => handleSortClick("name")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Customer</span>
                      {renderSortIndicator("name")}
                    </div>
                  </th>

                  {/* Status */}
                  <th scope="col" className="py-3.5 px-4">
                    Status
                  </th>

                  {/* Vehicles */}
                  <th scope="col" className="py-3.5 px-3 text-center">
                    Vehicles
                  </th>

                  {/* Bookings */}
                  <th scope="col" className="py-3.5 px-3 text-center">
                    Bookings
                  </th>

                  {/* Service Requests */}
                  <th scope="col" className="py-3.5 px-3 text-center">
                    Requests
                  </th>

                  {/* Joined Date (Sortable) */}
                  <th
                    scope="col"
                    className="py-3.5 px-4 cursor-pointer hover:text-slate-800 transition-colors group"
                    onClick={() => handleSortClick("createdAt")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Joined</span>
                      {renderSortIndicator("createdAt")}
                    </div>
                  </th>

                  {/* Actions */}
                  <th scope="col" className="py-3.5 px-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((customer) => {
                  const initials = customer.name
                    ? customer.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "CU";

                  return (
                    <tr
                      key={customer.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${getAvatarColor(
                              customer.id
                            )}`}
                          >
                            {initials}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <Link
                              href={`/admin/customers/${customer.id}`}
                              className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate max-w-[200px] sm:max-w-[260px]"
                            >
                              {customer.name}
                            </Link>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 truncate">
                              <span className="truncate">{customer.email}</span>
                              {customer.phone && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <span>{customer.phone}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {customer.isActive ? (
                          <Badge variant="success" size="sm" dot>
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="danger" size="sm" dot>
                            Inactive
                          </Badge>
                        )}
                      </td>

                      {/* Vehicles count */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                            customer.vehicleCount > 0
                              ? "bg-slate-100 text-slate-800"
                              : "text-slate-400"
                          }`}
                        >
                          {customer.vehicleCount}
                        </span>
                      </td>

                      {/* Bookings count */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                            customer.bookingCount > 0
                              ? "bg-blue-50 text-blue-700"
                              : "text-slate-400"
                          }`}
                        >
                          {customer.bookingCount}
                        </span>
                      </td>

                      {/* Service Requests count */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                            customer.serviceRequestCount > 0
                              ? "bg-purple-50 text-purple-700"
                              : "text-slate-400"
                          }`}
                        >
                          {customer.serviceRequestCount}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium text-[11px]">
                        {formatDate(customer.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 transition-colors shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>View Details</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ================= PAGINATION BAR ================= */}
          <div className="p-4 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-500">
              Showing <span className="font-semibold text-slate-800">{startRange}</span> to{" "}
              <span className="font-semibold text-slate-800">{endRange}</span> of{" "}
              <span className="font-semibold text-slate-800">{totalElements.toLocaleString("en-IN")}</span> customers
            </div>

            <div className="flex items-center gap-1">
              {/* First Page */}
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setPage(0);
                }}
                disabled={page === 0 || isLoading}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="First page"
                aria-label="First page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Prev Page */}
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setPage((p) => Math.max(0, p - 1));
                }}
                disabled={page === 0 || isLoading}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              {/* Current Page Pill */}
              <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs">
                {page + 1}
              </span>

              {/* Next Page */}
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setPage((p) => Math.min(totalPages - 1, p + 1));
                }}
                disabled={page >= totalPages - 1 || isLoading}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                aria-label="Next page"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Last Page */}
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setPage(Math.max(0, totalPages - 1));
                }}
                disabled={page >= totalPages - 1 || isLoading}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Last page"
                aria-label="Last page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerRegistryPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-12 bg-white rounded-2xl animate-pulse border border-slate-200" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-24 bg-white rounded-2xl animate-pulse border border-slate-200" />
            <div className="h-24 bg-white rounded-2xl animate-pulse border border-slate-200" />
            <div className="h-24 bg-white rounded-2xl animate-pulse border border-slate-200" />
          </div>
          <div className="h-96 bg-white rounded-2xl animate-pulse border border-slate-200" />
        </div>
      }
    >
      <CustomerRegistryContent />
    </Suspense>
  );
}
