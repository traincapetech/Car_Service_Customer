"use client";

import React, { useState, useEffect, useMemo } from "react";
import CustomerShell from "../../components/layout/CustomerShell";
import PageHeader from "../../components/ui/PageHeader";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import ServiceCard from "../../components/services/ServiceCard";
import ServiceDetailModal from "../../components/services/ServiceDetailModal";
import ServiceSkeletonGrid from "../../components/services/ServiceSkeleton";
import { servicesApi, getCategoryMeta } from "../../lib/services";
import { useToast } from "../../context/ToastContext";
import {
  Wrench,
  Search,
  X,
  Filter,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export default function ServicesPage() {
  const toast = useToast();

  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("DEFAULT");

  // Modal states
  const [detailModalService, setDetailModalService] = useState(null);

  // Fetch active services from backend API
  useEffect(() => {
    let ignore = false;

    async function fetchServices() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await servicesApi.getServices();
        if (!ignore) {
          setServices(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.message ||
              "Unable to load the service catalog. Please check your connection and try again."
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchServices();

    return () => {
      ignore = true;
    };
  }, []);

  const handleRetry = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await servicesApi.getServices();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.message ||
          "Unable to load the service catalog. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Derive available categories dynamically from real services list
  const availableCategories = useMemo(() => {
    const counts = {};
    services.forEach((s) => {
      const cat = s.category || "OTHER";
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const categoryKeys = Object.keys(counts);
    const tabs = [
      {
        id: "ALL",
        label: "All Services",
        count: services.length,
      },
    ];

    categoryKeys.forEach((key) => {
      const meta = getCategoryMeta(key);
      tabs.push({
        id: key,
        label: meta.shortLabel || meta.label,
        count: counts[key],
      });
    });

    return tabs;
  }, [services]);

  // Client-side search and category filtering
  const filteredServices = useMemo(() => {
    let result = services.filter((s) => {
      const matchesCategory =
        selectedCategory === "ALL" || s.category === selectedCategory;

      const q = searchQuery.trim().toLowerCase();
      const meta = getCategoryMeta(s.category);
      const matchesSearch =
        !q ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        (meta.label && meta.label.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });

    // Sort order
    if (sortBy === "PRICE_ASC") {
      result.sort((a, b) => Number(a.basePrice || 0) - Number(b.basePrice || 0));
    } else if (sortBy === "PRICE_DESC") {
      result.sort((a, b) => Number(b.basePrice || 0) - Number(a.basePrice || 0));
    } else if (sortBy === "DURATION_ASC") {
      result.sort(
        (a, b) =>
          Number(a.estimatedDurationMinutes || 0) -
          Number(b.estimatedDurationMinutes || 0)
      );
    } else if (sortBy === "NAME_ASC") {
      result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }

    return result;
  }, [services, selectedCategory, searchQuery, sortBy]);

  // Open Service Detail modal
  const handleViewDetails = (service) => {
    setDetailModalService(service);
  };

  // Step 17 Preparation: Prepare selected service for booking
  const handleBookService = (service) => {
    try {
      // Store selected service in sessionStorage to be consumed by Step 17 Booking Wizard
      if (typeof window !== "undefined") {
        sessionStorage.setItem("pending_booking_service", JSON.stringify(service));
        sessionStorage.setItem("pending_booking_service_id", String(service.id));
      }
    } catch {
      // sessionStorage unavailable/restricted
    }

    // Close detail modal if open
    setDetailModalService(null);

    // Inform user of preparation for Step 17
    toast.success(
      `"${service.name}" selected! Vehicle selection & appointment scheduling will continue in Step 17.`
    );
  };

  const handleResetFilters = () => {
    setSelectedCategory("ALL");
    setSearchQuery("");
    setSortBy("DEFAULT");
  };

  return (
    <CustomerShell>
      {/* PAGE HEADER */}
      <PageHeader
        title="Service Catalog"
        description="Explore certified automotive service packages, transparent pricing, and OEM guaranteed maintenance."
        badge={
          !isLoading && !error && (
            <Badge variant="blue" size="sm" dot>
              {filteredServices.length}{" "}
              {filteredServices.length === 1 ? "Package Available" : "Packages Available"}
            </Badge>
          )
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Service Catalog" },
        ]}
      />

      {/* FILTER & SEARCH TOOLBAR */}
      {!error && (
        <div className="space-y-3.5 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          {/* Top Row: Search & Sort */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services by name, keywords, or components..."
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all"
                aria-label="Search service catalog"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/60"
                  aria-label="Clear search text"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-2.5 px-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all cursor-pointer"
                aria-label="Sort services"
              >
                <option value="DEFAULT">Featured / Recommended</option>
                <option value="PRICE_ASC">Price: Low to High</option>
                <option value="PRICE_DESC">Price: High to Low</option>
                <option value="DURATION_ASC">Duration: Quickest</option>
                <option value="NAME_ASC">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Bottom Row: Dynamic Category Pills */}
          {availableCategories.length > 1 && (
            <div
              className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 scrollbar-none"
              role="tablist"
              aria-label="Filter services by category"
            >
              {availableCategories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 ${
                      isActive
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100/70 hover:bg-slate-200/70 text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-200/80 text-slate-500"
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ERROR STATE */}
      {error && (
        <ErrorState
          title="Unable to Load Service Catalog"
          description={error}
          onRetry={handleRetry}
          retryLabel="Retry Catalog"
          className="my-6"
        />
      )}

      {/* LOADING STATE */}
      {isLoading && !error && <ServiceSkeletonGrid count={6} />}

      {/* EMPTY STATES */}
      {!isLoading && !error && services.length === 0 && (
        <EmptyState
          icon={Wrench}
          title="No services are available right now"
          description="Our service packages are currently being updated by the workshop. Please check back shortly."
          action={
            <Button variant="outline" size="sm" onClick={handleRetry} leftIcon={RotateCcw}>
              Refresh Catalog
            </Button>
          }
          className="my-8"
        />
      )}

      {!isLoading && !error && services.length > 0 && filteredServices.length === 0 && (
        <EmptyState
          icon={Search}
          title="No matching service packages found"
          description={
            searchQuery
              ? `No services matched "${searchQuery}". Try searching for another keyword or reset filters.`
              : "No services found in this category."
          }
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              leftIcon={RotateCcw}
            >
              Reset Filters
            </Button>
          }
          className="my-8"
        />
      )}

      {/* SERVICE CARDS GRID */}
      {!isLoading && !error && filteredServices.length > 0 && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
          role="region"
          aria-label="Available services"
        >
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onViewDetails={handleViewDetails}
              onBookService={handleBookService}
            />
          ))}
        </div>
      )}

      {/* SERVICE DETAIL MODAL */}
      <ServiceDetailModal
        isOpen={Boolean(detailModalService)}
        onClose={() => setDetailModalService(null)}
        service={detailModalService}
        onBookService={handleBookService}
      />
    </CustomerShell>
  );
}
