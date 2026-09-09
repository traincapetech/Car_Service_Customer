"use client";

import React from "react";
import { Skeleton } from "../ui/Skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "../ui/Card";

export function VehicleCardSkeleton() {
  return (
    <Card className="flex flex-col justify-between overflow-hidden animate-pulse">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-3/4 rounded-md" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
          </div>
          <Skeleton className="h-6 w-12 rounded-lg shrink-0" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3.5 py-4">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-4 w-28 rounded font-mono" />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100/80 space-y-1.5">
            <Skeleton className="h-2.5 w-12 rounded" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100/80 space-y-1.5">
            <Skeleton className="h-2.5 w-16 rounded" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-end gap-2 pt-3">
        <Skeleton className="h-8 w-20 rounded-xl" />
        <Skeleton className="h-8 w-16 rounded-xl" />
      </CardFooter>
    </Card>
  );
}

export default function VehicleSkeletonGrid({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <VehicleCardSkeleton key={i} />
      ))}
    </div>
  );
}
