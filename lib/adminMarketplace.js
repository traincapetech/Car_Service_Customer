import { apiRequest } from "./api";

/**
 * Dedicated Admin Marketplace & Service Request API Client.
 * Interfaces with /api/v1/admin/marketplace endpoints with automatic JWT token attachment.
 */
export const adminMarketplaceApi = {
  /**
   * Fetch global operational marketplace KPIs
   * GET /api/v1/admin/marketplace/summary
   */
  getSummary: async () => {
    const res = await apiRequest("/admin/marketplace/summary", {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch paginated, searchable, and filtered list of service requests
   * GET /api/v1/admin/marketplace/service-requests
   *
   * @param {Object} params - { page, size, search, status, city, workshopId, startDate, endDate, sort, direction }
   */
  getServiceRequests: async (params = {}) => {
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
    if (params.city && params.city.trim() && params.city !== "ALL") {
      query.append("city", params.city.trim());
    }
    if (params.workshopId) {
      query.append("workshopId", params.workshopId);
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
    const res = await apiRequest(`/admin/marketplace/service-requests${qs ? `?${qs}` : ""}`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch complete 360° dossier for a service request
   * GET /api/v1/admin/marketplace/service-requests/{id}
   */
  getServiceRequestDetail: async (id) => {
    const res = await apiRequest(`/admin/marketplace/service-requests/${id}`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch all workshop opportunities generated for a service request
   * GET /api/v1/admin/marketplace/service-requests/{id}/opportunities
   */
  getServiceRequestOpportunities: async (id) => {
    const res = await apiRequest(`/admin/marketplace/service-requests/${id}/opportunities`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch all workshop payments for a service request
   * GET /api/v1/admin/marketplace/service-requests/{id}/payments
   */
  getServiceRequestPayments: async (id) => {
    const res = await apiRequest(`/admin/marketplace/service-requests/${id}/payments`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch all refunds associated with a service request
   * GET /api/v1/admin/marketplace/service-requests/{id}/refunds
   */
  getServiceRequestRefunds: async (id) => {
    const res = await apiRequest(`/admin/marketplace/service-requests/${id}/refunds`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch chronological audit event timeline for a service request
   * GET /api/v1/admin/marketplace/service-requests/{id}/timeline
   */
  getServiceRequestTimeline: async (id) => {
    const res = await apiRequest(`/admin/marketplace/service-requests/${id}/timeline`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },
};

export default adminMarketplaceApi;
