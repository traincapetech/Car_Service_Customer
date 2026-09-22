"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { adminConfigurationApi } from "../../../lib/adminConfiguration";
import { useToast } from "../../../context/ToastContext";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import PageHeader from "../../../components/ui/PageHeader";
import Modal from "../../../components/ui/Modal";
import EmptyState from "../../../components/ui/EmptyState";
import ErrorState from "../../../components/ui/ErrorState";
import { Skeleton } from "../../../components/ui/Skeleton";
import {
  Sliders,
  Settings,
  ShieldCheck,
  History,
  DollarSign,
  MapPin,
  Users,
  Clock,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Edit3,
  Check,
  X,
  Info,
  Lock,
  ArrowRight,
  Search,
  ChevronRight,
  ShieldAlert,
  Activity,
  ToggleLeft,
  ToggleRight,
  SlidersHorizontal,
} from "lucide-react";

// Format currency
function formatCurrency(val) {
  if (val === null || val === undefined || val === "") return "—";
  const num = Number(val);
  if (isNaN(num)) return val;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(num);
}

// Format timestamp
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
      second: "2-digit",
    });
  } catch {
    return "—";
  }
}

// Category tabs config
const CATEGORY_TABS = [
  { id: "ALL", label: "All Rules", icon: SlidersHorizontal },
  { id: "MARKETPLACE", label: "Marketplace Operations", icon: Activity },
  { id: "MATCHING", label: "Matching Engine", icon: MapPin },
  { id: "PAYMENT", label: "Payment & Fees", icon: DollarSign },
  { id: "WALLET", label: "Wallet & Billing", icon: Wallet },
];

function AdminConfigurationContent() {
  const { showSuccess, showError } = useToast();

  // Data states
  const [configs, setConfigs] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [editingConfig, setEditingConfig] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editReason, setEditReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [conflictError, setConflictError] = useState(null);

  // History Drawer / Modal
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyTargetKey, setHistoryTargetKey] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Initial data loading using clean async effect pattern
  useEffect(() => {
    let ignore = false;

    async function fetchConfigs() {
      try {
        const data = await adminConfigurationApi.getAllConfigurations();
        if (!ignore) {
          setConfigs(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load platform configurations:", err);
          setError(err?.message || "Failed to load platform configurations. Please verify network and permissions.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchConfigs();

    return () => {
      ignore = true;
    };
  }, []);

  // Manual refresh or reload after edits
  const loadConfigurations = useCallback(async (showRefreshingSpinner = false) => {
    if (showRefreshingSpinner) setRefreshing(true);
    try {
      const data = await adminConfigurationApi.getAllConfigurations();
      setConfigs(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Failed to reload platform configurations:", err);
      setError(err?.message || "Failed to reload platform configurations.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load audit history
  const loadHistory = useCallback(async (key = null) => {
    setLoadingHistory(true);
    try {
      const data = await adminConfigurationApi.getHistory(key);
      setHistoryList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch configuration audit history:", err);
      showError("Failed to fetch configuration audit history.");
    } finally {
      setLoadingHistory(false);
    }
  }, [showError]);

  // Open Edit Modal
  const handleOpenEdit = (config) => {
    setEditingConfig(config);
    setEditValue(config.configValue || "");
    setEditReason("");
    setConflictError(null);
  };

  // Close Edit Modal
  const handleCloseEdit = () => {
    setEditingConfig(null);
    setEditValue("");
    setEditReason("");
    setConflictError(null);
    setSaving(false);
  };

  // Submit Configuration Update
  const handleSaveConfig = async (e) => {
    if (e) e.preventDefault();
    if (!editingConfig) return;

    const trimmedReason = editReason.trim();
    if (!trimmedReason) {
      showError("Audit reason is strictly mandatory. Please explain why this parameter is being changed.");
      return;
    }

    if (trimmedReason.length < 5) {
      showError("Audit reason must be descriptive (at least 5 characters).");
      return;
    }

    // Client-side datatype validations
    if (editingConfig.dataType === "DECIMAL" || editingConfig.dataType === "INTEGER") {
      const numVal = Number(editValue);
      if (isNaN(numVal)) {
        showError(`Please enter a valid numeric value for ${editingConfig.friendlyName}.`);
        return;
      }
      if (editingConfig.minVal !== null && editingConfig.minVal !== undefined && numVal < editingConfig.minVal) {
        showError(`Value cannot be less than minimum allowed (${editingConfig.minVal}).`);
        return;
      }
      if (editingConfig.maxVal !== null && editingConfig.maxVal !== undefined && numVal > editingConfig.maxVal) {
        showError(`Value cannot exceed maximum allowed (${editingConfig.maxVal}).`);
        return;
      }
    }

    setSaving(true);
    setConflictError(null);

    try {
      const payload = {
        value: editValue.toString().trim(),
        configValue: editValue.toString().trim(),
        reason: trimmedReason,
        version: editingConfig.version ?? 0,
      };

      await adminConfigurationApi.updateConfiguration(editingConfig.configKey, payload);
      showSuccess(`Successfully updated ${editingConfig.friendlyName}!`);
      handleCloseEdit();
      await loadConfigurations(true);
    } catch (err) {
      console.error("Failed to update configuration:", err);
      if (err?.status === 409 || err?.message?.includes("concurrently") || err?.message?.includes("modified")) {
        setConflictError(
          "Conflict detected! Another administrator has updated this setting concurrently. Please reload settings to view the latest value before applying changes."
        );
      } else {
        showError(err?.message || "Failed to update configuration. Please check the values and try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  // Open History for a key or global
  const handleOpenHistory = (key = null) => {
    setHistoryTargetKey(key);
    setHistoryModalOpen(true);
    loadHistory(key);
  };

  // Visible configurations (excluding internal legacy alias)
  const visibleConfigs = useMemo(() => {
    return configs.filter((c) => c.configKey !== "lead_acceptance_fee");
  }, [configs]);

  // Filtered configuration cards
  const filteredConfigs = useMemo(() => {
    return visibleConfigs.filter((c) => {
      // Category filter
      if (selectedCategory !== "ALL" && c.category !== selectedCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = c.friendlyName?.toLowerCase().includes(q);
        const matchKey = c.configKey?.toLowerCase().includes(q);
        const matchDesc = c.description?.toLowerCase().includes(q);
        const matchVal = c.configValue?.toLowerCase().includes(q);
        if (!matchName && !matchKey && !matchDesc && !matchVal) return false;
      }
      return true;
    });
  }, [visibleConfigs, selectedCategory, searchQuery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { ALL: visibleConfigs.length, MARKETPLACE: 0, MATCHING: 0, PAYMENT: 0, WALLET: 0 };
    visibleConfigs.forEach((c) => {
      if (counts[c.category] !== undefined) {
        counts[c.category] += 1;
      }
    });
    return counts;
  }, [visibleConfigs]);

  // Quick KPI summary helpers
  const acceptanceFee = configs.find((c) => c.configKey === "MARKETPLACE_ACCEPTANCE_FEE")?.configValue;
  const matchingRadius = configs.find((c) => c.configKey === "MATCHING_DEFAULT_RADIUS_KM")?.configValue;
  const maxWorkshops = configs.find((c) => c.configKey === "MATCHING_MAX_WORKSHOPS_PER_REQUEST")?.configValue;
  const expiryMinutes = configs.find((c) => c.configKey === "MARKETPLACE_OPPORTUNITY_EXPIRY_MINUTES")?.configValue;
  const marketplaceStatus = configs.find((c) => c.configKey === "MARKETPLACE_ENABLED")?.configValue;
  const walletMin = configs.find((c) => c.configKey === "WALLET_MIN_TOPUP_AMOUNT")?.configValue;
  const walletMax = configs.find((c) => c.configKey === "WALLET_MAX_TOPUP_AMOUNT")?.configValue;

  // Render value with unit
  const renderDisplayValue = (c) => {
    if (c.dataType === "BOOLEAN") {
      const isTrue = c.configValue?.toLowerCase() === "true";
      return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${
          isTrue ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
        }`}>
          {isTrue ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {isTrue ? "ENABLED" : "DISABLED"}
        </span>
      );
    }
    if (c.dataType === "DECIMAL") {
      if (c.unit?.includes("INR") || c.unit?.includes("₹")) {
        return (
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {formatCurrency(c.configValue)}
          </span>
        );
      }
      return (
        <span className="text-2xl font-black text-slate-900 tracking-tight">
          {c.configValue} <span className="text-sm font-medium text-slate-500">{c.unit}</span>
        </span>
      );
    }
    if (c.dataType === "INTEGER") {
      return (
        <span className="text-2xl font-black text-slate-900 tracking-tight">
          {c.configValue} <span className="text-sm font-medium text-slate-500">{c.unit}</span>
        </span>
      );
    }
    return (
      <span className="text-xl font-bold text-slate-900">
        {c.configValue} {c.unit && <span className="text-sm font-medium text-slate-500">{c.unit}</span>}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-slate-900 text-white rounded-xl shadow-xs">
                <Sliders className="w-5 h-5 text-indigo-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Platform Rules & Configuration
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              Centrally manage marketplace parameters, matching boundaries, financial acceptance fees, and operational governance rules.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenHistory(null)}
              className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <History className="w-4 h-4 text-slate-500" />
              <span>Full Audit Trail</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => loadConfigurations(true)}
              disabled={refreshing || loading}
              className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-indigo-600" : "text-slate-500"}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* FINANCIAL IMMUTABILITY GOVERNANCE BANNER */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 p-5 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-amber-950 uppercase tracking-wider">
                  Platform Immutability & Financial Snapshot Policy
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-200 text-amber-900">
                  Strict Rule
                </span>
              </div>
              <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed">
                Changes made to business rules and fees define platform defaults for <strong>new incoming service requests, fresh matchings, and new wallet operations only</strong>. All past workshop opportunities, unlocked customer contact fees, payments, refunds, and transfers preserve their historical price snapshots and will <strong>never</strong> be retroactively recalculated.
              </p>
            </div>
          </div>
        </div>

        {/* Operational Overview KPI Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Acceptance Fee</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {acceptanceFee ? formatCurrency(acceptanceFee) : "—"}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Per unlocked customer opportunity</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Matching Radius</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {matchingRadius ? `${matchingRadius} km` : "—"}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Default workshop matching geofence</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Opportunity Expiry</span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {expiryMinutes ? `${expiryMinutes} min` : "—"}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Response window before auto-transfer</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Marketplace Dispatch</span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                {marketplaceStatus?.toLowerCase() === "true" ? (
                  <span className="text-emerald-600 flex items-center gap-1.5 text-xl font-black">
                    <Check className="w-5 h-5" /> ACTIVE
                  </span>
                ) : (
                  <span className="text-rose-600 flex items-center gap-1.5 text-xl font-black">
                    <X className="w-5 h-5" /> DISABLED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Max {maxWorkshops || 5} workshops per request</p>
            </div>
          </div>
        </div>

        {/* Filter Navigation Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              {CATEGORY_TABS.map((tab) => {
                const Icon = tab.icon;
                const isSelected = selectedCategory === tab.id;
                const count = categoryCounts[tab.id] || 0;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                      isSelected
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    <span
                      className={`ml-1 text-[11px] px-2 py-0.5 rounded-full font-bold ${
                        isSelected ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-72 shrink-0">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search rule by name or key..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Configuration Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-12 w-full" />
                <div className="pt-4 border-t border-slate-100 flex justify-between">
                  <Skeleton className="h-8 w-24 rounded-lg" />
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to Load Configurations"
            description={error}
            onRetry={() => loadConfigurations(false)}
          />
        ) : filteredConfigs.length === 0 ? (
          <EmptyState
            icon={Sliders}
            title="No Configurations Found"
            description={
              searchQuery
                ? `No platform rules match "${searchQuery}". Try adjusting your search query.`
                : "No configurations match the selected category."
            }
            action={
              searchQuery ? (
                <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
                  Clear Search Filter
                </Button>
              ) : null
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredConfigs.map((config) => {
              const hasMin = config.minVal !== null && config.minVal !== undefined;
              const hasMax = config.maxVal !== null && config.maxVal !== undefined;

              return (
                <div
                  key={config.configKey}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                >
                  {/* Card Header & Content */}
                  <div className="p-5 sm:p-6 space-y-4">
                    {/* Top Row: Category badge & Data Type */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        {config.category || "SYSTEM"}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                        <span className="px-2 py-0.5 bg-slate-50 rounded-md border border-slate-200">
                          {config.dataType}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-50 rounded-md border border-slate-200 font-mono">
                          v{config.version ?? 0}
                        </span>
                      </div>
                    </div>

                    {/* Friendly Title & Key */}
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                        {config.friendlyName || config.configKey}
                      </h3>
                      <div className="mt-1 flex items-center gap-2">
                        <code className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md break-all">
                          {config.configKey}
                        </code>
                      </div>
                    </div>

                    {/* Current Value Display Box */}
                    <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 font-medium block">Current Platform Value</span>
                        <div className="mt-1">{renderDisplayValue(config)}</div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                      {config.description || "Platform operational parameter governing marketplace behavior."}
                    </p>

                    {/* Validation Bounds / Unit Info */}
                    {(hasMin || hasMax || config.unit) && (
                      <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        {config.unit && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                            Unit: {config.unit}
                          </span>
                        )}
                        {(hasMin || hasMax) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-medium border border-amber-200">
                            Bounds: {hasMin ? config.minVal : "—"} to {hasMax ? config.maxVal : "—"}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Metadata & Actions */}
                  <div className="p-5 sm:p-6 pt-3 bg-slate-50/60 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Last updated:</span>
                      <span className="font-medium text-slate-600">{formatDateTime(config.updatedAt)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenEdit(config)}
                        className="flex-1 gap-1.5 text-xs font-semibold py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Setting</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenHistory(config.configKey)}
                        className="gap-1.5 text-xs font-semibold py-2 border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl"
                        title="View audit history for this parameter"
                      >
                        <History className="w-3.5 h-3.5 text-slate-500" />
                        <span>History</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================================= */}
        {/* EDIT CONFIGURATION MODAL (WITH MANDATORY REASON & CONCURRENCY PROTECTION) */}
        {/* ========================================================================= */}
        <Modal
          isOpen={Boolean(editingConfig)}
          onClose={handleCloseEdit}
          title={editingConfig ? `Configure ${editingConfig.friendlyName}` : "Edit Setting"}
          description={
            editingConfig
              ? `Update parameter value with audit reason and concurrency protection.`
              : ""
          }
          maxWidth="max-w-lg"
        >
          {editingConfig && (
            <form onSubmit={handleSaveConfig} className="space-y-4">
              {/* Conflict Error Alert */}
              {conflictError && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Concurrency Conflict</span>
                  </div>
                  <p className="text-xs leading-relaxed">{conflictError}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleCloseEdit();
                      loadConfigurations(true);
                    }}
                    className="w-full text-xs font-semibold bg-white border-rose-300 text-rose-700 hover:bg-rose-50 mt-1"
                  >
                    Reload Latest Configurations
                  </Button>
                </div>
              )}

              {/* Technical Details Banner */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-semibold">Config Key:</span>
                  <code className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 font-bold text-slate-900">
                    {editingConfig.configKey}
                  </code>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-semibold">Data Type / Unit:</span>
                  <span className="font-medium text-slate-800">
                    {editingConfig.dataType} {editingConfig.unit ? `(${editingConfig.unit})` : ""}
                  </span>
                </div>
                {(editingConfig.minVal !== null || editingConfig.maxVal !== null) && (
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="font-semibold">Allowed Range:</span>
                    <span className="font-bold text-amber-800">
                      {editingConfig.minVal ?? "—"} to {editingConfig.maxVal ?? "—"}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-semibold">Version:</span>
                  <span className="font-mono text-slate-700">v{editingConfig.version ?? 0}</span>
                </div>
              </div>

              {/* Input field according to data type */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  New Value <span className="text-rose-500">*</span>
                </label>

                {editingConfig.dataType === "BOOLEAN" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setEditValue("true")}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                        editValue?.toLowerCase() === "true"
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>ENABLED (True)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditValue("false")}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                        editValue?.toLowerCase() === "false"
                          ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <X className="w-4 h-4" />
                      <span>DISABLED (False)</span>
                    </button>
                  </div>
                ) : editingConfig.dataType === "DECIMAL" || editingConfig.dataType === "INTEGER" ? (
                  <div className="relative">
                    <input
                      type="number"
                      step={editingConfig.dataType === "DECIMAL" ? "0.01" : "1"}
                      min={editingConfig.minVal ?? undefined}
                      max={editingConfig.maxVal ?? undefined}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder={`Enter numeric value...`}
                      required
                      className="w-full px-4 py-2.5 text-base font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 transition-all"
                    />
                    {editingConfig.unit && (
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                        {editingConfig.unit}
                      </span>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 text-sm font-medium bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 transition-all"
                  />
                )}

                {/* Companion hint for Wallet limits */}
                {editingConfig.configKey.startsWith("WALLET_") && (
                  <p className="text-[11px] text-amber-700 mt-1.5 flex items-center gap-1 font-medium">
                    <Info className="w-3.5 h-3.5" />
                    Note: Platform enforces Minimum Topup &le; Maximum Topup at all times.
                  </p>
                )}
              </div>

              {/* MANDATORY AUDIT REASON */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Reason for Change <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    Audit Mandatory
                  </span>
                </div>
                <textarea
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="Explain why this platform business rule or parameter is being changed (e.g. Approved Q3 fee update by Operations team)..."
                  rows={3}
                  required
                  className="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all placeholder:text-slate-400"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  This explanation is permanently logged in the immutable administrative audit history.
                </p>
              </div>

              {/* Notice of Forward-Only Application */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Reminder: This new setting applies strictly to <strong>future operations</strong>. Existing opportunities, fees, and transfers retain their immutable historical snapshot.
                </span>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCloseEdit}
                  disabled={saving}
                  className="border-slate-300 text-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={saving || !editReason.trim() || Boolean(conflictError)}
                  className="gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Rule...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Apply & Log Change</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </Modal>

        {/* ========================================================================= */}
        {/* AUDIT HISTORY DRAWER / MODAL (IMMUTABLE LOG)                              */}
        {/* ========================================================================= */}
        <Modal
          isOpen={historyModalOpen}
          onClose={() => setHistoryModalOpen(false)}
          title={
            historyTargetKey
              ? `Audit History: ${historyTargetKey}`
              : "Platform Configuration Audit History"
          }
          description="Read-only chronological trail of all administrative configuration modifications."
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            {/* Quick Actions / Refresh */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500 font-medium">
                {historyTargetKey ? (
                  <span>Filtering logs for parameter: <strong className="text-slate-800">{historyTargetKey}</strong></span>
                ) : (
                  <span>Showing all platform configuration modification events</span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadHistory(historyTargetKey)}
                disabled={loadingHistory}
                className="gap-1.5 text-xs border-slate-300"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? "animate-spin" : ""}`} />
                <span>Refresh History</span>
              </Button>
            </div>

            {loadingHistory ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            ) : historyList.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <History className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">No History Records Found</p>
                <p className="text-xs text-slate-400">
                  {historyTargetKey
                    ? `No modifications have been recorded for ${historyTargetKey} yet.`
                    : "No configuration modification events recorded in the system."}
                </p>
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
                {historyList.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-colors space-y-2.5"
                  >
                    {/* Top Row: Key, Category & Timestamp */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                          {entry.configKey}
                        </code>
                        {entry.category && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {entry.category}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-medium text-slate-400">
                        {formatDateTime(entry.changedAt)}
                      </span>
                    </div>

                    {/* Value Transition Comparison */}
                    <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg text-xs font-mono">
                      <div className="flex-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Previous Value</span>
                        <span className="text-rose-700 font-bold line-through">
                          {entry.oldValue ?? "(initial)"}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                      <div className="flex-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Updated Value</span>
                        <span className="text-emerald-700 font-bold">
                          {entry.newValue}
                        </span>
                      </div>
                    </div>

                    {/* Mandatory Reason */}
                    <div className="text-xs text-slate-700 bg-amber-50/60 border border-amber-200/60 p-2.5 rounded-lg">
                      <span className="font-bold text-amber-950 block text-[11px] uppercase tracking-wider">
                        Audit Reason:
                      </span>
                      <p className="mt-0.5 italic text-slate-800">&ldquo;{entry.reason || "No reason specified"}&rdquo;</p>
                    </div>

                    {/* Admin Actor */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Changed by: <strong className="text-slate-800">{entry.changedBy || "ADMIN"}</strong></span>
                      {entry.changedByUserId && (
                        <span>User ID: #{entry.changedByUserId}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHistoryModalOpen(false)}
                className="border-slate-300 text-slate-700"
              >
                Close Audit View
              </Button>
            </div>
          </div>
        </Modal>
      </div>
  );
}

export default function AdminConfigurationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
            <RefreshCw className="w-5 h-5 animate-spin text-slate-900" />
            <span>Loading Platform Configuration...</span>
          </div>
        </div>
      }
    >
      <AdminConfigurationContent />
    </Suspense>
  );
}
