"use client";

import React from "react";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import AdminShell from "../../components/admin/AdminShell";

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminShell>{children}</AdminShell>
    </ProtectedRoute>
  );
}
