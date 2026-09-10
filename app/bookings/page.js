"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import CustomerShell from "../../components/layout/CustomerShell";
import PageHeader from "../../components/ui/PageHeader";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import BookingCard from "../../components/booking/BookingCard";
import { BookingListSkeleton } from "../../components/booking/BookingSkeleton";
import CancelBookingModal from "../../components/booking/CancelBookingModal";
import { bookingsApi } from "../../lib/bookings";
import {
  Calendar,
  Plus,
  Search,
  X,
  RotateCcw,
  Wrench,
  Filter,
} from "lucide-react";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Cancel Modal
  const [bookingToCancel, setBookingToCancel] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function fetchBookings() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await bookingsApi.getBookings();
        if (!ignore) {
          setBookings(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load bookings.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchBookings();

    return () => {
      ignore = true;
    };
  }, []);

  const handleRetry = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await bookingsApi.getBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load bookings.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingCancelled = (cancelledBooking) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === cancelledBooking.id ? cancelledBooking : b))
    );
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Status filter
      let matchesStatus = true;
      if (statusFilter === "ACTIVE") {
        matchesStatus = b.status === "PENDING" || b.status === "CONFIRMED";
      } else if (statusFilter !== "ALL") {
        matchesStatus = b.status === statusFilter;
      }

      // Search filter
      const q = searchQuery.trim().toLowerCase();
      const serviceName = (b.serviceNameSnapshot || b.service?.name || "").toLowerCase();
      const vehicleMake = (b.vehicle?.make || "").toLowerCase();
      const vehicleModel = (b.vehicle?.model || "").toLowerCase();
      const vehicleReg = (b.vehicle?.registrationNumber || "").toLowerCase();
      const reference = (b.bookingReference || "").toLowerCase();

      const matchesSearch =
        !q ||
        reference.includes(q) ||
        serviceName.includes(q) ||
        vehicleMake.includes(q) ||
        vehicleModel.includes(q) ||
        vehicleReg.includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [bookings, statusFilter, searchQuery]);

  const activeCount = useMemo(() => {
    return bookings.filter((b) => b.status === "PENDING" || b.status === "CONFIRMED").length;
  }, [bookings]);

  return (
    <CustomerShell>
      {/* PAGE HEADER */}
      <PageHeader
        title="My Service Bookings"
        description="Review scheduled appointments, inspect service records, track active repairs, or manage bookings."
        badge={
          !isLoading && !error && (
            <Badge variant="blue" size="sm" dot>
              {activeCount} {activeCount === 1 ? "Active Appointment" : "Active Appointments"}
            </Badge>
          )
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "My Bookings" },
        ]}
        actions={
          <Link href="/bookings/new">
            <Button variant="primary" size="sm" leftIcon={Plus} id="new-booking-btn">
              Schedule Service
            </Button>
          </Link>
        }
      />

      {/* TOOLBAR: SEARCH & STATUS TABS */}
      {!error && (
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bookings by reference CSB-..., vehicle, or service..."
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all"
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

            {/* Quick Action */}
            <Link href="/services" className="shrink-0 hidden sm:block">
              <Button variant="outline" size="sm" leftIcon={Wrench}>
                Service Catalog
              </Button>
            </Link>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 scrollbar-none">
            {[
              { id: "ALL", label: "All Bookings", count: bookings.length },
              { id: "ACTIVE", label: "Active", count: activeCount },
              {
                id: "IN_PROGRESS",
                label: "In Progress",
                count: bookings.filter((b) => b.status === "IN_PROGRESS").length,
              },
              {
                id: "COMPLETED",
                label: "Completed",
                count: bookings.filter((b) => b.status === "COMPLETED").length,
              },
              {
                id: "CANCELLED",
                label: "Cancelled",
                count: bookings.filter((b) => b.status === "CANCELLED").length,
              },
            ].map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100/70 hover:bg-slate-200/70 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ERROR STATE */}
      {error && (
        <ErrorState
          title="Unable to Load Bookings"
          description={error}
          onRetry={handleRetry}
          retryLabel="Try Again"
          className="my-6"
        />
      )}

      {/* LOADING STATE */}
      {isLoading && !error && <BookingListSkeleton count={4} />}

      {/* EMPTY STATES */}
      {!isLoading && !error && bookings.length === 0 && (
        <EmptyState
          icon={Calendar}
          title="No bookings yet"
          description="You haven't scheduled any service appointments yet. Choose a package from our catalog and schedule your first service."
          action={
            <Link href="/services">
              <Button variant="primary" size="md" leftIcon={Wrench}>
                Browse Service Catalog
              </Button>
            </Link>
          }
          className="my-8"
        />
      )}

      {!isLoading && !error && bookings.length > 0 && filteredBookings.length === 0 && (
        <EmptyState
          icon={Search}
          title="No matching bookings found"
          description={
            searchQuery
              ? `No bookings match "${searchQuery}". Try a different keyword or reset filters.`
              : "No bookings found with the selected status filter."
          }
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStatusFilter("ALL");
                setSearchQuery("");
              }}
              leftIcon={RotateCcw}
            >
              Reset Filters
            </Button>
          }
          className="my-8"
        />
      )}

      {/* BOOKINGS GRID / LIST */}
      {!isLoading && !error && filteredBookings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {filteredBookings.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onCancelClick={(booking) => setBookingToCancel(booking)}
            />
          ))}
        </div>
      )}

      {/* CANCEL BOOKING MODAL */}
      <CancelBookingModal
        isOpen={Boolean(bookingToCancel)}
        onClose={() => setBookingToCancel(null)}
        booking={bookingToCancel}
        onCancelled={handleBookingCancelled}
      />
    </CustomerShell>
  );
}
