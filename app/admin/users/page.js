"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import PageHeader from "../../../components/ui/PageHeader";
import { adminUsersApi } from "../../../lib/admin";
import { useAuth } from "../../../context/AuthContext";
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Eye,
  ShieldCheck,
  ShieldAlert,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  UserX,
  Building2,
  Car,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  ArrowRight,
} from "lucide-react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";

const ROLE_OPTIONS = [
  { value: "ALL", label: "All Roles" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "ADMIN", label: "Administrator" },
  { value: "OPERATIONS_ADMIN", label: "Operations Admin" },
  { value: "FINANCE_ADMIN", label: "Finance Admin" },
  { value: "SUPPORT_AGENT", label: "Support Agent" },
  { value: "WORKSHOP_OWNER", label: "Workshop Owner" },
  { value: "PARTNER", label: "Workshop Partner" },
  { value: "WORKSHOP_STAFF", label: "Workshop Staff" },
  { value: "CUSTOMER", label: "Customer" },
];

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "PENDING", label: "Pending" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "REJECTED", label: "Rejected" },
];

export default function AdminUsersPage() {
  const { user: currentAdmin } = useAuth();
  const isSuperAdmin = currentAdmin?.role === "SUPER_ADMIN";

  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filtering
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // User Detail Modal
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [detailUser, setDetailUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Status Change Dialog
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [newStatus, setNewStatus] = useState("ACTIVE");
  const [statusReason, setStatusReason] = useState("");
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [statusError, setStatusError] = useState(null);

  // Role Assignment Dialog
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState("CUSTOMER");
  const [roleReason, setRoleReason] = useState("");
  const [roleSubmitting, setRoleSubmitting] = useState(false);
  const [roleError, setRoleError] = useState(null);

  const [reloadKey, setReloadKey] = useState(0);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Load KPI Summary
  useEffect(() => {
    let ignore = false;
    async function loadSummary() {
      try {
        const sum = await adminUsersApi.getUserSummary();
        if (!ignore) setSummary(sum);
      } catch (err) {
        console.error("Failed to load user summary:", err);
      }
    }
    loadSummary();
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  // Load Users List
  // Load Users List
  useEffect(() => {
    let ignore = false;
    async function loadUsers() {
      try {
        setLoading(true);
        setError(null);
        const data = await adminUsersApi.getUsers({
          page,
          size,
          search: debouncedSearch.trim() || undefined,
          role: selectedRole !== "ALL" ? selectedRole : undefined,
          status: selectedStatus !== "ALL" ? selectedStatus : undefined,
          sort: "createdAt",
          direction: "DESC",
        });
        if (!ignore) {
          setUsers(data.content || []);
          setTotalPages(data.totalPages || 1);
          setTotalElements(data.totalElements || 0);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load users:", err);
          setError(err.message || "Failed to load users. Verify your administrative privileges.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadUsers();
    return () => {
      ignore = true;
    };
  }, [page, size, debouncedSearch, selectedRole, selectedStatus, reloadKey]);

  // Open User Detail
  const handleOpenDetail = async (userId) => {
    setSelectedUserId(userId);
    setDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const data = await adminUsersApi.getUserDetail(userId);
      setDetailUser(data);
    } catch (err) {
      console.error("Failed to load user detail:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Open Status Dialog
  const handleOpenStatusModal = (u) => {
    setTargetUser(u);
    setNewStatus(u.status || (u.isActive ? "ACTIVE" : "INACTIVE"));
    setStatusReason("");
    setStatusError(null);
    setStatusModalOpen(true);
  };

  // Submit Status Change
  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!targetUser) return;
    if (!statusReason.trim()) {
      setStatusError("A detailed justification reason is mandatory for audit compliance.");
      return;
    }
    try {
      setStatusSubmitting(true);
      setStatusError(null);
      await adminUsersApi.updateUserStatus(targetUser.id, {
        status: newStatus,
        reason: statusReason.trim(),
      });
      setStatusModalOpen(false);
      setReloadKey((prev) => prev + 1);
      if (detailUser && detailUser.id === targetUser.id) {
        handleOpenDetail(targetUser.id);
      }
    } catch (err) {
      setStatusError(err.message || "Failed to update user status.");
    } finally {
      setStatusSubmitting(false);
    }
  };

  // Open Role Dialog
  const handleOpenRoleModal = (u) => {
    setTargetUser(u);
    setNewRole(u.role || "CUSTOMER");
    setRoleReason("");
    setRoleError(null);
    setRoleModalOpen(true);
  };

  // Submit Role Change
  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!targetUser) return;
    if (!roleReason.trim()) {
      setRoleError("A detailed justification reason is required for role modification.");
      return;
    }
    try {
      setRoleSubmitting(true);
      setRoleError(null);
      await adminUsersApi.updateUserRole(targetUser.id, {
        role: newRole,
        reason: roleReason.trim(),
      });
      setRoleModalOpen(false);
      setReloadKey((prev) => prev + 1);
      if (detailUser && detailUser.id === targetUser.id) {
        handleOpenDetail(targetUser.id);
      }
    } catch (err) {
      setRoleError(err.message || "Failed to update user role.");
    } finally {
      setRoleSubmitting(false);
    }
  };

  // Helper badge styles
  const getRoleBadge = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <Badge variant="purple" icon={ShieldAlert}>Super Admin</Badge>;
      case "ADMIN":
        return <Badge variant="blue" icon={ShieldCheck}>Admin</Badge>;
      case "OPERATIONS_ADMIN":
        return <Badge variant="blue" icon={Shield}>Operations Admin</Badge>;
      case "FINANCE_ADMIN":
        return <Badge variant="success" icon={Shield}>Finance Admin</Badge>;
      case "SUPPORT_AGENT":
        return <Badge variant="blue" icon={Shield}>Support Agent</Badge>;
      case "PARTNER":
      case "WORKSHOP_OWNER":
        return <Badge variant="warning" icon={Building2}>Workshop Partner</Badge>;
      case "WORKSHOP_STAFF":
        return <Badge variant="warning" icon={Building2}>Workshop Staff</Badge>;
      case "CUSTOMER":
      default:
        return <Badge variant="neutral" icon={Users}>Customer</Badge>;
    }
  };

  const getStatusBadge = (status, isActive) => {
    const s = status || (isActive ? "ACTIVE" : "INACTIVE");
    switch (s) {
      case "ACTIVE":
        return <Badge variant="success" icon={CheckCircle2}>Active</Badge>;
      case "SUSPENDED":
        return <Badge variant="danger" icon={XCircle}>Suspended</Badge>;
      case "PENDING":
        return <Badge variant="warning" icon={Clock}>Pending</Badge>;
      case "INACTIVE":
        return <Badge variant="neutral" icon={UserX}>Inactive</Badge>;
      case "REJECTED":
        return <Badge variant="danger" icon={AlertTriangle}>Rejected</Badge>;
      default:
        return <Badge variant="neutral">{s}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs */}
      <PageHeader
        title="Users & Access Control"
        description="Manage accounts, security lifecycle states, and role-based permissions across the platform."
        breadcrumbs={[
          { label: "Admin Console", href: "/admin/dashboard" },
          { label: "Users & Roles" },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/roles"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-purple-600" />
              <span>Roles & Permissions Matrix</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setReloadKey((k) => k + 1)}
              icon={RefreshCw}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Refresh
            </Button>
          </div>
        }
      />

      {/* KPI Metrics Ribbon */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="text-xs text-slate-500 font-medium">Total Users</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{summary.totalUsers}</div>
            <div className="mt-1 text-[11px] text-slate-400">Platform-wide</div>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-2xs">
            <div className="text-xs text-emerald-800 font-medium">Active Accounts</div>
            <div className="mt-1 text-2xl font-bold text-emerald-700">{summary.activeUsers}</div>
            <div className="mt-1 text-[11px] text-emerald-600/80">Enabled access</div>
          </div>
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 shadow-2xs">
            <div className="text-xs text-rose-800 font-medium">Suspended</div>
            <div className="mt-1 text-2xl font-bold text-rose-700">{summary.suspendedUsers}</div>
            <div className="mt-1 text-[11px] text-rose-600/80">Account locked</div>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-2xs">
            <div className="text-xs text-amber-800 font-medium">Pending / Inactive</div>
            <div className="mt-1 text-2xl font-bold text-amber-700">{summary.pendingUsers + summary.inactiveUsers}</div>
            <div className="mt-1 text-[11px] text-amber-600/80">Awaiting or paused</div>
          </div>
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 shadow-2xs">
            <div className="text-xs text-purple-800 font-medium">Admins</div>
            <div className="mt-1 text-2xl font-bold text-purple-700">{summary.adminUsers}</div>
            <div className="mt-1 text-[11px] text-purple-600/80">Elevated staff</div>
          </div>
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 shadow-2xs">
            <div className="text-xs text-indigo-800 font-medium">Partners</div>
            <div className="mt-1 text-2xl font-bold text-indigo-700">{summary.partnerUsers}</div>
            <div className="mt-1 text-[11px] text-indigo-600/80">Workshops & owners</div>
          </div>
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 shadow-2xs">
            <div className="text-xs text-blue-800 font-medium">Customers</div>
            <div className="mt-1 text-2xl font-bold text-blue-700">{summary.customerUsers}</div>
            <div className="mt-1 text-[11px] text-blue-600/80">Car owners</div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setPage(0);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(0);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {error && (
          <div className="p-4 bg-rose-50 border-b border-rose-200 text-rose-700 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 select-none">
                <th scope="col" className="py-3.5 px-4">User</th>
                <th scope="col" className="py-3.5 px-4">Contact</th>
                <th scope="col" className="py-3.5 px-4">Role</th>
                <th scope="col" className="py-3.5 px-4">Status</th>
                <th scope="col" className="py-3.5 px-4">Associated Entity</th>
                <th scope="col" className="py-3.5 px-4">Joined Date</th>
                <th scope="col" className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                      <span className="text-sm font-medium">Loading platform users...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500 text-sm">
                    No users found matching current filters.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSuper = u.role === "SUPER_ADMIN";
                  const isSelf = currentAdmin && String(u.id) === String(currentAdmin.id);

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 uppercase shrink-0">
                            {u.name ? u.name.substring(0, 2) : "U"}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              {u.name || "Unnamed User"}
                              {isSelf && (
                                <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded-full border border-purple-200 font-semibold">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">ID: {u.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs">
                        <div className="text-slate-800 font-medium">{u.email}</div>
                        <div className="text-slate-400">{u.phone || "No phone"}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        {getRoleBadge(u.role)}
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(u.status, u.isActive)}
                      </td>

                      <td className="py-3.5 px-4 text-xs">
                        {u.hasWorkshop ? (
                          <div className="flex items-center gap-1.5 text-amber-700 font-medium">
                            <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Workshop Profile Linked</span>
                          </div>
                        ) : u.role === "CUSTOMER" ? (
                          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                            <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Customer Account</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500 font-medium">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(u.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="View User Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Status Change Button */}
                          {(!isSuper || isSuperAdmin) && !isSelf && (
                            <button
                              onClick={() => handleOpenStatusModal(u)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200/80"
                              title="Change User Status"
                            >
                              Status
                            </button>
                          )}

                          {/* Role Assignment Button (Super Admin Only) */}
                          {isSuperAdmin && !isSelf && (
                            <button
                              onClick={() => handleOpenRoleModal(u)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors"
                              title="Assign Role"
                            >
                              Role
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{users.length}</span> of{" "}
            <span className="font-bold text-slate-800">{totalElements}</span> users
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0 || loading}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              icon={ChevronLeft}
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Previous
            </Button>
            <span className="text-xs text-slate-600 font-medium px-2">
              Page {page + 1} of {Math.max(1, totalPages)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1 || loading}
              onClick={() => setPage((p) => p + 1)}
              icon={ChevronRight}
              iconPosition="right"
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="User Account Details"
        size="lg"
      >
        {detailLoading || !detailUser ? (
          <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-sm font-medium">Loading user profile...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Profile Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center font-extrabold text-lg text-purple-700 shadow-2xs">
                  {detailUser.name ? detailUser.name.substring(0, 2).toUpperCase() : "U"}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{detailUser.name || "Unnamed User"}</h3>
                  <p className="text-xs text-slate-600 font-mono">{detailUser.email}</p>
                  <p className="text-xs text-slate-400 font-mono">{detailUser.phone || "No phone number"}</p>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-2">
                {getRoleBadge(detailUser.role)}
                {getStatusBadge(detailUser.status, detailUser.isActive)}
              </div>
            </div>

            {/* Account Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">User ID</div>
                <div className="text-sm font-mono font-bold text-slate-900 mt-0.5">{detailUser.id}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Active State</div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">
                  {detailUser.isActive ? "Enabled" : "Disabled"}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Created At</div>
                <div className="text-xs text-slate-600 mt-1 font-medium">
                  {detailUser.createdAt ? new Date(detailUser.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Last Updated</div>
                <div className="text-xs text-slate-600 mt-1 font-medium">
                  {detailUser.updatedAt ? new Date(detailUser.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                </div>
              </div>
            </div>

            {/* Associated Workshop Profile if Partner */}
            {detailUser.workshop && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                    <Building2 className="w-4 h-4 text-amber-600" />
                    <span>Associated Workshop Facility</span>
                  </div>
                  <Badge variant={detailUser.workshop.verificationStatus === "VERIFIED" ? "success" : "warning"}>
                    {detailUser.workshop.verificationStatus}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Workshop Name:</span>
                    <div className="font-bold text-slate-900 mt-0.5">{detailUser.workshop.businessName}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Location:</span>
                    <div className="font-bold text-slate-900 mt-0.5">{detailUser.workshop.city}, {detailUser.workshop.state}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Facility ID:</span>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">WS-{detailUser.workshop.id}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Status:</span>
                    <div className="font-bold text-slate-900 mt-0.5">{detailUser.workshop.isActive ? "Operational" : "Inactive"}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Associated Customer Metrics if Customer */}
            {detailUser.customer && (
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-3">
                <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
                  <Car className="w-4 h-4 text-blue-600" />
                  <span>Customer Activity & Garage</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-white border border-blue-200/80 shadow-2xs">
                    <div className="text-xs text-slate-500 font-medium">Registered Vehicles</div>
                    <div className="text-xl font-extrabold text-slate-900 mt-1">{detailUser.customer.vehiclesCount}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-blue-200/80 shadow-2xs">
                    <div className="text-xs text-slate-500 font-medium">Total Bookings</div>
                    <div className="text-xl font-extrabold text-slate-900 mt-1">{detailUser.customer.bookingsCount}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-blue-200/80 shadow-2xs">
                    <div className="text-xs text-slate-500 font-medium">Service Requests</div>
                    <div className="text-xl font-extrabold text-slate-900 mt-1">{detailUser.customer.requestsCount}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Effective Role Permissions Matrix */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <KeyRound className="w-4 h-4 text-purple-600" />
                  <span>Effective Permissions ({detailUser.permissions?.length || 0})</span>
                </div>
                <span className="text-xs text-slate-500">Derived from role: <strong className="text-slate-800">{detailUser.role}</strong></span>
              </div>

              <div className="max-h-48 overflow-y-auto p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap gap-1.5">
                {detailUser.permissions && detailUser.permissions.length > 0 ? (
                  detailUser.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="px-2 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-mono font-medium text-slate-700 shadow-2xs"
                    >
                      {perm}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No explicit authorities granted.</span>
                )}
              </div>
            </div>

            {/* Action Buttons in Modal */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Audit logs recorded for all administrative operations.
              </div>
              <div className="flex items-center gap-2">
                {(!detailUser.role?.includes("SUPER_ADMIN") || isSuperAdmin) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDetailModalOpen(false);
                      handleOpenStatusModal(detailUser);
                    }}
                    className="border-slate-300 text-slate-700"
                  >
                    Update Status
                  </Button>
                )}
                {isSuperAdmin && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setDetailModalOpen(false);
                      handleOpenRoleModal(detailUser);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Assign Role
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Status Change Dialog */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={`Update User Status: ${targetUser?.name || targetUser?.email}`}
        size="md"
      >
        <form onSubmit={handleSaveStatus} className="space-y-4">
          {statusError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{statusError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              New Lifecycle Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="ACTIVE">ACTIVE (Account Enabled & Fully Accessible)</option>
              <option value="SUSPENDED">SUSPENDED (Locked Due to Policy/Security Violation)</option>
              <option value="INACTIVE">INACTIVE (Temporarily Disabled)</option>
              <option value="PENDING">PENDING (Awaiting Review/Verification)</option>
              <option value="REJECTED">REJECTED (Access Denied)</option>
            </select>
          </div>

          {newStatus === "SUSPENDED" && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Warning:</strong> Suspending this user will immediately revoke login sessions and prevent vehicle booking or workshop actions.
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Audit Reason / Justification <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows="3"
              placeholder="Enter mandatory reason for changing this user's lifecycle state..."
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">
              This rationale will be permanently recorded in the Enterprise Audit Log.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setStatusModalOpen(false)}
              disabled={statusSubmitting}
              className="border-slate-300 text-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={statusSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {statusSubmitting ? "Updating..." : "Confirm Status Change"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Role Assignment Dialog (Super Admin) */}
      <Modal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title={`Assign Role: ${targetUser?.name || targetUser?.email}`}
        size="md"
      >
        <form onSubmit={handleSaveRole} className="space-y-4">
          {roleError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{roleError}</span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Privileged Operation:</strong> Changing a user&apos;s role will dynamically recompute their granted security authorities across all platform endpoints.
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              New Platform Role
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              {ROLE_OPTIONS.filter((r) => r.value !== "ALL").map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} ({opt.value})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Audit Reason / Justification <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows="3"
              placeholder="Enter mandatory administrative reason for updating role assignment..."
              value={roleReason}
              onChange={(e) => setRoleReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              required
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRoleModalOpen(false)}
              disabled={roleSubmitting}
              className="border-slate-300 text-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={roleSubmitting}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {roleSubmitting ? "Assigning..." : "Confirm Role Assignment"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
