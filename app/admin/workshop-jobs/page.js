"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { adminWorkshopJobsApi } from "../../../lib/adminWorkshopJobs";
import { useToast } from "../../../context/ToastContext";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import PageHeader from "../../../components/ui/PageHeader";
import EmptyState from "../../../components/ui/EmptyState";
import ErrorState from "../../../components/ui/ErrorState";
import { Skeleton } from "../../../components/ui/Skeleton";
import {
  Search,
  RefreshCw,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  CheckCircle2,
  Clock,
  Car,
  User,
  Building2,
  Briefcase,
  AlertCircle,
  IndianRupee,
  Layers,
  ArrowRight,
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

function getJobStatusBadge(status) {
  switch (status) {
    case "ASSIGNED":
      return <Badge variant="warning" size="sm" dot>Assigned</Badge>;
    case "CONFIRMED":
      return <Badge variant="blue" size="sm" dot>Confirmed</Badge>;
    case "VEHICLE_RECEIVED":
      return <Badge variant="purple" size="sm" dot>Vehicle Received</Badge>;
    case "INSPECTION":
      return <Badge variant="purple" size="sm" dot>Inspection</Badge>;
    case "WORK_IN_PROGRESS":
      return <Badge variant="blue" size="sm" dot>Work In Progress</Badge>;
    case "READY_FOR_DELIVERY":
      return <Badge variant="amber" size="sm" dot>Ready for Delivery</Badge>;
    case "COMPLETED":
      return <Badge variant="success" size="sm" dot>Completed</Badge>;
    case "CANCELLED":
      return <Badge variant="danger" size="sm" dot>Cancelled</Badge>;
    case "TRANSFERRED":
      return <Badge variant="neutral" size="sm" dot>Transferred</Badge>;
    default:
      return <Badge variant="neutral" size="sm">{status || "Unknown"}</Badge>;
  }
}

function WorkshopJobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useToast();

  const [summary, setSummary] = useState(null);
  const [jobs, setJobs] = useState([]);
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

  const fetchJobs = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [summaryData, jobsData] = await Promise.all([
        adminWorkshopJobsApi.getSummary(),
        adminWorkshopJobsApi.getJobs({
          page: pageInfo.page,
          size: pageInfo.size,
          search: search.trim() || undefined,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
      ]);

      setSummary(summaryData);
      setJobs(jobsData.content || []);
      setPageInfo((prev) => ({
        ...prev,
        totalElements: jobsData.totalElements || 0,
        totalPages: jobsData.totalPages || 0,
      }));
      setError(null);
    } catch (err) {
      console.error("Failed to load admin workshop jobs:", err);
      setError(err.message || "Failed to load workshop jobs from administrative server.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [pageInfo.page, pageInfo.size, search, statusFilter, startDate, endDate]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const [summaryData, jobsData] = await Promise.all([
          adminWorkshopJobsApi.getSummary(),
          adminWorkshopJobsApi.getJobs({
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
          setJobs(jobsData.content || []);
          setPageInfo((prev) => ({
            ...prev,
            totalElements: jobsData.totalElements || 0,
            totalPages: jobsData.totalPages || 0,
          }));
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load admin workshop jobs:", err);
          setError(err.message || "Failed to load workshop jobs from administrative server.");
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

  const isFiltered = search.trim() !== "" || statusFilter !== "ALL" || startDate !== "" || endDate !== "";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Workshop Jobs"
        description="Supervise active workshop jobs, fulfillment milestones, and partner accountability across all servicing bays."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchJobs(true)}
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
          <span className="text-xs font-semibold text-slate-500 block">Total Jobs</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
            {summary ? summary.totalJobs : "—"}
          </span>
          <span className="text-[10px] text-slate-400">All time</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-amber-600 block">Assigned</span>
          <span className="text-2xl font-extrabold text-amber-700 mt-1 block">
            {summary ? summary.assignedJobs : "—"}
          </span>
          <span className="text-[10px] text-slate-400">Awaiting acceptance</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-blue-600 block">Confirmed</span>
          <span className="text-2xl font-extrabold text-blue-700 mt-1 block">
            {summary ? summary.confirmedJobs : "—"}
          </span>
          <span className="text-[10px] text-slate-400">Partner accepted</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-purple-600 block">In Progress</span>
          <span className="text-2xl font-extrabold text-purple-700 mt-1 block">
            {summary ? summary.inProgressJobs : "—"}
          </span>
          <span className="text-[10px] text-slate-400">Active servicing</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-emerald-600 block">Completed</span>
          <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">
            {summary ? summary.completedJobs : "—"}
          </span>
          <span className="text-[10px] text-slate-400">Delivered & closed</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-rose-600 block">Cancelled</span>
          <span className="text-2xl font-extrabold text-rose-700 mt-1 block">
            {summary ? summary.cancelledJobs : "—"}
          </span>
          <span className="text-[10px] text-slate-400">Voided jobs</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-600 block">Transferred</span>
          <span className="text-2xl font-extrabold text-slate-700 mt-1 block">
            {summary ? summary.transferredJobs : "—"}
          </span>
          <span className="text-[10px] text-slate-400">Reassigned partner</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Job Ref, Booking Ref, Workshop, Customer, Vehicle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPageInfo((prev) => ({ ...prev, page: 0 }));
              }}
              aria-label="Filter by workshop job status"
              className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
            >
              <option value="ALL">All Statuses</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="VEHICLE_RECEIVED">Vehicle Received</option>
              <option value="INSPECTION">Inspection</option>
              <option value="WORK_IN_PROGRESS">Work In Progress</option>
              <option value="READY_FOR_DELIVERY">Ready For Delivery</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="TRANSFERRED">Transferred</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="w-full lg:w-40">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPageInfo((prev) => ({ ...prev, page: 0 }));
              }}
              aria-label="Filter from date"
              className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
            />
          </div>

          {/* End Date */}
          <div className="w-full lg:w-40">
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPageInfo((prev) => ({ ...prev, page: 0 }));
              }}
              aria-label="Filter to date"
              className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" variant="primary" className="px-4">
              Filter
            </Button>
            {isFiltered && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleResetFilters}
                className="text-slate-500 hover:text-slate-700"
              >
                Reset
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Main Table / States */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-36 rounded-lg" />
              <Skeleton className="h-6 w-24 rounded-lg" />
            </div>
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
                <Skeleton className="h-10 w-24 rounded-lg" />
                <Skeleton className="h-10 flex-1 rounded-lg" />
                <Skeleton className="h-10 w-32 rounded-lg" />
                <Skeleton className="h-10 w-20 rounded-lg" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8">
            <ErrorState
              title="Unable to Load Workshop Jobs"
              message={error}
              onRetry={() => fetchJobs(false)}
            />
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12">
            {isFiltered ? (
              <EmptyState
                icon={Search}
                title="No Matching Workshop Jobs Found"
                description="No workshop jobs matched your active search queries or filter constraints. Try clearing filters to see all jobs."
                action={
                  <Button variant="outline" size="sm" onClick={handleResetFilters}>
                    Clear Filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={Briefcase}
                title="No Workshop Jobs Yet"
                description="Workshop jobs are created automatically when service requests are matched with or assigned to workshop partners. As jobs are created, they will appear here in real time."
              />
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Job / Booking Ref</th>
                    <th className="py-3 px-4">Workshop Partner</th>
                    <th className="py-3 px-4">Customer & Vehicle</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {jobs.map((job) => (
                    <tr
                      key={job.id}
                      className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                      onClick={() => router.push(`/admin/workshop-jobs/${job.id}`)}
                    >
                      {/* Job & Booking Ref */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors flex items-center gap-1.5">
                          <span>#{job.jobReference || `JOB-${job.id}`}</span>
                        </div>
                        {job.bookingReference && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/admin/bookings/${job.bookingId}`);
                            }}
                            className="text-xs text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <span>Booking: #{job.bookingReference}</span>
                          </div>
                        )}
                      </td>

                      {/* Workshop Partner */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-slate-900 truncate">
                              {job.workshopName || "Unassigned Partner"}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              {job.workshopCity && <span>{job.workshopCity}</span>}
                              {job.workshopPhone && (
                                <>
                                  <span>•</span>
                                  <span>{job.workshopPhone}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Customer & Vehicle */}
                      <td className="py-3 px-4">
                        <div className="min-w-0">
                          <div className="font-medium text-slate-900 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{job.customerName || "Customer"}</span>
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>
                              {job.vehicleYear ? `${job.vehicleYear} ` : ""}
                              {job.vehicleMake || ""} {job.vehicleModel || ""}
                            </span>
                            {job.vehiclePlateNumber && (
                              <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1 rounded">
                                {job.vehiclePlateNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getJobStatusBadge(job.status)}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">
                          {formatCurrency(job.finalAmount || job.estimatedAmount)}
                        </div>
                        {job.finalAmount && job.estimatedAmount && job.finalAmount !== job.estimatedAmount && (
                          <div className="text-[10px] text-slate-400">
                            Est: {formatCurrency(job.estimatedAmount)}
                          </div>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-500">
                        <div>{formatDate(job.createdAt)}</div>
                        <div className="text-[10px] text-slate-400">
                          {job.createdAt ? new Date(job.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : ""}
                        </div>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link href={`/admin/workshop-jobs/${job.id}`}>
                          <Button variant="ghost" size="xs" className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            <span>Dossier</span>
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select
                  value={pageInfo.size}
                  onChange={(e) => handleSizeChange(Number(e.target.value))}
                  aria-label="Page size"
                  className="bg-white border border-slate-200 rounded-lg py-1 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>entries per page</span>
                <span className="text-slate-400">|</span>
                <span>
                  Showing{" "}
                  <strong className="text-slate-900 font-semibold">
                    {pageInfo.totalElements === 0 ? 0 : pageInfo.page * pageInfo.size + 1}
                  </strong>{" "}
                  to{" "}
                  <strong className="text-slate-900 font-semibold">
                    {Math.min((pageInfo.page + 1) * pageInfo.size, pageInfo.totalElements)}
                  </strong>{" "}
                  of <strong className="text-slate-900 font-semibold">{pageInfo.totalElements}</strong> jobs
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => handlePageChange(0)}
                  disabled={pageInfo.page === 0}
                  className="p-1.5"
                  title="First Page"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => handlePageChange(pageInfo.page - 1)}
                  disabled={pageInfo.page === 0}
                  className="p-1.5"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>

                <span className="px-3 py-1 font-medium text-slate-700 bg-white border border-slate-200 rounded-lg">
                  Page {pageInfo.page + 1} of {Math.max(1, pageInfo.totalPages)}
                </span>

                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => handlePageChange(pageInfo.page + 1)}
                  disabled={pageInfo.page >= pageInfo.totalPages - 1}
                  className="p-1.5"
                  title="Next Page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => handlePageChange(pageInfo.totalPages - 1)}
                  disabled={pageInfo.page >= pageInfo.totalPages - 1}
                  className="p-1.5"
                  title="Last Page"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function WorkshopJobsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 space-y-4">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      }
    >
      <WorkshopJobsContent />
    </Suspense>
  );
}
