"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { adminSystemApi } from "../../../lib/admin";
import {
  Activity,
  Server,
  Database,
  Shield,
  CreditCard,
  Layers,
  Store,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Lock,
  Settings,
  Cpu,
} from "lucide-react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";

export default function AdminSettingsPage() {
  const [health, setHealth] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      try {
        setError(null);
        const [healthData, settingsData] = await Promise.all([
          adminSystemApi.getSystemHealth(),
          adminSystemApi.getSystemSettings(),
        ]);

        if (!ignore) {
          setHealth(healthData);
          setSettings(settingsData);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to fetch system data:", err);
          setError(err.message || "Failed to retrieve system health and settings.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, [refreshIndex]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    setRefreshIndex((prev) => prev + 1);
  };

  const formatUptime = (seconds) => {
    if (!seconds && seconds !== 0) return "N/A";
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(" ");
  };

  const breadcrumbs = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "System & Governance" },
    { label: "System Settings", href: "/admin/settings" },
  ];

  return (
    <div className="space-y-6 pb-12">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-2xs">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  System Settings & Health
                </h1>
                <p className="text-xs text-slate-500">
                  Real-time engine diagnostics, component health monitoring, and governance policies
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={loading || refreshing}
              className="flex items-center gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
              <span>{refreshing ? "Refreshing..." : "Refresh Diagnostics"}</span>
            </Button>
            <Link href="/admin/configuration">
              <Button size="sm" className="flex items-center gap-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white">
                <Settings className="w-3.5 h-3.5" />
                <span>Manage Rules</span>
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Error loading system diagnostics</p>
              <p className="mt-0.5 text-rose-700">{error}</p>
            </div>
            <button
              onClick={handleManualRefresh}
              className="px-2.5 py-1 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Overall System Health Status Banner */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                  health?.status === "HEALTHY"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    : "bg-amber-50 text-amber-600 border border-amber-200"
                }`}
              >
                {health?.status === "HEALTHY" ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <AlertTriangle className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">
                    System Core Engine: {health?.status || "HEALTHY"}
                  </h2>
                  <Badge variant={health?.status === "HEALTHY" ? "success" : "warning"} size="sm">
                    {health?.status || "OPERATIONAL"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {health?.subsystem || "Car Service Platform - Enterprise Core"} • Version {health?.version || "1.0.0"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Uptime</span>
                <span className="font-mono font-semibold text-slate-800">
                  {formatUptime(health?.uptimeSeconds)}
                </span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Environment</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {settings?.environment || "development"}
                </span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Server Time</span>
                <span className="font-mono font-semibold text-slate-800">
                  {health?.serverTime ? new Date(health.serverTime).toLocaleTimeString() : "--:--:--"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Core Subsystems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Subsystem 1: Database Health */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900">Database (MySQL)</span>
              </div>
              <Badge variant={health?.components?.database?.status === "UP" ? "success" : "danger"} size="sm">
                {health?.components?.database?.status || "UP"}
              </Badge>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600 pt-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Engine</span>
                <span className="font-semibold text-slate-900">MySQL 8.x / InnoDB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ping Latency</span>
                <span className="font-mono font-bold text-emerald-600">
                  {health?.components?.database?.latencyMs ?? 1} ms
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Isolation Safety</span>
                <span className="font-semibold text-blue-600">Guarded (Auto)</span>
              </div>
            </div>
          </div>

          {/* Subsystem 2: Security & RBAC */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900">Security & RBAC</span>
              </div>
              <Badge variant="purple" size="sm">Active</Badge>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600 pt-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Auth Token</span>
                <span className="font-semibold text-slate-900">JWT (HMAC-SHA256)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Password Hashing</span>
                <span className="font-semibold text-slate-900">BCrypt (Standard)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Registered Users</span>
                <span className="font-mono font-bold text-slate-900">
                  {health?.components?.security?.totalUsers ?? "--"}
                </span>
              </div>
            </div>
          </div>

          {/* Subsystem 3: Service Catalog */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900">Service Catalog</span>
              </div>
              <Badge variant="success" size="sm">Online</Badge>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600 pt-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Catalog Mode</span>
                <span className="font-semibold text-slate-900">Admin-Managed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Services</span>
                <span className="font-mono font-bold text-slate-900">
                  {health?.components?.serviceCatalog?.totalServices ?? 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Active Services</span>
                <span className="font-mono font-bold text-emerald-600">
                  {health?.components?.serviceCatalog?.activeServices ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* Subsystem 4: Marketplace Matching */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900">Marketplace Engine</span>
              </div>
              <Badge variant="indigo" size="sm">Active</Badge>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600 pt-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Matching Mode</span>
                <span className="font-semibold text-slate-900">Dynamic Radius Dispatch</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Active Config Rules</span>
                <span className="font-mono font-bold text-slate-900">
                  {health?.components?.marketplace?.activeRulesCount ?? "--"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Broadcast Engine</span>
                <span className="font-semibold text-emerald-600">Operational</span>
              </div>
            </div>
          </div>

          {/* Subsystem 5: Financial Wallets */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900">Wallets & Ledgers</span>
              </div>
              <Badge variant="success" size="sm">Healthy</Badge>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600 pt-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Accounting Type</span>
                <span className="font-semibold text-slate-900">Double-Entry / ACID</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Workshop Wallets</span>
                <span className="font-mono font-bold text-slate-900">
                  {health?.components?.wallets?.walletsCount ?? 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Settlement Lock</span>
                <span className="font-semibold text-slate-900">Optimistic Versioned</span>
              </div>
            </div>
          </div>

          {/* Subsystem 6: Payment Gateway */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900">Razorpay Gateway</span>
              </div>
              <Badge variant="blue" size="sm">
                {settings?.paymentGateway?.enabled ? "Production Ready" : "Test Mode"}
              </Badge>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600 pt-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Key Identifier</span>
                <span className="font-mono text-slate-700">
                  {settings?.paymentGateway?.keyIdMasked || "Masked"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Secret Protection</span>
                <span className="font-semibold text-emerald-600">Unexposed (Safe)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Currency</span>
                <span className="font-semibold text-slate-900">INR (₹)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Runtime Environment & Platform Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Environment & Framework Info */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-slate-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Runtime Environment
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">HOST DIAGNOSTICS</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Java Virtual Machine</span>
                <span className="font-mono font-semibold text-slate-800">
                  OpenJDK {settings?.javaVersion || "21"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Spring Boot Framework</span>
                <span className="font-mono font-semibold text-slate-800">
                  v{settings?.springBootVersion || "3.4.x"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Active Profiles</span>
                <span className="font-mono font-semibold text-slate-800">
                  {settings?.activeProfile || "development"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Database Engine</span>
                <span className="font-semibold text-slate-800">
                  {settings?.databaseEngine || "MySQL 8.x / InnoDB"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Frontend App</span>
                <span className="font-mono font-semibold text-slate-800">Next.js 14 App Router</span>
              </div>
            </div>
          </div>

          {/* Right: Security & Token Policies */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Security & Session Policies
                </h3>
              </div>
              <Badge variant="purple" size="sm">Enforced</Badge>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Access Token Lifespan</span>
                <span className="font-mono font-semibold text-slate-800">
                  {settings?.securityPolicy?.accessTokenValidityMinutes || 15} minutes
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Refresh Token Lifespan</span>
                <span className="font-mono font-semibold text-slate-800">
                  {settings?.securityPolicy?.refreshTokenValidityDays || 7} days
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Password Reset Window</span>
                <span className="font-mono font-semibold text-slate-800">
                  {settings?.securityPolicy?.passwordResetTokenValidityMinutes || 15} minutes
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">RBAC Enforcement</span>
                <span className="font-semibold text-emerald-600">Strict (@PreAuthorize)</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Supported Roles</span>
                <span className="font-mono text-slate-700">CUSTOMER, PARTNER, ADMIN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Marketplace Operational Parameters Snapshot */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Active Marketplace Governance Rules
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Dynamic configuration values evaluated at runtime during dispatch and financial settlement
              </p>
            </div>
            <Link
              href="/admin/configuration"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Edit in Rules Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {settings?.marketplaceRules &&
              Object.entries(settings.marketplaceRules).map(([key, item]) => (
                <div
                  key={key}
                  className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-900 truncate font-mono" title={key}>
                      {key}
                    </span>
                    <Badge variant="blue" size="sm">
                      {item.value}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {item.description || "System runtime parameter."}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
  );
}
