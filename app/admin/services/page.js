"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { adminServicesApi } from "../../../lib/adminServices";
import { SERVICE_CATEGORIES, formatPrice, formatDuration } from "../../../lib/services";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import PageHeader from "../../../components/ui/PageHeader";
import EmptyState from "../../../components/ui/EmptyState";
import { Skeleton } from "../../../components/ui/Skeleton";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import {
  Wrench,
  Search,
  Plus,
  RefreshCw,
  Eye,
  Edit2,
  Power,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Tag,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Percent,
  IndianRupee,
  ShieldAlert,
  Sparkles,
  Info,
  Calendar,
  Layers,
  ChevronRight,
  X,
} from "lucide-react";

// Format date for Indian locale
function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-IN", {
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

// Calculate live customer price
function calculatePreviewPrice(basePriceStr, discountType, discountValueStr) {
  const basePrice = parseFloat(basePriceStr);
  if (isNaN(basePrice) || basePrice < 0) return 0;

  const discountVal = parseFloat(discountValueStr) || 0;
  if (discountVal < 0) return basePrice;

  if (discountType === "PERCENTAGE") {
    const discountAmount = (basePrice * discountVal) / 100;
    return Math.max(0, basePrice - discountAmount);
  }

  if (discountType === "FIXED_AMOUNT") {
    return Math.max(0, basePrice - discountVal);
  }

  return basePrice;
}

export default function AdminServicesPage() {
  // Query Filters & Sorting
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("ASC");

  // Data & State
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals & Drawers
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "PERIODIC_SERVICE",
    basePrice: "",
    discountType: "NO_DISCOUNT",
    discountValue: "0",
    estimatedDurationMinutes: "60",
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [formServerMessage, setFormServerMessage] = useState(null);

  // Confirmation Dialogs
  const [toggleConfirmOpen, setToggleConfirmOpen] = useState(false);
  const [serviceToToggle, setServiceToToggle] = useState(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [deleteConflictMessage, setDeleteConflictMessage] = useState(null);

  // Toast Notification State
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const [reloadKey, setReloadKey] = useState(0);

  // Fetch Services via asynchronous effect
  useEffect(() => {
    let ignore = false;

    async function loadServices() {
      try {
        const data = await adminServicesApi.getServices({
          search: debouncedSearch,
          category: categoryFilter !== "ALL" ? categoryFilter : undefined,
          status: statusFilter,
          sort: sortBy,
          direction: sortDir,
        });
        if (!ignore) {
          setServices(data || []);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          console.warn("Failed to load services:", err?.message);
          setError(err.message || "Failed to load service catalog.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadServices();

    return () => {
      ignore = true;
    };
  }, [debouncedSearch, categoryFilter, statusFilter, sortBy, sortDir, reloadKey]);

  const fetchServices = useCallback(() => {
    setIsLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  // Summary Metrics Computation
  const summaryMetrics = useMemo(() => {
    const total = services.length;
    const active = services.filter((s) => s.isActive).length;
    const inactive = total - active;
    const discounted = services.filter(
      (s) => s.discountType && s.discountType !== "NO_DISCOUNT" && s.discountValue > 0
    ).length;

    const avgPrice =
      total > 0
        ? Math.round(
            services.reduce((acc, s) => acc + (Number(s.finalPrice) || Number(s.basePrice) || 0), 0) /
              total
          )
        : 0;

    return { total, active, inactive, discounted, avgPrice };
  }, [services]);

  // Open Create Form
  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingServiceId(null);
    setFormData({
      name: "",
      description: "",
      category: "PERIODIC_SERVICE",
      basePrice: "",
      discountType: "NO_DISCOUNT",
      discountValue: "0",
      estimatedDurationMinutes: "60",
      isActive: true,
    });
    setFormErrors({});
    setFormServerMessage(null);
    setFormModalOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (service) => {
    setIsEditing(true);
    setEditingServiceId(service.id);
    setFormData({
      name: service.name || "",
      description: service.description || "",
      category: service.category || "PERIODIC_SERVICE",
      basePrice: service.basePrice != null ? service.basePrice.toString() : "",
      discountType: service.discountType || "NO_DISCOUNT",
      discountValue: service.discountValue != null ? service.discountValue.toString() : "0",
      estimatedDurationMinutes: service.estimatedDurationMinutes != null ? service.estimatedDurationMinutes.toString() : "60",
      isActive: service.isActive ?? true,
    });
    setFormErrors({});
    setFormServerMessage(null);
    setFormModalOpen(true);
  };

  // Open Detail Modal
  const handleOpenDetail = (service) => {
    setSelectedService(service);
    setDetailModalOpen(true);
  };

  // Validate Form Client-side
  const validateForm = () => {
    const errors = {};
    if (!formData.name || !formData.name.trim()) {
      errors.name = "Service name is required.";
    } else if (formData.name.trim().length < 2 || formData.name.trim().length > 100) {
      errors.name = "Service name must be between 2 and 100 characters.";
    }

    const basePriceNum = parseFloat(formData.basePrice);
    if (!formData.basePrice || isNaN(basePriceNum) || basePriceNum <= 0) {
      errors.basePrice = "Base price must be a positive number greater than ₹0.";
    }

    const durationNum = parseInt(formData.estimatedDurationMinutes, 10);
    if (!formData.estimatedDurationMinutes || isNaN(durationNum) || durationNum < 1 || durationNum > 1440) {
      errors.estimatedDurationMinutes = "Duration must be between 1 and 1440 minutes (24 hours).";
    }

    const discountValNum = parseFloat(formData.discountValue);
    if (formData.discountType && formData.discountType !== "NO_DISCOUNT") {
      if (isNaN(discountValNum) || discountValNum < 0) {
        errors.discountValue = "Discount value cannot be negative.";
      } else if (formData.discountType === "PERCENTAGE" && discountValNum > 100) {
        errors.discountValue = "Percentage discount cannot exceed 100%.";
      } else if (formData.discountType === "FIXED_AMOUNT" && !isNaN(basePriceNum) && discountValNum > basePriceNum) {
        errors.discountValue = "Fixed discount cannot exceed the base price.";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Form (Create / Edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setActionLoading(true);
    setFormServerMessage(null);

    const payload = {
      name: formData.name.trim(),
      description: formData.description?.trim() || null,
      category: formData.category,
      basePrice: parseFloat(formData.basePrice),
      discountType: formData.discountType,
      discountValue: formData.discountType !== "NO_DISCOUNT" ? parseFloat(formData.discountValue) || 0 : 0,
      estimatedDurationMinutes: parseInt(formData.estimatedDurationMinutes, 10),
      isActive: formData.isActive,
    };

    try {
      if (isEditing) {
        await adminServicesApi.updateService(editingServiceId, payload);
        showToast(`Service "${payload.name}" updated successfully.`);
      } else {
        await adminServicesApi.createService(payload);
        showToast(`Service "${payload.name}" created successfully.`);
      }
      setFormModalOpen(false);
      fetchServices();
    } catch (err) {
      console.warn("Save failed:", err?.message);
      setFormServerMessage(err?.message || "Operation failed. Please check form values.");
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Activation
  const handleConfirmToggle = async () => {
    if (!serviceToToggle) return;
    setActionLoading(true);
    try {
      if (serviceToToggle.isActive) {
        await adminServicesApi.deactivateService(serviceToToggle.id);
        showToast(`Service "${serviceToToggle.name}" has been deactivated.`);
      } else {
        await adminServicesApi.activateService(serviceToToggle.id);
        showToast(`Service "${serviceToToggle.name}" has been activated.`);
      }
      setToggleConfirmOpen(false);
      setServiceToToggle(null);
      fetchServices();
    } catch (err) {
      console.warn("Toggle activation failed:", err?.message);
      showToast(err?.message || "Failed to update service status.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Service (Safely guarded by backend)
  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;
    setActionLoading(true);
    setDeleteConflictMessage(null);
    try {
      await adminServicesApi.deleteService(serviceToDelete.id);
      showToast(`Service "${serviceToDelete.name}" permanently deleted.`);
      setDeleteConfirmOpen(false);
      setServiceToDelete(null);
      setDeleteConflictMessage(null);
      fetchServices();
    } catch (err) {
      console.warn("Delete rejected by safety guard:", err?.message);
      const isConflict =
        err?.status === 409 ||
        err?.message?.toLowerCase().includes("referenced") ||
        err?.message?.toLowerCase().includes("cannot delete");

      if (isConflict) {
        setDeleteConflictMessage(
          err?.message ||
            `Cannot delete service '${serviceToDelete.name}' because it is referenced by historical bookings or service requests. Please deactivate the service instead.`
        );
      } else {
        showToast(err?.message || "Cannot delete service.", "error");
        setDeleteConfirmOpen(false);
        setServiceToDelete(null);
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Deactivate directly when deletion is blocked by historical references
  const handleDeactivateFromConflict = async () => {
    if (!serviceToDelete) return;
    setActionLoading(true);
    try {
      await adminServicesApi.deactivateService(serviceToDelete.id);
      showToast(`Service "${serviceToDelete.name}" has been deactivated.`);
      setDeleteConfirmOpen(false);
      setServiceToDelete(null);
      setDeleteConflictMessage(null);
      fetchServices();
    } catch (err) {
      console.warn("Deactivation from conflict failed:", err?.message);
      showToast(err?.message || "Failed to deactivate service.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Preview Price
  const previewPrice = useMemo(() => {
    return calculatePreviewPrice(formData.basePrice, formData.discountType, formData.discountValue);
  }, [formData.basePrice, formData.discountType, formData.discountValue]);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transition-all transform animate-in slide-in-from-top-3 duration-200 ${
            toast.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          {toast.type === "error" ? (
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Service Catalog & Pricing"
        subtitle="Manage customer packages, category classification, authoritative pricing, and discounts"
        icon={Wrench}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchServices}
              disabled={isLoading}
              className="gap-1.5"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4" />
              Add Service Package
            </Button>
          </div>
        }
      />

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Services
            </span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{summaryMetrics.total}</span>
            <span className="text-xs text-slate-500">catalog items</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Active Packages
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700">{summaryMetrics.active}</span>
            <span className="text-xs text-emerald-600">bookable</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Inactive
            </span>
            <XCircle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-700">{summaryMetrics.inactive}</span>
            <span className="text-xs text-slate-500">hidden</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Discounted
            </span>
            <Percent className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-700">{summaryMetrics.discounted}</span>
            <span className="text-xs text-amber-600">promotions</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Avg Final Price
            </span>
            <IndianRupee className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-900">{formatPrice(summaryMetrics.avgPrice)}</span>
            <span className="text-xs text-indigo-500">customer avg</span>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search service name or description..."
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown Filter */}
          <div className="w-full md:w-56">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-700"
            >
              <option value="ALL">All Categories</option>
              {Object.entries(SERVICE_CATEGORIES).map(([catKey, meta]) => (
                <option key={catKey} value={catKey}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Field */}
          <div className="w-full md:w-48 flex items-center gap-1.5">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-700"
            >
              <option value="name">Sort by Name</option>
              <option value="basePrice">Sort by Price</option>
              <option value="estimatedDurationMinutes">Sort by Duration</option>
              <option value="createdAt">Sort by Created Date</option>
            </select>
            <button
              onClick={() => setSortDir((prev) => (prev === "ASC" ? "DESC" : "ASC"))}
              className="p-2 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
              title={`Sort Direction: ${sortDir}`}
            >
              {sortDir === "ASC" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500 mr-2">Status:</span>
          {["ALL", "ACTIVE", "INACTIVE"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                statusFilter === tab
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab === "ALL" && `All (${summaryMetrics.total})`}
              {tab === "ACTIVE" && `Active (${summaryMetrics.active})`}
              {tab === "INACTIVE" && `Inactive (${summaryMetrics.inactive})`}
            </button>
          ))}
        </div>
      </div>

      {/* Services Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-800">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchServices}>
              Try Again
            </Button>
          </div>
        ) : services.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No Services Found"
            description="No service packages match your filter criteria. Try adjusting the search term or category."
            actionLabel="Add New Service"
            onAction={handleOpenCreate}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3.5">Service & Category</th>
                  <th className="px-4 py-3.5">Duration</th>
                  <th className="px-4 py-3.5">Base Price</th>
                  <th className="px-4 py-3.5">Discount</th>
                  <th className="px-4 py-3.5">Customer Price</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Last Updated</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {services.map((service) => {
                  const catMeta = SERVICE_CATEGORIES[service.category] || {
                    label: service.category,
                    badgeVariant: "neutral",
                  };
                  const hasDiscount =
                    service.discountType &&
                    service.discountType !== "NO_DISCOUNT" &&
                    service.discountValue > 0;

                  return (
                    <tr
                      key={service.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Name & Category */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {service.name}
                          </span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Badge variant={catMeta.badgeVariant || "neutral"} size="sm">
                              {catMeta.label || service.category}
                            </Badge>
                          </div>
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="px-4 py-4 text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDuration(service.estimatedDurationMinutes)}</span>
                        </div>
                      </td>

                      {/* Base Price */}
                      <td className="px-4 py-4 text-slate-700 whitespace-nowrap font-medium">
                        {formatPrice(service.basePrice)}
                      </td>

                      {/* Discount */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {hasDiscount ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Tag className="w-3 h-3" />
                            {service.discountType === "PERCENTAGE"
                              ? `${service.discountValue}% OFF`
                              : `-₹${service.discountValue}`}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">None</span>
                        )}
                      </td>

                      {/* Final Customer Price */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-base font-bold text-slate-900">
                          {formatPrice(service.finalPrice)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-slate-400 line-through ml-1.5">
                            {formatPrice(service.basePrice)}
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {service.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Last Updated */}
                      <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(service.updatedAt || service.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Details */}
                          <button
                            onClick={() => handleOpenDetail(service)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(service)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit Service"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Toggle Active/Inactive */}
                          <button
                            onClick={() => {
                              setServiceToToggle(service);
                              setToggleConfirmOpen(true);
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              service.isActive
                                ? "text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                                : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                            }`}
                            title={service.isActive ? "Deactivate Service" : "Activate Service"}
                          >
                            <Power className="w-4 h-4" />
                          </button>

                          {/* Delete (Safely Guarded) */}
                          <button
                            onClick={() => {
                              setServiceToDelete(service);
                              setDeleteConfirmOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Service (guarded)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SERVICE DETAIL MODAL / DRAWER                                            */}
      {/* ========================================================================= */}
      {detailModalOpen && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Service Package Overview</h3>
                  <p className="text-xs text-slate-500">Database-driven catalog specification</p>
                </div>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 overflow-y-auto">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">{selectedService.name}</h2>
                  {selectedService.isActive ? (
                    <Badge variant="emerald" size="md">Active</Badge>
                  ) : (
                    <Badge variant="neutral" size="md">Inactive</Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Category: <span className="font-semibold text-slate-700">{selectedService.category}</span>
                </p>
              </div>

              {/* Description */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Description
                </span>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedService.description || "No specific customer description provided."}
                </p>
              </div>

              {/* Pricing Breakdown Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/30 space-y-3">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Authoritative Pricing Breakdown
                </span>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-xs text-slate-500 block">Base Price</span>
                    <span className="text-base font-bold text-slate-900">
                      {formatPrice(selectedService.basePrice)}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-xs text-slate-500 block">Discount</span>
                    <span className="text-base font-bold text-amber-600">
                      {selectedService.discountType === "PERCENTAGE"
                        ? `${selectedService.discountValue}%`
                        : selectedService.discountType === "FIXED_AMOUNT"
                        ? `-₹${selectedService.discountValue}`
                        : "₹0"}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-blue-200 bg-blue-50/50">
                    <span className="text-xs text-blue-700 font-semibold block">Customer Price</span>
                    <span className="text-base font-extrabold text-blue-900">
                      {formatPrice(selectedService.finalPrice)}
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 italic text-center pt-1">
                  * Customer booking price snapshots are authoritatively calculated server-side.
                </div>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block">Estimated Duration</span>
                  <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                    {formatDuration(selectedService.estimatedDurationMinutes)} ({selectedService.estimatedDurationMinutes} mins)
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block">Lead Acceptance Fee</span>
                  <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                    Separate Market Fee (₹125)
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block">Created At</span>
                  <span className="font-medium text-slate-700 mt-0.5 block">
                    {formatDate(selectedService.createdAt)}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block">Last Updated</span>
                  <span className="font-medium text-slate-700 mt-0.5 block">
                    {formatDate(selectedService.updatedAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDetailModalOpen(false);
                  handleOpenEdit(selectedService);
                }}
                className="gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Package
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setDetailModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE / EDIT SERVICE MODAL                                              */}
      {/* ========================================================================= */}
      {formModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                  {isEditing ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isEditing ? "Edit Service Package" : "Create New Service Package"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure customer-facing package specifications and server pricing
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Server Error Banner */}
              {formServerMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span>{formServerMessage}</span>
                </div>
              )}

              {/* Service Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Service Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Comprehensive AC Cooling Service"
                  className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                    formErrors.name
                      ? "border-rose-300 focus:ring-rose-500 bg-rose-50/30"
                      : "border-slate-200 focus:ring-blue-500 bg-slate-50 focus:bg-white"
                  }`}
                />
                {formErrors.name && (
                  <p className="text-xs text-rose-600 mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Category & Duration Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Service Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
                  >
                    {Object.entries(SERVICE_CATEGORIES).map(([catKey, meta]) => (
                      <option key={catKey} value={catKey}>
                        {meta.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Duration (Minutes) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={formData.estimatedDurationMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, estimatedDurationMinutes: e.target.value })
                    }
                    placeholder="e.g. 90"
                    className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                      formErrors.estimatedDurationMinutes
                        ? "border-rose-300 focus:ring-rose-500 bg-rose-50/30"
                        : "border-slate-200 focus:ring-blue-500 bg-slate-50 focus:bg-white"
                    }`}
                  />
                  {formErrors.estimatedDurationMinutes && (
                    <p className="text-xs text-rose-600 mt-1">{formErrors.estimatedDurationMinutes}</p>
                  )}
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Displays as: {formatDuration(formData.estimatedDurationMinutes)}
                  </span>
                </div>
              </div>

              {/* Pricing & Discount Grid */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Authoritative Pricing Configuration
                  </span>
                  <Badge variant="blue" size="sm">Server Authoritative</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Base Price */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Base Price (₹) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                      placeholder="e.g. 2999"
                      className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                        formErrors.basePrice
                          ? "border-rose-300 focus:ring-rose-500 bg-white"
                          : "border-slate-200 focus:ring-blue-500 bg-white"
                      }`}
                    />
                    {formErrors.basePrice && (
                      <p className="text-[11px] text-rose-600 mt-1">{formErrors.basePrice}</p>
                    )}
                  </div>

                  {/* Discount Type */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Discount Type
                    </label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                    >
                      <option value="NO_DISCOUNT">No Discount</option>
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                    </select>
                  </div>

                  {/* Discount Value */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Discount Value {formData.discountType === "PERCENTAGE" ? "(%)" : "(₹)"}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      disabled={formData.discountType === "NO_DISCOUNT"}
                      value={formData.discountType === "NO_DISCOUNT" ? "0" : formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      placeholder={formData.discountType === "PERCENTAGE" ? "e.g. 10" : "e.g. 300"}
                      className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                        formData.discountType === "NO_DISCOUNT" ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-white"
                      } ${formErrors.discountValue ? "border-rose-300 focus:ring-rose-500" : "border-slate-200 focus:ring-blue-500"}`}
                    />
                    {formErrors.discountValue && (
                      <p className="text-[11px] text-rose-600 mt-1">{formErrors.discountValue}</p>
                    )}
                  </div>
                </div>

                {/* Real-time Final Price Preview Strip */}
                <div className="bg-white p-3 rounded-lg border border-blue-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">Computed Final Customer Price:</span>
                    <span className="text-lg font-black text-slate-900">{formatPrice(previewPrice)}</span>
                  </div>
                  {formData.discountType && formData.discountType !== "NO_DISCOUNT" && parseFloat(formData.discountValue) > 0 && (
                    <div className="text-right">
                      <span className="text-[11px] text-emerald-600 font-semibold block">
                        Customer Saves: {formData.discountType === "PERCENTAGE"
                          ? `${formData.discountValue}% (${formatPrice(
                              (parseFloat(formData.basePrice) * parseFloat(formData.discountValue)) / 100
                            )})`
                          : formatPrice(formData.discountValue)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed customer description including scope, inclusions, and replacement specs..."
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white resize-none"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-sm font-semibold text-slate-800 block">Active in Customer Catalog</span>
                  <span className="text-xs text-slate-500">
                    When active, customers can discover and book this service package.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormModalOpen(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={actionLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {actionLoading ? "Saving..." : isEditing ? "Update Service" : "Create Service"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ACTIVATION / DEACTIVATION CONFIRMATION DIALOG                             */}
      {/* ========================================================================= */}
      <ConfirmDialog
        isOpen={toggleConfirmOpen}
        onClose={() => {
          setToggleConfirmOpen(false);
          setServiceToToggle(null);
        }}
        onConfirm={handleConfirmToggle}
        title={serviceToToggle?.isActive ? "Deactivate Service Package?" : "Activate Service Package?"}
        description={
          serviceToToggle?.isActive
            ? `Are you sure you want to deactivate "${serviceToToggle?.name}"? It will immediately be hidden from the customer booking catalog. All historical bookings and price snapshots will remain completely preserved.`
            : `Are you sure you want to activate "${serviceToToggle?.name}"? It will immediately become discoverable and bookable by customers in the Service Catalog.`
        }
        confirmLabel={serviceToToggle?.isActive ? "Deactivate Service" : "Activate Service"}
        confirmVariant={serviceToToggle?.isActive ? "danger" : "primary"}
        isLoading={actionLoading}
      />

      {/* ========================================================================= */}
      {/* SAFE DELETE CONFIRMATION DIALOG                                          */}
      {/* ========================================================================= */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setServiceToDelete(null);
          setDeleteConflictMessage(null);
        }}
        onConfirm={deleteConflictMessage ? handleDeactivateFromConflict : handleConfirmDelete}
        title={deleteConflictMessage ? "Historical Record Protection" : `Delete "${serviceToDelete?.name}"?`}
        description={
          deleteConflictMessage
            ? "This service is referenced by historical bookings or service requests. To protect financial audit records and snapshots, it cannot be permanently removed."
            : "Services that are referenced by historical customer bookings cannot be deleted to preserve financial records. If referenced, the system will safely reject deletion and advise deactivation."
        }
        confirmLabel={deleteConflictMessage ? "Deactivate Service Instead" : "Attempt Delete"}
        confirmVariant={deleteConflictMessage ? "primary" : "danger"}
        cancelLabel={deleteConflictMessage ? "Dismiss" : "Cancel"}
        isLoading={actionLoading}
      >
        {deleteConflictMessage && (
          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block">Safety Guard Enforced</span>
              <p className="leading-relaxed">{deleteConflictMessage}</p>
            </div>
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
