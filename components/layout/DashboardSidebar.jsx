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
  ShieldCheck,
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
    { label: "My Profile & Security", href: "/profile", icon: User },
    { label: "Service Catalog", href: "/services", icon: Wrench },
    { label: "Service Records", href: "/history", icon: History },
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
      <aside className="w-full lg:w-64 shrink-0 space-y-6">
        {/* User Card */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="overflow-hidden flex-1">
            <h4 className="text-sm font-bold text-slate-900 truncate">
              {user?.name || "Customer"}
            </h4>
            <p className="text-xs text-slate-500 truncate">{user?.phone || user?.email}</p>
            <div className="mt-1">
              <Badge variant="blue" size="sm" dot>
                {user?.role || "CUSTOMER"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-2 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Customer Hub
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                <ChevronRight
                  className={`w-3.5 h-3.5 ${
                    isActive ? "text-white/60" : "text-slate-300"
                  }`}
                />
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-100 mt-2">
            <button
              onClick={() => setLogoutModalOpen(true)}
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </nav>

        {/* Guarantee Info Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-100 text-xs text-slate-600 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>OEM Warranty Guard</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            All services booked through AutoCare Pro include a 6-month / 10,000 km warranty.
          </p>
        </div>
      </aside>

      {/* Logout confirmation dialog */}
      <ConfirmDialog
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Sign Out of AutoCare Pro?"
        description="Your current session will be closed on this device. You will need to sign in again with your credentials."
        confirmLabel="Sign Out"
        confirmVariant="danger"
        isLoading={isLoggingOut}
      />
    </>
  );
}
