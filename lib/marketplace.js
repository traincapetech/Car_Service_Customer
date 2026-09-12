import { apiRequest } from "./api";

/**
 * Workshop Marketplace API Service
 * Interacts with Spring Boot backend endpoints for:
 * - Partner Lead Opportunities (/api/v1/partner/opportunities)
 * - Partner Wallet (/api/v1/partner/wallet)
 * - Workshop Payments (/api/v1/partner/payments)
 * - Workshop Refunds (/api/v1/partner/refunds)
 */

export const marketplaceApi = {
  /**
   * Fetch lead opportunities for the current workshop partner
   * @param {string} [status] - Optional OpportunityStatus filter
   */
  async getOpportunities(status) {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    const response = await apiRequest(`/partner/opportunities${query}`, {
      method: "GET",
      requiresAuth: true,
    });
    return response?.data || [];
  },

  /**
   * Fetch details of a single lead opportunity
   * @param {number|string} id - Opportunity ID
   */
  async getOpportunityDetails(id) {
    const response = await apiRequest(`/partner/opportunities/${id}`, {
      method: "GET",
      requiresAuth: true,
    });
    return response?.data;
  },

  /**
   * Accept a lead opportunity (transitions to ACCEPTED state)
   * @param {number|string} id - Opportunity ID
   */
  async acceptOpportunity(id) {
    const response = await apiRequest(`/partner/opportunities/${id}/accept`, {
      method: "POST",
      requiresAuth: true,
    });
    return response?.data;
  },

  /**
   * Pay for and atomically claim opportunity using workshop wallet
   * @param {number|string} opportunityId - Opportunity ID
   * @param {string} [idempotencyKey] - Unique idempotency key to prevent double charge
   */
  async payWithWallet(opportunityId, idempotencyKey) {
    const key = idempotencyKey || `WAL-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const response = await apiRequest(`/partner/payments/pay-wallet`, {
      method: "POST",
      body: {
        opportunityId: Number(opportunityId),
        idempotencyKey: key,
      },
      requiresAuth: true,
    });
    return response?.data;
  },

  /**
   * Transfer opportunity to another workshop and trigger re-matching
   * @param {number|string} id - Opportunity ID
   * @param {string} reason - Reason for transfer
   * @param {string} [notes] - Optional operational notes
   */
  async transferOpportunity(id, reason, notes) {
    const body = { reason };
    if (notes && typeof notes === "string" && notes.trim()) {
      body.notes = notes.trim();
    }
    const response = await apiRequest(`/partner/opportunities/${id}/transfer`, {
      method: "POST",
      body,
      requiresAuth: true,
    });
    return response?.data;
  },

  /**
   * Fetch current workshop partner wallet details and balance
   */
  async getWallet() {
    const response = await apiRequest(`/partner/wallet`, {
      method: "GET",
      requiresAuth: true,
    });
    return response?.data;
  },

  /**
   * Top up workshop partner wallet
   * @param {number} amount - Amount in INR
   * @param {string} [description] - Top-up description
   * @param {string} [referenceId] - External transaction reference
   */
  async topupWallet(amount, description, referenceId) {
    const response = await apiRequest(`/partner/wallet/topup`, {
      method: "POST",
      body: {
        amount: Number(amount),
        description: description || `Wallet Top-up of ₹${amount}`,
        referenceId: referenceId || `TOPUP-${Date.now()}`,
      },
      requiresAuth: true,
    });
    return response?.data;
  },

  /**
   * Initiate top-up intent (Step 18D / 18E gateway preparation)
   * @param {number} amount - Amount in INR (min 100, max 50,000)
   * @param {string} [description] - Optional description
   */
  async initiateTopup(amount, description) {
    const response = await apiRequest(`/partner/wallet/topup/initiate`, {
      method: "POST",
      body: {
        amount: Number(amount),
        description: description || `Wallet Top-up of ₹${amount}`,
      },
      requiresAuth: true,
    });
    return response?.data;
  },

  /**
   * Fetch wallet ledger transactions (supports pagination & filtering)
   * @param {Object} [params] - Optional query parameters: { page, size, type }
   */
  async getWalletTransactions(params = {}) {
    const query = new URLSearchParams();
    if (params.page !== undefined && params.page !== null) query.append("page", params.page);
    if (params.size !== undefined && params.size !== null) query.append("size", params.size);
    if (params.type) query.append("type", params.type);

    const queryString = query.toString();
    const endpoint = queryString ? `/partner/wallet/transactions?${queryString}` : `/partner/wallet/transactions`;

    const response = await apiRequest(endpoint, {
      method: "GET",
      requiresAuth: true,
    });
    return response?.data || [];
  },

  /**
   * Fetch single transaction by ID
   * @param {number|string} id - Transaction ID
   */
  async getTransactionDetails(id) {
    const response = await apiRequest(`/partner/wallet/transactions/${id}`, {
      method: "GET",
      requiresAuth: true,
    });
    return response?.data;
  },

  /**
   * Fetch all refunds received by the current workshop partner
   */
  async getRefunds() {
    const response = await apiRequest(`/partner/refunds`, {
      method: "GET",
      requiresAuth: true,
    });
    return response?.data || [];
  },

  /**
   * Fetch specific refund details
   * @param {number|string} id - Refund ID
   */
  async getRefundDetails(id) {
    const response = await apiRequest(`/partner/refunds/${id}`, {
      method: "GET",
      requiresAuth: true,
    });
    return response?.data;
  },
};
