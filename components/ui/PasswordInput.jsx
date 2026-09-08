"use client";

import React, { useState, forwardRef } from "react";
import { Eye, EyeOff, Lock, Check, X } from "lucide-react";
import FormField from "./FormField";

const PasswordInput = forwardRef(function PasswordInput(
  {
    label,
    id,
    placeholder = "••••••••",
    value = "",
    onChange,
    error,
    helperText,
    required = false,
    optional = false,
    disabled = false,
    leftIcon: LeftIcon = Lock,
    showStrengthMeter = false,
    className = "",
    inputClassName = "",
    autoComplete = "current-password",
    ...props
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);

  const errorId = id && error ? `${id}-error` : undefined;
  const helperId = id && helperText ? `${id}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(" ") || undefined;

  // Strength calculations
  const criteria = [
    { label: "At least 8 characters", met: value.length >= 8 },
    { label: "One uppercase letter (A-Z)", met: /[A-Z]/.test(value) },
    { label: "One lowercase letter (a-z)", met: /[a-z]/.test(value) },
    { label: "One number (0-9)", met: /[0-9]/.test(value) },
    { label: "One special character (@$!%*?&)", met: /[@$!%*?&]/.test(value) },
  ];

  const metCount = criteria.filter((c) => c.met).length;
  const strengthScore = value.length === 0 ? 0 : Math.min(metCount, 5);

  const strengthLabels = ["Empty", "Weak", "Fair", "Good", "Strong", "Very Strong"];
  const strengthColors = [
    "bg-slate-200",
    "bg-rose-500",
    "bg-amber-500",
    "bg-blue-500",
    "bg-emerald-500",
    "bg-emerald-600",
  ];

  const inputElement = (
    <div className="space-y-2 w-full">
      <div className="relative flex items-center w-full">
        {LeftIcon && (
          <div className="absolute left-3.5 pointer-events-none text-slate-400 flex items-center justify-center">
            <LeftIcon className="w-4 h-4" aria-hidden="true" />
          </div>
        )}

        <input
          ref={ref}
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`w-full rounded-xl bg-white border text-sm text-slate-900 placeholder-slate-400 transition-all duration-150 py-2.5 shadow-2xs ${
            LeftIcon ? "pl-10" : "pl-3.5"
          } pr-11 ${
            error
              ? "border-rose-400 text-rose-950 focus:border-rose-600 focus:ring-2 focus:ring-rose-100 bg-rose-50/15"
              : "border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          } disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed ${inputClassName}`}
          {...props}
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          tabIndex={0}
          className="absolute right-3 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4 text-slate-600" aria-hidden="true" />
          ) : (
            <Eye className="w-4 h-4 text-slate-500" aria-hidden="true" />
          )}
        </button>
      </div>

      {showStrengthMeter && value.length > 0 && (
        <div className="pt-1.5 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
            <span>Password strength</span>
            <span className="font-semibold text-slate-800">
              {strengthLabels[strengthScore]}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 h-1.5">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`h-full rounded-full transition-colors duration-300 ${
                  step <= strengthScore ? strengthColors[strengthScore] : "bg-slate-200"
                }`}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
            {criteria.map((c, i) => (
              <div
                key={i}
                className={`flex items-center gap-1.5 text-[11px] ${
                  c.met ? "text-emerald-700 font-medium" : "text-slate-400"
                }`}
              >
                {c.met ? (
                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                ) : (
                  <X className="w-3 h-3 text-slate-300 shrink-0" />
                )}
                <span>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (label || error || helperText) {
    return (
      <FormField
        label={label}
        id={id}
        required={required}
        optional={optional}
        helperText={helperText}
        error={error}
        className={className}
      >
        {inputElement}
      </FormField>
    );
  }

  return inputElement;
});

export default PasswordInput;
