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

  // ==========================================
  // ADMIN WORKSHOP / SERVICE CENTRE MODULE
  // ==========================================

  /**
   * Fetch paginated list of workshops with search, filter, and sorting
   * GET /api/v1/admin/workshops
   */
  getWorkshops: async (params = {}) => {
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
    if (params.verificationStatus && params.verificationStatus !== "ALL") {
      query.append("verificationStatus", params.verificationStatus);
    }
    if (params.city && params.city.trim()) {
      query.append("city", params.city.trim());
    }
    if (params.state && params.state.trim()) {
      query.append("state", params.state.trim());
    }
    if (params.activity && params.activity !== "ALL") {
      query.append("activity", params.activity);
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
    const res = await apiRequest(`/admin/workshops${qs ? `?${qs}` : ""}`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch workshop aggregate summary counters
   * GET /api/v1/admin/workshops/summary
   */
  getWorkshopSummary: async () => {
    const res = await apiRequest("/admin/workshops/summary", {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch complete workshop 360° detail dossier
   * GET /api/v1/admin/workshops/{id}
   */
  getWorkshop: async (workshopId) => {
    const res = await apiRequest(`/admin/workshops/${workshopId}`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Update workshop operational status (Activate / Deactivate)
   * PATCH /api/v1/admin/workshops/{id}/status
   */
  updateWorkshopStatus: async (workshopId, isActive, reason) => {
    const res = await apiRequest(`/admin/workshops/${workshopId}/status`, {
      method: "PATCH",
      body: { isActive: Boolean(isActive), reason: reason || "" },
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Update workshop verification status (VERIFIED / REJECTED / SUSPENDED)
   * PATCH /api/v1/admin/workshops/{id}/verification
   */
  updateWorkshopVerification: async (workshopId, status, reason) => {
    const res = await apiRequest(`/admin/workshops/${workshopId}/verification`, {
      method: "PATCH",
      body: { status, reason: reason || "" },
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch workshop capabilities / supported services
   * GET /api/v1/admin/workshops/{id}/capabilities
   */
  getWorkshopCapabilities: async (workshopId) => {
    const res = await apiRequest(`/admin/workshops/${workshopId}/capabilities`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch workshop marketplace opportunities history
   * GET /api/v1/admin/workshops/{id}/opportunities
   */
  getWorkshopOpportunities: async (workshopId, params = {}) => {
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
    const qs = query.toString();
    const res = await apiRequest(`/admin/workshops/${workshopId}/opportunities${qs ? `?${qs}` : ""}`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch workshop bookings history
   * GET /api/v1/admin/workshops/{id}/bookings
   */
  getWorkshopBookings: async (workshopId, params = {}) => {
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
    const qs = query.toString();
    const res = await apiRequest(`/admin/workshops/${workshopId}/bookings${qs ? `?${qs}` : ""}`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch workshop jobs
   * GET /api/v1/admin/workshops/{id}/jobs
   */
  getWorkshopJobs: async (workshopId, params = {}) => {
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
    const qs = query.toString();
    const res = await apiRequest(`/admin/workshops/${workshopId}/jobs${qs ? `?${qs}` : ""}`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch workshop payments history
   * GET /api/v1/admin/workshops/{id}/payments
   */
  getWorkshopPayments: async (workshopId) => {
    const res = await apiRequest(`/admin/workshops/${workshopId}/payments`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch workshop refunds history
   * GET /api/v1/admin/workshops/{id}/refunds
   */
  getWorkshopRefunds: async (workshopId) => {
    const res = await apiRequest(`/admin/workshops/${workshopId}/refunds`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch workshop wallet details
   * GET /api/v1/admin/workshops/{id}/wallet
   */
  getWorkshopWallet: async (workshopId) => {
    const res = await apiRequest(`/admin/workshops/${workshopId}/wallet`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch workshop audit event trail
   * GET /api/v1/admin/workshops/{id}/audit-events
   */
  getWorkshopAuditEvents: async (workshopId) => {
    const res = await apiRequest(`/admin/workshops/${workshopId}/audit-events`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },
};

export { adminMarketplaceApi } from "./adminMarketplace";
export { adminConfigurationApi } from "./adminConfiguration";
