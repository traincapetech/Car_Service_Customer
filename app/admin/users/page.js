"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AdminShell from "../../../components/admin/AdminShell";
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
  UserCheck,
  UserX,
  Building2,
  Car,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  KeyRound,
  FileText,
  BadgeAlert,
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
        return <Badge variant="indigo" icon={Shield}>Operations Admin</Badge>;
      case "FINANCE_ADMIN":
        return <Badge variant="emerald" icon={Shield}>Finance Admin</Badge>;
      case "SUPPORT_AGENT":
        return <Badge variant="cyan" icon={Shield}>Support Agent</Badge>;
      case "PARTNER":
      case "WORKSHOP_OWNER":
        return <Badge variant="amber" icon={Building2}>Workshop Partner</Badge>;
      case "WORKSHOP_STAFF":
        return <Badge variant="teal" icon={Building2}>Workshop Staff</Badge>;
      case "CUSTOMER":
      default:
        return <Badge variant="neutral" icon={Users}>Customer</Badge>;
    }
  };

  const getStatusBadge = (status, isActive) => {
    const s = status || (isActive ? "ACTIVE" : "INACTIVE");
    switch (s) {
      case "ACTIVE":
        return <Badge variant="emerald" icon={CheckCircle2}>Active</Badge>;
      case "SUSPENDED":
        return <Badge variant="red" icon={XCircle}>Suspended</Badge>;
      case "PENDING":
        return <Badge variant="amber" icon={Clock}>Pending</Badge>;
      case "INACTIVE":
        return <Badge variant="neutral" icon={UserX}>Inactive</Badge>;
      case "REJECTED":
        return <Badge variant="red" icon={AlertTriangle}>Rejected</Badge>;
      default:
        return <Badge variant="neutral">{s}</Badge>;
    }
  };

  return (
    <AdminShell
      breadcrumbs={[
        { label: "Admin", href: "/admin/dashboard" },
        { label: "Users & Roles", href: "/admin/users" },
      ]}
    >
      <div className="space-y-6">
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Users & Access Control</h1>
                <p className="text-sm text-neutral-400">
                  Manage accounts, security lifecycle states, and role-based permissions across the platform
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/roles"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-200 text-sm font-medium transition-colors"
            >
              <KeyRound className="w-4 h-4 text-purple-400" />
              <span>Roles & Permissions Matrix</span>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setReloadKey((k) => k + 1)}
              icon={RefreshCw}
              className="border-white/10 hover:bg-white/5"
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* KPI Metrics Ribbon */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-white/5 backdrop-blur-sm">
              <div className="text-xs text-neutral-400 font-medium">Total Users</div>
              <div className="mt-1 text-2xl font-bold text-white">{summary.totalUsers}</div>
              <div className="mt-1 text-xs text-neutral-500">Platform-wide</div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 backdrop-blur-sm">
              <div className="text-xs text-emerald-400 font-medium">Active Accounts</div>
              <div className="mt-1 text-2xl font-bold text-emerald-400">{summary.activeUsers}</div>
              <div className="mt-1 text-xs text-emerald-500/80">Enabled access</div>
            </div>
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 backdrop-blur-sm">
              <div className="text-xs text-red-400 font-medium">Suspended</div>
              <div className="mt-1 text-2xl font-bold text-red-400">{summary.suspendedUsers}</div>
              <div className="mt-1 text-xs text-red-500/80">Account locked</div>
            </div>
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 backdrop-blur-sm">
              <div className="text-xs text-amber-400 font-medium">Pending / Inactive</div>
              <div className="mt-1 text-2xl font-bold text-amber-400">{summary.pendingUsers + summary.inactiveUsers}</div>
              <div className="mt-1 text-xs text-amber-500/80">Awaiting or paused</div>
            </div>
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 backdrop-blur-sm">
              <div className="text-xs text-purple-400 font-medium">Admins</div>
              <div className="mt-1 text-2xl font-bold text-purple-400">{summary.adminUsers}</div>
              <div className="mt-1 text-xs text-purple-500/80">Elevated staff</div>
            </div>
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 backdrop-blur-sm">
              <div className="text-xs text-amber-400 font-medium">Partners</div>
              <div className="mt-1 text-2xl font-bold text-amber-400">{summary.partnerUsers}</div>
              <div className="mt-1 text-xs text-amber-500/80">Workshops & owners</div>
            </div>
            <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 backdrop-blur-sm">
              <div className="text-xs text-blue-400 font-medium">Customers</div>
              <div className="mt-1 text-2xl font-bold text-blue-400">{summary.customerUsers}</div>
              <div className="mt-1 text-xs text-blue-500/80">Car owners</div>
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-xl bg-neutral-900/60 border border-white/5 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/50"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-neutral-400" />
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setPage(0);
                }}
                className="bg-black/40 border border-white/10 rounded-xl text-xs text-white px-3 py-2 focus:outline-none focus:border-purple-500/50"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-neutral-900 text-white">
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
                className="bg-black/40 border border-white/10 rounded-xl text-xs text-white px-3 py-2 focus:outline-none focus:border-purple-500/50"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-neutral-900 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-xl border border-white/5 bg-neutral-900/60 overflow-hidden shadow-xl">
          {error && (
            <div className="p-4 bg-red-950/40 border-b border-red-500/20 text-red-300 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-300">
              <thead className="text-xs uppercase bg-black/40 text-neutral-400 border-b border-white/5">
                <tr>
                  <th scope="col" className="px-6 py-4">User</th>
                  <th scope="col" className="px-6 py-4">Contact</th>
                  <th scope="col" className="px-6 py-4">Role</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4">Associated Entity</th>
                  <th scope="col" className="px-6 py-4">Joined Date</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-neutral-400">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
                        <span>Loading platform users...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-neutral-500">
                      No users found matching current filters.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const isSuper = u.role === "SUPER_ADMIN";
                    const isSelf = currentAdmin && String(u.id) === String(currentAdmin.id);

                    return (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600/30 to-blue-600/30 border border-white/10 flex items-center justify-center font-bold text-xs text-white uppercase">
                              {u.name ? u.name.substring(0, 2) : "U"}
                            </div>
                            <div>
                              <div className="font-medium text-white flex items-center gap-1.5">
                                {u.name || "Unnamed User"}
                                {isSelf && (
                                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-neutral-500 font-mono">ID: {u.id}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 font-mono text-xs">
                          <div className="text-white">{u.email}</div>
                          <div className="text-neutral-500">{u.phone || "No phone"}</div>
                        </td>

                        <td className="px-6 py-4">
                          {getRoleBadge(u.role)}
                        </td>

                        <td className="px-6 py-4">
                          {getStatusBadge(u.status, u.isActive)}
                        </td>

                        <td className="px-6 py-4 text-xs">
                          {u.hasWorkshop ? (
                            <div className="flex items-center gap-1.5 text-amber-400">
                              <Building2 className="w-3.5 h-3.5" />
                              <span>Workshop Profile Linked</span>
                            </div>
                          ) : u.role === "CUSTOMER" ? (
                            <div className="flex items-center gap-1.5 text-neutral-400">
                              <Car className="w-3.5 h-3.5" />
                              <span>Customer Account</span>
                            </div>
                          ) : (
                            <span className="text-neutral-500">—</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-xs text-neutral-400">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenDetail(u.id)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
                              title="View User Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Status Change Button */}
                            {(!isSuper || isSuperAdmin) && !isSelf && (
                              <button
                                onClick={() => handleOpenStatusModal(u)}
                                className="px-2.5 py-1 text-xs rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-white/10 transition-colors"
                                title="Change User Status"
                              >
                                Status
                              </button>
                            )}

                            {/* Role Assignment Button (Super Admin Only) */}
                            {isSuperAdmin && !isSelf && (
                              <button
                                onClick={() => handleOpenRoleModal(u)}
                                className="px-2.5 py-1 text-xs rounded-lg bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 hover:text-purple-200 border border-purple-500/20 transition-colors"
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
          <div className="px-6 py-4 bg-black/40 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-neutral-400">
              Showing <span className="font-semibold text-white">{users.length}</span> of{" "}
              <span className="font-semibold text-white">{totalElements}</span> users
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0 || loading}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                icon={ChevronLeft}
                className="border-white/10"
              >
                Previous
              </Button>
              <span className="text-xs text-neutral-400 px-2">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1 || loading}
                onClick={() => setPage((p) => p + 1)}
                icon={ChevronRight}
                iconPosition="right"
                className="border-white/10"
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
            <div className="p-8 text-center text-neutral-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
              <span>Loading user profile...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Profile Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-neutral-900/80 border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center font-bold text-lg text-purple-300">
                    {detailUser.name ? detailUser.name.substring(0, 2).toUpperCase() : "U"}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{detailUser.name || "Unnamed"}</h3>
                    <p className="text-xs text-neutral-400 font-mono">{detailUser.email}</p>
                    <p className="text-xs text-neutral-500 font-mono">{detailUser.phone || "No phone number"}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {getRoleBadge(detailUser.role)}
                  {getStatusBadge(detailUser.status, detailUser.isActive)}
                </div>
              </div>

              {/* Account Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider">User ID</div>
                  <div className="text-sm font-mono text-white mt-0.5">{detailUser.id}</div>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Active State</div>
                  <div className="text-sm font-semibold text-white mt-0.5">
                    {detailUser.isActive ? "Enabled" : "Disabled"}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Created At</div>
                  <div className="text-xs text-neutral-300 mt-1">
                    {detailUser.createdAt ? new Date(detailUser.createdAt).toLocaleString() : "—"}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Last Updated</div>
                  <div className="text-xs text-neutral-300 mt-1">
                    {detailUser.updatedAt ? new Date(detailUser.updatedAt).toLocaleString() : "—"}
                  </div>
                </div>
              </div>

              {/* Associated Workshop Profile if Partner */}
              {detailUser.workshop && (
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                      <Building2 className="w-4 h-4" />
                      <span>Associated Workshop Facility</span>
                    </div>
                    <Badge variant={detailUser.workshop.verificationStatus === "VERIFIED" ? "emerald" : "amber"}>
                      {detailUser.workshop.verificationStatus}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-neutral-400">Workshop Name:</span>
                      <div className="font-semibold text-white">{detailUser.workshop.businessName}</div>
                    </div>
                    <div>
                      <span className="text-neutral-400">Location:</span>
                      <div className="font-semibold text-white">{detailUser.workshop.city}, {detailUser.workshop.state}</div>
                    </div>
                    <div>
                      <span className="text-neutral-400">Facility ID:</span>
                      <div className="font-mono text-white">WS-{detailUser.workshop.id}</div>
                    </div>
                    <div>
                      <span className="text-neutral-400">Status:</span>
                      <div className="font-semibold text-white">{detailUser.workshop.isActive ? "Operational" : "Inactive"}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Associated Customer Metrics if Customer */}
              {detailUser.customer && (
                <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                    <Car className="w-4 h-4" />
                    <span>Customer Activity & Garage</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2.5 rounded-lg bg-black/30 border border-blue-500/10">
                      <div className="text-xs text-neutral-400">Registered Vehicles</div>
                      <div className="text-xl font-bold text-white mt-1">{detailUser.customer.vehiclesCount}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-black/30 border border-blue-500/10">
                      <div className="text-xs text-neutral-400">Total Bookings</div>
                      <div className="text-xl font-bold text-white mt-1">{detailUser.customer.bookingsCount}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-black/30 border border-blue-500/10">
                      <div className="text-xs text-neutral-400">Service Requests</div>
                      <div className="text-xl font-bold text-white mt-1">{detailUser.customer.requestsCount}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Effective Role Permissions Matrix */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <KeyRound className="w-4 h-4 text-purple-400" />
                    <span>Effective Permissions ({detailUser.permissions?.length || 0})</span>
                  </div>
                  <span className="text-xs text-neutral-500">Derived from role: {detailUser.role}</span>
                </div>

                <div className="max-h-48 overflow-y-auto p-3 rounded-xl bg-black/40 border border-white/5 flex flex-wrap gap-1.5">
                  {detailUser.permissions && detailUser.permissions.length > 0 ? (
                    detailUser.permissions.map((perm) => (
                      <span
                        key={perm}
                        className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[11px] font-mono text-neutral-300"
                      >
                        {perm}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-neutral-500">No explicit authorities granted.</span>
                  )}
                </div>
              </div>

              {/* Action Buttons in Modal */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="text-xs text-neutral-500">
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
                      className="bg-purple-600 hover:bg-purple-500 text-white border-0"
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
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{statusError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                New Lifecycle Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
              >
                <option value="ACTIVE">ACTIVE (Account Enabled & Fully Accessible)</option>
                <option value="SUSPENDED">SUSPENDED (Locked Due to Policy/Security Violation)</option>
                <option value="INACTIVE">INACTIVE (Temporarily Disabled)</option>
                <option value="PENDING">PENDING (Awaiting Review/Verification)</option>
                <option value="REJECTED">REJECTED (Access Denied)</option>
              </select>
            </div>

            {newStatus === "SUSPENDED" && (
              <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Warning:</strong> Suspending this user will immediately revoke login sessions and prevent vehicle booking or workshop actions.
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Audit Reason / Justification <span className="text-red-400">*</span>
              </label>
              <textarea
                rows="3"
                placeholder="Enter mandatory reason for changing this user's lifecycle state..."
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/50"
                required
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                This rationale will be permanently recorded in the Enterprise Audit Log.
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStatusModalOpen(false)}
                disabled={statusSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={statusSubmitting}
                className="bg-purple-600 hover:bg-purple-500 text-white border-0"
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
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{roleError}</span>
              </div>
            )}

            <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-500/20 text-purple-300 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Privileged Operation:</strong> Changing a user&apos;s role will dynamically recompute their granted security authorities across all platform endpoints.
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                New Platform Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
              >
                {ROLE_OPTIONS.filter((r) => r.value !== "ALL").map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-neutral-900 text-white">
                    {opt.label} ({opt.value})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Audit Reason / Justification <span className="text-red-400">*</span>
              </label>
              <textarea
                rows="3"
                placeholder="Enter mandatory administrative reason for updating role assignment..."
                value={roleReason}
                onChange={(e) => setRoleReason(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/50"
                required
              />
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRoleModalOpen(false)}
                disabled={roleSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={roleSubmitting}
                className="bg-purple-600 hover:bg-purple-500 text-white border-0"
              >
                {roleSubmitting ? "Assigning..." : "Confirm Role Assignment"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminShell>
  );
}
