// Client-side validation helpers matching Spring Boot backend contracts

export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return "Email address is required";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return "Please enter a valid email address";
  }
  return null;
};

export const validateIndianPhone = (phone) => {
  if (!phone || !phone.trim()) {
    return "Phone number is required";
  }
  // Matches backend: 10 digits starting with 6, 7, 8, or 9
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phone.trim())) {
    return "Please enter a valid 10-digit mobile number starting with 6-9";
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password) {
    return "Password is required";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  if (password.length > 100) {
    return "Password cannot exceed 100 characters";
  }
  return null;
};

export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "Empty", color: "bg-slate-200" };

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  switch (score) {
    case 1:
      return { score: 25, label: "Weak", color: "bg-rose-500", text: "text-rose-600" };
    case 2:
      return { score: 50, label: "Fair", color: "bg-amber-500", text: "text-amber-600" };
    case 3:
      return { score: 75, label: "Good", color: "bg-sky-500", text: "text-sky-600" };
    case 4:
      return { score: 100, label: "Strong", color: "bg-emerald-500", text: "text-emerald-600" };
    default:
      return { score: 10, label: "Very Weak", color: "bg-rose-400", text: "text-rose-500" };
  }
};

/**
 * All recognized Indian State and Union Territory RTO Prefix Codes
 */
export const INDIAN_STATE_CODES = {
  AN: "Andaman & Nicobar Islands",
  AP: "Andhra Pradesh",
  AR: "Arunachal Pradesh",
  AS: "Assam",
  BR: "Bihar",
  CH: "Chandigarh",
  CG: "Chhattisgarh",
  DD: "Daman & Diu",
  DL: "Delhi",
  DN: "Dadra & Nagar Haveli",
  GA: "Goa",
  GJ: "Gujarat",
  HR: "Haryana",
  HP: "Himachal Pradesh",
  JH: "Jharkhand",
  JK: "Jammu & Kashmir",
  KA: "Karnataka",
  KL: "Kerala",
  LA: "Ladakh",
  LD: "Lakshadweep",
  MP: "Madhya Pradesh",
  MH: "Maharashtra",
  MN: "Manipur",
  ML: "Meghalaya",
  MZ: "Mizoram",
  NL: "Nagaland",
  OD: "Odisha",
  OR: "Odisha (Old)",
  PB: "Punjab",
  PY: "Puducherry",
  RJ: "Rajasthan",
  SK: "Sikkim",
  TN: "Tamil Nadu",
  TR: "Tripura",
  TS: "Telangana",
  UK: "Uttarakhand",
  UA: "Uttarakhand (Old)",
  UP: "Uttar Pradesh",
  WB: "West Bengal",
};

/**
 * Automatically formats registration number input with standard spaces:
 * State Series: [State] [RTO] [Series] [Number] -> e.g. "MH 02 AB 1234"
 * Bharat Series: [Year] BH [Number] [Series] -> e.g. "22 BH 1234 AA"
 */
export const formatRegistrationNumber = (raw) => {
  if (!raw) return "";
  // Strip everything except alphanumeric characters
  const clean = raw.toString().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!clean) return "";

  // 1. Bharat Series (starts with 2 digits followed by optional BH...)
  if (/^\d/.test(clean)) {
    const p1 = clean.slice(0, 2); // Year (e.g. 22)
    const p2 = clean.slice(2, 4); // BH
    const p3 = clean.slice(4, 8); // 4-digit number (e.g. 1234)
    const p4 = clean.slice(8, 10); // Series (e.g. AA)
    return [p1, p2, p3, p4].filter(Boolean).join(" ");
  }

  // 2. Standard State Series: SS RR AAA NNNN
  const state = clean.slice(0, 2);
  let rest = clean.slice(2);
  if (!rest) return state;

  // Extract RTO digits (1 or 2 digits)
  const rtoMatch = rest.match(/^(\d{1,2})/);
  if (!rtoMatch) {
    return `${state} ${rest}`.trim();
  }

  const rto = rtoMatch[1];
  rest = rest.slice(rto.length);
  if (!rest) return `${state} ${rto}`;

  // Extract series letters (0 to 3 letters)
  const seriesMatch = rest.match(/^([A-Z]{1,3})/);
  if (!seriesMatch) {
    // If no series letters, user might type digits directly (vintage/vip: e.g. DL 01 1234)
    const numMatch = rest.match(/^(\d{1,4})/);
    if (numMatch) {
      return `${state} ${rto} ${numMatch[1]}`;
    }
    return `${state} ${rto} ${rest}`.trim();
  }

  const series = seriesMatch[1];
  rest = rest.slice(series.length);
  if (!rest) return `${state} ${rto} ${series}`;

  // Extract number (up to 4 digits)
  const numMatch = rest.match(/^(\d{1,4})/);
  const num = numMatch ? numMatch[1] : rest.slice(0, 4);

  return [state, rto, series, num].filter(Boolean).join(" ");
};

/**
 * Validates vehicle registration number strictly according to Indian RTO standards:
 * - Standard State Format: 2-letter state code + 1-2 digit RTO + 0-3 letter series + 1-4 digit number
 * - Bharat (BH) Series Format: 2-digit year + 'BH' + 4-digit number + 1-2 letter series
 *
 * @param {string} raw - Raw registration string (e.g. "MH 02 AB 1234", "mh02ab1234", "22 BH 1234 AA")
 * @returns {{ isValid: boolean, formatted: string, stateName: string | null, type: string, error: string | null }}
 */
export const validateIndianRegistrationNumber = (raw) => {
  if (!raw || !raw.trim()) {
    return {
      isValid: false,
      formatted: "",
      stateName: null,
      type: "UNKNOWN",
      error: "Registration number is required",
    };
  }

  const clean = raw.toString().toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (clean.length < 6) {
    return {
      isValid: false,
      formatted: formatRegistrationNumber(raw),
      stateName: null,
      type: "UNKNOWN",
      error: "Registration number is too short (e.g., MH 02 AB 1234)",
    };
  }

  if (clean.length > 11) {
    return {
      isValid: false,
      formatted: formatRegistrationNumber(raw),
      stateName: null,
      type: "UNKNOWN",
      error: "Registration number cannot exceed 10-11 characters",
    };
  }

  // 1. Check Bharat (BH) Series: YY BH NNNN XX (e.g. 22 BH 1234 AA)
  const bhMatch = clean.match(/^(\d{2})BH(\d{4})([A-Z]{1,2})$/);
  if (bhMatch) {
    const year = bhMatch[1];
    const num = bhMatch[2];
    const series = bhMatch[3];
    return {
      isValid: true,
      formatted: `${year} BH ${num} ${series}`,
      stateName: "Bharat Series (MoRTH)",
      type: "BHARAT",
      error: null,
    };
  }

  // 2. Check Standard State/UT Series: SS RR [AAA] NNNN (e.g. MH 02 AB 1234, DL 1 C 1234, DL 01 1234)
  const stateMatch = clean.match(/^([A-Z]{2})(\d{1,2})([A-Z]{0,3})(\d{1,4})$/);
  if (stateMatch) {
    const stateCode = stateMatch[1];
    const rto = stateMatch[2].padStart(2, "0");
    const series = stateMatch[3];
    const num = stateMatch[4].padStart(4, "0");

    const stateName = INDIAN_STATE_CODES[stateCode];
    if (!stateName) {
      return {
        isValid: false,
        formatted: formatRegistrationNumber(raw),
        stateName: null,
        type: "STATE",
        error: `"${stateCode}" is not a recognized Indian State/UT code (e.g., DL, MH, KA, HR, UP)`,
      };
    }

    const formatted = [stateCode, rto, series, num].filter(Boolean).join(" ");
    return {
      isValid: true,
      formatted,
      stateCode,
      stateName,
      type: "STATE",
      error: null,
    };
  }

  // If starts with digits but failed BH regex
  if (/^\d/.test(clean)) {
    return {
      isValid: false,
      formatted: formatRegistrationNumber(raw),
      stateName: null,
      type: "BHARAT",
      error: "Invalid Bharat Series format. Expected: 22 BH 1234 AA",
    };
  }

  // If starts with 2 letters but rest doesn't conform
  const statePrefix = clean.slice(0, 2);
  const recognizedState = INDIAN_STATE_CODES[statePrefix];
  if (!recognizedState) {
    return {
      isValid: false,
      formatted: formatRegistrationNumber(raw),
      stateName: null,
      type: "STATE",
      error: `"${statePrefix}" is not a recognized State code. Valid examples: DL, MH, KA, HR, UP`,
    };
  }

  return {
    isValid: false,
    formatted: formatRegistrationNumber(raw),
    stateName: recognizedState,
    type: "STATE",
    error: `Invalid registration plate format for ${recognizedState}. Expected format: ${statePrefix} 02 AB 1234`,
  };
};
