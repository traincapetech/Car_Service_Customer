import { apiRequest } from "./api";

/**
 * Enterprise Audit API Client
 */
export const adminAuditApi = {
  /**
   * Fetch paginated audit events with multi-attribute filtering
   * GET /api/v1/admin/audit/events
   */
  getAuditEvents: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page !== undefined && params.page !== null) query.append("page", params.page);
    if (params.size !== undefined && params.size !== null) query.append("size", params.size);
    if (params.action && params.action !== "ALL") query.append("action", params.action);
    if (params.entityType && params.entityType !== "ALL") query.append("entityType", params.entityType);
    if (params.entityId && params.entityId.trim()) query.append("entityId", params.entityId.trim());
    if (params.status && params.status !== "ALL") query.append("status", params.status);
    if (params.actorUserId) query.append("actorUserId", params.actorUserId);
    if (params.actorEmail && params.actorEmail.trim()) query.append("actorEmail", params.actorEmail.trim());
    if (params.startDate) query.append("startDate", params.startDate);
    if (params.endDate) query.append("endDate", params.endDate);
    if (params.search && params.search.trim()) query.append("search", params.search.trim());
    if (params.sort) query.append("sort", params.sort);
    if (params.direction) query.append("direction", params.direction);

    const queryString = query.toString();
    const endpoint = `/admin/audit/events${queryString ? `?${queryString}` : ""}`;
    const res = await apiRequest(endpoint, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch full audit event details including states and diffs
   * GET /api/v1/admin/audit/events/{id}
   */
  getAuditEventDetail: async (id) => {
    const res = await apiRequest(`/admin/audit/events/${id}`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch aggregate KPI metrics for audit events
   * GET /api/v1/admin/audit/summary
   */
  getAuditSummary: async () => {
    const res = await apiRequest("/admin/audit/summary", {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },
};
