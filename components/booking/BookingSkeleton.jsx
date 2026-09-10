"use client";

import React from "react";
import { Skeleton } from "../ui/Skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "../ui/Card";

export function BookingCardSkeleton() {
  return (
    <Card className="flex flex-col justify-between overflow-hidden border border-slate-200/90 shadow-2xs">
      <CardHeader className="pb-3.5 border-b border-slate-100">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-5 w-36 rounded-md font-mono" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </CardHeader>

      <CardContent className="py-4 space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-3.5 w-1/2 rounded" />
          </div>
          <Skeleton className="h-6 w-16 rounded" />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <Skeleton className="h-3 w-12 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <Skeleton className="h-3 w-12 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 pb-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
        <Skeleton className="h-7 w-20 rounded-xl" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20 rounded-xl" />
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
      </CardFooter>
    </Card>
  );
}

export function BookingListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4" aria-hidden="true" aria-label="Loading bookings">
      {Array.from({ length: count }).map((_, i) => (
        <BookingCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function BookingDetailsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-hidden="true">
      {/* Top Banner Skeleton */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48 rounded" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
      </div>

      {/* Grid of detail cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
          <Skeleton className="h-5 w-32 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-3/4 rounded" />
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
          <Skeleton className="h-5 w-32 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-3/4 rounded" />
        </div>
      </div>
    </div>
  );
}
