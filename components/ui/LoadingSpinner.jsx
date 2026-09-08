import React from "react";
import { Loader2 } from "lucide-react";

export default function LoadingSpinner({
  size = "md",
  variant = "blue",
  label,
  fullPage = false,
  className = "",
}) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const variants = {
    primary: "text-slate-900",
    blue: "text-blue-600",
    slate: "text-slate-400",
    white: "text-white",
  };

  const spinner = (
    <div
      role="status"
      className={`inline-flex flex-col items-center justify-center gap-2 ${className}`}
    >
      <Loader2
        className={`animate-spin ${sizes[size] || sizes.md} ${variants[variant] || variants.blue}`}
        aria-hidden="true"
      />
      <span className="sr-only">Loading...</span>
      {label && <p className="text-xs font-medium text-slate-500">{label}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-xs">
        {spinner}
      </div>
    );
  }

  return spinner;
}
