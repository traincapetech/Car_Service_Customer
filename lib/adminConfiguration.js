import { apiRequest } from "./api";

/**
 * Dedicated Admin Platform Configuration & Business Rules API Client.
 * Interfaces with /api/v1/admin/configuration endpoints with automatic JWT token attachment.
 */
export const adminConfigurationApi = {
  /**
   * Fetch all platform configurations categorized and ordered
   * GET /api/v1/admin/configuration
   * @returns {Promise<Array>} List<AdminPlatformConfigResponse>
   */
  getAllConfigurations: async () => {
    const res = await apiRequest("/admin/configuration", {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch specific configuration setting by key
   * GET /api/v1/admin/configuration/{key}
   * @param {string} key
   * @returns {Promise<Object>} AdminPlatformConfigResponse
   */
  getConfiguration: async (key) => {
    const res = await apiRequest(`/admin/configuration/${encodeURIComponent(key)}`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Update configuration setting with mandatory audit reason and version for concurrency protection
   * PUT /api/v1/admin/configuration/{key}
   * @param {string} key
   * @param {Object} payload - { configValue: string, reason: string, version: number }
   * @returns {Promise<Object>} AdminPlatformConfigResponse
   */
  updateConfiguration: async (key, payload) => {
    const res = await apiRequest(`/admin/configuration/${encodeURIComponent(key)}`, {
      method: "PUT",
      body: payload,
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch global configuration audit history or key-specific audit history
   * GET /api/v1/admin/configuration/history OR GET /api/v1/admin/configuration/history/{key}
   * @param {string} [key]
   * @returns {Promise<Array>} List<AdminPlatformConfigHistoryResponse>
   */
  getHistory: async (key = null) => {
    const endpoint = key
      ? `/admin/configuration/history/${encodeURIComponent(key)}`
      : "/admin/configuration/history";
    const res = await apiRequest(endpoint, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },
};
