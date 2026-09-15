"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import CustomerShell from "../../components/layout/CustomerShell";
import PageHeader from "../../components/ui/PageHeader";
import Card, { CardHeader, CardContent } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import { useToast } from "../../context/ToastContext";
import { marketplaceApi } from "../../lib/marketplace";
import { formatPrice } from "../../lib/services";
import {
  Activity,
  CheckCircle2,
  Clock,
  Wrench,
  Car,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Check,
  Building2,
  FileText,
  XCircle,
  ExternalLink,
} from "lucide-react";

function TrackingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();

  const queryBookingId = searchParams.get("bookingId");
  const queryRequestId = searchParams.get("requestId");

  const [trackingList, setTrackingList] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    let isMounted = true;

    async function loadTrackingData() {
      setIsLoading(true);
      setError(null);
      try {
        if (queryBookingId) {
          const data = await marketplaceApi.getCustomerTracking({ bookingId: queryBookingId });
          if (isMounted && data) {
            setSelectedJob(data);
            setTrackingList([data]);
          }
        } else if (queryRequestId) {
          const data = await marketplaceApi.getCustomerTracking({ requestId: queryRequestId });
          if (isMounted && data) {
            setSelectedJob(data);
            setTrackingList([data]);
          }
        } else {
          // Fetch active jobs
          try {
            const data = await marketplaceApi.getCustomerTracking();
            if (isMounted && data) {
              const list = Array.isArray(data) ? data : [data];
              setTrackingList(list);
              if (list.length > 0) {
                setSelectedJob(list[0]);
              }
            }
          } catch {
            if (isMounted) {
              setTrackingList([]);
              setSelectedJob(null);
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load tracking details:", err);
          setError(err.message || "Failed to load service tracking details");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTrackingData();

    return () => {
      isMounted = false;
    };
  }, [queryBookingId, queryRequestId, refreshKey]);

  const handleCancelService = async () => {
    if (!selectedJob) return;
    setIsCancelling(true);
    try {
      if (selectedJob.bookingId) {
        const response = await fetch(`/api/v1/bookings/${selectedJob.bookingId}/cancel`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        });
        const res = await response.json();
        if (!res.success) {
          throw new Error(res.message || "Failed to cancel booking");
        }
      } else if (selectedJob.serviceRequestId) {
        await marketplaceApi.cancelServiceRequest(selectedJob.serviceRequestId);
      }
      toast.success("Service cancelled successfully. Any workshop holds have been refunded.");
      setShowCancelModal(false);
      triggerRefresh();
    } catch (err) {
      toast.error(err.message || "Could not cancel service");
    } finally {
      setIsCancelling(false);
    }
  };

  const STAGES = [
    { step: 1, key: "ASSIGNED", label: "Booking Placed", desc: "Finding authorized service center" },
    { step: 2, key: "CONFIRMED", label: "Confirmed", desc: "Bay and technician scheduled" },
    { step: 3, key: "VEHICLE_RECEIVED", label: "Vehicle Intake", desc: "Car checked in at workshop bay" },
    { step: 4, key: "INSPECTION", label: "Inspection", desc: "Multi-point diagnostics & checkup" },
    { step: 5, key: "WORK_IN_PROGRESS", label: "In Progress", desc: "Parts & maintenance underway" },
    { step: 6, key: "READY_FOR_DELIVERY", label: "Quality Check", desc: "Washing, detailing & final test" },
    { step: 7, key: "COMPLETED", label: "Completed", desc: "Vehicle ready for customer pickup" },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 font-medium">Connecting to workshop bay telemetry...</p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Tracking Error"
        message={error}
        onRetry={triggerRefresh}
      />
    );
  }

  if (!selectedJob) {
    return (
      <EmptyState
        icon={Activity}
        title="No Active Repair Job"
        description="You have no active vehicle repairs currently undergoing maintenance in workshop bays."
        action={
          <Link href="/bookings/new">
            <Button variant="primary" rightIcon={ArrowRight}>
              Book a Service
            </Button>
          </Link>
        }
        secondaryAction={
          <Link href="/bookings">
            <Button variant="outline">
              View Bookings History
            </Button>
          </Link>
        }
      />
    );
  }

  const currentStepNum = selectedJob.currentStep || selectedJob.stageNumber || 1;
  const isCancelled = selectedJob.status === "CANCELLED" || selectedJob.jobStatus === "CANCELLED";
  const isCompleted = selectedJob.status === "COMPLETED" || selectedJob.jobStatus === "COMPLETED";

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {selectedJob.friendlyStatusTitle || "Service Tracking"}
            </h2>
            {isCancelled ? (
              <Badge variant="red" size="sm">Cancelled</Badge>
            ) : isCompleted ? (
              <Badge variant="green" size="sm">Service Completed</Badge>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Bay Telemetry
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {selectedJob.friendlyStatusDescription || "Your vehicle is progressing through authorized service bay stages."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={RotateCcw}
            onClick={triggerRefresh}
          >
            Refresh
          </Button>

          {selectedJob.isCancellable && !isCancelled && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-800"
              onClick={() => setShowCancelModal(true)}
            >
              Cancel Service
            </Button>
          )}
        </div>
      </div>

      {/* 7-Stage Horizontal Stepper */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Lifecycle Progress: Stage {isCancelled ? "Cancelled" : `${currentStepNum} of 7`}
          </span>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            Ref: {selectedJob.bookingReference || selectedJob.requestReference}
          </span>
        </div>

        <div className="relative">
          {/* Progress track line */}
          <div className="hidden md:block absolute top-5 left-8 right-8 h-1 bg-gray-200 dark:bg-gray-700 -z-0">
            <div
              className={`h-full transition-all duration-500 ${isCancelled ? "bg-red-500" : "bg-indigo-600"}`}
              style={{
                width: isCancelled ? "100%" : `${Math.min(100, Math.max(0, ((currentStepNum - 1) / (STAGES.length - 1)) * 100))}%`,
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 relative z-10">
            {STAGES.map((s) => {
              const isPast = !isCancelled && currentStepNum > s.step;
              const isCurrent = !isCancelled && currentStepNum === s.step;
              const isFuture = !isCancelled && currentStepNum < s.step;

              return (
                <div key={s.step} className="flex md:flex-col items-center md:text-center gap-3 md:gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shrink-0 ${
                      isPast
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                        : isCurrent
                        ? "bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900/50 shadow-lg shadow-indigo-600/30 scale-105"
                        : isCancelled
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    {isPast ? <Check className="w-5 h-5" /> : isCancelled ? <XCircle className="w-5 h-5 text-red-500" /> : s.step}
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`text-xs font-semibold truncate ${
                        isCurrent
                          ? "text-indigo-600 dark:text-indigo-400"
                          : isPast
                          ? "text-gray-900 dark:text-gray-100"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {s.label}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Two Column Layout: Partner Garage Details & Vehicle/Order Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workshop Partner Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Assigned Service Centre</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedJob.assignedWorkshopName || selectedJob.workshop?.name ? (
              <div className="space-y-3">
                <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      {selectedJob.assignedWorkshopName || selectedJob.workshop?.name}
                    </h4>
                    <Badge variant="blue" size="sm">Verified Partner</Badge>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300 mt-2">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span>{selectedJob.assignedWorkshopAddress || selectedJob.workshop?.address || "Authorized Workshop Bay"}</span>
                  </div>
                </div>

                {(selectedJob.assignedWorkshopPhone || selectedJob.workshop?.phone) && (
                  <a
                    href={`tel:${selectedJob.assignedWorkshopPhone || selectedJob.workshop?.phone}`}
                    className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-sm"
                  >
                    <Phone className="w-4 h-4" />
                    Call Service Center ({selectedJob.assignedWorkshopPhone || selectedJob.workshop?.phone})
                  </a>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                <Clock className="w-8 h-8 mx-auto text-amber-500 mb-2 animate-pulse" />
                <p className="font-medium text-gray-700 dark:text-gray-300">Matching Nearby Service Centres</p>
                <p className="text-xs text-gray-500 mt-1">
                  Our algorithm is securing the best certified workshop in your city. Details will unlock as soon as assigned.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vehicle & Service Items Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Vehicle & Package Details</h3>
              </div>
              {selectedJob.appointmentDate && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {selectedJob.appointmentDate} ({selectedJob.appointmentTimeSlot || "Morning"})
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedJob.vehicleSummary && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-between text-sm">
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">Registered Vehicle</span>
                  <p className="font-bold text-gray-900 dark:text-white mt-0.5">{selectedJob.vehicleSummary}</p>
                </div>
                <Badge variant="gray" size="sm">Active Bay</Badge>
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Authorized Services Included
              </h4>
              <div className="divide-y divide-gray-100 dark:divide-gray-700 border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden">
                {(selectedJob.services || []).map((s, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-sm bg-white dark:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {s.serviceNameSnapshot || s.name || "Package Service"}
                      </span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {formatPrice(s.finalPriceSnapshot || s.price || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Authoritative Amount</span>
              <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                {formatPrice(selectedJob.totalAmount || 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">Cancel Service Booking</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to cancel this booking? Because physical vehicle intake has not yet taken place, you are eligible for full cancellation. Any workshop acceptance fee will be automatically refunded.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
              >
                Go Back
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleCancelService}
                isLoading={isCancelling}
              >
                Yes, Cancel Service
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackingPage() {
  return (
    <CustomerShell>
      <PageHeader
        title="Vehicle Service Tracking"
        description="Monitor real-time repair stages, technician inspections, and workshop milestones."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Live Tracking" },
        ]}
      />
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 font-medium">Loading tracking details...</p>
          </div>
        }
      >
        <TrackingContent />
      </Suspense>
    </CustomerShell>
  );
}
