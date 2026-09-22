import { apiRequest } from "./api";

/**
 * Dedicated Admin Workshop Jobs API Client.
 * Interfaces with /api/v1/admin/workshop-jobs endpoints with automatic JWT token attachment.
 */
export const adminWorkshopJobsApi = {
  /**
   * Fetch global operational workshop job KPIs
   * GET /api/v1/admin/workshop-jobs/summary
   */
  getSummary: async () => {
    const res = await apiRequest("/admin/workshop-jobs/summary", {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch paginated, searchable, and filtered list of operational workshop jobs
   * GET /api/v1/admin/workshop-jobs
   *
   * @param {Object} params - { page, size, search, status, workshopId, customerId, startDate, endDate, sort, direction }
   */
  getJobs: async (params = {}) => {
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
    const res = await apiRequest(`/admin/workshop-jobs${qs ? `?${qs}` : ""}`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch complete 360° operational dossier for a workshop job including lifecycle timestamps,
   * workshop partner details, customer, vehicle, line items, and audit events.
   * GET /api/v1/admin/workshop-jobs/{id}
   */
  getJobDetail: async (id) => {
    const res = await apiRequest(`/admin/workshop-jobs/${id}`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Administrative status update with audit trail
   * PUT /api/v1/admin/workshop-jobs/{id}/status
   *
   * @param {number|string} id
   * @param {Object} data - { status, notes, reason }
   */
  updateJobStatus: async (id, data) => {
    const res = await apiRequest(`/admin/workshop-jobs/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
    return res.data;
  },
};
