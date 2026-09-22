import { apiRequest } from "./api";
import { getAccessToken } from "./tokens";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

/**
 * Dedicated Admin Reports & Analytics API Client.
 * Interfaces with /api/v1/admin/reports endpoints with automatic JWT token attachment.
 */
export const adminReportsApi = {
  /**
   * Fetch global platform overview KPI report
   * GET /api/v1/admin/reports/overview
   * @param {Object} params - { from, to }
   */
  getOverview: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.from) query.append("from", params.from);
    if (params.to) query.append("to", params.to);

    const qs = query.toString();
    const res = await apiRequest(`/admin/reports/overview${qs ? `?${qs}` : ""}`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch customer registrations and timeline report
   * GET /api/v1/admin/reports/customers
   * @param {Object} params - { from, to }
   */
  getCustomers: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.from) query.append("from", params.from);
    if (params.to) query.append("to", params.to);

    const qs = query.toString();
    const res = await apiRequest(`/admin/reports/customers${qs ? `?${qs}` : ""}`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch workshop registrations, status breakdown, and geo notice report
   * GET /api/v1/admin/reports/workshops
   * @param {Object} params - { from, to }
   */
  getWorkshops: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.from) query.append("from", params.from);
    if (params.to) query.append("to", params.to);

    const qs = query.toString();
    const res = await apiRequest(`/admin/reports/workshops${qs ? `?${qs}` : ""}`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch service request volume and status distribution report
   * GET /api/v1/admin/reports/service-requests
   * @param {Object} params - { from, to, workshopId }
   */
  getServiceRequests: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.from) query.append("from", params.from);
    if (params.to) query.append("to", params.to);
    if (params.workshopId) query.append("workshopId", params.workshopId);

    const qs = query.toString();
    const res = await apiRequest(`/admin/reports/service-requests${qs ? `?${qs}` : ""}`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch booking volume, status distribution, and financial trends report
   * GET /api/v1/admin/reports/bookings
   * @param {Object} params - { from, to, workshopId }
   */
  getBookings: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.from) query.append("from", params.from);
    if (params.to) query.append("to", params.to);
    if (params.workshopId) query.append("workshopId", params.workshopId);

    const qs = query.toString();
    const res = await apiRequest(`/admin/reports/bookings${qs ? `?${qs}` : ""}`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch service catalog items and top requested/booked services
   * GET /api/v1/admin/reports/services
   */
  getServices: async () => {
    const res = await apiRequest("/admin/reports/services", {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Fetch paginated and searchable recent platform operational activity
   * GET /api/v1/admin/reports/activity
   * @param {Object} params - { search, type, status, from, to, page, size }
   */
  getActivity: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page !== undefined && params.page !== null) query.append("page", params.page);
    if (params.size !== undefined && params.size !== null) query.append("size", params.size);
    if (params.search && params.search.trim()) query.append("search", params.search.trim());
    if (params.type && params.type !== "ALL") query.append("type", params.type);
    if (params.status && params.status !== "ALL") query.append("status", params.status);
    if (params.from) query.append("from", params.from);
    if (params.to) query.append("to", params.to);

    const qs = query.toString();
    const res = await apiRequest(`/admin/reports/activity${qs ? `?${qs}` : ""}`, {
      method: "GET",
      requiresAuth: true,
    });
    return res.data;
  },

  /**
   * Download real CSV export file from server
   * GET /api/v1/admin/reports/export/csv
   * @param {Object} params - { reportType, from, to, search }
   */
  exportCsv: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.reportType) query.append("reportType", params.reportType);
    if (params.from) query.append("from", params.from);
    if (params.to) query.append("to", params.to);
    if (params.search && params.search.trim()) query.append("search", params.search.trim());

    const token = getAccessToken();
    const qs = query.toString();
    const url = `${API_BASE}/admin/reports/export/csv${qs ? `?${qs}` : ""}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to export CSV: ${res.status} ${res.statusText}`);
    }

    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `platform-report-${(params.reportType || "overview").toLowerCase()}-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },
};
