"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { CardSkeleton } from "../ui/Skeleton";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && allowedRoles && allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
      if (pathname.startsWith("/admin")) {
        if (user.role === "PARTNER") {
          router.replace("/marketplace");
        } else if (user.role === "CUSTOMER") {
          router.replace("/dashboard");
        }
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    const fallbackPath =
      user.role === "ADMIN"
        ? "/admin/dashboard"
        : user.role === "PARTNER"
        ? "/marketplace"
        : "/dashboard";
    const fallbackLabel =
      user.role === "ADMIN"
        ? "Return to Admin Console"
        : user.role === "PARTNER"
        ? "Return to Partner Portal"
        : "Return to Customer Dashboard";

    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
          <p className="text-xs text-slate-500">
            You do not have permission to view this page. This area requires administrative privileges.
          </p>
          <button
            type="button"
            onClick={() => router.push(fallbackPath)}
            className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            {fallbackLabel}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
