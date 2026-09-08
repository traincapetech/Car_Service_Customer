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
