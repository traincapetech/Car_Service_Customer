import React from "react";

export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-shimmer rounded-lg bg-slate-200/70 ${className}`}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
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

export function AvatarSkeleton({ size = "md" }) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-11 h-11",
    lg: "w-14 h-14",
  };
  return <Skeleton className={`${sizes[size] || sizes.md} rounded-full`} />;
}

export function TableRowSkeleton({ columns = 4 }) {
  return (
    <div className="flex items-center gap-4 py-4 px-6 border-b border-slate-100">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === 0 ? "w-1/4" : i === 1 ? "w-1/3" : "w-1/6"}`}
        />
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
      <Skeleton className="h-11 w-full rounded-xl mt-6" />
    </div>
  );
}
