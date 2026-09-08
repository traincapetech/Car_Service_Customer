import React from "react";

export default function Badge({
  children,
  variant = "neutral",
  size = "md",
  dot = false,
  pulse = false,
  className = "",
}) {
  const variants = {
    neutral: "bg-slate-100 text-slate-700 border-slate-200/80",
    primary: "bg-slate-900 text-white border-transparent",
    blue: "bg-blue-50 text-blue-700 border-blue-200/80",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    warning: "bg-amber-50 text-amber-700 border-amber-200/80",
    danger: "bg-rose-50 text-rose-700 border-rose-200/80",
    purple: "bg-purple-50 text-purple-700 border-purple-200/80",
  };

  const dotColors = {
    neutral: "bg-slate-400",
    primary: "bg-white",
    blue: "bg-blue-600",
    success: "bg-emerald-600",
    warning: "bg-amber-600",
    danger: "bg-rose-600",
    purple: "bg-purple-600",
  };

  const sizes = {
    sm: "text-[10px] px-2 py-0.5 gap-1 font-semibold",
    md: "text-xs px-2.5 py-0.75 gap-1.5 font-medium",
    lg: "text-sm px-3 py-1 gap-2 font-medium",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border tracking-wide uppercase font-mono select-none ${
        variants[variant] || variants.neutral
      } ${sizes[size] || sizes.md} ${className}`}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          {pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                dotColors[variant] || "bg-slate-400"
              }`}
            />
          )}
          <span
            className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
              dotColors[variant] || "bg-slate-400"
            }`}
          />
        </span>
      )}
      <span>{children}</span>
    </span>
  );
}
