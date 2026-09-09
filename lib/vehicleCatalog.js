import { apiRequest } from "./api";

/**
 * Vehicle Catalog Service for Indian Passenger Cars
 */
export const vehicleCatalogApi = {
  /**
   * Fetch all active passenger car brands in India
   * GET /api/v1/vehicle-catalog/brands
   */
  async getBrands() {
    try {
      const res = await apiRequest("/vehicle-catalog/brands", {
        method: "GET",
        requiresAuth: false,
      });
      return res?.data || [];
    } catch (err) {
      console.warn("Failed to fetch vehicle brands from catalog:", err);
      return [];
    }
  },

  /**
   * Fetch active models for a specific brand ID
   * GET /api/v1/vehicle-catalog/brands/{brandId}/models
   */
  async getModelsByBrandId(brandId) {
    if (!brandId) return [];
    try {
      const res = await apiRequest(`/vehicle-catalog/brands/${brandId}/models`, {
        method: "GET",
        requiresAuth: false,
      });
      return res?.data || [];
    } catch (err) {
      console.warn(`Failed to fetch models for brand ${brandId}:`, err);
      return [];
    }
  },

  /**
   * Fetch active models for a specific brand name
   * GET /api/v1/vehicle-catalog/models?brand={brandName}
   */
  async getModelsByBrandName(brandName) {
    if (!brandName || !brandName.trim()) return [];
    try {
      const res = await apiRequest(`/vehicle-catalog/models?brand=${encodeURIComponent(brandName.trim())}`, {
        method: "GET",
        requiresAuth: false,
      });
      return res?.data || [];
    } catch (err) {
      console.warn(`Failed to fetch models for brand ${brandName}:`, err);
      return [];
    }
  },
};
