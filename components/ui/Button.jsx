"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  fullWidth = false,
  className = "",
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  onClick,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed select-none active:scale-[0.98]";

  const variants = {
    primary:
      "bg-slate-900 hover:bg-slate-800 text-white shadow-xs focus-visible:ring-slate-900 focus-visible:ring-offset-white",
    blue:
      "bg-blue-600 hover:bg-blue-700 text-white shadow-xs focus-visible:ring-blue-600 focus-visible:ring-offset-white",
    secondary:
      "bg-slate-100 hover:bg-slate-200 text-slate-900 focus-visible:ring-slate-400 focus-visible:ring-offset-white",
    outline:
      "border border-slate-300 hover:border-slate-400 bg-white text-slate-700 hover:bg-slate-50 shadow-xs focus-visible:ring-slate-400 focus-visible:ring-offset-white",
    ghost:
      "text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:ring-slate-300 focus-visible:ring-offset-white",
    danger:
      "bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus-visible:ring-rose-600 focus-visible:ring-offset-white",
    subtleDanger:
      "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 focus-visible:ring-rose-500",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2.5 gap-2",
    lg: "text-base px-5 py-3 gap-2.5",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${widthStyle} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" aria-hidden="true" />
      ) : (
        LeftIcon && <LeftIcon className="w-4 h-4 text-current shrink-0" aria-hidden="true" />
      )}
      <span>{children}</span>
      {!isLoading && RightIcon && (
        <RightIcon className="w-4 h-4 text-current shrink-0" aria-hidden="true" />
      )}
    </button>
  );
}
