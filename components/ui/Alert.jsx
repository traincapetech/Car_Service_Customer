"use client";

import React from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

export default function Alert({
  variant = "info",
  title,
  children,
  icon: CustomIcon,
  onClose,
  action,
  className = "",
}) {
  const configs = {
    info: {
      container: "bg-blue-50/80 border-blue-200/80 text-blue-900",
      icon: Info,
      iconColor: "text-blue-600",
      closeHover: "hover:bg-blue-100 text-blue-700",
    },
    success: {
      container: "bg-emerald-50/80 border-emerald-200/80 text-emerald-900",
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
      closeHover: "hover:bg-emerald-100 text-emerald-700",
    },
    warning: {
      container: "bg-amber-50/80 border-amber-200/80 text-amber-900",
      icon: AlertTriangle,
      iconColor: "text-amber-600",
      closeHover: "hover:bg-amber-100 text-amber-700",
    },
    error: {
      container: "bg-rose-50/80 border-rose-200/80 text-rose-900",
      icon: AlertCircle,
      iconColor: "text-rose-600",
      closeHover: "hover:bg-rose-100 text-rose-700",
    },
  };

  const current = configs[variant] || configs.info;
  const IconComponent = CustomIcon || current.icon;

  return (
    <div
      role="alert"
      className={`relative rounded-xl border p-4 text-xs sm:text-sm flex items-start gap-3 transition-all ${current.container} ${className}`}
    >
      <IconComponent className={`w-5 h-5 shrink-0 mt-0.5 ${current.iconColor}`} aria-hidden="true" />

      <div className="flex-1 min-w-0">
        {title && <h4 className="font-bold text-sm tracking-tight mb-1">{title}</h4>}
        <div className="leading-relaxed">{children}</div>
        {action && <div className="mt-2.5 pt-1">{action}</div>}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className={`p-1 rounded-lg transition-colors shrink-0 ${current.closeHover}`}
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
