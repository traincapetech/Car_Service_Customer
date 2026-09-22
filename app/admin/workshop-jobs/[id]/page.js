"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { adminWorkshopJobsApi } from "../../../../lib/adminWorkshopJobs";
import { useToast } from "../../../../context/ToastContext";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import PageHeader from "../../../../components/ui/PageHeader";
import EmptyState from "../../../../components/ui/EmptyState";
import ErrorState from "../../../../components/ui/ErrorState";
import { Skeleton } from "../../../../components/ui/Skeleton";
import {
  Calendar,
  Clock,
  Car,
  User,
  Building2,
  MapPin,
  IndianRupee,
  Wrench,
  Ban,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ArrowLeft,
  RefreshCw,
  Phone,
  Mail,
  ShieldCheck,
  Briefcase,
  Layers,
  FileText,
  Activity,
  Check,
  Edit3,
  X,
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
      return <Badge variant="warning" size="md" dot>Assigned</Badge>;
    case "CONFIRMED":
      return <Badge variant="blue" size="md" dot>Confirmed</Badge>;
    case "VEHICLE_RECEIVED":
      return <Badge variant="purple" size="md" dot>Vehicle Received</Badge>;
    case "INSPECTION":
      return <Badge variant="purple" size="md" dot>Inspection</Badge>;
    case "WORK_IN_PROGRESS":
      return <Badge variant="blue" size="md" dot>Work In Progress</Badge>;
    case "READY_FOR_DELIVERY":
      return <Badge variant="amber" size="md" dot>Ready for Delivery</Badge>;
    case "COMPLETED":
      return <Badge variant="success" size="md" dot>Completed</Badge>;
    case "CANCELLED":
      return <Badge variant="danger" size="md" dot>Cancelled</Badge>;
    case "TRANSFERRED":
      return <Badge variant="neutral" size="md" dot>Transferred</Badge>;
    default:
      return <Badge variant="neutral" size="md">{status || "Unknown"}</Badge>;
  }
}

const LIFECYCLE_STEPS = [
  { key: "ASSIGNED", label: "Assigned", timeField: "assignedAt" },
  { key: "CONFIRMED", label: "Confirmed", timeField: "confirmedAt" },
  { key: "VEHICLE_RECEIVED", label: "Intake", timeField: "vehicleReceivedAt" },
  { key: "INSPECTION", label: "Inspection", timeField: "inspectionStartedAt" },
  { key: "WORK_IN_PROGRESS", label: "In Service", timeField: "workStartedAt" },
  { key: "READY_FOR_DELIVERY", label: "Ready", timeField: "readyForDeliveryAt" },
  { key: "COMPLETED", label: "Completed", timeField: "completedAt" },
];

export default function WorkshopJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const jobId = params?.id;

  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Status Update Modal State
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [statusReason, setStatusReason] = useState("");
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

  const fetchJobDetail = useCallback(async () => {
    if (!jobId) return;
    setIsRefreshing(true);
    try {
      const data = await adminWorkshopJobsApi.getJobDetail(jobId);
      setJob(data);
      setError(null);
    } catch (err) {
      console.error("Failed to load workshop job detail:", err);
      setError(err.message || "Failed to load workshop job details from administrative server.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [jobId]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const data = await adminWorkshopJobsApi.getJobDetail(jobId);
        if (!ignore) {
          setJob(data);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load workshop job detail:", err);
          setError(err.message || "Failed to load workshop job details from administrative server.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    if (jobId) {
      load();
    }
    return () => {
      ignore = true;
    };
  }, [jobId]);

  const handleOpenStatusModal = () => {
    if (!job) return;
    setTargetStatus(job.status || "CONFIRMED");
    setStatusNotes(job.notes || "");
    setStatusReason("");
    setIsUpdateModalOpen(true);
  };

  const handleConfirmStatusUpdate = async (e) => {
    e.preventDefault();
    if (!targetStatus) return;

    if ((targetStatus === "CANCELLED" || targetStatus === "TRANSFERRED") && !statusReason.trim()) {
      showError(`A reason is required when transitioning job to ${targetStatus}.`);
      return;
    }

    setIsSubmittingStatus(true);
    try {
      await adminWorkshopJobsApi.updateJobStatus(job.id, {
        status: targetStatus,
        notes: statusNotes.trim() || undefined,
        reason: statusReason.trim() || undefined,
      });

      showSuccess(`Workshop Job status updated to ${targetStatus}.`);
      setIsUpdateModalOpen(false);
      fetchJobDetail(true);
    } catch (err) {
      showError(err.message || "Failed to update workshop job status.");
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-64 rounded-xl" />
        </div>
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="p-8">
        <ErrorState
          title="Unable to Load Workshop Job"
          message={error || "Job not found."}
          onRetry={() => fetchJobDetail(false)}
        />
        <div className="mt-4 flex justify-center">
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/workshop-jobs")}>
            Return to Workshop Jobs
          </Button>
        </div>
      </div>
    );
  }

  const isTerminal = job.status === "COMPLETED" || job.status === "CANCELLED" || job.status === "TRANSFERRED";

  // Calculate lifecycle step index
  const currentStepIdx = LIFECYCLE_STEPS.findIndex((s) => s.key === job.status);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb / Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/workshop-jobs">
            <Button variant="ghost" size="sm" className="flex items-center gap-1.5 text-slate-600">
              <ArrowLeft className="w-4 h-4" />
              <span>Jobs</span>
            </Button>
          </Link>
          <div className="h-4 w-px bg-slate-300" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                Job #{job.jobReference || `JOB-${job.id}`}
              </h1>
              {getJobStatusBadge(job.status)}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Created on {formatDateTime(job.createdAt)} • Last updated {formatDateTime(job.updatedAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchJobDetail(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          {job.bookingId && (
            <Link href={`/admin/bookings/${job.bookingId}`}>
              <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-primary-700 hover:text-primary-800">
                <FileText className="w-3.5 h-3.5" />
                <span>View Booking #{job.bookingReference}</span>
              </Button>
            </Link>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenStatusModal}
            className="flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Update Status</span>
          </Button>
        </div>
      </div>

      {/* Visual Lifecycle Stepper Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary-600" />
            <h2 className="text-sm font-bold text-slate-900">Workshop Operational Lifecycle</h2>
          </div>
          {job.status === "CANCELLED" && (
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              Cancelled on {formatDateTime(job.cancelledAt)}
            </span>
          )}
          {job.status === "TRANSFERRED" && (
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              Transferred on {formatDateTime(job.transferredAt)}
            </span>
          )}
        </div>

        {/* Stepper track */}
        <div className="relative">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {LIFECYCLE_STEPS.map((step, idx) => {
              const timestamp = job[step.timeField];
              const isPast = timestamp !== null && timestamp !== undefined;
              const isCurrent = job.status === step.key;

              let iconBg = "bg-slate-100 text-slate-400 border-slate-200";
              let textClass = "text-slate-500";

              if (isCurrent) {
                iconBg = "bg-primary-600 text-white border-primary-600 ring-4 ring-primary-100";
                textClass = "text-primary-700 font-bold";
              } else if (isPast) {
                iconBg = "bg-emerald-600 text-white border-emerald-600";
                textClass = "text-slate-800 font-semibold";
              }

              return (
                <div
                  key={step.key}
                  className={`p-3 rounded-xl border transition-all ${
                    isCurrent
                      ? "bg-primary-50/40 border-primary-200"
                      : isPast
                      ? "bg-emerald-50/20 border-emerald-100"
                      : "bg-slate-50/50 border-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 text-xs ${iconBg}`}
                    >
                      {isPast && !isCurrent ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>
                    <span className={`text-xs ${textClass}`}>{step.label}</span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500 min-h-[16px]">
                    {timestamp ? (
                      <div>
                        <div>{formatDate(timestamp)}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(timestamp).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Pending</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cancellation or Transferred Banner if present */}
        {job.cancellationReason && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Cancellation / Transfer Reason: </span>
              <span>{job.cancellationReason}</span>
            </div>
          </div>
        )}

        {/* Operational Notes if present */}
        {job.notes && (
          <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
            <FileText className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Internal Notes: </span>
              <span>{job.notes}</span>
            </div>
          </div>
        )}
      </div>

      {/* 360° Partner, Customer & Vehicle Dossier Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workshop Partner Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Workshop Partner</h3>
            </div>
            {job.workshopStatus && (
              <Badge variant={job.workshopStatus === "VERIFIED" ? "success" : "warning"} size="xs">
                {job.workshopStatus}
              </Badge>
            )}
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-slate-400 block">Workshop Name</span>
              <span className="font-semibold text-slate-900 block mt-0.5">
                {job.workshopName || "Unassigned"}
              </span>
            </div>

            {job.workshopPhone && (
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{job.workshopPhone}</span>
              </div>
            )}

            {job.workshopEmail && (
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{job.workshopEmail}</span>
              </div>
            )}

            {(job.workshopAddress || job.workshopCity) && (
              <div className="flex items-start gap-2 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <span className="text-xs">
                  {job.workshopAddress ? `${job.workshopAddress}, ` : ""}
                  {job.workshopCity ? `${job.workshopCity} ` : ""}
                  {job.workshopState || ""}
                </span>
              </div>
            )}
          </div>

          {job.workshopId && (
            <div className="pt-2 border-t border-slate-100">
              <Link href={`/admin/workshops/${job.workshopId}`}>
                <Button variant="ghost" size="xs" className="w-full flex items-center justify-center gap-1 text-primary-600 hover:text-primary-700">
                  <span>View Partner Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Customer Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Customer Details</h3>
            </div>
            <Badge variant="blue" size="xs">Direct Client</Badge>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-slate-400 block">Customer Name</span>
              <span className="font-semibold text-slate-900 block mt-0.5">
                {job.customerName || "Customer"}
              </span>
            </div>

            {job.customerPhone && (
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{job.customerPhone}</span>
              </div>
            )}

            {job.customerEmail && (
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{job.customerEmail}</span>
              </div>
            )}

            {job.customerCreatedAt && (
              <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Member since {formatDate(job.customerCreatedAt)}</span>
              </div>
            )}
          </div>

          {job.customerId && (
            <div className="pt-2 border-t border-slate-100">
              <Link href={`/admin/customers/${job.customerId}`}>
                <Button variant="ghost" size="xs" className="w-full flex items-center justify-center gap-1 text-emerald-700 hover:text-emerald-800">
                  <span>View Customer Dossier</span>
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Vehicle Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900">Serviced Vehicle</h3>
            </div>
            {job.vehicleRegistrationNumber && (
              <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                {job.vehicleRegistrationNumber}
              </span>
            )}
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-slate-400 block">Make & Model</span>
              <span className="font-semibold text-slate-900 block mt-0.5">
                {job.vehicleYear ? `${job.vehicleYear} ` : ""}
                {job.vehicleMake || ""} {job.vehicleModel || "Vehicle"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Fuel Type</span>
                <span className="font-medium text-slate-800">{job.vehicleFuelType || "—"}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Transmission</span>
                <span className="font-medium text-slate-800">{job.vehicleTransmission || "—"}</span>
              </div>
            </div>
          </div>

          {/* Linked Booking summary box */}
          {job.bookingId && (
            <div className="pt-2 border-t border-slate-100 bg-slate-50/60 p-3 rounded-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Booking Ref</span>
                <Link
                  href={`/admin/bookings/${job.bookingId}`}
                  className="font-bold text-primary-600 hover:underline"
                >
                  #{job.bookingReference}
                </Link>
              </div>
              <div className="flex items-center justify-between text-xs mt-1.5">
                <span className="text-slate-500">Booking Amount</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(job.bookingTotalAmount)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Services Requested & Line Items */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-primary-600" />
            <h2 className="text-sm font-bold text-slate-900">Service Line Items</h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {job.services?.length || 0} items requested
          </span>
        </div>

        {job.services && job.services.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Service Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {job.services.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {item.serviceName || item.customServiceName || "Service Item"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-slate-600 font-mono bg-slate-100 px-2 py-0.5 rounded">
                        {item.serviceCategory || "SERVICE"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {item.packageType || "Standard"}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900">
                      {formatCurrency(item.price || item.estimatedPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 bg-slate-50/80 font-bold text-slate-900">
                  <td colSpan={3} className="py-3 px-4 text-right">
                    Total Estimated Amount:
                  </td>
                  <td className="py-3 px-4 text-right text-base text-primary-700">
                    {formatCurrency(job.bookingTotalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-sm">
            No specific line items cataloged for this job.
          </div>
        )}
      </div>

      {/* Audit Trail & Milestone History */}
      {job.auditEvents && job.auditEvents.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">Marketplace Audit Trail</h2>
            </div>
            <span className="text-xs text-slate-400">
              {job.auditEvents.length} recorded events
            </span>
          </div>

          <div className="p-4 sm:p-5 space-y-3">
            {job.auditEvents.map((evt, idx) => (
              <div
                key={evt.id || idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs"
              >
                <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">{evt.action}</span>
                    <span className="text-slate-400">{formatDateTime(evt.createdAt)}</span>
                  </div>
                  <div className="text-slate-600 mt-1">{evt.details}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Actor: {evt.actorEmail || evt.actorType || "System"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-primary-600" />
                <h3 className="font-bold text-slate-900">Update Job Lifecycle Status</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmStatusUpdate} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Target Status <span className="text-rose-500">*</span>
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  required
                >
                  <option value="ASSIGNED">Assigned (Awaiting workshop acceptance)</option>
                  <option value="CONFIRMED">Confirmed (Partner accepted job)</option>
                  <option value="VEHICLE_RECEIVED">Vehicle Received (Customer delivered car)</option>
                  <option value="INSPECTION">Inspection (Technician diagnosing)</option>
                  <option value="WORK_IN_PROGRESS">Work In Progress (Bay active service)</option>
                  <option value="READY_FOR_DELIVERY">Ready For Delivery (Service completed, car parked)</option>
                  <option value="COMPLETED">Completed (Handed over to customer, invoice settled)</option>
                  <option value="CANCELLED">Cancelled (Void job)</option>
                  <option value="TRANSFERRED">Transferred (Reassign to different workshop)</option>
                </select>
              </div>

              {(targetStatus === "CANCELLED" || targetStatus === "TRANSFERRED") && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Reason <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder={`State why this job is being ${targetStatus.toLowerCase()}...`}
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Operational Notes / Technician Remarks
                </label>
                <textarea
                  rows={3}
                  placeholder="Optional internal remarks or workshop update notes..."
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Updating status records an immutable administrative audit event and dispatches real-time WebSocket alerts to both the customer and the workshop partner.
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsUpdateModalOpen(false)}
                  disabled={isSubmittingStatus}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmittingStatus}
                >
                  {isSubmittingStatus ? "Updating..." : "Save Status Transition"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
