import { apiRequest } from "./api";

/**
 * Controlled time slots for workshop scheduling
 */
export const CONTROLLED_TIME_SLOTS = [
  { id: "09:00-10:00", label: "09:00 AM – 10:00 AM", period: "Morning", hours: "09:00" },
  { id: "10:00-11:00", label: "10:00 AM – 11:00 AM", period: "Morning", hours: "10:00" },
  { id: "11:00-12:00", label: "11:00 AM – 12:00 PM", period: "Morning", hours: "11:00" },
  { id: "12:00-13:00", label: "12:00 PM – 01:00 PM", period: "Afternoon", hours: "12:00" },
  { id: "14:00-15:00", label: "02:00 PM – 03:00 PM", period: "Afternoon", hours: "14:00" },
  { id: "15:00-16:00", label: "03:00 PM – 04:00 PM", period: "Afternoon", hours: "15:00" },
  { id: "16:00-17:00", label: "04:00 PM – 05:00 PM", period: "Evening", hours: "16:00" },
  { id: "17:00-18:00", label: "05:00 PM – 06:00 PM", period: "Evening", hours: "17:00" },
];

/**
 * Status metadata helper matching backend BookingStatus
 */
export const BOOKING_STATUSES = {
  CONFIRMED: {
    label: "Confirmed",
    badgeVariant: "emerald",
    dotVariant: "bg-emerald-500",
    description: "Your appointment is confirmed with the workshop.",
  },
  PENDING: {
    label: "Pending Confirmation",
    badgeVariant: "amber",
    dotVariant: "bg-amber-500",
    description: "Awaiting service bay allocation.",
  },
  IN_PROGRESS: {
    label: "In Progress",
    badgeVariant: "blue",
    dotVariant: "bg-blue-500",
    description: "Service is currently being performed by certified technicians.",
  },
  COMPLETED: {
    label: "Completed",
    badgeVariant: "purple",
    dotVariant: "bg-purple-500",
    description: "Service successfully completed. Health report available.",
  },
  CANCELLED: {
    label: "Cancelled",
    badgeVariant: "rose",
    dotVariant: "bg-rose-500",
    description: "This appointment has been cancelled.",
  },
};

/**
 * Returns formatted status badge config
 */
export function getBookingStatusMeta(status) {
  if (!status) {
    return {
      label: "Pending",
      badgeVariant: "neutral",
      dotVariant: "bg-slate-400",
      description: "Status pending",
    };
  }
  return (
    BOOKING_STATUSES[status] || {
      label: status.replace(/_/g, " "),
      badgeVariant: "neutral",
      dotVariant: "bg-slate-400",
      description: status,
    }
  );
}

/**
 * Parses YYYY-MM-DD string into a local Date object without UTC midnight timezone rollback
 */
export function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  if (typeof dateStr !== "string") return new Date(dateStr);
  const parts = dateStr.split("T")[0].split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts.map(Number);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month - 1, day);
    }
  }
  return new Date(dateStr);
}

/**
 * Formats a Date object to YYYY-MM-DD using local calendar date
 */
export function formatLocalDate(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Formats ISO or YYYY-MM-DD date to readable Indian format (e.g. 11 Sep 2026)
 */
export function formatBookingDate(dateStr, options = {}) {
  if (!dateStr) return "Date not set";
  try {
    const d = parseLocalDate(dateStr);
    if (!d || isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      ...options,
    });
  } catch {
    return dateStr;
  }
}

/**
 * Formats time slot to friendly display string
 */
export function formatSlotDisplay(slot) {
  if (!slot) return "Time not set";
  const match = CONTROLLED_TIME_SLOTS.find((s) => s.id === slot);
  return match ? match.label : slot;
}

/**
 * Checks whether a given time slot is open for booking on a specific date.
 * - Future dates: All slots are available.
 * - Past dates: No slots are available.
 * - Today: Only slots starting after current time + leadTimeMinutes buffer (default 30 min).
 */
export function isSlotAvailableForDate(slotOrId, dateStr, leadTimeMinutes = 30) {
  if (!slotOrId || !dateStr) return false;
  const slotId = typeof slotOrId === "object" ? slotOrId.id : slotOrId;
  const todayStr = formatLocalDate(new Date());

  if (dateStr > todayStr) return true;
  if (dateStr < todayStr) return false;

  // Date is today - check time with buffer
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startPart] = slotId.split("-");
  const [hourStr, minuteStr] = startPart.split(":");
  const slotStartMinutes = parseInt(hourStr, 10) * 60 + parseInt(minuteStr || "0", 10);

  return slotStartMinutes >= currentMinutes + leadTimeMinutes;
}

/**
 * Returns array of available time slot objects for a given date
 */
export function getAvailableSlotsForDate(dateStr, leadTimeMinutes = 30) {
  return CONTROLLED_TIME_SLOTS.filter((slot) =>
    isSlotAvailableForDate(slot, dateStr, leadTimeMinutes)
  );
}

/**
 * Centralized Booking API Client
 * Interacts with Spring Boot /api/v1/bookings
 */
export const bookingsApi = {
  /**
   * Create a new customer booking
   * POST /api/v1/bookings
   * Note: NEVER sends userId or price. Derived securely from JWT by backend.
   */
  async createBooking({ vehicleId, serviceId, bookingDate, timeSlot, bookingTime, customerNotes }) {
    const payload = {
      vehicleId: Number(vehicleId),
      serviceId: Number(serviceId),
      bookingDate,
      timeSlot,
      ...(bookingTime ? { bookingTime } : {}),
      ...(customerNotes ? { customerNotes: customerNotes.trim() } : {}),
    };

    const res = await apiRequest("/bookings", {
      method: "POST",
      requiresAuth: true,
      body: payload,
    });
    return res?.data;
  },

  /**
   * Fetch all bookings for the authenticated customer
   * GET /api/v1/bookings
   */
  async getBookings() {
    const res = await apiRequest("/bookings", {
      method: "GET",
      requiresAuth: true,
    });
    return res?.data || [];
  },

  /**
   * Fetch a single booking by ID
   * GET /api/v1/bookings/{id}
   */
  async getBooking(id) {
    const res = await apiRequest(`/bookings/${id}`, {
      method: "GET",
      requiresAuth: true,
    });
    return res?.data;
  },

  /**
   * Cancel an existing booking
   * PUT /api/v1/bookings/{id}/cancel
   */
  async cancelBooking(id) {
    const res = await apiRequest(`/bookings/${id}/cancel`, {
      method: "PUT",
      requiresAuth: true,
    });
    return res?.data;
  },
};
