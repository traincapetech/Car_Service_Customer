"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import CustomerShell from "../../../components/layout/CustomerShell";
import PageHeader from "../../../components/ui/PageHeader";
import Card, { CardHeader, CardContent, CardFooter } from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import ErrorState from "../../../components/ui/ErrorState";
import ServiceCard from "../../../components/services/ServiceCard";
import ServiceDetailModal from "../../../components/services/ServiceDetailModal";
import {
  Car,
  Wrench,
  Calendar as CalendarIcon,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Plus,
  RotateCcw,
  Sparkles,
  Info,
  Check,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Wind,
  BatteryCharging,
  Disc,
  Sliders,
  ShieldAlert,
  Activity,
  LifeBuoy,
  ShoppingCart,
  Tag,
} from "lucide-react";
import {
  servicesApi,
  formatPrice,
  formatDuration,
  getCategoryMeta,
  getOriginalPrice,
  getServiceInclusions,
} from "../../../lib/services";
import { vehiclesApi } from "../../../lib/vehicles";
import {
  bookingsApi,
  CONTROLLED_TIME_SLOTS,
  formatSlotDisplay,
  parseLocalDate,
  formatLocalDate,
  isSlotAvailableForDate,
  getAvailableSlotsForDate,
} from "../../../lib/bookings";
import { useToast } from "../../../context/ToastContext";

function BookingWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const queryServiceId = searchParams.get("serviceId");
  const queryVehicleId = searchParams.get("vehicleId");

  // Step state (1: Service, 2: Vehicle, 3: Schedule, 4: Review, 5: Success)
  const [currentStep, setCurrentStep] = useState(queryServiceId ? 2 : 1);

  // Data states
  const [services, setServices] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("10:00-11:00");
  const [customerNotes, setCustomerNotes] = useState("");

  // Loading & submission states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [createdBooking, setCreatedBooking] = useState(null);

  // Step 1: Search, Category Filter, Pagination & Detail Modal states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [servicePage, setServicePage] = useState(1);
  const [detailModalService, setDetailModalService] = useState(null);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const categoryScrollRef = useRef(null);
  const SERVICES_PER_PAGE = 8;

  const scrollCategories = (offset) => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  // Local calendar date definitions
  const todayStr = formatLocalDate(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatLocalDate(tomorrow);

  // Maximum selectable date (30 days ahead)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = formatLocalDate(maxDate);

  // Check how many workshop slots remain open today
  const availableSlotsToday = useMemo(() => {
    return getAvailableSlotsForDate(todayStr);
  }, [todayStr]);

  // Minimum selectable date: today onwards
  const minDateStr = todayStr;

  // Default initial date: if today has slots remaining, pick today! Otherwise tomorrow.
  const defaultDateStr = availableSlotsToday.length > 0 ? todayStr : tomorrowStr;

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [servicesData, vehiclesData] = await Promise.all([
          servicesApi.getServices(),
          vehiclesApi.getVehicles(),
        ]);

        if (ignore) return;

        const activeServices = Array.isArray(servicesData) ? servicesData : [];
        const customerVehicles = Array.isArray(vehiclesData) ? vehiclesData : [];

        setServices(activeServices);
        setVehicles(customerVehicles);

        // Pre-select service if passed via URL or sessionStorage
        let serviceToPreselect = null;
        const targetServiceId =
          queryServiceId ||
          (typeof window !== "undefined"
            ? sessionStorage.getItem("pending_booking_service_id")
            : null);

        if (targetServiceId) {
          serviceToPreselect = activeServices.find(
            (s) => String(s.id) === String(targetServiceId)
          );
        }

        if (serviceToPreselect) {
          setSelectedService(serviceToPreselect);
          setCurrentStep(customerVehicles.length > 0 ? 2 : 2);
        } else if (activeServices.length > 0) {
          setSelectedService(activeServices[0]);
        }

        // Pre-select vehicle if passed via URL, or default to first
        if (queryVehicleId) {
          const matchedVehicle = customerVehicles.find(
            (v) => String(v.id) === String(queryVehicleId)
          );
          if (matchedVehicle) {
            setSelectedVehicle(matchedVehicle);
          } else if (customerVehicles.length > 0) {
            setSelectedVehicle(customerVehicles[0]);
          }
        } else if (customerVehicles.length > 0) {
          setSelectedVehicle(customerVehicles[0]);
        }

        // If vehicle was preselected from garage and no service yet, stay on step 1 to pick service
        if (queryVehicleId && !queryServiceId) {
          setCurrentStep(1);
        }

        // Set default date and slot
        setSelectedDate(defaultDateStr);
        const initialSlots = getAvailableSlotsForDate(defaultDateStr);
        if (initialSlots.length > 0) {
          setSelectedSlot(initialSlots[0].id);
        }
      } catch (err) {
        if (!ignore) {
          setLoadError(err.message || "Failed to load booking resources.");
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
  }, [queryServiceId, queryVehicleId, defaultDateStr]);

  // Synchronize date and select an available slot
  const handleSelectDate = (newDate) => {
    setSelectedDate(newDate);
    if (!newDate) return;
    const availableSlots = getAvailableSlotsForDate(newDate);
    if (!availableSlots.some((s) => s.id === selectedSlot)) {
      setSelectedSlot(availableSlots.length > 0 ? availableSlots[0].id : "");
    }
  };

  // Derive available categories dynamically from active services
  const availableCategories = useMemo(() => {
    const counts = {};
    services.forEach((s) => {
      const cat = s.category || "OTHER";
      counts[cat] = (counts[cat] || 0) + 1;
    });

    function getCategoryTabIcon(catKey) {
      switch (catKey) {
        case "PERIODIC_SERVICE":
          return Car;
        case "AC_SERVICE":
          return Wind;
        case "BATTERY_SERVICE":
          return BatteryCharging;
        case "TYRE_SERVICE":
          return Disc;
        case "WHEEL_ALIGNMENT":
          return Sliders;
        case "BRAKE_SERVICE":
          return ShieldAlert;
        case "DETAILING":
          return Sparkles;
        case "DIAGNOSTICS":
          return Activity;
        case "ENGINE_SERVICE":
          return Wrench;
        case "GENERAL_SERVICE":
          return LifeBuoy;
        default:
          return Wrench;
      }
    }

    const categoryKeys = Object.keys(counts);
    const tabs = [
      {
        id: "ALL",
        label: "All Services",
        count: services.length,
        icon: SlidersHorizontal,
      },
    ];

    categoryKeys.forEach((key) => {
      const meta = getCategoryMeta(key);
      tabs.push({
        id: key,
        label: meta.shortLabel || meta.label,
        count: counts[key],
        icon: getCategoryTabIcon(key),
      });
    });

    return tabs;
  }, [services]);

  // Filter services by search query and category
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesCategory =
        selectedCategory === "ALL" || s.category === selectedCategory;

      const q = searchQuery.trim().toLowerCase();
      const meta = getCategoryMeta(s.category);
      const matchesSearch =
        !q ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        (meta.label && meta.label.toLowerCase().includes(q)) ||
        (meta.shortLabel && meta.shortLabel.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  // Paginate filtered services (6 per page)
  const totalPages = Math.ceil(filteredServices.length / SERVICES_PER_PAGE) || 1;
  const paginatedServices = useMemo(() => {
    const start = (servicePage - 1) * SERVICES_PER_PAGE;
    return filteredServices.slice(start, start + SERVICES_PER_PAGE);
  }, [filteredServices, servicePage]);

  const handleSelectService = (service) => {
    setSelectedService(service);
  };

  const handleSelectFromModal = (service) => {
    setSelectedService(service);
    setDetailModalService(null);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("ALL");
    setServicePage(1);
  };

  const steps = [
    { num: 1, label: "Service" },
    { num: 2, label: "Vehicle" },
    { num: 3, label: "Date & Time" },
    { num: 4, label: "Review & Confirm" },
  ];

  // Handle final submission
  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedVehicle || !selectedDate || !selectedSlot) {
      toast.error("Please complete all required booking steps.");
      return;
    }

    if (selectedDate < todayStr) {
      toast.error("Past dates cannot be booked. Please select an upcoming appointment date.");
      setCurrentStep(3);
      return;
    }

    if (!isSlotAvailableForDate(selectedSlot, selectedDate)) {
      toast.error("The selected time slot has elapsed or is no longer bookable. Please select an open slot.");
      setCurrentStep(3);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await bookingsApi.createBooking({
        vehicleId: selectedVehicle.id,
        serviceId: selectedService.id,
        bookingDate: selectedDate,
        timeSlot: selectedSlot,
        customerNotes,
      });

      // Clear pending session storage
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("pending_booking_service");
        sessionStorage.removeItem("pending_booking_service_id");
      }

      setCreatedBooking(response);
      setCurrentStep(5); // Success step
      toast.success("Service appointment successfully confirmed!");
    } catch (err) {
      // 409 Conflict or 400 validation
      setSubmitError(
        err.message || "Unable to confirm booking. Please try again or select another time slot."
      );
      toast.error(err.message || "Booking creation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <CustomerShell>
        <ErrorState
          title="Booking Service Unavailable"
          description={loadError}
          onRetry={() => window.location.reload()}
          retryLabel="Reload Page"
        />
      </CustomerShell>
    );
  }

  return (
    <CustomerShell>
      {/* PAGE HEADER */}
      <PageHeader
        title="Book a Service"
        description="Schedule professional OEM maintenance with guaranteed parts, certified master mechanics, and live diagnostics."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "My Bookings", href: "/bookings" },
          { label: "New Booking" },
        ]}
      />

      {/* STEP PROGRESS BAR */}
      {currentStep < 5 && (
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {steps.map((s, idx) => {
              const isCompleted = currentStep > s.num;
              const isCurrent = currentStep === s.num;
              return (
                <React.Fragment key={s.num}>
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                        isCompleted
                          ? "bg-emerald-600 text-white shadow-xs"
                          : isCurrent
                          ? "bg-slate-900 text-white shadow-sm ring-4 ring-slate-100"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : s.num}
                    </div>
                    <span
                      className={`text-[11px] font-semibold hidden sm:block ${
                        isCurrent ? "text-slate-900 font-bold" : "text-slate-400"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${
                        currentStep > s.num ? "bg-emerald-500" : "bg-slate-100"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 1: SERVICE SELECTION (GoMechanic Style Experience) */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* Top Category Icon Ribbon with Left/Right Scroll Controls */}
          <div className="relative bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollCategories(-220)}
                className="hidden sm:flex w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 items-center justify-center text-slate-600 shadow-2xs shrink-0 z-10"
                aria-label="Scroll categories left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div
                ref={categoryScrollRef}
                className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-1 scroll-smooth flex-1"
                role="tablist"
                aria-label="Filter packages by category"
              >
                {availableCategories.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  const CatIcon = cat.icon || Wrench;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setServicePage(1);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 flex flex-col items-center gap-1 shrink-0 border ${
                        isActive
                          ? "bg-red-50/50 border-red-600 text-red-700 shadow-2xs ring-2 ring-red-600/10 font-bold"
                          : "bg-slate-50/60 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      <CatIcon
                        className={`w-5 h-5 ${
                          isActive ? "text-red-600 stroke-[2.25]" : "text-slate-500 stroke-[1.75]"
                        }`}
                      />
                      <div className="flex items-center gap-1">
                        <span>{cat.label}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            isActive
                              ? "bg-red-600 text-white"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {cat.count}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => scrollCategories(220)}
                className="hidden sm:flex w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 items-center justify-center text-slate-600 shadow-2xs shrink-0 z-10"
                aria-label="Scroll categories right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main 2-Column Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Search & Horizontal Cards (8 cols on lg) */}
            <div className="lg:col-span-8 space-y-4">
              {/* Search Bar matching GoMechanic */}
              <div className="relative">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="service-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setServicePage(1);
                  }}
                  placeholder="Example: Periodic Services, Tyre Puncture, Brake Pads, AC Gas..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 shadow-2xs transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setServicePage(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Section Header */}
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {availableCategories.find((c) => c.id === selectedCategory)?.label || "Car Services"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {filteredServices.length} {filteredServices.length === 1 ? "service package" : "service packages"} available with genuine OEM parts
                  </p>
                </div>

                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset search</span>
                  </button>
                )}
              </div>

              {/* Horizontal Service Cards List */}
              {paginatedServices.length > 0 ? (
                <div className="space-y-3.5">
                  {paginatedServices.map((svc) => (
                    <ServiceCard
                      key={svc.id}
                      service={svc}
                      isSelected={selectedService?.id === svc.id}
                      onSelect={handleSelectService}
                      onViewDetails={setDetailModalService}
                      mode="select"
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Wrench}
                  title="No services match your search"
                  description={`We couldn't find any services matching "${searchQuery}". Try a different keyword or reset filters.`}
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

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">
                    Page <span className="font-bold text-slate-900">{servicePage}</span> of{" "}
                    <span className="font-bold text-slate-900">{totalPages}</span> ({filteredServices.length} total)
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={servicePage <= 1}
                      onClick={() => {
                        setServicePage((p) => Math.max(1, p - 1));
                        window.scrollTo({ top: 180, behavior: "smooth" });
                      }}
                      leftIcon={ChevronLeft}
                      className="text-xs"
                    >
                      Previous
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={servicePage >= totalPages}
                      onClick={() => {
                        setServicePage((p) => Math.min(totalPages, p + 1));
                        window.scrollTo({ top: 180, behavior: "smooth" });
                      }}
                      rightIcon={ChevronRight}
                      className="text-xs"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Sticky Vehicle & Selection Summary (4 cols on lg) */}
            <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
              {/* Vehicle Card (GoMechanic Style) */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3">
                {selectedVehicle ? (
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Selected Vehicle
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsVehicleModalOpen(true)}
                        className="text-xs font-bold text-red-600 hover:text-red-700 uppercase tracking-wider hover:underline"
                      >
                        CHANGE
                      </button>
                    </div>
                    <div className="flex items-center gap-3.5">
                      <div className="w-16 h-12 rounded-xl bg-gradient-to-br from-red-50 to-slate-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0 shadow-2xs">
                        <Car className="w-7 h-7 stroke-[1.75]" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-base font-extrabold text-slate-900 truncate">
                          {selectedVehicle.make} {selectedVehicle.model}
                        </h4>
                        <p className="text-xs text-slate-500 truncate">
                          {selectedVehicle.fuelType || "Petrol"} • {selectedVehicle.manufacturingYear || ""} {selectedVehicle.licensePlate ? `• ${selectedVehicle.licensePlate}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <Car className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">No Vehicle Selected</div>
                        <div className="text-[11px] text-slate-500">Choose from your garage</div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsVehicleModalOpen(true)}
                      className="text-xs font-bold text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Select Car
                    </Button>
                  </div>
                )}
              </div>

              {/* Cart / Booking Summary Box (GoMechanic Style) */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
                {!selectedService ? (
                  <div className="py-8 text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-300 mx-auto">
                      <ShoppingCart className="w-8 h-8 stroke-[1.5]" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-700">No Service Selected Yet</h4>
                      <p className="text-xs text-slate-400 max-w-[200px] mx-auto">
                        Go ahead and book a service for your car.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Service Cart</span>
                      </div>
                      <Badge variant="blue" size="sm">
                        {getCategoryMeta(selectedService.category).shortLabel}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                        {selectedService.name}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{formatDuration(selectedService.estimatedDurationMinutes)}</span>
                      </p>
                    </div>

                    {/* Pricing Breakdown */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Package MRP</span>
                        <span className="line-through">₹{getOriginalPrice(selectedService.basePrice).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-emerald-600 font-semibold">
                        <span>Special Online Discount</span>
                        <span>- ₹{(getOriginalPrice(selectedService.basePrice) - (Number(selectedService.basePrice) || 0)).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Estimated Total</span>
                        <span className="text-lg font-black text-slate-900">
                          {formatPrice(selectedService.basePrice)}
                        </span>
                      </div>
                    </div>

                    {/* Key Guarantee Badges */}
                    <div className="space-y-1.5 text-[11px] text-slate-600 pt-1">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>100% Genuine OEM / OES Spares</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>6-Month / 10,000 km Warranty</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Complimentary Vehicle Health Report</span>
                      </div>
                    </div>

                    {/* Primary Proceed CTA Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedVehicle) {
                          setCurrentStep(3); // Proceed directly to date & time!
                        } else {
                          setCurrentStep(2); // Choose vehicle first
                        }
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.99]"
                    >
                      <span>Proceed to Schedule</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Vehicle Switcher Modal */}
          {isVehicleModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Car className="w-5 h-5 text-red-600" />
                    <span>Select Vehicle for Service</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsVehicleModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
                  {vehicles.length === 0 ? (
                    <div className="text-center py-6 space-y-3">
                      <p className="text-xs text-slate-500">No vehicles found in your garage.</p>
                      <Link href="/garage">
                        <Button size="sm" variant="primary">Register Vehicle Now</Button>
                      </Link>
                    </div>
                  ) : (
                    vehicles.map((v) => {
                      const isCurrent = selectedVehicle?.id === v.id;
                      return (
                        <div
                          key={v.id}
                          onClick={() => {
                            setSelectedVehicle(v);
                            setIsVehicleModalOpen(false);
                            toast.success(`Active vehicle set to ${v.make} ${v.model}`);
                          }}
                          className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                            isCurrent
                              ? "border-red-600 bg-red-50/20 shadow-2xs"
                              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                              <Car className="w-5 h-5" />
                            </div>
                            <div>
                              <h5 className="text-sm font-bold text-slate-900">
                                {v.make} {v.model}
                              </h5>
                              <p className="text-xs text-slate-500">
                                {v.fuelType} • {v.manufacturingYear} {v.licensePlate ? `• ${v.licensePlate}` : ""}
                              </p>
                            </div>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              isCurrent ? "border-red-600 bg-red-600 text-white" : "border-slate-300"
                            }`}
                          >
                            {isCurrent && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <Link
                    href="/garage"
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add another vehicle to garage</span>
                  </Link>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsVehicleModalOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Service Detail Modal */}
          <ServiceDetailModal
            isOpen={Boolean(detailModalService)}
            onClose={() => setDetailModalService(null)}
            service={detailModalService}
            onSelectService={handleSelectFromModal}
            selectLabel="Select This Service"
          />
        </div>
      )}

      {/* STEP 2: VEHICLE SELECTION */}
      {currentStep === 2 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-slate-900">
                Select Your Vehicle
              </h3>
              <p className="text-xs text-slate-500">
                Choose which vehicle from your garage needs servicing.
              </p>
            </div>
            <Link href="/garage">
              <Button variant="outline" size="sm" leftIcon={Plus}>
                Add Another Vehicle
              </Button>
            </Link>
          </div>

          {vehicles.length === 0 ? (
            <EmptyState
              icon={Car}
              title="No Vehicles Registered"
              description="You must register at least one vehicle in your garage before scheduling a service appointment."
              action={
                <Link href="/garage">
                  <Button variant="primary" size="md" leftIcon={Plus}>
                    Register Vehicle Now
                  </Button>
                </Link>
              }
              className="my-6"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehicles.map((v) => {
                const isSelected = selectedVehicle?.id === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVehicle(v)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/20 shadow-xs ring-2 ring-blue-600/10"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Car className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {v.make} {v.model}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {v.registrationNumber}
                          </span>
                          <span className="text-xs text-slate-400">{v.year}</span>
                          {v.fuelType && (
                            <Badge variant="neutral" size="sm">
                              {v.fuelType}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border shrink-0 flex items-center justify-center ${
                        isSelected
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="md"
              onClick={() => setCurrentStep(1)}
              leftIcon={ArrowLeft}
            >
              Back to Service
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={!selectedVehicle}
              onClick={() => setCurrentStep(3)}
              rightIcon={ArrowRight}
            >
              Continue to Schedule
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: SCHEDULE (DATE & TIME SLOT) */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              Choose Date & Workshop Time Slot
            </h3>
            <p className="text-xs text-slate-500">
              Select your preferred appointment date and available service bay window.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Date Selection */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <CalendarIcon className="w-4 h-4 text-blue-600" />
                <span>Appointment Date</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Pick an Appointment Date (Today onwards)
                </label>
                <input
                  type="date"
                  min={todayStr}
                  max={maxDateStr}
                  value={selectedDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && val < todayStr) {
                      toast.error("Past dates cannot be selected. Please choose today or an upcoming date.");
                      handleSelectDate(todayStr);
                    } else {
                      handleSelectDate(val);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all cursor-pointer"
                />
              </div>

              {/* Quick Select Dates (Today, Tomorrow, Upcoming) */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-400">Quick Select:</span>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {[0, 1, 2, 3, 4].map((offset) => {
                    const d = new Date();
                    d.setDate(d.getDate() + offset);
                    const iso = formatLocalDate(d);
                    const isToday = offset === 0;
                    const isTomorrow = offset === 1;
                    const dayName = isToday ? "Today" : isTomorrow ? "Tomorrow" : d.toLocaleDateString("en-IN", { weekday: "short" });
                    const dateNum = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
                    const isSelected = selectedDate === iso;
                    const slotsCount = isToday ? availableSlotsToday.length : CONTROLLED_TIME_SLOTS.length;

                    return (
                      <button
                        key={iso}
                        type="button"
                        onClick={() => handleSelectDate(iso)}
                        className={`p-2 rounded-xl text-center border transition-all ${
                          isSelected
                            ? "border-blue-600 bg-blue-600 text-white shadow-xs font-bold"
                            : "border-slate-200 bg-slate-50 hover:bg-white text-slate-700 font-semibold"
                        }`}
                      >
                        <span className="block text-[10px] uppercase opacity-80">{dayName}</span>
                        <span className="block text-xs font-bold mt-0.5">{dateNum}</span>
                        {isToday && (
                          <span
                            className={`block text-[9px] mt-0.5 font-medium ${
                              isSelected
                                ? "text-blue-100"
                                : slotsCount > 0
                                ? "text-emerald-600"
                                : "text-slate-400"
                            }`}
                          >
                            {slotsCount > 0 ? `${slotsCount} open` : "Closed"}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Time Slot Selection */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Controlled Time Slots</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {selectedDate === todayStr ? "30-min lead buffer" : "Standard 1-hr arrival window"}
                </span>
              </div>

              {selectedDate === todayStr && availableSlotsToday.length === 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    All service bay windows for today have elapsed. Please choose <strong>Tomorrow</strong> or another upcoming date.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CONTROLLED_TIME_SLOTS.map((slot) => {
                  const isAvailable = isSlotAvailableForDate(slot, selectedDate);
                  const isSelected = selectedSlot === slot.id && isAvailable;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => isAvailable && setSelectedSlot(slot.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                        !isAvailable
                          ? "border-slate-200 bg-slate-50/70 opacity-40 cursor-not-allowed text-slate-400 border-dashed"
                          : isSelected
                          ? "border-blue-600 bg-blue-50/40 text-blue-950 font-bold shadow-2xs ring-2 ring-blue-600/10"
                          : "border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 text-slate-700 font-semibold"
                      }`}
                    >
                      <div>
                        <span className="block text-xs">{slot.label}</span>
                        <span className="block text-[10px] font-normal">
                          {!isAvailable ? (
                            <span className="text-amber-600 font-medium">Window Elapsed</span>
                          ) : (
                            <span className="text-slate-400">{slot.period}</span>
                          )}
                        </span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          !isAvailable
                            ? "border-slate-200 bg-slate-200/50 text-slate-400"
                            : isSelected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Customer Special Notes */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Special Instructions or Concerns (Optional)
            </label>
            <textarea
              rows={2}
              maxLength={1000}
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              placeholder="E.g. Brake pedal feels spongy, squeaking noise when turning left, pickup from gate 2..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="md"
              onClick={() => setCurrentStep(2)}
              leftIcon={ArrowLeft}
            >
              Back to Vehicle
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={!selectedDate || selectedDate < todayStr || !selectedSlot || !isSlotAvailableForDate(selectedSlot, selectedDate)}
              onClick={() => {
                if (!selectedDate || selectedDate < todayStr) {
                  toast.error("Please pick a valid appointment date.");
                  return;
                }
                if (!selectedSlot || !isSlotAvailableForDate(selectedSlot, selectedDate)) {
                  toast.error("The selected slot is not open. Please select an available arrival window.");
                  return;
                }
                setCurrentStep(4);
              }}
              rightIcon={ArrowRight}
            >
              Review Booking
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & CONFIRM */}
      {currentStep === 4 && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-bold text-slate-900">
              Review Appointment Summary
            </h3>
            <p className="text-xs text-slate-500">
              Please double check your vehicle details, scheduled slot, and estimated package pricing.
            </p>
          </div>

          {submitError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
              <p className="font-bold">Booking Conflict or Validation Issue</p>
              <p>{submitError}</p>
            </div>
          )}

          {selectedDate && (selectedDate < todayStr || !isSlotAvailableForDate(selectedSlot, selectedDate)) && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Invalid or Elapsed Slot Selected</p>
                <p>
                  The selected appointment date or workshop arrival window has elapsed. Please click &ldquo;Change Schedule&rdquo; below to select an open slot.
                </p>
              </div>
            </div>
          )}

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
            {/* Service & Vehicle Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-5 border-b border-slate-100">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Selected Service
                </span>
                <h4 className="text-base font-bold text-slate-900">
                  {selectedService?.name}
                </h4>
                <div className="flex items-center gap-2">
                  <Badge variant="blue" size="sm">
                    {getCategoryMeta(selectedService?.category).shortLabel}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    Est. {formatDuration(selectedService?.estimatedDurationMinutes)}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Selected Vehicle
                </span>
                <h4 className="text-base font-bold text-slate-900">
                  {selectedVehicle?.make} {selectedVehicle?.model}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {selectedVehicle?.registrationNumber}
                  </span>
                  <span className="text-xs text-slate-500">{selectedVehicle?.year}</span>
                </div>
              </div>
            </div>

            {/* Schedule Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Scheduled Date
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {selectedDate
                      ? (selectedDate === todayStr ? "Today, " : selectedDate === tomorrowStr ? "Tomorrow, " : "") +
                        (parseLocalDate(selectedDate)?.toLocaleDateString("en-IN", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }) || selectedDate)
                      : "Date not selected"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Workshop Slot
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatSlotDisplay(selectedSlot)}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Notes */}
            {customerNotes && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                <span className="font-bold text-slate-900 block mb-0.5">Special Instructions:</span>
                &ldquo;{customerNotes}&rdquo;
              </div>
            )}

            {/* Pricing Breakdown Snapshot */}
            <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Locked Base Estimate
                </span>
                <span className="text-xs text-slate-300">
                  100% Genuine OEM parts + certified labor
                </span>
              </div>
              <p className="text-2xl font-black tracking-tight text-white">
                {formatPrice(selectedService?.basePrice)}
              </p>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>6-Month / 10,000 km Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Doorstep Valet Assistance</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => setCurrentStep(3)}
              disabled={isSubmitting}
              leftIcon={ArrowLeft}
            >
              Change Schedule
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={isSubmitting || !selectedDate || selectedDate < todayStr || !isSlotAvailableForDate(selectedSlot, selectedDate)}
              onClick={handleConfirmBooking}
              isLoading={isSubmitting}
              rightIcon={ArrowRight}
              className="shadow-sm"
            >
              Confirm & Book Service
            </Button>
          </div>
        </div>
      )}

      {/* STEP 5: BOOKING CONFIRMED (SUCCESS SCREEN) */}
      {currentStep === 5 && createdBooking && (
        <div className="max-w-2xl mx-auto space-y-6 text-center py-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1.5">
            <Badge variant="emerald" size="md">
              Appointment Reserved
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Booking Confirmed!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Your service appointment has been reserved in our workshop queue. A service advisor has been assigned.
            </p>
          </div>

          {/* Booking Summary Box */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Booking Reference
              </span>
              <span className="font-mono text-base font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                {createdBooking.bookingReference}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Vehicle</span>
                <span className="font-bold text-slate-900">
                  {createdBooking.vehicle?.make} {createdBooking.vehicle?.model}
                </span>
                <span className="font-mono text-[11px] text-slate-500 block">
                  {createdBooking.vehicle?.registrationNumber}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block">Service Package</span>
                <span className="font-bold text-slate-900">
                  {createdBooking.serviceNameSnapshot || createdBooking.service?.name}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Locked at {formatPrice(createdBooking.price || createdBooking.servicePriceSnapshot)}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block">Date</span>
                <span className="font-bold text-slate-900">
                  {createdBooking.bookingDate}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block">Time Window</span>
                <span className="font-bold text-slate-900">
                  {formatSlotDisplay(createdBooking.timeSlot || createdBooking.bookingTime)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href={`/bookings/${createdBooking.id}`}>
              <Button variant="primary" size="md" className="w-full sm:w-auto">
                View Booking Details
              </Button>
            </Link>
            <Link href="/bookings">
              <Button variant="outline" size="md" className="w-full sm:w-auto">
                Go to My Bookings
              </Button>
            </Link>
            <Link href="/services">
              <Button variant="ghost" size="md" className="w-full sm:w-auto">
                Browse More Services
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Sticky Bottom Summary & Continue Action Bar for Mobile in Step 1 */}
      {currentStep === 1 && selectedService && (
        <div className="lg:hidden sticky bottom-0 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg mt-8 flex items-center justify-between gap-3 transition-all">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
              {getCategoryMeta(selectedService.category).shortLabel}
            </div>
            <div className="text-sm font-bold text-slate-900 truncate">
              {selectedService.name}
            </div>
            <div className="text-xs font-black text-slate-900">
              {formatPrice(selectedService.basePrice)}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (selectedVehicle) {
                setCurrentStep(3);
              } else {
                setCurrentStep(2);
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <span>Continue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </CustomerShell>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense
      fallback={
        <CustomerShell activeNav="/bookings">
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-500">Loading booking wizard...</p>
          </div>
        </CustomerShell>
      }
    >
      <BookingWizardContent />
    </Suspense>
  );
}
