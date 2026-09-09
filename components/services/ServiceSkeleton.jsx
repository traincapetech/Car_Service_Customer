"use client";

import React from "react";
import { Skeleton } from "../ui/Skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "../ui/Card";

export function ServiceCardSkeleton() {
  return (
    <Card className="flex flex-col justify-between overflow-hidden border border-slate-200/80 shadow-2xs">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between gap-3 mb-2">
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-md" />
        </div>
        <Skeleton className="h-6 w-3/4 rounded-md mt-1" />
        <div className="space-y-1.5 pt-2">
          <Skeleton className="h-3.5 w-full rounded" />
          <Skeleton className="h-3.5 w-4/5 rounded" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3 py-4 flex-1">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100/80 space-y-2">
          <Skeleton className="h-3 w-28 rounded" />
          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="h-5 w-32 rounded-md" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 pb-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
        <div className="space-y-1">
          <Skeleton className="h-2.5 w-14 rounded" />
          <Skeleton className="h-6 w-20 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </CardFooter>
    </Card>
  );
}

export default function ServiceSkeletonGrid({ count = 6 }) {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
      aria-hidden="true"
      aria-label="Loading service catalog"
    >
      {Array.from({ length: count }).map((_, index) => (
        <ServiceCardSkeleton key={index} />
      ))}
    </div>
  );
}
