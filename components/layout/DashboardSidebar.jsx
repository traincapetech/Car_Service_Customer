"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  User,
  Wrench,
  History,
  LogOut,
  Car,
  ChevronRight,
  Activity,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import Badge from "../ui/Badge";
import ConfirmDialog from "../ui/ConfirmDialog";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems = [
    { label: "Dashboard Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Garage", href: "/garage", icon: Car },
    { label: "Service Catalog", href: "/services", icon: Wrench },
    { label: "My Bookings", href: "/bookings", icon: Calendar },
    { label: "Live Tracking", href: "/tracking", icon: Activity },
    { label: "Service History", href: "/history", icon: History },
    { label: "Profile & Security", href: "/profile", icon: User },
  ];

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
    <>
      <aside className="w-full lg:w-64 shrink-0 space-y-5" aria-label="Customer Hub Navigation">
        {/* User Card */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-2xs shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="overflow-hidden flex-1">
            <h4 className="text-sm font-bold text-slate-900 truncate">
              {user?.name || "Customer"}
            </h4>
            <p className="text-xs text-slate-500 truncate">{user?.phone || user?.email}</p>
            <div className="mt-1 flex items-center">
              <Badge variant="blue" size="sm" dot>
                {user?.role || "CUSTOMER"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-2 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Customer Hub
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"
                      }`}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                <ChevronRight
                  className={`w-3.5 h-3.5 shrink-0 transition-transform ${isActive ? "text-white/70" : "text-slate-300"
                    }`}
                  aria-hidden="true"
                />
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={() => setLogoutModalOpen(true)}
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-rose-500 shrink-0" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          </div>
        </nav>

        {/* Guarantee Info Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/70 to-slate-50 border border-blue-100 text-xs text-slate-600 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
            <span>OEM Warranty Guard</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            All services booked through Addior Mechanics Pro include a 6-month / 10,000 km warranty.
          </p>
        </div>
      </aside>

      {/* Logout confirmation dialog */}
      <ConfirmDialog
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Sign Out of Addior Mechanics Pro?"
        description="Your current session will be closed on this device. You will need to sign in again with your credentials."
        confirmLabel="Sign Out"
        confirmVariant="danger"
        isLoading={isLoggingOut}
      />
    </>
  );
}
