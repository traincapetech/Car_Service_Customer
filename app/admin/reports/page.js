"use client";

import React, { useState, useEffect, useCallback, Suspense, useMemo } from "react";
import { adminReportsApi } from "../../../lib/adminReports";
import { useToast } from "../../../context/ToastContext";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import PageHeader from "../../../components/ui/PageHeader";
import EmptyState from "../../../components/ui/EmptyState";
import ErrorState from "../../../components/ui/ErrorState";
import { Skeleton } from "../../../components/ui/Skeleton";
import {
  BarChart3,
  Calendar,
  Download,
  RefreshCw,
  Search,
  Users,
  Building2,
  Wrench,
  CalendarCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  IndianRupee,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  TrendingUp,
  MapPin,
  Car,
  Layers,
  Info,
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

/**
 * Native SVG Trend & Bar Chart Component
 * High performance, zero dependencies, responsive, and handles 0/empty state gracefully.
 */
function NativeTrendChart({ points = [], valueField = "count", color = "#2563eb", title, emptyText = "No data available for this period" }) {
  const hasData = points && points.length > 0 && points.some((p) => Number(p[valueField] || 0) > 0);

  if (!hasData) {
    return (
      <div className="h-44 flex flex-col items-center justify-center rounded-xl bg-slate-50/70 border border-dashed border-slate-200 text-center p-4">
        <BarChart3 className="w-6 h-6 text-slate-300 mb-1.5" />
        <span className="text-xs text-slate-500 font-medium">{emptyText}</span>
      </div>
    );
  }

  const values = points.map((p) => Number(p[valueField] || 0));
  const maxVal = Math.max(...values, 1);
  const width = 500;
  const height = 140;
  const paddingX = 20;
  const paddingY = 20;

  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const stepX = points.length > 1 ? chartW / (points.length - 1) : chartW / 2;

  const coordinates = points.map((p, idx) => {
    const x = paddingX + idx * stepX;
    const val = Number(p[valueField] || 0);
    const y = height - paddingY - (val / maxVal) * chartH;
    return { x, y, val, date: p.date };
  });

  const linePath = coordinates.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, "");

  const areaPath = `${linePath} L ${coordinates[coordinates.length - 1].x} ${height - paddingY} L ${coordinates[0].x} ${height - paddingY} Z`;

  return (
    <div className="space-y-2">
      {title && <div className="text-xs font-semibold text-slate-700">{title}</div>}
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 overflow-visible">
          <defs>
            <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background horizontal guide lines */}
          {[0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = height - paddingY - ratio * chartH;
            return (
              <line
                key={ratio}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#f1f5f9"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Area Fill */}
          <path d={areaPath} fill={`url(#grad-${color.replace("#", "")})`} />

          {/* Smooth Line */}
          <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {coordinates.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r={pt.val > 0 ? "3.5" : "2"}
              fill="#ffffff"
              stroke={color}
              strokeWidth="2"
            >
              <title>{`${pt.date}: ${pt.val}`}</title>
            </circle>
          ))}
        </svg>

        {/* Date Labels on X Axis */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 px-2 font-mono">
          <span>{points[0]?.date || ""}</span>
          {points.length > 2 && <span>{points[Math.floor(points.length / 2)]?.date || ""}</span>}
          <span>{points[points.length - 1]?.date || ""}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Native Status Distribution Bar Component
 */
function StatusDistributionBar({ segments = [] }) {
  const totalCount = segments.reduce((sum, s) => sum + (s.count || 0), 0);

  if (totalCount === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-400">
        No records available for status breakdown
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Progress Bar Track */}
      <div className="w-full h-3 bg-slate-100 rounded-full flex overflow-hidden">
        {segments.map((s, idx) => {
          if (s.count === 0) return null;
          const pct = ((s.count / totalCount) * 100).toFixed(1);
          return (
            <div
              key={idx}
              style={{ width: `${pct}%`, backgroundColor: s.color }}
              className="h-full transition-all duration-300 relative group"
              title={`${s.label}: ${s.count} (${pct}%)`}
            />
          );
        })}
      </div>

      {/* Legend Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        {segments.map((s, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-slate-600 truncate">{s.label}</span>
            </div>
            <span className="font-bold text-slate-900 ml-2">
              {s.count} <span className="text-[10px] text-slate-400 font-normal">({totalCount > 0 ? ((s.count / totalCount) * 100).toFixed(0) : 0}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportsContent() {
  const { showSuccess, showError, showWarning } = useToast();

  // Date Range Presets
  const [periodPreset, setPeriodPreset] = useState("30D");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  // Category Tab
  const [activeTab, setActiveTab] = useState("OVERVIEW"); // OVERVIEW, CUSTOMERS, WORKSHOPS, SERVICE_REQUESTS, BOOKINGS, SERVICES

  // Activity Table State
  const [activitySearch, setActivitySearch] = useState("");
  const [activityType, setActivityType] = useState("ALL");
  const [activityPage, setActivityPage] = useState(0);
  const [activitySize, setActivitySize] = useState(10);
  const [activityData, setActivityData] = useState({ content: [], totalElements: 0, totalPages: 0 });

  // Main Report States
  const [overview, setOverview] = useState(null);
  const [customerReport, setCustomerReport] = useState(null);
  const [workshopReport, setWorkshopReport] = useState(null);
  const [requestReport, setRequestReport] = useState(null);
  const [bookingReport, setBookingReport] = useState(null);
  const [catalogReport, setCatalogReport] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Compute ISO from/to based on selected preset
  const { fromIso, toIso } = useMemo(() => {
    const now = new Date();
    let fromDate = null;
    let toDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    if (periodPreset === "TODAY") {
      fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    } else if (periodPreset === "7D") {
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (periodPreset === "30D") {
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (periodPreset === "90D") {
      fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else if (periodPreset === "YEAR") {
      fromDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
    } else if (periodPreset === "CUSTOM") {
      if (customFrom) fromDate = new Date(customFrom + "T00:00:00");
      if (customTo) toDate = new Date(customTo + "T23:59:59");
    }

    return {
      fromIso: fromDate ? fromDate.toISOString() : undefined,
      toIso: toDate ? toDate.toISOString() : undefined,
    };
  }, [periodPreset, customFrom, customTo]);

  // Load Reports Data
  const fetchReports = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [ovData, custData, wkData, srData, bkData, catData, actData] = await Promise.all([
        adminReportsApi.getOverview({ from: fromIso, to: toIso }),
        adminReportsApi.getCustomers({ from: fromIso, to: toIso }),
        adminReportsApi.getWorkshops({ from: fromIso, to: toIso }),
        adminReportsApi.getServiceRequests({ from: fromIso, to: toIso }),
        adminReportsApi.getBookings({ from: fromIso, to: toIso }),
        adminReportsApi.getServices(),
        adminReportsApi.getActivity({
          from: fromIso,
          to: toIso,
          type: activityType,
          search: activitySearch,
          page: activityPage,
          size: activitySize,
        }),
      ]);

      setOverview(ovData);
      setCustomerReport(custData);
      setWorkshopReport(wkData);
      setRequestReport(srData);
      setBookingReport(bkData);
      setCatalogReport(catData);
      setActivityData(actData || { content: [], totalElements: 0, totalPages: 0 });
      setError(null);
    } catch (err) {
      console.error("Failed to load reports:", err);
      setError(err.message || "Failed to load platform analytics report from server.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [fromIso, toIso, activityType, activitySearch, activityPage, activitySize]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const [ovData, custData, wkData, srData, bkData, catData, actData] = await Promise.all([
          adminReportsApi.getOverview({ from: fromIso, to: toIso }),
          adminReportsApi.getCustomers({ from: fromIso, to: toIso }),
          adminReportsApi.getWorkshops({ from: fromIso, to: toIso }),
          adminReportsApi.getServiceRequests({ from: fromIso, to: toIso }),
          adminReportsApi.getBookings({ from: fromIso, to: toIso }),
          adminReportsApi.getServices(),
          adminReportsApi.getActivity({
            from: fromIso,
            to: toIso,
            type: activityType,
            search: activitySearch,
            page: activityPage,
            size: activitySize,
          }),
        ]);

        if (!ignore) {
          setOverview(ovData);
          setCustomerReport(custData);
          setWorkshopReport(wkData);
          setRequestReport(srData);
          setBookingReport(bkData);
          setCatalogReport(catData);
          setActivityData(actData || { content: [], totalElements: 0, totalPages: 0 });
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load reports:", err);
          setError(err.message || "Failed to load platform analytics report from server.");
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
  }, [fromIso, toIso, activityType, activitySearch, activityPage, activitySize]);

  // Export Handlers
  const handleExportCsv = async () => {
    try {
      showSuccess("Preparing CSV export...");
      await adminReportsApi.exportCsv({
        reportType: activeTab === "OVERVIEW" ? "OVERVIEW" : activeTab,
        from: fromIso,
        to: toIso,
        search: activitySearch,
      });
      showSuccess("CSV export downloaded successfully.");
    } catch (err) {
      showError(err.message || "Failed to export CSV report.");
    }
  };

  const handleExportPdf = () => {
    showWarning("Coming Soon — PDF export engine will be available in the upcoming analytics release.");
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Global Controls */}
      <PageHeader
        title="Reports & Analytics"
        description="Platform performance, operational activity, and business intelligence."
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <select
              value={periodPreset}
              onChange={(e) => setPeriodPreset(e.target.value)}
              aria-label="Select report date range"
              className="text-xs font-semibold text-slate-700 bg-transparent border-0 focus:ring-0 py-1 pr-7 pl-1 cursor-pointer"
            >
              <option value="TODAY">Today</option>
              <option value="7D">Last 7 Days</option>
              <option value="30D">Last 30 Days</option>
              <option value="90D">Last 90 Days</option>
              <option value="YEAR">This Year</option>
              <option value="CUSTOM">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Pickers when CUSTOM is active */}
          {periodPreset === "CUSTOM" && (
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                aria-label="Custom Start Date"
                className="text-xs py-1 px-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <span className="text-slate-400 text-xs">to</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                aria-label="Custom End Date"
                className="text-xs py-1 px-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          )}

          {/* Export Dropdown / Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 text-slate-700"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPdf}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-700"
              title="PDF export engine"
            >
              <span>PDF</span>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded font-mono">SOON</span>
            </Button>
          </div>

          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReports}
            disabled={isLoading || isRefreshing}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </PageHeader>

      {/* Global Platform Overview KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Customers</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 mt-2 block">
            {overview ? overview.totalCustomers : "—"}
          </span>
          <span className="text-[10px] text-slate-400">
            {overview && overview.periodCustomers !== undefined ? `+${overview.periodCustomers} in period` : "Lifetime count"}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Workshops</span>
            <Building2 className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 mt-2 block">
            {overview ? overview.totalWorkshops : "—"}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium">
            {overview ? `${overview.verifiedWorkshops} verified` : "—"}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Service Requests</span>
            <Wrench className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 mt-2 block">
            {overview ? overview.totalServiceRequests : "—"}
          </span>
          <span className="text-[10px] text-slate-400">
            {overview ? `${overview.periodServiceRequests} in period` : "—"}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Bookings</span>
            <CalendarCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 mt-2 block">
            {overview ? overview.totalBookings : "—"}
          </span>
          <span className="text-[10px] text-slate-400">
            {overview ? `${overview.periodBookings} in period` : "—"}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Completed Bookings</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-extrabold text-emerald-700 mt-2 block">
            {overview ? overview.completedBookings : "—"}
          </span>
          <span className="text-[10px] text-rose-500">
            {overview ? `${overview.cancelledBookings} cancelled` : "—"}
          </span>
        </div>
      </div>

      {/* Category Tabs Switcher */}
      <div className="flex items-center gap-1 border-b border-slate-200 bg-white p-1 rounded-2xl shadow-2xs overflow-x-auto">
        {[
          { id: "OVERVIEW", label: "All Visualizations", icon: BarChart3 },
          { id: "CUSTOMERS", label: "Customers", icon: Users },
          { id: "WORKSHOPS", label: "Workshops", icon: Building2 },
          { id: "SERVICE_REQUESTS", label: "Service Requests", icon: Wrench },
          { id: "BOOKINGS", label: "Bookings", icon: CalendarCheck },
          { id: "SERVICES", label: "Catalog & Top Services", icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Panels */}
      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      ) : error ? (
        <ErrorState title="Unable to Load Reports" message={error} onRetry={fetchReports} />
      ) : (
        <div className="space-y-6">
          {/* Section 1: Customer & Workshop Activity Charts */}
          {(activeTab === "OVERVIEW" || activeTab === "CUSTOMERS" || activeTab === "WORKSHOPS") && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Activity Panel */}
              {(activeTab === "OVERVIEW" || activeTab === "CUSTOMERS") && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-bold text-slate-900">Customer Registrations Over Time</h3>
                    </div>
                    {customerReport && (
                      <Badge variant="blue" size="xs">
                        +{customerReport.newCustomers} New
                      </Badge>
                    )}
                  </div>

                  {/* KPI mini stats */}
                  <div className="grid grid-cols-3 gap-2 text-xs text-center">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Active</span>
                      <span className="font-extrabold text-slate-900 text-sm">
                        {customerReport ? customerReport.activeCustomers : 0}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Inactive / Susp.</span>
                      <span className="font-extrabold text-slate-900 text-sm">
                        {customerReport ? customerReport.inactiveSuspendedCustomers : 0}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Growth Rate</span>
                      <span className="font-extrabold text-emerald-600 text-sm">
                        {customerReport ? `${customerReport.growthRatePercentage}%` : "0%"}
                      </span>
                    </div>
                  </div>

                  {/* Real Chart */}
                  <NativeTrendChart
                    points={customerReport?.timeline || []}
                    valueField="count"
                    color="#2563eb"
                    emptyText="No customer registrations recorded for this period"
                  />
                </div>
              )}

              {/* Workshop Activity Panel */}
              {(activeTab === "OVERVIEW" || activeTab === "WORKSHOPS") && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-purple-600" />
                      <h3 className="text-sm font-bold text-slate-900">Workshop Registrations Over Time</h3>
                    </div>
                    {workshopReport && (
                      <Badge variant={workshopReport.pendingApproval > 0 ? "warning" : "neutral"} size="xs">
                        {workshopReport.pendingApproval} Pending
                      </Badge>
                    )}
                  </div>

                  {/* Workshop KPI mini stats */}
                  <div className="grid grid-cols-3 gap-2 text-xs text-center">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Verified</span>
                      <span className="font-extrabold text-emerald-600 text-sm">
                        {workshopReport ? workshopReport.verifiedWorkshops : 0}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Pending</span>
                      <span className="font-extrabold text-amber-600 text-sm">
                        {workshopReport ? workshopReport.pendingApproval : 0}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Rejected</span>
                      <span className="font-extrabold text-rose-600 text-sm">
                        {workshopReport ? workshopReport.rejectedWorkshops : 0}
                      </span>
                    </div>
                  </div>

                  {/* Real Chart */}
                  <NativeTrendChart
                    points={workshopReport?.timeline || []}
                    valueField="count"
                    color="#9333ea"
                    emptyText="No workshop registrations recorded for this period"
                  />

                  {/* Geographic Analytics Notice or Distribution */}
                  <div className="pt-2 border-t border-slate-100">
                    {workshopReport && workshopReport.cityDistribution && workshopReport.cityDistribution.length > 0 ? (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-500 uppercase">Geographic Distribution</span>
                        <div className="flex flex-wrap gap-2">
                          {workshopReport.cityDistribution.map((item, idx) => (
                            <span key={idx} className="text-xs bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <strong>{item.city}</strong> ({item.count})
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 text-xs text-slate-500">
                        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>{workshopReport?.geoNotice || "Workshop location analytics will be available after workshop geo-registration is enabled."}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 2: Status Distribution (Service Requests & Bookings) */}
          {(activeTab === "OVERVIEW" || activeTab === "SERVICE_REQUESTS" || activeTab === "BOOKINGS") && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Service Requests Status Distribution */}
              {(activeTab === "OVERVIEW" || activeTab === "SERVICE_REQUESTS") && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-amber-600" />
                      <h3 className="text-sm font-bold text-slate-900">Service Request Status Distribution</h3>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      {requestReport ? `${requestReport.totalRequests} Total` : "—"}
                    </span>
                  </div>

                  <StatusDistributionBar
                    segments={[
                      { label: "Submitted", count: requestReport?.submitted || 0, color: "#f59e0b" },
                      { label: "Matched", count: requestReport?.matched || 0, color: "#3b82f6" },
                      { label: "Accepted", count: requestReport?.accepted || 0, color: "#8b5cf6" },
                      { label: "In Progress", count: requestReport?.inProgress || 0, color: "#06b6d4" },
                      { label: "Completed", count: requestReport?.completed || 0, color: "#10b981" },
                      { label: "Cancelled", count: requestReport?.cancelled || 0, color: "#ef4444" },
                      { label: "Re-Matching", count: requestReport?.reMatching || 0, color: "#64748b" },
                    ]}
                  />

                  {/* Request Volume Timeline */}
                  <NativeTrendChart
                    points={requestReport?.timeline || []}
                    valueField="count"
                    color="#f59e0b"
                    title="Request Volume Over Time"
                    emptyText="No service request activity in this period"
                  />
                </div>
              )}

              {/* Bookings Status Distribution */}
              {(activeTab === "OVERVIEW" || activeTab === "BOOKINGS") && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <CalendarCheck className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-sm font-bold text-slate-900">Booking Status & Fulfillment</h3>
                    </div>
                    {bookingReport && (
                      <span className="text-xs font-semibold text-slate-500">
                        Avg: {bookingReport.averageBookingsPerDay} / day
                      </span>
                    )}
                  </div>

                  <StatusDistributionBar
                    segments={[
                      { label: "Pending", count: bookingReport?.pending || 0, color: "#f59e0b" },
                      { label: "Confirmed", count: bookingReport?.confirmed || 0, color: "#3b82f6" },
                      { label: "In Progress", count: bookingReport?.inProgress || 0, color: "#8b5cf6" },
                      { label: "Completed", count: bookingReport?.completed || 0, color: "#10b981" },
                      { label: "Cancelled", count: bookingReport?.cancelled || 0, color: "#ef4444" },
                    ]}
                  />

                  {/* Booking Volume Timeline */}
                  <NativeTrendChart
                    points={bookingReport?.timeline || []}
                    valueField="count"
                    color="#10b981"
                    title="Booking Volume Over Time"
                    emptyText="No booking activity in this period"
                  />
                </div>
              )}
            </div>
          )}

          {/* Section 3: Service Catalog & Top Services Report */}
          {(activeTab === "OVERVIEW" || activeTab === "SERVICES") && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-700" />
                  <h3 className="text-sm font-bold text-slate-900">Service Catalog & Popularity</h3>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">Catalog Items:</span>
                  <strong className="text-slate-900">{catalogReport?.totalServiceCatalogItems || 0}</strong>
                  <span className="text-slate-300">|</span>
                  <span className="text-emerald-600 font-semibold">{catalogReport?.activeServices || 0} Active</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Most Requested Services */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Most Requested Services
                  </h4>
                  {catalogReport && catalogReport.mostRequestedServices && catalogReport.mostRequestedServices.length > 0 ? (
                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                      {catalogReport.mostRequestedServices.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 text-xs hover:bg-slate-50/50">
                          <span className="font-semibold text-slate-800">{item.serviceName}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-500 font-mono">{item.count} requests</span>
                            {item.totalRevenue && item.totalRevenue > 0 && (
                              <span className="font-bold text-slate-900">{formatCurrency(item.totalRevenue)}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-400">
                      No service request items cataloged yet.
                    </div>
                  )}
                </div>

                {/* Most Booked Services */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Most Booked Services
                  </h4>
                  {catalogReport && catalogReport.mostBookedServices && catalogReport.mostBookedServices.length > 0 ? (
                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                      {catalogReport.mostBookedServices.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 text-xs hover:bg-slate-50/50">
                          <span className="font-semibold text-slate-800">{item.serviceName}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-500 font-mono">{item.count} bookings</span>
                            {item.totalRevenue && item.totalRevenue > 0 && (
                              <span className="font-bold text-emerald-700">{formatCurrency(item.totalRevenue)}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-400">
                      No service bookings cataloged yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Recent Platform Activity Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">Recent Platform Operational Activity</h3>
              </div>

              {/* Table search and type filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search activity..."
                    value={activitySearch}
                    onChange={(e) => {
                      setActivitySearch(e.target.value);
                      setActivityPage(0);
                    }}
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 w-44"
                  />
                </div>

                <select
                  value={activityType}
                  onChange={(e) => {
                    setActivityType(e.target.value);
                    setActivityPage(0);
                  }}
                  aria-label="Filter activity type"
                  className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="ALL">All Types</option>
                  <option value="BOOKING">Bookings</option>
                  <option value="SERVICE_REQUEST">Service Requests</option>
                </select>
              </div>
            </div>

            {/* Table */}
            {activityData.content.length === 0 ? (
              <div className="p-10">
                <EmptyState
                  icon={Clock}
                  title="No Activity Recorded"
                  description="No platform operations matched the selected period or filters."
                />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Date & Time</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Reference</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Workshop</th>
                        <th className="py-3 px-4">Service</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {activityData.content.map((act, idx) => (
                        <tr key={act.id || idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                            {formatDateTime(act.date)}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="font-semibold px-2 py-0.5 rounded text-[10px] uppercase bg-slate-100 text-slate-700">
                              {act.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                            #{act.reference}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-800">
                            {act.customerName || "Customer"}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {act.workshopName || "—"}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {act.serviceName || "—"}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <Badge variant={act.status === "COMPLETED" ? "success" : act.status === "CANCELLED" ? "danger" : "blue"} size="xs">
                              {act.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-slate-900 whitespace-nowrap">
                            {formatCurrency(act.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination */}
                <div className="p-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-600">
                  <span>
                    Showing {activityData.totalElements === 0 ? 0 : activityPage * activitySize + 1} to{" "}
                    {Math.min((activityPage + 1) * activitySize, activityData.totalElements)} of{" "}
                    <strong>{activityData.totalElements}</strong> items
                  </span>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => setActivityPage(0)}
                      disabled={activityPage === 0}
                      className="p-1"
                    >
                      <ChevronsLeft className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => setActivityPage(activityPage - 1)}
                      disabled={activityPage === 0}
                      className="p-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </Button>
                    <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-medium">
                      Page {activityPage + 1} of {Math.max(1, activityData.totalPages)}
                    </span>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => setActivityPage(activityPage + 1)}
                      disabled={activityPage >= activityData.totalPages - 1}
                      className="p-1"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => setActivityPage(activityData.totalPages - 1)}
                      disabled={activityPage >= activityData.totalPages - 1}
                      className="p-1"
                    >
                      <ChevronsRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
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
      <ReportsContent />
    </Suspense>
  );
}
