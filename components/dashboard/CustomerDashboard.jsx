"use client";

import React, { useState } from "react";
import {
  Car,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Wrench,
  ChevronRight,
  TrendingUp,
  FileCheck2,
  Plus
} from "lucide-react";

export default function CustomerDashboard({ vehicles, activeTracking, setActiveView, setSelectedVehicleForBooking }) {
  const primaryVehicle = vehicles[0] || {};
  const { healthBreakdown } = primaryVehicle;

  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="space-y-8 py-2 pb-16">
      {/* GREETING & HEADER ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#0e1625] via-[#0b101c] to-[#070a10] border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Good morning, Saurav 👋
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              VIP Garage Owner
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Everything about your vehicles, health diagnostics and active services in one place.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedVehicleForBooking(primaryVehicle);
              setActiveView("booking");
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg glow-lime transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Book New Service</span>
          </button>
        </div>
      </div>

      {/* TOP SECTION: ACTIVE VEHICLE CARD & RADIAL HEALTH GAUGE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Primary Vehicle Specs Card */}
        <div className="lg:col-span-8 relative rounded-3xl bg-[#0f1624] border border-white/10 p-6 sm:p-8 space-y-6 overflow-hidden shadow-2xl">
          {/* Subtle Ambient Background Gradient */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
                <Car className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    {primaryVehicle.brand} {primaryVehicle.model}
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                    {primaryVehicle.year}
                  </span>
                </div>
                <p className="text-xs font-mono text-emerald-400 mt-0.5">
                  Reg: {primaryVehicle.registration} • VIN: {primaryVehicle.vin}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveView("vehicles")}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-emerald-400 transition-colors self-start sm:self-auto"
            >
              <span>Switch Vehicle (4)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Vehicle Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Current Mileage</span>
              <p className="text-sm font-bold font-mono text-white mt-1">{primaryVehicle.mileage}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Fuel Type</span>
              <p className="text-sm font-bold text-white mt-1">{primaryVehicle.fuelType}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Last Service</span>
              <p className="text-sm font-bold text-white mt-1">{primaryVehicle.lastService}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Next Due</span>
              <p className="text-sm font-bold text-emerald-400 mt-1">{primaryVehicle.nextServiceDue}</p>
            </div>
          </div>

          {/* Vehicle Visual Banner */}
          <div className="relative h-44 rounded-2xl overflow-hidden border border-white/10">
            <img
              src={primaryVehicle.image}
              alt={primaryVehicle.model}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1624] via-black/40 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
              <span className="font-semibold px-3 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/10">
                Exterior Color: {primaryVehicle.color}
              </span>
              <button
                onClick={() => setActiveView("tracking")}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500/90 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors shadow-md"
              >
                View Live Telemetry
              </button>
            </div>
          </div>
        </div>

        {/* Visual Health Score Gauge Card */}
        <div className="lg:col-span-4 rounded-3xl bg-[#0f1624] border border-white/10 p-6 flex flex-col justify-between space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Vehicle Health Score</h4>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              OBD-II DIAGNOSTICS
            </span>
          </div>

          {/* Radial Progress Gauge */}
          <div className="relative flex flex-col items-center justify-center py-2">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 120 120">
              {/* Outer Background Track */}
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-800/80"
                fill="transparent"
              />
              {/* Animated Progress Track */}
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="url(#limeGradient)"
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 50}
                strokeDashoffset={2 * Math.PI * 50 * (1 - primaryVehicle.healthScore / 100)}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="limeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Gauge Text */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-extrabold text-white font-mono tracking-tight">
                {primaryVehicle.healthScore}
              </span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider mt-0.5">
                {primaryVehicle.healthStatus}
              </span>
              <span className="text-[10px] text-slate-500 mt-1">Condition Rating</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
            <p className="text-xs text-slate-300">
              ⚡ Engine & Battery at peak performance. Rear tyres require rotation in next 1,000 km.
            </p>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: UPCOMING SERVICE & VEHICLE HEALTH METRICS & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upcoming Service Card */}
        <div className="lg:col-span-6 rounded-3xl bg-[#0f1624] border border-white/10 p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Upcoming Service
              </h3>
            </div>
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
              Confirmed
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/30 to-slate-900 border border-emerald-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-white">General Service</h4>
              <span className="text-xs font-mono font-bold text-emerald-400">ID: SRV-2026-1048</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Date: <strong className="text-white">28 August 2026</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Time: <strong className="text-white">10:30 AM</strong></span>
              </div>
            </div>
          </div>

          {/* Service Step Progress Timeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Service Progress Tracker</h4>
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span className="text-emerald-400 font-bold">● Booking Confirmed</span>
              <span>Vehicle Check-In</span>
              <span>In Repair</span>
              <span>Ready</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
              <div className="w-1/4 h-full bg-emerald-500"></div>
              <div className="w-1/4 h-full bg-slate-700"></div>
              <div className="w-1/4 h-full bg-slate-700"></div>
              <div className="w-1/4 h-full bg-slate-700"></div>
            </div>
          </div>

          <button
            onClick={() => setActiveView("tracking")}
            className="w-full py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-emerald-400 font-bold text-xs border border-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <span>Open Telemetry Service Tracker</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Vehicle Health Systems Grid */}
        <div className="lg:col-span-6 rounded-3xl bg-[#0f1624] border border-white/10 p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                System Diagnostics
              </h3>
            </div>
            <span className="text-xs text-slate-400">Synced 10 mins ago</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Engine */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Engine System</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-400">
                  {healthBreakdown?.engine?.status || "Excellent"}
                </span>
              </div>
              <p className="text-xs text-slate-400">{healthBreakdown?.engine?.detail}</p>
            </div>

            {/* Brakes */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Brakes System</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-sky-500/20 text-sky-400">
                  {healthBreakdown?.brakes?.status || "Good"}
                </span>
              </div>
              <p className="text-xs text-slate-400">{healthBreakdown?.brakes?.detail}</p>
            </div>

            {/* Battery */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Battery & Electronics</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-400">
                  {healthBreakdown?.battery?.status || "Excellent"}
                </span>
              </div>
              <p className="text-xs text-slate-400">{healthBreakdown?.battery?.detail}</p>
            </div>

            {/* Tyres */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-amber-500/30 bg-amber-500/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Tyres & Suspension</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-400">
                  {healthBreakdown?.tyres?.status || "Attention Needed"}
                </span>
              </div>
              <p className="text-xs text-slate-300">{healthBreakdown?.tyres?.detail}</p>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY FEED */}
      <div className="p-6 rounded-3xl bg-[#0f1624] border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="text-base font-bold text-white uppercase tracking-wider">Recent Activity</h3>
          <button
            onClick={() => setActiveView("history")}
            className="text-xs text-emerald-400 font-bold hover:underline"
          >
            View Full Service History →
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Service Booked - General Service</span>
                <span className="text-slate-500 text-[10px]">Today, 09:00 AM</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Appointment confirmed for BMW 3 Series M Sport on 28 August 2026.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Digital Estimate Approved</span>
                <span className="text-slate-500 text-[10px]">26 Aug, 11:30 AM</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Line-item estimate of ₹6,499 approved via AutoCare Pro mobile app.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Wheel Alignment Completed</span>
                <span className="text-slate-500 text-[10px]">12 May 2026</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                3D Laser balancing completed at Workshop Bay 02. Invoice SRV-2026-0892 closed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
