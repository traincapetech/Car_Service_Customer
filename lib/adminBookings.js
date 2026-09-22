import { apiRequest } from "./api";

/**
 * Dedicated Admin Bookings API Client.
 * Interfaces with /api/v1/admin/bookings endpoints with automatic JWT token attachment.
 */
export const adminBookingsApi = {
  /**
   * Fetch global operational booking KPIs
   * GET /api/v1/admin/bookings/summary
   */
  getSummary: async () => {
    const res = await apiRequest("/admin/bookings/summary", {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch paginated, searchable, and filtered list of bookings
   * GET /api/v1/admin/bookings
   *
   * @param {Object} params - { page, size, search, status, workshopId, customerId, startDate, endDate, sort, direction }
   */
  getBookings: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page !== undefined && params.page !== null) {
      query.append("page", params.page);
    }
    if (params.size !== undefined && params.size !== null) {
      query.append("size", params.size);
    }
    if (params.search && params.search.trim()) {
      query.append("search", params.search.trim());
    }
    if (params.status && params.status !== "ALL") {
      query.append("status", params.status);
    }
    if (params.workshopId) {
      query.append("workshopId", params.workshopId);
    }
    if (params.customerId) {
      query.append("customerId", params.customerId);
    }
    if (params.startDate) {
      query.append("startDate", params.startDate);
    }
    if (params.endDate) {
      query.append("endDate", params.endDate);
    }
    const sortField = params.sort || params.sortBy;
    if (sortField) {
      query.append("sort", sortField);
    }
    const sortDir = params.direction || params.sortDir;
    if (sortDir) {
      query.append("direction", sortDir.toUpperCase());
    }

    const qs = query.toString();
    const res = await apiRequest(`/admin/bookings${qs ? `?${qs}` : ""}`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch complete 360° booking dossier including customer, vehicle, line items,
   * assigned workshop, current job, and workshop routing opportunities pipeline.
   * GET /api/v1/admin/bookings/{id}
   */
  getBookingDetail: async (id) => {
    const res = await apiRequest(`/admin/bookings/${id}`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Administrative cancellation of a booking
   * PUT /api/v1/admin/bookings/{id}/cancel
   */
  cancelBooking: async (id, reason) => {
    const res = await apiRequest(`/admin/bookings/${id}/cancel`, {
      method: "PUT",
      body: JSON.stringify({ reason: reason || "Cancelled by Platform Administrator" }),
      requiresAuth: true,
    });
    return res.data;
  },
};
