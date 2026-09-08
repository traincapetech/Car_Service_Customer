import React from "react";

export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-shimmer rounded-lg bg-slate-100 ${className}`}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-48" />
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  );
}
