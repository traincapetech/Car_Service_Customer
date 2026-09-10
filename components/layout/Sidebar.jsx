"use client";

import React from "react";
import {
  LayoutDashboard,
  Car,
  CalendarPlus,
  Activity,
  History,
  Wrench,
  Settings,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Globe,
  X
} from "lucide-react";

export default function Sidebar({ activeView, setActiveView, isMobileOpen, setIsMobileOpen }) {
  const mainNav = [
    { id: "landing", label: "Product Overview", icon: Globe, badge: "SaaS" },
    { id: "dashboard", label: "Customer Dashboard", icon: LayoutDashboard },
    { id: "vehicles", label: "My Garage", icon: Car, count: "4 Vehicles" },
    { id: "booking", label: "Book Service", icon: CalendarPlus, highlight: true },
    { id: "tracking", label: "Track Live Service", icon: Activity, pulse: true },
    { id: "history", label: "Service History", icon: History },
    { id: "admin", label: "Workshop Portal", icon: Wrench, badge: "Enterprise" },
  ];

  const handleSelect = (id) => {
    setActiveView(id);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-72 bg-[#090d14] border-r border-white/5 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Header / Logo */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-white/5">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleSelect("landing")}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 font-extrabold shadow-lg glow-lime-sm">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-white">Addior Mechanics</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">
                Automotive Operating OS
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1 text-slate-400 rounded-lg lg:hidden hover:text-white hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
            Main Experience
          </div>

          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`group relative flex items-center justify-between w-full px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${isActive
                    ? "bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 text-emerald-400 border border-emerald-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-200"
                      }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-2">
                  {item.pulse && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.badge === "Enterprise"
                          ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                          : "bg-white/5 text-slate-400 border border-white/10"
                        }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.count && (
                    <span className="text-[11px] text-slate-500 font-mono">
                      {item.count}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-white/5 space-y-3">
          <div className="space-y-1">
            <button
              onClick={() => alert("Addior Mechanics Pro Settings: All vehicle diagnostics & notifications synced.")}
              className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>System Settings</span>
            </button>
            <button
              onClick={() => alert("Need Help? Contact Addior Mechanics Enterprise Concierge at concierge@Addior Mechanics.pro")}
              className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span>Concierge & Support</span>
            </button>
          </div>

          {/* User Profile Card */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Saurav Sharma"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/40"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#090d14]"></span>
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-semibold text-white truncate">Saurav Sharma</h4>
                <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 inline" /> VIP Garage Member
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>
        </div>
      </aside>
    </>
  );
}
