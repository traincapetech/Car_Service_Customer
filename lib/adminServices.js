import { apiRequest } from "./api";

/**
 * Admin Service Catalog & Pricing Management API Client
 * Mapped to /api/v1/admin/services/**
 */
export const adminServicesApi = {
  /**
   * Fetch service catalog list with optional search, category, status, and sorting
   * GET /api/v1/admin/services
   *
   * @param {Object} params - { search, category, status, sort, direction }
   * @returns {Promise<Array>} List of ServiceCatalogResponse
   */
  getServices: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search && params.search.trim()) {
      query.append("search", params.search.trim());
    }
    if (params.category && params.category !== "ALL") {
      query.append("category", params.category);
    }
    if (params.status && params.status !== "ALL") {
      query.append("status", params.status);
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
    const endpoint = `/admin/services${qs ? `?${qs}` : ""}`;
    const res = await apiRequest(endpoint, {
      method: "GET",
      requiresAuth: true,
    });
    return res?.data || [];
  },

  /**
   * Fetch single service details by ID
   * GET /api/v1/admin/services/{id}
   */
  getService: async (id) => {
    const res = await apiRequest(`/admin/services/${id}`, {
      method: "GET",
      requiresAuth: true,
    });
    return res?.data;
  },

  /**
   * Create a new service catalog package
   * POST /api/v1/admin/services
   */
  createService: async (payload) => {
    const res = await apiRequest("/admin/services", {
      method: "POST",
      body: payload,
      requiresAuth: true,
    });
    return res?.data;
  },

  /**
   * Update an existing service catalog package
   * PUT /api/v1/admin/services/{id}
   */
  updateService: async (id, payload) => {
    const res = await apiRequest(`/admin/services/${id}`, {
      method: "PUT",
      body: payload,
      requiresAuth: true,
    });
    return res?.data;
  },

  /**
   * Activate a service
   * PATCH /api/v1/admin/services/{id}/activate
   */
  activateService: async (id) => {
    const res = await apiRequest(`/admin/services/${id}/activate`, {
      method: "PATCH",
      requiresAuth: true,
    });
    return res?.data;
  },

  /**
   * Deactivate a service
   * PATCH /api/v1/admin/services/{id}/deactivate
   */
  deactivateService: async (id) => {
    const res = await apiRequest(`/admin/services/${id}/deactivate`, {
      method: "PATCH",
      requiresAuth: true,
    });
    return res?.data;
  },

  /**
   * Safely delete a service (rejected if historical bookings or requests reference it)
   * DELETE /api/v1/admin/services/{id}
   */
  deleteService: async (id) => {
    const res = await apiRequest(`/admin/services/${id}`, {
      method: "DELETE",
      requiresAuth: true,
    });
    return res?.data;
  },
};
