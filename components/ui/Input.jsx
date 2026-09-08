"use client";

import React, { forwardRef } from "react";
import FormField from "./FormField";

const Input = forwardRef(function Input(
  {
    label,
    id,
    type = "text",
    placeholder,
    value,
    onChange,
    error,
    helperText,
    required = false,
    optional = false,
    disabled = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    className = "",
    inputClassName = "",
    autoComplete,
    ...props
  },
  ref
) {
  const errorId = id && error ? `${id}-error` : undefined;
  const helperId = id && helperText ? `${id}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(" ") || undefined;

  const inputElement = (
    <div className="relative flex items-center w-full">
      {LeftIcon && (
        <div className="absolute left-3.5 pointer-events-none text-slate-400 flex items-center justify-center">
          <LeftIcon className="w-4 h-4" aria-hidden="true" />
        </div>
      )}

      <input
        ref={ref}
        id={id}
        type={type}
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
        } ${RightIcon ? "pr-10" : "pr-3.5"} ${
          error
            ? "border-rose-400 text-rose-950 focus:border-rose-600 focus:ring-2 focus:ring-rose-100 bg-rose-50/15"
            : "border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        } disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed ${inputClassName}`}
        {...props}
      />

      {RightIcon && (
        <div className="absolute right-3.5 pointer-events-none text-slate-400 flex items-center justify-center">
          <RightIcon className="w-4 h-4" aria-hidden="true" />
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

export default Input;
