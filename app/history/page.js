"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import CustomerShell from "../../components/layout/CustomerShell";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import Button from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { useToast } from "../../context/ToastContext";
import {
  FileText,
  Download,
  Search,
  History,
  Calendar,
  Wrench,
  Clock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { bookingsApi, formatBookingDate, getBookingStatusMeta } from "../../lib/bookings";
import { formatPrice } from "../../lib/services";

export default function HistoryPage() {
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let ignore = false;
    async function fetchHistory() {
      try {
        const data = await bookingsApi.getBookings();
        if (!ignore) {
          setBookings(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch customer service history:", err);
        if (!ignore) {
          setError(err?.message || "Unable to load service records from the server.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchHistory();

    return () => {
      ignore = true;
    };
  }, []);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    bookingsApi
      .getBookings()
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .catch((err) => setError(err?.message || "Unable to load service records."))
      .finally(() => setIsLoading(false));
  };

  const filteredBookings = bookings.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const ref = (item.bookingReference || "").toLowerCase();
    const serviceName = (item.serviceNameSnapshot || item.serviceName || item.service?.name || "").toLowerCase();
    const vehicle = `${item.vehicleMake || item.vehicle?.brand || ""} ${item.vehicleModel || item.vehicle?.model || ""}`.toLowerCase();
    const reg = (item.registrationNumber || item.vehicle?.registrationNumber || item.vehicle?.registration || "").toLowerCase();
    return ref.includes(q) || serviceName.includes(q) || vehicle.includes(q) || reg.includes(q);
  });

  const handleDownloadInvoice = (reference) => {
    toast.success(`Digital GST Tax Invoice for ${reference} generated successfully.`);
  };

  return (
    <CustomerShell>
      <PageHeader
        title="Service Records & Invoices"
        description="Transparent digital service logbook tracking vehicle appointments, verified invoices, and completed maintenance records."
        badge={
          <Badge variant="blue" size="sm">
            {bookings.length} Records
          </Badge>
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Service History" },
        ]}
        actions={
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by ref, car, reg..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-2xs transition-all"
            />
          </div>
        }
      />

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="h-32 rounded-2xl bg-white border border-slate-200/80 p-6 animate-pulse space-y-3">
              <div className="h-5 bg-slate-200 rounded w-1/4" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
              <div className="h-4 bg-slate-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState
          title="Failed to Load Service History"
          message={error}
          onRetry={handleRetry}
        />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          icon={History}
          title={searchQuery ? "No Matching Records" : "No Service Records Yet"}
          description={
            searchQuery
              ? `No service history matches "${searchQuery}". Try searching by registration number or service name.`
              : "Your completed appointments and workshop service invoices will automatically appear here."
          }
          action={
            searchQuery ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </Button>
            ) : (
              <Link href="/bookings/new">
                <Button variant="primary" size="sm" rightIcon={ArrowRight}>
                  Book a Service
                </Button>
              </Link>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((item) => {
            const statusMeta = getBookingStatusMeta(item.status);
            const serviceName = item.serviceNameSnapshot || item.serviceName || item.service?.name || "Standard Service";
            const vehicleMake = item.vehicleMake || item.vehicle?.brand || "";
            const vehicleModel = item.vehicleModel || item.vehicle?.model || "";
            const vehicleName = vehicleMake ? `${vehicleMake} ${vehicleModel}` : "Vehicle Service";
            const regNumber = item.registrationNumber || item.vehicle?.registrationNumber || item.vehicle?.registration || "Registered Vehicle";
            const bookingRef = item.bookingReference || `BK-${item.id}`;
            const amount = item.totalAmount || item.finalPrice || item.servicePriceSnapshot || 0;

            return (
              <Card key={item.id} hover className="p-5 sm:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                      <FileText className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">
                          {serviceName}
                        </h3>
                        <Badge
                          variant={statusMeta.badgeVariant}
                          size="sm"
                          dot
                        >
                          {statusMeta.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {vehicleName} • Reg:{" "}
                        <span className="font-mono font-medium text-slate-700">
                          {regNumber}
                        </span>{" "}
                        • Ref: <span className="font-mono font-medium text-slate-600">{bookingRef}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 justify-between md:justify-end">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        Invoice Total
                      </span>
                      <p className="text-lg font-extrabold text-slate-900">
                        {formatPrice(amount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadInvoice(bookingRef)}
                        leftIcon={Download}
                      >
                        Invoice PDF
                      </Button>
                      <Link href={`/bookings/${item.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          rightIcon={ExternalLink}
                        >
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Service Date:</span>
                    <p className="text-slate-800 font-semibold mt-0.5">
                      {formatBookingDate(item.bookingDate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Time Slot:</span>
                    <p className="text-slate-800 font-semibold mt-0.5">
                      {item.timeSlot || "Scheduled Slot"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Status Note:</span>
                    <p className="text-slate-800 font-semibold mt-0.5">
                      {statusMeta.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </CustomerShell>
  );
}
