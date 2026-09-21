import { apiRequest } from "./api";

/**
 * Enterprise Users & Roles / Access Control API Client
 */
export const adminUsersApi = {
  /**
   * Fetch paginated list of users with search, role, status filters, and sorting
   * GET /api/v1/admin/users
   */
  getUsers: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page !== undefined && params.page !== null) query.append("page", params.page);
    if (params.size !== undefined && params.size !== null) query.append("size", params.size);
    if (params.search && params.search.trim()) query.append("search", params.search.trim());
    if (params.role && params.role !== "ALL") query.append("role", params.role);
    if (params.status && params.status !== "ALL") query.append("status", params.status);
    if (params.sort) query.append("sort", params.sort);
    if (params.direction) query.append("direction", params.direction);

    const queryString = query.toString();
    const endpoint = `/admin/users${queryString ? `?${queryString}` : ""}`;
    const res = await apiRequest(endpoint, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch aggregate user distribution and lifecycle status metrics
   * GET /api/v1/admin/users/summary
   */
  getUserSummary: async () => {
    const res = await apiRequest("/admin/users/summary", {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch complete user profile detail with associated workshop / customer data and permissions
   * GET /api/v1/admin/users/{id}
   */
  getUserDetail: async (id) => {
    const res = await apiRequest(`/admin/users/${id}`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Update a user's lifecycle status with mandatory audit reason
   * PATCH /api/v1/admin/users/{id}/status
   */
  updateUserStatus: async (id, { status, reason }) => {
    const res = await apiRequest(`/admin/users/${id}/status`, {
      method: "PATCH",
      requiresAuth: true,
      body: JSON.stringify({ status, reason }),
    });
    return res.data;
  },

  /**
   * Update a user's platform role with mandatory audit reason (Super Admin only)
   * PATCH /api/v1/admin/users/{id}/role
   */
  updateUserRole: async (id, { role, reason }) => {
    const res = await apiRequest(`/admin/users/${id}/role`, {
      method: "PATCH",
      requiresAuth: true,
      body: JSON.stringify({ role, reason }),
    });
    return res.data;
  },

  /**
   * Fetch system role catalog with assigned counts and permission definitions
   * GET /api/v1/admin/roles
   */
  getRoles: async () => {
    const res = await apiRequest("/admin/roles", {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },
};
