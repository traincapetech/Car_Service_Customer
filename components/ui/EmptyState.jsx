import React from "react";
import { Inbox } from "lucide-react";

export default function EmptyState({
  icon: Icon = Inbox,
  title = "No records found",
  description = "There are currently no items to display.",
  action,
  secondaryAction,
  compact = false,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-slate-300 bg-white/70 ${
        compact ? "p-6 sm:p-8" : "p-10 sm:p-14"
      } ${className}`}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 mb-3.5 shadow-2xs">
        <Icon className="w-6 h-6 text-slate-500" aria-hidden="true" />
      </div>

      <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
        {title}
      </h3>

      {description && (
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 leading-relaxed">
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
