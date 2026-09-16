import { apiRequest } from "./api";

/**
 * Dedicated Admin API client.
 * Built on the centralized apiRequest client to leverage automated token attachment,
 * automatic token refresh, and normalized error handling.
 */
export const adminApi = {
  /**
   * Fetch authenticated admin session profile
   * GET /api/v1/admin/me
   */
  getMe: async () => {
    const res = await apiRequest("/admin/me", {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch administrative subsystem health status
   * GET /api/v1/admin/health
   */
  getHealth: async () => {
    const res = await apiRequest("/admin/health", {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch paginated list of customers with optional search, filter, and sorting
   * GET /api/v1/admin/customers
   *
   * @param {Object} params - { page, size, search, status, sort, direction }
   * @returns {Promise<Object>} PageResponse of AdminCustomerListResponse
   */
  getCustomers: async (params = {}) => {
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
    const sortField = params.sort || params.sortBy;
    if (sortField) {
      query.append("sort", sortField);
    }
    const sortDir = params.direction || params.sortDir;
    if (sortDir) {
      query.append("direction", sortDir.toUpperCase());
    }

    const qs = query.toString();
    const res = await apiRequest(`/admin/customers${qs ? `?${qs}` : ""}`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch complete customer 360° detail dossier
   * GET /api/v1/admin/customers/{customerId}
   *
   * @param {number|string} customerId
   * @returns {Promise<Object>} AdminCustomerDetailResponse
   */
  getCustomer: async (customerId) => {
    const res = await apiRequest(`/admin/customers/${customerId}`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch customer's registered vehicles (administrative read-only view)
   * GET /api/v1/admin/customers/{customerId}/vehicles
   *
   * @param {number|string} customerId
   * @returns {Promise<Array>} List<AdminCustomerVehicleResponse>
   */
  getCustomerVehicles: async (customerId) => {
    const res = await apiRequest(`/admin/customers/${customerId}/vehicles`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch customer's booking history with authoritative price snapshots
   * GET /api/v1/admin/customers/{customerId}/bookings
   *
   * @param {number|string} customerId
   * @param {Object} params - { page, size, status, sort, direction }
   * @returns {Promise<Object>} PageResponse of AdminCustomerBookingResponse
   */
  getCustomerBookings: async (customerId, params = {}) => {
    const query = new URLSearchParams();
    if (params.page !== undefined && params.page !== null) {
      query.append("page", params.page);
    }
    if (params.size !== undefined && params.size !== null) {
      query.append("size", params.size);
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
    const res = await apiRequest(`/admin/customers/${customerId}/bookings${qs ? `?${qs}` : ""}`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch customer's marketplace service-request history
   * GET /api/v1/admin/customers/{customerId}/service-requests
   *
   * @param {number|string} customerId
   * @param {Object} params - { page, size, status, direction }
   * @returns {Promise<Object>} PageResponse of AdminCustomerServiceRequestResponse
   */
  getCustomerServiceRequests: async (customerId, params = {}) => {
    const query = new URLSearchParams();
    if (params.page !== undefined && params.page !== null) {
      query.append("page", params.page);
    }
    if (params.size !== undefined && params.size !== null) {
      query.append("size", params.size);
    }
    if (params.status && params.status !== "ALL") {
      query.append("status", params.status);
    }
    const sortDir = params.direction || params.sortDir;
    if (sortDir) {
      query.append("direction", sortDir.toUpperCase());
    }

    const qs = query.toString();
    const res = await apiRequest(`/admin/customers/${customerId}/service-requests${qs ? `?${qs}` : ""}`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Update customer account status (Activate / Deactivate)
   * PUT /api/v1/admin/customers/{customerId}/status
   *
   * @param {number|string} customerId
   * @param {boolean} isActive
   * @returns {Promise<Object>} AdminCustomerDetailResponse
   */
  updateCustomerStatus: async (customerId, isActive) => {
    const res = await apiRequest(`/admin/customers/${customerId}/status`, {
      method: "PUT",
      body: { isActive: Boolean(isActive) },
      requiresAuth: true,
    });
    return res.data;
  },
};
