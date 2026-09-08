import { apiRequest } from "./api";

/**
 * Authentication and User Account Services
 * Mapped to Spring Boot REST APIs (/api/v1/auth/**)
 */

export const authApi = {
  /**
   * 1. Customer Registration
   * POST /api/v1/auth/register/customer
   */
  async register({ name, email, phone, password }) {
    return apiRequest("/auth/register/customer", {
      method: "POST",
      body: { name, email, phone, password },
      requiresAuth: false,
    });
  },

  /**
   * 2. Login
   * POST /api/v1/auth/login
   */
  async login({ email, password }) {
    return apiRequest("/auth/login", {
      method: "POST",
      body: { email, password },
      requiresAuth: false,
    });
  },

  /**
   * 3. Refresh Token
   * POST /api/v1/auth/refresh
   */
  async refresh(refreshToken) {
    return apiRequest("/auth/refresh", {
      method: "POST",
      body: { refreshToken },
      requiresAuth: false,
    });
  },

  /**
   * 4. Logout
   * POST /api/v1/auth/logout
   */
  async logout(refreshToken) {
    return apiRequest("/auth/logout", {
      method: "POST",
      body: { refreshToken },
      requiresAuth: false,
    });
  },

  /**
   * 5. Get Current Authenticated User
   * GET /api/v1/auth/me
   */
  async getCurrentUser() {
    return apiRequest("/auth/me", {
      method: "GET",
      requiresAuth: true,
    });
  },

  /**
   * 6. Update Profile
   * PUT /api/v1/auth/me
   */
  async updateProfile({ name, phone }) {
    return apiRequest("/auth/me", {
      method: "PUT",
      body: { name, phone },
      requiresAuth: true,
    });
  },

  /**
   * 7. Change Password
   * PUT /api/v1/auth/change-password
   */
  async changePassword({ currentPassword, newPassword, confirmPassword }) {
    return apiRequest("/auth/change-password", {
      method: "PUT",
      body: { currentPassword, newPassword, confirmPassword },
      requiresAuth: true,
    });
  },

  /**
   * 8. Forgot Password
   * POST /api/v1/auth/forgot-password
   */
  async forgotPassword({ email }) {
    return apiRequest("/auth/forgot-password", {
      method: "POST",
      body: { email },
      requiresAuth: false,
    });
  },

  /**
   * 9. Reset Password
   * POST /api/v1/auth/reset-password
   */
  async resetPassword({ resetToken, newPassword }) {
    return apiRequest("/auth/reset-password", {
      method: "POST",
      body: { resetToken, newPassword },
      requiresAuth: false,
    });
  },

  /**
   * 10. Account Deactivation
   * PUT /api/v1/auth/deactivate
   */
  async deactivateAccount(password) {
    return apiRequest("/auth/deactivate", {
      method: "PUT",
      body: password ? { password } : {},
      requiresAuth: true,
    });
  },
};
