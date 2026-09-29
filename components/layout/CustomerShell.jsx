"use client";

import React from "react";
import ProtectedRoute from "../auth/ProtectedRoute";
import DashboardSidebar from "./DashboardSidebar";
import { useAuth } from "../../context/AuthContext";

export default function CustomerShell({ children, className = "", requireAuth = true }) {
  const { isAuthenticated } = useAuth();

  const content = (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50/60 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* Sidebar only shown for authenticated customer dashboard */}
          {isAuthenticated && <DashboardSidebar />}

          {/* Main Content Area */}
          <main className={`flex-1 w-full min-w-0 space-y-6 ${className}`}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );

  if (!requireAuth) {
    return content;
  }

  return <ProtectedRoute>{content}</ProtectedRoute>;
}
