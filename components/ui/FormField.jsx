"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

export default function FormField({
  label,
  id,
  required = false,
  optional = false,
  helperText,
  error,
  children,
  className = "",
}) {
  const errorId = id && error ? `${id}-error` : undefined;
  const helperId = id && helperText ? `${id}-helper` : undefined;

  return (
    <div className={`space-y-1.5 text-left ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={id}
            className="block text-xs font-semibold text-slate-700 tracking-tight"
          >
            {label}
            {required && <span className="text-rose-500 ml-1" aria-hidden="true">*</span>}
          </label>
          {optional && (
            <span className="text-[11px] text-slate-400 font-normal">Optional</span>
          )}
        </div>
      )}

      {children}

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-xs font-medium text-rose-600 flex items-center gap-1.5 animate-in fade-in duration-150"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-slate-500 leading-normal">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
