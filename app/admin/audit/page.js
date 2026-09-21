"use client";

import React, { useState, useEffect, useCallback } from "react";
import AdminShell from "../../../components/admin/AdminShell";
import { adminAuditApi } from "../../../lib/admin";
import {
  History,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldAlert,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  Layers,
  Copy,
  Check,
  Code2,
  Globe,
  Terminal,
} from "lucide-react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";

export default function AdminAuditPage() {
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination State
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [search, setSearch] = useState("");
  const [selectedAction, setSelectedAction] = useState("ALL");
  const [selectedEntityType, setSelectedEntityType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [diffViewTab, setDiffViewTab] = useState("diff"); // 'diff' | 'before' | 'after' | 'metadata'

  const [reloadKey, setReloadKey] = useState(0);

  // Load summary
  useEffect(() => {
    let ignore = false;
    async function fetchSummary() {
      try {
        const summaryData = await adminAuditApi.getAuditSummary();
        if (!ignore) {
          setSummary(summaryData);
        }
      } catch (err) {
        console.error("Failed to load audit summary:", err);
      }
    }
    fetchSummary();
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  // Load events
  useEffect(() => {
    let ignore = false;
    async function fetchEvents() {
      try {
        setError(null);
        const params = {
          page,
          size,
          search: search.trim() || undefined,
          action: selectedAction !== "ALL" ? selectedAction : undefined,
          entityType: selectedEntityType !== "ALL" ? selectedEntityType : undefined,
          status: selectedStatus !== "ALL" ? selectedStatus : undefined,
          sort: "createdAt",
          direction: "DESC",
        };

        const data = await adminAuditApi.getAuditEvents(params);
        if (!ignore) {
          setEvents(data.content || []);
          setTotalPages(data.totalPages || 1);
          setTotalElements(data.totalElements || 0);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load audit events:", err);
          setError(err.message || "Failed to load audit logs. Please ensure you have administrative permissions.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchEvents();
    return () => {
      ignore = true;
    };
  }, [page, size, search, selectedAction, selectedEntityType, selectedStatus, reloadKey]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    setReloadKey((prev) => prev + 1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setSelectedAction("ALL");
    setSelectedEntityType("ALL");
    setSelectedStatus("ALL");
    setPage(0);
    setReloadKey((prev) => prev + 1);
  };

  const handleManualRefresh = () => {
    setLoading(true);
    setReloadKey((prev) => prev + 1);
  };

  const handleOpenDetail = async (logId) => {
    setDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const detail = await adminAuditApi.getAuditEventDetail(logId);
      setSelectedLog(detail);
      if (detail.diffJson) setDiffViewTab("diff");
      else if (detail.afterStateJson) setDiffViewTab("after");
      else if (detail.metadataJson) setDiffViewTab("metadata");
      else setDiffViewTab("before");
    } catch (err) {
      console.error("Failed to fetch log details:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatJson = (jsonString) => {
    if (!jsonString) return null;
    try {
      const parsed = typeof jsonString === "string" ? JSON.parse(jsonString) : jsonString;
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonString;
    }
  };

  const getActionBadgeVariant = (action) => {
    if (!action) return "neutral";
    const act = action.toUpperCase();
    if (act.includes("LOGIN") || act.includes("LOGOUT")) return "purple";
    if (act.includes("CREATED") || act.includes("ACTIVATED")) return "success";
    if (act.includes("UPDATED") || act.includes("CONFIG")) return "blue";
    if (act.includes("DELETED") || act.includes("DEACTIVATED") || act.includes("FAILED")) return "danger";
    return "neutral";
  };

  const getStatusBadgeVariant = (status) => {
    if (status === "SUCCESS") return "success";
    if (status === "FAILED") return "danger";
    if (status === "WARN") return "warning";
    return "neutral";
  };

  const breadcrumbs = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "System & Governance" },
    { label: "Audit Logs", href: "/admin/audit" },
  ];

  return (
    <AdminShell breadcrumbs={breadcrumbs}>
      <div className="space-y-6 pb-12">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shadow-2xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Enterprise Audit Logs & Governance
              </h1>
              <p className="text-xs text-slate-500">
                Immutable chronological trail of security events, administrative updates, and system operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-purple-600" : ""}`} />
              <span>Refresh Logs</span>
            </Button>
          </div>
        </div>

        {/* Aggregate KPI Summary Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Logged Events
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {summary ? summary.totalEvents.toLocaleString() : "--"}
              </span>
              <span className="text-[10px] text-slate-500">all-time immutable</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Today&apos;s Activity
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-600 font-mono">
                {summary ? summary.todayEvents.toLocaleString() : "--"}
              </span>
              <span className="text-[10px] text-slate-500">since 00:00:00</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Failed Operations
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-600 font-mono">
                {summary ? summary.failedEvents.toLocaleString() : "0"}
              </span>
              <span className="text-[10px] text-slate-500">rejected / aborted</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Security & Auth Events
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-purple-600 font-mono">
                {summary ? summary.securityEvents.toLocaleString() : "0"}
              </span>
              <span className="text-[10px] text-slate-500">logins & auth</span>
            </div>
          </div>
        </div>

        {/* Multi-Attribute Filter Toolbar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by action, entity ID, actor email, description..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder:text-slate-400 text-slate-900"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Action Filter */}
              <select
                value={selectedAction}
                onChange={(e) => {
                  setSelectedAction(e.target.value);
                  setPage(0);
                }}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">All Actions</option>
                <option value="ADMIN_LOGIN">Admin Login</option>
                <option value="LOGIN_FAILED">Login Failed</option>
                <option value="ADMIN_LOGOUT">Admin Logout</option>
                <option value="SERVICE_CREATED">Service Created</option>
                <option value="SERVICE_UPDATED">Service Updated</option>
                <option value="SERVICE_ACTIVATED">Service Activated</option>
                <option value="SERVICE_DEACTIVATED">Service Deactivated</option>
                <option value="SERVICE_DELETED">Service Deleted</option>
                <option value="CONFIGURATION_UPDATED">Config Updated</option>
                <option value="WORKSHOP_STATUS_CHANGED">Workshop Status</option>
                <option value="WORKSHOP_VERIFICATION_CHANGED">Workshop Verification</option>
                <option value="CUSTOMER_STATUS_CHANGED">Customer Status</option>
              </select>

              {/* Entity Type Filter */}
              <select
                value={selectedEntityType}
                onChange={(e) => {
                  setSelectedEntityType(e.target.value);
                  setPage(0);
                }}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">All Entities</option>
                <option value="USER">User / Auth</option>
                <option value="SECURITY">Security</option>
                <option value="SERVICE_CATALOG">Service Catalog</option>
                <option value="PLATFORM_CONFIG">Platform Config</option>
                <option value="WORKSHOP">Workshop</option>
                <option value="CUSTOMER">Customer</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(0);
                }}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="FAILED">FAILED</option>
                <option value="WARN">WARN</option>
              </select>

              <Button type="submit" size="sm" className="text-xs bg-purple-600 hover:bg-purple-700 text-white">
                Filter
              </Button>

              {(search || selectedAction !== "ALL" || selectedEntityType !== "ALL" || selectedStatus !== "ALL") && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-xs text-slate-500 hover:text-slate-900"
                >
                  Reset
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Error loading audit trail</p>
              <p className="mt-0.5 text-rose-700">{error}</p>
            </div>
            <button
              onClick={loadEvents}
              className="px-2.5 py-1 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Audit Log Table */}
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Entity</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Summary Description</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
                        <span>Querying immutable audit repository...</span>
                      </div>
                    </td>
                  </tr>
                ) : events.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <History className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                        <span className="font-semibold text-slate-800 text-sm">No audit logs found</span>
                        <span className="text-xs text-slate-400">
                          {search || selectedAction !== "ALL" || selectedEntityType !== "ALL" || selectedStatus !== "ALL"
                            ? "Try adjusting your search queries or filter attributes."
                            : "New platform events will be recorded here chronologically."}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  events.map((log) => {
                    const dateObj = new Date(log.createdAt);
                    const formattedDate = dateObj.toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                    const formattedTime = dateObj.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    });

                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-slate-50/75 transition-colors group cursor-pointer"
                        onClick={() => handleOpenDetail(log.id)}
                      >
                        {/* Timestamp */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-mono text-[11px] font-semibold text-slate-900">
                            {formattedTime}
                          </div>
                          <div className="text-[10px] text-slate-400 font-sans">
                            {formattedDate}
                          </div>
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <Badge variant={getActionBadgeVariant(log.action)} size="sm">
                            {log.action}
                          </Badge>
                        </td>

                        {/* Entity */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-mono font-semibold text-slate-800 text-[11px]">
                            {log.entityType}
                          </span>
                          {log.entityId && (
                            <span className="text-[11px] text-slate-400 font-mono ml-1">
                              #{log.entityId}
                            </span>
                          )}
                        </td>

                        {/* Actor */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-[10px]">
                              {log.actorName ? log.actorName.charAt(0).toUpperCase() : "S"}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-900 text-[11px]">
                                {log.actorEmail || "SYSTEM"}
                              </span>
                              <span className="text-[9px] text-slate-400 uppercase font-mono">
                                {log.actorRole || "SYSTEM"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <Badge variant={getStatusBadgeVariant(log.status)} size="sm">
                            {log.status}
                          </Badge>
                        </td>

                        {/* Description */}
                        <td className="py-3.5 px-4 max-w-xs sm:max-w-md truncate text-slate-600">
                          {log.description || "—"}
                        </td>

                        {/* View Action */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenDetail(log.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                            title="View audit event payload & diff"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-800">{events.length ? page * size + 1 : 0}</span> to{" "}
              <span className="font-semibold text-slate-800">
                {Math.min((page + 1) * size, totalElements)}
              </span>{" "}
              of <span className="font-semibold text-slate-800">{totalElements}</span> entries
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span>Show</span>
                <select
                  value={size}
                  onChange={(e) => {
                    setSize(Number(e.target.value));
                    setPage(0);
                  }}
                  className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                  disabled={page === 0 || loading}
                  className="p-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-2 font-mono text-xs">
                  Page {page + 1} of {Math.max(1, totalPages)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                  disabled={page >= totalPages - 1 || loading}
                  className="p-1.5"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Event Detail & State Diff Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedLog(null);
        }}
        title="Audit Event Inspection"
        description={selectedLog ? `Event #${selectedLog.id} • ${selectedLog.action} on ${selectedLog.entityType}` : "Loading event details..."}
        maxWidth="max-w-3xl"
      >
        {detailLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
            <span className="text-xs">Loading complete audit event state...</span>
          </div>
        ) : selectedLog ? (
          <div className="space-y-4 text-xs">
            {/* Context Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                <Badge variant={getStatusBadgeVariant(selectedLog.status)} size="sm" className="mt-1">
                  {selectedLog.status}
                </Badge>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Action</span>
                <span className="font-mono font-bold text-slate-900 text-[11px] block mt-1">
                  {selectedLog.action}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Actor</span>
                <span className="text-slate-800 font-medium text-[11px] block mt-1 truncate" title={selectedLog.actorEmail}>
                  {selectedLog.actorEmail || "SYSTEM"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">IP Address</span>
                <span className="font-mono text-slate-600 text-[11px] block mt-1">
                  {selectedLog.ipAddress || "127.0.0.1"}
                </span>
              </div>
            </div>

            {/* Description & User Agent */}
            <div className="space-y-1.5 p-3 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-800">Event Description</div>
              <p className="text-slate-600 text-xs leading-relaxed">{selectedLog.description || "No description provided."}</p>
              {selectedLog.userAgent && (
                <div className="pt-2 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono truncate border-t border-slate-100 mt-2">
                  <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{selectedLog.userAgent}</span>
                </div>
              )}
            </div>

            {/* Tabs for JSON payloads */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200">
                <div className="flex items-center gap-1">
                  {selectedLog.diffJson && (
                    <button
                      onClick={() => setDiffViewTab("diff")}
                      className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-all ${
                        diffViewTab === "diff"
                          ? "border-purple-600 text-purple-600"
                          : "border-transparent text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      State Diff
                    </button>
                  )}
                  {selectedLog.beforeStateJson && (
                    <button
                      onClick={() => setDiffViewTab("before")}
                      className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-all ${
                        diffViewTab === "before"
                          ? "border-purple-600 text-purple-600"
                          : "border-transparent text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Before State
                    </button>
                  )}
                  {selectedLog.afterStateJson && (
                    <button
                      onClick={() => setDiffViewTab("after")}
                      className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-all ${
                        diffViewTab === "after"
                          ? "border-purple-600 text-purple-600"
                          : "border-transparent text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      After State
                    </button>
                  )}
                  {selectedLog.metadataJson && (
                    <button
                      onClick={() => setDiffViewTab("metadata")}
                      className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-all ${
                        diffViewTab === "metadata"
                          ? "border-purple-600 text-purple-600"
                          : "border-transparent text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Metadata
                    </button>
                  )}
                </div>

                {/* Copy Current Tab JSON */}
                <button
                  onClick={() => {
                    const currentText =
                      diffViewTab === "diff"
                        ? selectedLog.diffJson
                        : diffViewTab === "before"
                        ? selectedLog.beforeStateJson
                        : diffViewTab === "after"
                        ? selectedLog.afterStateJson
                        : selectedLog.metadataJson;
                    if (currentText) copyToClipboard(formatJson(currentText), diffViewTab);
                  }}
                  className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 transition-colors py-1"
                >
                  {copiedKey === diffViewTab ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              </div>

              {/* Tab Content JSON Block */}
              <div className="relative rounded-xl bg-slate-900 text-slate-100 p-4 font-mono text-[11px] overflow-x-auto max-h-72">
                <pre>
                  {diffViewTab === "diff" && formatJson(selectedLog.diffJson)}
                  {diffViewTab === "before" && formatJson(selectedLog.beforeStateJson)}
                  {diffViewTab === "after" && formatJson(selectedLog.afterStateJson)}
                  {diffViewTab === "metadata" && formatJson(selectedLog.metadataJson)}
                  {!selectedLog.diffJson &&
                    !selectedLog.beforeStateJson &&
                    !selectedLog.afterStateJson &&
                    !selectedLog.metadataJson &&
                    "// No structured state payloads attached to this audit event."}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDetailModalOpen(false);
                  setSelectedLog(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </AdminShell>
  );
}
