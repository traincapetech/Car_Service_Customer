"use client";

import React from "react";
import ProtectedRoute from "../auth/ProtectedRoute";
import DashboardSidebar from "./DashboardSidebar";

export default function CustomerShell({ children, className = "" }) {
  return (
    <ProtectedRoute>
      <div className="min-h-[calc(100vh-64px)] bg-slate-50/60 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main Content Area */}
            <main className={`flex-1 w-full min-w-0 space-y-6 ${className}`}>
              {children}
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
