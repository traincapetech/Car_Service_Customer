"use client";

import React, { useState } from "react";
import {
  Menu,
  Bell,
  Search,
  Plus,
  Shield,
  CheckCircle2,
  AlertCircle,
  Car
} from "lucide-react";

export default function Topbar({ activeView, setActiveView, setIsMobileOpen }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const viewTitles = {
    landing: "Product Showcase & Ecosystem",
    dashboard: "Customer Operating Dashboard",
    vehicles: "Garage Management",
    booking: "Smart Service Scheduler",
    tracking: "Live Vehicle Telemetry & Tracking",
    history: "Service Records & Invoices",
    admin: "Workshop Operations Command Center",
  };

  const mockNotifications = [
    {
      id: 1,
      title: "Service In Progress",
      message: "BMW 3 Series wheel alignment underway at Bay 04.",
      time: "10 mins ago",
      unread: true
    },
    {
      id: 2,
      title: "Inspection Complete",
      message: "360° Digital inspection report ready for review.",
      time: "1 hour ago",
      unread: true
    },
    {
      id: 3,
      title: "Next Service Reminder",
      message: "Mercedes-Benz C-Class due for inspection in October.",
      time: "2 days ago",
      unread: false
    }
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-4 sm:px-8 bg-[#070a0f]/80 backdrop-blur-md border-b border-white/5">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 text-slate-400 rounded-lg lg:hidden hover:text-white hover:bg-white/5"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
              Addior Mechanics Pro
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
              {activeView}
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            {viewTitles[activeView] || "Dashboard"}
          </h1>
        </div>
      </div>

      {/* Center: Search input (hidden on small mobile) */}
      <div className="hidden md:flex items-center relative w-72">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search reg #, service ID or vehicle..."
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Telemetry Status Indicator */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Workshop Live Telemetry Active</span>
        </div>

        {/* Quick CTA */}
        {activeView !== "booking" && (
          <button
            onClick={() => setActiveView("booking")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md glow-lime-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Book Service</span>
          </button>
        )}

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 rounded-xl bg-white/[0.04] border border-white/10 hover:text-white hover:bg-white/[0.08] transition-all"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-[#070a0f]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-[#0e1522] border border-white/10 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Notifications
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                  3 New
                </span>
              </div>

              <div className="py-2 space-y-2 max-h-64 overflow-y-auto">
                {mockNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors border border-white/5"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-white">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-slate-500">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setShowNotifications(false);
                  setActiveView("tracking");
                }}
                className="w-full mt-2 py-2 text-center text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors border-t border-white/5 pt-3"
              >
                Go to Telemetry Tracking →
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
