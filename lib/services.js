import { apiRequest } from "./api";

/**
 * Service Category metadata matching backend ServiceCategory enum
 */
export const SERVICE_CATEGORIES = {
  PERIODIC_SERVICE: {
    label: "Periodic Maintenance",
    badgeVariant: "blue",
    shortLabel: "Periodic",
    tagline: "Scheduled factory maintenance & oil service",
  },
  GENERAL_SERVICE: {
    label: "General Service",
    badgeVariant: "neutral",
    shortLabel: "General",
    tagline: "Complete multi-point vehicle inspection & tune-up",
  },
  AC_SERVICE: {
    label: "AC & Climate Control",
    badgeVariant: "cyan",
    shortLabel: "AC Service",
    tagline: "Cabin cooling, refrigerant recharge & condenser care",
  },
  BRAKE_SERVICE: {
    label: "Brakes & Suspension",
    badgeVariant: "rose",
    shortLabel: "Brakes",
    tagline: "Brake pads, rotors, caliper flush & shock absorbers",
  },
  ENGINE_SERVICE: {
    label: "Engine & Transmission",
    badgeVariant: "amber",
    shortLabel: "Engine",
    tagline: "Engine diagnostics, timing belts & fluid replacement",
  },
  BATTERY_SERVICE: {
    label: "Battery & Electrical",
    badgeVariant: "purple",
    shortLabel: "Battery",
    tagline: "Battery health check, terminal service & alternator test",
  },
  WHEEL_ALIGNMENT: {
    label: "Wheel Alignment & Balancing",
    badgeVariant: "indigo",
    shortLabel: "Alignment",
    tagline: "3D laser alignment, balancing & steering calibration",
  },
  TYRE_SERVICE: {
    label: "Tyres & Wheels",
    badgeVariant: "neutral",
    shortLabel: "Tyres",
    tagline: "Tread depth analysis, rotation & replacement",
  },
  DETAILING: {
    label: "Car Detailing & Wash",
    badgeVariant: "emerald",
    shortLabel: "Detailing",
    tagline: "Deep interior sanitization, paint polish & ceramic coat",
  },
  DIAGNOSTICS: {
    label: "Full Diagnostics",
    badgeVariant: "warning",
    shortLabel: "Diagnostics",
    tagline: "OBD-II ECU scan & electronic sensor troubleshooting",
  },
  OTHER: {
    label: "Specialized Care",
    badgeVariant: "neutral",
    shortLabel: "Specialized",
    tagline: "Custom automotive repairs and specialized upkeep",
  },
};

/**
 * Formats duration in minutes to human-readable string (e.g. 45 mins, 2 hrs, 2 hrs 30 mins)
 */
export function formatDuration(minutes) {
  if (!minutes || isNaN(minutes) || minutes <= 0) {
    return "Duration on request";
  }

  const mins = parseInt(minutes, 10);
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;

  if (hours === 0) {
    return `${remainingMins} mins`;
  }
  if (remainingMins === 0) {
    return hours === 1 ? "1 hr" : `${hours} hrs`;
  }
  return `${hours} hr${hours > 1 ? "s" : ""} ${remainingMins} mins`;
}

/**
 * Formats price in Indian Rupees (INR)
 */
export function formatPrice(amount) {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "₹0";
  }
  return `₹${Number(amount).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}`;
}

/**
 * Helper to get user-friendly category label
 */
export function getCategoryMeta(categoryKey) {
  if (!categoryKey) {
    return {
      label: "General Service",
      badgeVariant: "neutral",
      shortLabel: "Service",
      tagline: "Automotive service package",
    };
  }
  return (
    SERVICE_CATEGORIES[categoryKey] || {
      label: categoryKey.replace(/_/g, " "),
      badgeVariant: "neutral",
      shortLabel: categoryKey.replace(/_/g, " "),
      tagline: "Service package",
    }
  );
}

/**
 * Service Catalog API Service
 * Connects directly to Spring Boot ServiceCatalogController (/api/v1/services)
 */
export const servicesApi = {
  /**
   * Fetch all active services for the logged-in customer
   * GET /api/v1/services
   */
  async getServices() {
    const res = await apiRequest("/services", {
      method: "GET",
      requiresAuth: true,
    });
    return res?.data || [];
  },

  /**
   * Fetch a single service by ID
   * GET /api/v1/services/{id}
   */
  async getService(id) {
    const res = await apiRequest(`/services/${id}`, {
      method: "GET",
      requiresAuth: true,
    });
    return res?.data;
  },
};
