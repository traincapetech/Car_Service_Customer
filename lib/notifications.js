import { apiRequest } from "./api";

/**
 * Notifications API client for Addior Mechanics Pro
 */
export const notificationsApi = {
  /**
   * Fetch paginated notifications for current authenticated user
   * @param {Object} [params] - { page, size, unreadOnly }
   */
  async getNotifications({ page = 0, size = 20, unreadOnly = false } = {}) {
    const query = new URLSearchParams({
      page: String(page),
      size: String(size),
      unreadOnly: String(unreadOnly),
    });
    const response = await apiRequest(`/notifications?${query.toString()}`, {
      method: "GET",
      requiresAuth: true,
    });
    return response.data;
  },

  /**
   * Fetch unread notification count
   */
  async getUnreadCount() {
    const response = await apiRequest("/notifications/unread-count", {
      method: "GET",
      requiresAuth: true,
    });
    return response.data?.unreadCount || 0;
  },

  /**
   * Mark single notification as read
   * @param {number|string} id
   */
  async markAsRead(id) {
    const response = await apiRequest(`/notifications/${id}/read`, {
      method: "PUT",
      requiresAuth: true,
    });
    return response.data;
  },

  /**
   * Mark all notifications as read for current user
   */
  async markAllAsRead() {
    const response = await apiRequest("/notifications/read-all", {
      method: "PUT",
      requiresAuth: true,
    });
    return response.data;
  },
};
