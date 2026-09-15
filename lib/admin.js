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
};
