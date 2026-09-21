import { apiRequest } from "./api";

/**
 * System Health & Operational Settings API Client
 */
export const adminSystemApi = {
  /**
   * Fetch real-time system operational health and component statuses
   * GET /api/v1/admin/system/health
   */
  getSystemHealth: async () => {
    const res = await apiRequest("/admin/system/health", {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch runtime platform configurations, security policies, and environment info
   * GET /api/v1/admin/system/settings
   */
  getSystemSettings: async () => {
    const res = await apiRequest("/admin/system/settings", {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },
};
