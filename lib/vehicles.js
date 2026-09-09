import { apiRequest } from "./api";

export const FUEL_TYPES = [
  { value: "PETROL", label: "Petrol", badgeVariant: "neutral" },
  { value: "DIESEL", label: "Diesel", badgeVariant: "warning" },
  { value: "CNG", label: "CNG", badgeVariant: "blue" },
  { value: "ELECTRIC", label: "Electric (EV)", badgeVariant: "success" },
  { value: "HYBRID", label: "Hybrid", badgeVariant: "purple" },
];

export const TRANSMISSIONS = [
  { value: "MANUAL", label: "Manual" },
  { value: "AUTOMATIC", label: "Automatic" },
  { value: "AMT", label: "AMT (Automated)" },
  { value: "CVT", label: "CVT (Continuously Variable)" },
  { value: "DCT", label: "DCT (Dual Clutch)" },
];

export const REGISTRATION_REGEX = /^[A-Za-z0-9 -]{4,20}$/;

/**
 * Validates vehicle form data on the client side before sending to backend.
 * Matches Spring Boot DTO validation constraints.
 */
export function validateVehicleForm(data) {
  const errors = {};

  const make = data.make ? data.make.trim() : "";
  if (!make) {
    errors.make = "Make is required";
  } else if (make.length < 2 || make.length > 50) {
    errors.make = "Make must be between 2 and 50 characters";
  }

  const model = data.model ? data.model.trim() : "";
  if (!model) {
    errors.model = "Model is required";
  } else if (model.length < 1 || model.length > 50) {
    errors.model = "Model must be between 1 and 50 characters";
  }

  const yearNum = Number(data.year);
  if (!data.year || isNaN(yearNum)) {
    errors.year = "Year is required";
  } else if (yearNum < 1900) {
    errors.year = "Year must be 1900 or later";
  } else if (yearNum > 2100) {
    errors.year = "Year cannot be beyond 2100";
  }

  const regNum = data.registrationNumber ? data.registrationNumber.trim() : "";
  if (!regNum) {
    errors.registrationNumber = "Registration number is required";
  } else if (!REGISTRATION_REGEX.test(regNum)) {
    errors.registrationNumber = "Registration number must be 4 to 20 alphanumeric characters";
  }

  if (!data.fuelType) {
    errors.fuelType = "Fuel type is required";
  } else if (!FUEL_TYPES.some((f) => f.value === data.fuelType)) {
    errors.fuelType = "Please select a valid fuel type";
  }

  if (!data.transmission) {
    errors.transmission = "Transmission is required";
  } else if (!TRANSMISSIONS.some((t) => t.value === data.transmission)) {
    errors.transmission = "Please select a valid transmission type";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Vehicle API Service
 */
export const vehiclesApi = {
  /**
   * Fetch all vehicles for the authenticated customer
   * GET /api/v1/vehicles
   */
  async getVehicles() {
    const res = await apiRequest("/vehicles", {
      method: "GET",
      requiresAuth: true,
    });
    return res?.data || [];
  },

  /**
   * Fetch a single vehicle by ID
   * GET /api/v1/vehicles/{id}
   */
  async getVehicle(id) {
    const res = await apiRequest(`/vehicles/${id}`, {
      method: "GET",
      requiresAuth: true,
    });
    return res?.data;
  },

  /**
   * Create a new vehicle for the authenticated customer
   * POST /api/v1/vehicles
   * Note: NEVER sends userId - ownership is derived strictly by the backend JWT.
   */
  async createVehicle({ make, model, year, registrationNumber, fuelType, transmission }) {
    const payload = {
      make: make.trim(),
      model: model.trim(),
      year: parseInt(year, 10),
      registrationNumber: registrationNumber.trim().toUpperCase(),
      fuelType,
      transmission,
    };

    const res = await apiRequest("/vehicles", {
      method: "POST",
      requiresAuth: true,
      body: payload,
    });
    return res?.data;
  },

  /**
   * Update an existing vehicle
   * PUT /api/v1/vehicles/{id}
   */
  async updateVehicle(id, { make, model, year, registrationNumber, fuelType, transmission }) {
    const payload = {
      make: make.trim(),
      model: model.trim(),
      year: parseInt(year, 10),
      registrationNumber: registrationNumber.trim().toUpperCase(),
      fuelType,
      transmission,
    };

    const res = await apiRequest(`/vehicles/${id}`, {
      method: "PUT",
      requiresAuth: true,
      body: payload,
    });
    return res?.data;
  },

  /**
   * Delete a vehicle
   * DELETE /api/v1/vehicles/{id}
   */
  async deleteVehicle(id) {
    const res = await apiRequest(`/vehicles/${id}`, {
      method: "DELETE",
      requiresAuth: true,
    });
    return res?.data;
  },
};
