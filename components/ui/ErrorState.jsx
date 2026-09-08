import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import Button from "./Button";

export default function ErrorState({
  icon: Icon = AlertCircle,
  title = "Unable to load content",
  description = "A network error or unexpected issue occurred. Please try again.",
  onRetry,
  retryLabel = "Try Again",
  isRetrying = false,
  className = "",
}) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-rose-200 bg-rose-50/30 ${className}`}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 mb-3.5 shadow-2xs">
        <Icon className="w-6 h-6 text-rose-600" aria-hidden="true" />
      </div>

      <h3 className="text-base font-bold text-slate-900 tracking-tight">
        {title}
      </h3>

      {description && (
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 leading-relaxed">
          {description}
        </p>
      )}

      {onRetry && (
        <div className="mt-5">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            isLoading={isRetrying}
            leftIcon={RotateCcw}
          >
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
