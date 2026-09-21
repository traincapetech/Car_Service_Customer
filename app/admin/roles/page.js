"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AdminShell from "../../../components/admin/AdminShell";
import { adminUsersApi } from "../../../lib/admin";
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  KeyRound,
  Users,
  Building2,
  Car,
  Check,
  Minus,
  RefreshCw,
  ArrowLeft,
  Layers,
  Lock,
  Search,
  ExternalLink,
} from "lucide-react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";

export default function AdminRolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [viewMode, setViewMode] = useState("detail"); // "detail" | "matrix"
  const [filterModule, setFilterModule] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function loadRoles() {
      try {
        setLoading(true);
        setError(null);
        const data = await adminUsersApi.getRoles();
        if (!ignore) {
          setRoles(data || []);
          if (data && data.length > 0) {
            setSelectedRole((prev) => prev || data[0]);
          }
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load roles catalog:", err);
          setError(err.message || "Failed to load roles catalog.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadRoles();
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  // Collect all unique permissions across all roles for full matrix
  const allPermissions = React.useMemo(() => {
    const map = new Map();
    roles.forEach((r) => {
      (r.permissions || []).forEach((p) => {
        if (!map.has(p.name)) {
          map.set(p.name, p);
        }
      });
    });
    return Array.from(map.values()).sort((a, b) =>
      a.module.localeCompare(b.module) || a.name.localeCompare(b.name)
    );
  }, [roles]);

  const uniqueModules = React.useMemo(() => {
    const set = new Set(allPermissions.map((p) => p.module));
    return ["ALL", ...Array.from(set).sort()];
  }, [allPermissions]);

  const getRoleIcon = (roleName) => {
    switch (roleName) {
      case "SUPER_ADMIN":
        return <ShieldAlert className="w-4 h-4 text-purple-400" />;
      case "ADMIN":
        return <ShieldCheck className="w-4 h-4 text-blue-400" />;
      case "OPERATIONS_ADMIN":
        return <Shield className="w-4 h-4 text-indigo-400" />;
      case "FINANCE_ADMIN":
        return <Shield className="w-4 h-4 text-emerald-400" />;
      case "SUPPORT_AGENT":
        return <Shield className="w-4 h-4 text-cyan-400" />;
      case "PARTNER":
      case "WORKSHOP_OWNER":
      case "WORKSHOP_STAFF":
        return <Building2 className="w-4 h-4 text-amber-400" />;
      case "CUSTOMER":
      default:
        return <Users className="w-4 h-4 text-neutral-400" />;
    }
  };

  const getRoleBadge = (role) => {
    if (role.isPrivileged) {
      return <Badge variant={role.role === "SUPER_ADMIN" ? "purple" : "blue"}>Privileged</Badge>;
    }
    if (role.role.startsWith("WORKSHOP") || role.role === "PARTNER") {
      return <Badge variant="amber">Partner</Badge>;
    }
    return <Badge variant="neutral">Consumer</Badge>;
  };

  // Filter permissions for deep dive
  const displayedPermissions = React.useMemo(() => {
    if (!selectedRole || !selectedRole.permissions) return [];
    return selectedRole.permissions.filter((p) => {
      const matchModule = filterModule === "ALL" || p.module === filterModule;
      const matchSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchModule && matchSearch;
    });
  }, [selectedRole, filterModule, searchQuery]);

  return (
    <AdminShell
      breadcrumbs={[
        { label: "Admin", href: "/admin/dashboard" },
        { label: "Users & Roles", href: "/admin/users" },
        { label: "Roles & Permissions", href: "/admin/roles" },
      ]}
    >
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/users"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-colors"
                title="Back to Users Directory"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Roles & Permissions Matrix</h1>
                <p className="text-sm text-neutral-400">
                  Inspect role hierarchy, assigned personnel counts, and granular security authority mappings
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-1">
              <button
                onClick={() => setViewMode("detail")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === "detail"
                    ? "bg-purple-600 text-white"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Role Deep-Dive
              </button>
              <button
                onClick={() => setViewMode("matrix")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === "matrix"
                    ? "bg-purple-600 text-white"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Full Access Matrix
              </button>
            </div>

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

        {/* Security Architecture Callout */}
        <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-start gap-3">
          <Lock className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-neutral-300 leading-relaxed">
            <span className="font-semibold text-white">Server-Side Authoritative Security:</span> Granular permissions are strictly enforced on backend REST endpoints using Spring Security method security annotations (<code className="text-purple-300">@PreAuthorize</code>). Role assignments dynamically govern effective authorities, ensuring complete defense-in-depth across the automotive platform.
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-neutral-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
            <span>Loading roles and access policies...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/20 text-red-300 text-sm">
            {error}
          </div>
        ) : viewMode === "detail" ? (
          /* Role Deep Dive View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Role Selector List */}
            <div className="lg:col-span-4 space-y-2">
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-1 mb-2">
                Platform Roles ({roles.length})
              </div>
              <div className="space-y-2">
                {roles.map((r) => {
                  const isSelected = selectedRole?.role === r.role;
                  return (
                    <button
                      key={r.role}
                      onClick={() => setSelectedRole(r)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-purple-900/20 border-purple-500/40 shadow-lg shadow-purple-950/30"
                          : "bg-neutral-900/60 border-white/5 hover:border-white/15 hover:bg-neutral-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isSelected ? "bg-purple-500/20 text-purple-300" : "bg-white/5 text-neutral-400"
                          }`}
                        >
                          {getRoleIcon(r.role)}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-white flex items-center gap-2">
                            <span>{r.name}</span>
                          </div>
                          <div className="text-xs text-neutral-500 font-mono">{r.role}</div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {getRoleBadge(r)}
                        <span className="text-[11px] text-neutral-400">
                          {r.assignedUsersCount} users
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Selected Role Detail & Permissions */}
            {selectedRole && (
              <div className="lg:col-span-8 space-y-6">
                {/* Role Header Card */}
                <div className="p-6 rounded-xl bg-neutral-900/60 border border-white/5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                        {getRoleIcon(selectedRole.role)}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">{selectedRole.name}</h2>
                        <div className="text-xs text-neutral-400 font-mono">{selectedRole.role}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs text-neutral-400">Assigned Users</div>
                        <div className="text-lg font-bold text-white">{selectedRole.assignedUsersCount}</div>
                      </div>
                      <Link
                        href={`/admin/users?role=${selectedRole.role}`}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-purple-300 hover:text-purple-200 flex items-center gap-1.5 transition-colors"
                      >
                        <span>Filter Users</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  <p className="text-sm text-neutral-300 leading-relaxed border-t border-white/5 pt-4">
                    {selectedRole.description}
                  </p>
                </div>

                {/* Permissions Breakdown */}
                <div className="p-6 rounded-xl bg-neutral-900/60 border border-white/5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-purple-400" />
                        <span>Granted Permissions ({selectedRole.permissions?.length || 0})</span>
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Authorities inherited by any account holding this role
                      </p>
                    </div>

                    {/* Filter controls */}
                    <div className="flex items-center gap-2">
                      <select
                        value={filterModule}
                        onChange={(e) => setFilterModule(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-lg text-xs text-white px-2.5 py-1.5 focus:outline-none focus:border-purple-500/50"
                      >
                        {uniqueModules.map((m) => (
                          <option key={m} value={m} className="bg-neutral-900">
                            {m === "ALL" ? "All Modules" : m}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {displayedPermissions.length === 0 ? (
                    <div className="p-8 text-center text-neutral-500 text-xs">
                      No permissions match current filter criteria.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {displayedPermissions.map((perm) => (
                        <div
                          key={perm.name}
                          className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-semibold text-purple-300">
                              {perm.name}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-neutral-400 border border-white/10 font-mono">
                              {perm.module}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400 leading-snug">
                            {perm.description || "Grants access to authorized subsystem operations."}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Full Permissions Cross-Matrix View */
          <div className="rounded-xl border border-white/5 bg-neutral-900/60 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-neutral-300">
                <thead className="text-xs uppercase bg-black/40 text-neutral-400 border-b border-white/5">
                  <tr>
                    <th scope="col" className="px-6 py-4 min-w-[240px]">Permission & Module</th>
                    {roles.map((r) => (
                      <th
                        key={r.role}
                        scope="col"
                        className="px-4 py-4 text-center font-medium min-w-[120px]"
                      >
                        <div className="text-white font-semibold">{r.name}</div>
                        <div className="text-[10px] text-neutral-500 font-mono lowercase">
                          {r.assignedUsersCount} users
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {allPermissions.map((perm) => (
                    <tr key={perm.name} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="font-mono text-xs font-semibold text-white">{perm.name}</div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">{perm.description}</div>
                        <span className="inline-block mt-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-purple-300">
                          {perm.module}
                        </span>
                      </td>

                      {roles.map((r) => {
                        const hasPerm = (r.permissions || []).some((p) => p.name === perm.name);
                        return (
                          <td key={r.role} className="px-4 py-3.5 text-center">
                            {hasPerm ? (
                              <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center w-6 h-6 text-neutral-600">
                                <Minus className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
