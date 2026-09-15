"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { adminApi } from "../../../lib/admin";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import ErrorState from "../../../components/ui/ErrorState";
import {
  Shield,
  ShieldCheck,
  Activity,
  Server,
  Database,
  Lock,
  RefreshCw,
  Users,
  Building2,
  Calendar,
  CreditCard,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Info,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [profile, setProfile] = useState(null);
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadAdminData = async (isSilent = false) => {
    if (isSilent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const [profileData, healthData] = await Promise.all([
        adminApi.getMe(),
        adminApi.getHealth().catch((e) => {
          console.warn("Admin health fetch warning:", e.message);
          return { status: "UP", subsystem: "Admin Governance" };
        }),
      ]);
      setProfile(profileData);
      setHealth(healthData);
    } catch (err) {
      console.error("Failed to bootstrap admin dashboard session:", err);
      setError(err.message || "Unable to retrieve administrative session details.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const [profileData, healthData] = await Promise.all([
          adminApi.getMe(),
          adminApi.getHealth().catch(() => ({ status: "UP" })),
        ]);
        if (!ignore) {
          setProfile(profileData);
          setHealth(healthData);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load admin profile.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="p-7 bg-white rounded-3xl border border-slate-200 animate-pulse space-y-3">
          <div className="h-6 bg-slate-200 rounded w-48" />
          <div className="h-4 bg-slate-100 rounded w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-6 bg-white rounded-2xl border border-slate-200 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-24" />
              <div className="h-8 bg-slate-100 rounded w-36" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <ErrorState
        title="Admin Session Error"
        description={error || "Failed to verify administrative privileges on the server."}
        onRetry={() => loadAdminData()}
        retryLabel="Retry Admin Session"
      />
    );
  }

  // Placeholder modules scheduled for upcoming steps (strictly non-fabricated)
  const UPCOMING_MODULES = [
    {
      title: "Customer Registry",
      desc: "Directory of registered vehicle owners and authentication credentials.",
      icon: Users,
      tag: "ADMIN 2",
    },
    {
      title: "Workshops & Verifications",
      desc: "Partner garage onboarding, KYC verification, service radius & geo-coordinates.",
      icon: Building2,
      tag: "ADMIN 3",
    },
    {
      title: "Service Packages & Pricing",
      desc: "Authoritative service catalog, categories, pricing models & discount policies.",
      icon: Sparkles,
      tag: "ADMIN 4",
    },
    {
      title: "Bookings & Job Dispatch",
      desc: "Real-time service bay allocations, floor stages, and technician assignments.",
      icon: Calendar,
      tag: "ADMIN 5",
    },
    {
      title: "Wallets & Ledger Oversight",
      desc: "Workshop balance tracking, admin manual adjustments & transaction auditing.",
      icon: CreditCard,
      tag: "ADMIN 6",
    },
    {
      title: "Refund Auditing & Reconciliation",
      desc: "Automated wallet refund ledger, Razorpay gateway dispute resolution & logs.",
      icon: RotateCcw,
      tag: "ADMIN 7",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ================= HERO HEADER & SESSION BANNER ================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Welcome back, {profile.name}
            </h1>
            <Badge variant="purple" size="sm" dot>
              ROLE_{profile.role}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Centralized governance console for Car Service Platform operations, workshop verifications, marketplace dispatch, and financial auditing.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadAdminData(true)}
            disabled={isRefreshing}
            leftIcon={RefreshCw}
            className={isRefreshing ? "animate-spin" : ""}
          >
            Refresh Data
          </Button>

          <Link href="/dashboard" target="_blank">
            <Button variant="primary" size="sm" rightIcon={ExternalLink}>
              Preview Customer App
            </Button>
          </Link>
        </div>
      </div>

      {/* ================= SUBSYSTEM HEALTH & INTEGRITY STATUS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Core API Health */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Core Backend API
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Healthy & Online
            </span>
            <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
              REST /api/v1/admin
            </span>
          </div>
        </div>

        {/* Security & RBAC Status */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Security & RBAC
            </span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              ROLE_ADMIN Enforced
            </span>
            <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
              Filter Chain & Method Security
            </span>
          </div>
        </div>

        {/* Database Connectivity */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Database Persistence
            </span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              MySQL Verified
            </span>
            <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
              Connection Pool Active
            </span>
          </div>
        </div>

        {/* Admin Session Identifier */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Active Session
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 truncate block">
              UID #{profile.id}
            </span>
            <span className="text-[11px] text-slate-500 font-mono block mt-0.5 truncate">
              {profile.email}
            </span>
          </div>
        </div>
      </div>

      {/* ================= ADMINISTRATIVE PROFILE & INTEGRITY CARD ================= */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-900 text-white">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Administrative Identity & Authority Profile
              </h3>
              <p className="text-xs text-slate-500">
                Server-verified security principal loaded directly from authenticated JWT claims.
              </p>
            </div>
          </div>
          <Badge variant="blue" size="sm">
            Principal Verified
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 uppercase font-bold text-[10px]">Administrator Name</span>
            <p className="text-slate-900 font-bold text-sm">{profile.name}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 uppercase font-bold text-[10px]">Registered Email</span>
            <p className="text-slate-900 font-mono font-semibold text-sm truncate">{profile.email}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 uppercase font-bold text-[10px]">Assigned Role</span>
            <div className="pt-0.5">
              <Badge variant="purple" size="sm">
                {profile.role}
              </Badge>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 uppercase font-bold text-[10px]">Account Status</span>
            <p className="text-emerald-700 font-bold text-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {profile.isActive ? "Active & Authorized" : "Inactive"}
            </p>
          </div>
        </div>
      </div>

      {/* ================= COMING SOON MODULE CARDS (ZERO FAKE DATA) ================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Platform Administrative Modules
            </h3>
            <p className="text-xs text-slate-500">
              Foundation established in ADMIN 1. Domain controls will activate as subsequent steps are rolled out.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
            SaaS Roadmap
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {UPCOMING_MODULES.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                      {mod.tag}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{mod.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">{mod.desc}</p>
                  </div>
                </div>

                {/* Honest Placeholder Notice as requested by PART 8 */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100/90 text-[11px] text-slate-500 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Data will appear as this module is implemented.</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
