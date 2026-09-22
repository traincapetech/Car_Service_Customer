"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import PageHeader from "../../../components/ui/PageHeader";
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
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs */}
      <PageHeader
        title="Roles & Permissions Matrix"
        description="Inspect role hierarchy, assigned personnel counts, and granular security authority mappings."
        breadcrumbs={[
          { label: "Admin Console", href: "/admin/dashboard" },
          { label: "Users & Roles", href: "/admin/users" },
          { label: "Roles & Permissions" },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 border border-slate-200/90 rounded-xl p-1">
              <button
                onClick={() => setViewMode("detail")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  viewMode === "detail"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Role Deep-Dive
              </button>
              <button
                onClick={() => setViewMode("matrix")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  viewMode === "matrix"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
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
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Refresh
            </Button>
          </div>
        }
      />

      {/* Security Architecture Callout */}
      <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200/80 flex items-start gap-3">
        <Lock className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-purple-900 leading-relaxed">
          <span className="font-bold text-purple-950">Server-Side Authoritative Security:</span> Granular permissions are strictly enforced on backend REST endpoints using Spring Security method security annotations (<code className="text-purple-800 font-bold">@PreAuthorize</code>). Role assignments dynamically govern effective authorities, ensuring complete defense-in-depth across the automotive platform.
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-500 flex items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-sm font-medium">Loading roles and access policies...</span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      ) : viewMode === "detail" ? (
        /* Role Deep Dive View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Role Selector List */}
          <div className="lg:col-span-4 space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1 mb-2">
              Platform Roles ({roles.length})
            </div>
            <div className="space-y-2">
              {roles.map((r) => {
                const isSelected = selectedRole?.role === r.role;
                return (
                  <button
                    key={r.role}
                    onClick={() => setSelectedRole(r)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-purple-50/80 border-purple-300 shadow-2xs"
                        : "bg-white border-slate-200/90 hover:bg-slate-50 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl ${
                          isSelected ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {getRoleIcon(r.role)}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                          <span>{r.name}</span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono">{r.role}</div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {getRoleBadge(r)}
                      <span className="text-[11px] text-slate-500 font-medium">
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
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-purple-100 border border-purple-200 text-purple-700">
                      {getRoleIcon(selectedRole.role)}
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900">{selectedRole.name}</h2>
                      <div className="text-xs text-slate-500 font-mono">{selectedRole.role}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-slate-500 font-medium">Assigned Users</div>
                      <div className="text-lg font-bold text-slate-900">{selectedRole.assignedUsersCount}</div>
                    </div>
                    <Link
                      href={`/admin/users?role=${selectedRole.role}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors border border-slate-200/80"
                    >
                      <span>Filter Users</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    </Link>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4 font-normal">
                  {selectedRole.description}
                </p>
              </div>

              {/* Permissions Breakdown */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-purple-600" />
                      <span>Granted Permissions ({selectedRole.permissions?.length || 0})</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Authorities inherited by any account holding this role
                    </p>
                  </div>

                  {/* Filter controls */}
                  <div className="flex items-center gap-2">
                    <select
                      value={filterModule}
                      onChange={(e) => setFilterModule(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 px-3 py-1.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      {uniqueModules.map((m) => (
                        <option key={m} value={m}>
                          {m === "ALL" ? "All Modules" : m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {displayedPermissions.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs font-medium">
                    No permissions match current filter criteria.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {displayedPermissions.map((perm) => (
                      <div
                        key={perm.name}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-purple-800">
                            {perm.name}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-white text-slate-600 border border-slate-200 font-mono font-semibold shadow-2xs">
                            {perm.module}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-snug">
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
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 select-none">
                  <th scope="col" className="px-6 py-4 min-w-[240px]">Permission & Module</th>
                  {roles.map((r) => (
                    <th
                      key={r.role}
                      scope="col"
                      className="px-4 py-4 text-center font-medium min-w-[120px]"
                    >
                      <div className="text-slate-900 font-bold">{r.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono lowercase">
                        {r.assignedUsersCount} users
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allPermissions.map((perm) => (
                  <tr key={perm.name} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="font-mono text-xs font-bold text-slate-900">{perm.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{perm.description}</div>
                      <span className="inline-block mt-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-700 font-semibold">
                        {perm.module}
                      </span>
                    </td>

                    {roles.map((r) => {
                      const hasPerm = (r.permissions || []).some((p) => p.name === perm.name);
                      return (
                        <td key={r.role} className="px-4 py-3.5 text-center">
                          {hasPerm ? (
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-center w-6 h-6 text-slate-300">
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
  );
}
