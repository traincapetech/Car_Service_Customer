import { apiRequest } from "./api";

/**
 * Service Category metadata matching backend ServiceCategory enum
 */
export const SERVICE_CATEGORIES = {
  PERIODIC_SERVICE: {
    label: "Car Services",
    badgeVariant: "blue",
    shortLabel: "Car Services",
    iconName: "Car",
    tagline: "Periodic maintenance, engine oil & filter service",
  },
  AC_SERVICE: {
    label: "AC Service & Repair",
    badgeVariant: "cyan",
    shortLabel: "AC Service",
    iconName: "Wind",
    tagline: "Cabin cooling, refrigerant recharge & condenser care",
  },
  BATTERY_SERVICE: {
    label: "Batteries",
    badgeVariant: "purple",
    shortLabel: "Batteries",
    iconName: "BatteryCharging",
    tagline: "Jumpstart assistance, Amaron/Exide replacement",
  },
  TYRE_SERVICE: {
    label: "Tyres & Wheel Care",
    badgeVariant: "neutral",
    shortLabel: "Tyres",
    iconName: "Disc",
    tagline: "Puncture repair, stepney swap & new tyres",
  },
  WHEEL_ALIGNMENT: {
    label: "Wheel Alignment",
    badgeVariant: "indigo",
    shortLabel: "Alignment",
    iconName: "Sliders",
    tagline: "3D laser alignment & dynamic wheel balancing",
  },
  BRAKE_SERVICE: {
    label: "Brakes & Safety",
    badgeVariant: "rose",
    shortLabel: "Brakes",
    iconName: "ShieldAlert",
    tagline: "OE brake pads, shoes, rotor skimming & bleeding",
  },
  DETAILING: {
    label: "Detailing Services",
    badgeVariant: "emerald",
    shortLabel: "Detailing",
    iconName: "Sparkles",
    tagline: "Deep interior dry-cleaning, 3M wax & ceramic coat",
  },
  DIAGNOSTICS: {
    label: "Inspection & Diagnostics",
    badgeVariant: "warning",
    shortLabel: "Diagnostics",
    iconName: "Activity",
    tagline: "OBD-II computer scan & check-engine diagnostics",
  },
  ENGINE_SERVICE: {
    label: "Engine & Clutch",
    badgeVariant: "amber",
    shortLabel: "Engine",
    iconName: "Wrench",
    tagline: "Clutch overhaul, throttle cleaning & cooling system",
  },
  GENERAL_SERVICE: {
    label: "Roadside & General",
    badgeVariant: "neutral",
    shortLabel: "Roadside",
    iconName: "LifeBuoy",
    tagline: "Emergency fuel delivery, pre-purchase check & denting",
  },
  OTHER: {
    label: "Specialized Care",
    badgeVariant: "neutral",
    shortLabel: "Specialized",
    iconName: "Tool",
    tagline: "Custom automotive repairs and specialized upkeep",
  },
};

/**
 * Formats duration in minutes to human-readable string (e.g. 45 mins, 2 hrs, 2 hrs 30 mins)
 */
export function formatDuration(minutes) {
  if (!minutes || isNaN(minutes) || minutes <= 0) {
    return "Takes up to 1 Hour";
  }

  const mins = parseInt(minutes, 10);
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;

  if (hours === 0) {
    return `Takes up to ${remainingMins} mins`;
  }
  if (remainingMins === 0) {
    return `Takes up to ${hours} hr${hours > 1 ? "s" : ""}`;
  }
  return `Takes up to ${hours} hr${hours > 1 ? "s" : ""} ${remainingMins}m`;
}

/**
 * Formats price in Indian Rupees (INR)
 */
export function formatPrice(amount) {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "₹0";
  }
  return `₹${Number(amount).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })}`;
}

/**
 * Calculate realistic original MRP for strikethrough display (GoMechanic style)
 */
export function getOriginalPrice(basePrice) {
  const num = Number(basePrice) || 0;
  if (num <= 0) return 0;
  // Mark up by ~25-30% rounded to nearest 50
  const markup = num * 1.28;
  return Math.ceil(markup / 50) * 50;
}

/**
 * Extract structured inclusions checklist points from description
 */
export function getServiceInclusions(service) {
  if (!service) return [];

  // If description has "Includes ..."
  if (service.description && service.description.includes("Includes")) {
    const parts = service.description.split("Includes")[1];
    if (parts) {
      const cleaned = parts
        .replace(/\.$/, "")
        .split(/,|\band\b/)
        .map((s) => s.trim())
        .filter((s) => s.length > 2);
      if (cleaned.length > 0) {
        return cleaned.slice(0, 4);
      }
    }
  }

  // Fallback defaults based on category
  const categoryDefaults = {
    PERIODIC_SERVICE: [
      "Engine Oil Replacement",
      "Oil Filter Replacement",
      "Comprehensive Vehicle Inspection",
      "Free Vehicle Wash & Vacuum",
    ],
    AC_SERVICE: [
      "AC Gas Pressure & Leak Test",
      "Cabin AC Filter Cleaning",
      "Condenser Chemical Wash",
      "Vent Temperature Inspection",
    ],
    BATTERY_SERVICE: [
      "Rapid Doorstep Dispatch",
      "Alternator Charging Test",
      "Terminal Greasing & De-corrosion",
      "Manufacturer Warranty Certificate",
    ],
    TYRE_SERVICE: [
      "Doorstep Puncture Assistance",
      "Stepney Wheel Swap",
      "Tyre Pressure & Valve Check",
      "Tread Depth Inspection",
    ],
    WHEEL_ALIGNMENT: [
      "3D Computerized Laser Alignment",
      "Dynamic Wheel Balancing",
      "Precision Lead Balancing Weights",
      "Nitrogen Tyre Inflation",
    ],
    BRAKE_SERVICE: [
      "Genuine OE Friction Spares",
      "Disc Rotor Inspection & Cleaning",
      "Caliper Pin Greasing",
      "Brake Fluid Top-Up",
    ],
    DETAILING: [
      "Deep Interior Wet Vacuuming",
      "Dashboard Dressing & UV Guard",
      "High-Gloss Carnauba Wax Polish",
      "Anti-Bacterial Odor Treatment",
    ],
    DIAGNOSTICS: [
      "Full ECU Computerized Scan",
      "Fault Code (DTC) Analysis",
      "Live Sensor Telemetry Reading",
      "Digital Diagnostics Report",
    ],
    ENGINE_SERVICE: [
      "OEM Certified Replacement Spares",
      "Electronic Throttle Body Clean",
      "Engine Temperature Diagnostics",
      "Certified Master Mechanic Service",
    ],
    GENERAL_SERVICE: [
      "Doorstep Technician Dispatch",
      "100% Genuine OEM Spares",
      "Multi-Point Vehicle Inspection",
      "Customer Satisfaction Guarantee",
    ],
  };

  return (
    categoryDefaults[service.category] || [
      "100% Genuine OEM Spares",
      "Certified Master Technicians",
      "6-Month / 10,000 km Warranty",
      "Complimentary Digital Health Check",
    ]
  );
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
      iconName: "Car",
      tagline: "Automotive service package",
    };
  }
  return (
    SERVICE_CATEGORIES[categoryKey] || {
      label: categoryKey.replace(/_/g, " "),
      badgeVariant: "neutral",
      shortLabel: categoryKey.replace(/_/g, " "),
      iconName: "Car",
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
