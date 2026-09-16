"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Building2,
  Wrench,
  ClipboardList,
  Store,
  Calendar,
  Car,
  CreditCard,
  Wallet,
  RotateCcw,
  ShieldCheck,
  History,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Shield,
  Activity,
  User,
  Bell,
  ExternalLink,
} from "lucide-react";
import Badge from "../ui/Badge";
import ConfirmDialog from "../ui/ConfirmDialog";

// 15 Administrative Modules categorized logically for clean SaaS navigation
const ADMIN_NAV_GROUPS = [
  {
    title: "Core Administration",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
        isFunctional: true,
      },
    ],
  },
  {
    title: "Users & Workplaces",
    items: [
      {
        id: "customers",
        label: "Customers",
        href: "/admin/customers",
        icon: Users,
        isFunctional: true,
      },
      {
        id: "workshops",
        label: "Workshops",
        href: "/admin/workshops",
        icon: Building2,
        isFunctional: false,
      },
      {
        id: "users-roles",
        label: "Users & Roles",
        href: "/admin/users",
        icon: ShieldCheck,
        isFunctional: false,
      },
    ],
  },
  {
    title: "Services & Fulfillment",
    items: [
      {
        id: "service-catalog",
        label: "Service Catalog",
        href: "/admin/services",
        icon: Wrench,
        isFunctional: false,
      },
      {
        id: "service-requests",
        label: "Service Requests",
        href: "/admin/requests",
        icon: ClipboardList,
        isFunctional: false,
      },
      {
        id: "bookings",
        label: "Bookings",
        href: "/admin/bookings",
        icon: Calendar,
        isFunctional: false,
      },
      {
        id: "workshop-jobs",
        label: "Workshop Jobs",
        href: "/admin/jobs",
        icon: Car,
        isFunctional: false,
      },
    ],
  },
  {
    title: "Marketplace & Finance",
    items: [
      {
        id: "marketplace",
        label: "Marketplace",
        href: "/admin/marketplace",
        icon: Store,
        isFunctional: false,
      },
      {
        id: "payments",
        label: "Payments",
        href: "/admin/payments",
        icon: CreditCard,
        isFunctional: false,
      },
      {
        id: "wallets",
        label: "Wallets",
        href: "/admin/wallets",
        icon: Wallet,
        isFunctional: false,
      },
      {
        id: "refunds",
        label: "Refunds",
        href: "/admin/refunds",
        icon: RotateCcw,
        isFunctional: false,
      },
    ],
  },
  {
    title: "System & Governance",
    items: [
      {
        id: "audit-logs",
        label: "Audit Logs",
        href: "/admin/audit-logs",
        icon: History,
        isFunctional: false,
      },
      {
        id: "reports",
        label: "Reports",
        href: "/admin/reports",
        icon: BarChart3,
        isFunctional: false,
      },
      {
        id: "settings",
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
        isFunctional: false,
      },
    ],
  },
];

export default function AdminShell({ children, breadcrumbs = [] }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
      setLogoutModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans antialiased">
      {/* ================= TOP ADMINISTRATIVE NAVIGATION ================= */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-2xs">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Mobile Toggle & Brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/admin/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-2xs group-hover:bg-blue-600 transition-colors">
                <Shield className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-extrabold tracking-tight text-slate-900 leading-tight">
                  Addior Mechanics
                </span>
                <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase">
                  Admin Console
                </span>
              </div>
            </Link>

            <span className="hidden sm:inline-flex ml-2">
              <Badge variant="purple" size="sm">
                Super Admin
              </Badge>
            </span>
          </div>

          {/* Center: System Status Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold text-slate-700">
              System Operational
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[10px] text-slate-500 font-mono">v1.0-RC</span>
          </div>

          {/* Right: Admin Profile & Actions */}
          <div className="flex items-center gap-3">
            {/* Live Customer Portal Preview Link */}
            <Link
              href="/dashboard"
              target="_blank"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200/80"
              title="Open customer app in new tab"
            >
              <span>Customer App</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>

            {/* Admin User Chip */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  {user?.name || "Administrator"}
                </span>
                <span className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]">
                  {user?.email || "admin@carservice.com"}
                </span>
              </div>
            </div>

            {/* Sign Out Action Button */}
            <button
              type="button"
              onClick={() => setLogoutModalOpen(true)}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN WRAPPER (SIDEBAR + CONTENT) ================= */}
      <div className="flex-1 flex w-full">
        {/* ================= DESKTOP SIDEBAR ================= */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white border-r border-slate-200/90 py-6 px-4 space-y-6">
          <nav className="flex-1 space-y-5 overflow-y-auto scrollbar-none pr-1">
            {ADMIN_NAV_GROUPS.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  {group.title}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/admin/dashboard"
                      ? pathname === "/admin/dashboard" || pathname === "/admin"
                      : pathname.startsWith(item.href);

                  return (
                    <div key={item.id}>
                      {item.isFunctional ? (
                        <Link
                          href={item.href}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                            isActive
                              ? "bg-slate-900 text-white shadow-xs"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon
                              className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-400"}`}
                            />
                            <span>{item.label}</span>
                          </div>
                          <ChevronRight
                            className={`w-3.5 h-3.5 ${isActive ? "text-white/70" : "text-slate-300"}`}
                          />
                        </Link>
                      ) : (
                        <div
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 cursor-not-allowed select-none opacity-80"
                          title="Module scheduled for subsequent steps"
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 text-slate-300" />
                            <span>{item.label}</span>
                          </div>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold uppercase">
                            Soon
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Sidebar Footer Support Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs text-slate-600">
            <span className="font-bold text-slate-900 block text-[11px]">
              Platform RBAC Active
            </span>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Administrative APIs require verified <code className="font-mono text-blue-700">ROLE_ADMIN</code> bearer tokens.
            </p>
          </div>
        </aside>

        {/* ================= MOBILE DRAWER SIDEBAR ================= */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl z-50 p-5 space-y-6 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-slate-900 text-sm">Admin Navigation</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-5">
                {ADMIN_NAV_GROUPS.map((group, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      {group.title}
                    </div>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        item.href === "/admin/dashboard"
                          ? pathname === "/admin/dashboard" || pathname === "/admin"
                          : pathname.startsWith(item.href);

                      return item.isFunctional ? (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                            isActive
                              ? "bg-slate-900 text-white"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </div>
                        </Link>
                      ) : (
                        <div
                          key={item.id}
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-400"
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 text-slate-300" />
                            <span>{item.label}</span>
                          </div>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold">
                            Soon
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* ================= MAIN CONTENT AREA ================= */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium pb-2">
              <Link href="/admin/dashboard" className="hover:text-slate-700 transition-colors">
                Admin Console
              </Link>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-slate-700 transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-slate-900 font-bold">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}

          {children}
        </main>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Sign Out of Admin Console?"
        description="Your administrative session will be terminated and tokens revoked on the server. You will need to re-authenticate with your administrator credentials to return."
        confirmLabel="Sign Out"
        confirmVariant="danger"
        isLoading={isLoggingOut}
      />
    </div>
  );
}
