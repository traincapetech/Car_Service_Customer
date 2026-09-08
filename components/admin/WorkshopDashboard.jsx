"use client";

import React, { useState } from "react";
import {
  Wrench,
  TrendingUp,
  DollarSign,
  Car,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
  BarChart3,
  Search,
  Plus
} from "lucide-react";
import { workshopAnalytics } from "../shared/MockData";

export default function WorkshopDashboard() {
  const { kpis, pipeline, technicians, categoryBreakdown } = workshopAnalytics;
  const [pipelineState, setPipelineState] = useState(pipeline);
  const [selectedColumn, setSelectedColumn] = useState("all");

  return (
    <div className="space-y-8 py-2 pb-16">
      {/* ENTERPRISE COMMAND CENTER HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#0c1424] via-[#090e18] to-[#060910] border border-white/10 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Workshop Operations Command Center
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-400 border border-sky-500/30">
              Enterprise Hub #04 (Mumbai Central)
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Real-time bay capacity tracking, technician queue allocation, and daily revenue telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => alert("Creating manual workshop work order...")}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg glow-lime transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Work Order</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today's Bookings */}
        <div className="p-6 rounded-3xl bg-[#0f1624] border border-white/10 space-y-2 shadow-xl hover:border-sky-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today&apos;s Bookings</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
              {kpis.todayBookings.change}
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
            {kpis.todayBookings.value}
          </div>
          <p className="text-xs text-slate-400">18 Confirmed • 6 Express Slots</p>
        </div>

        {/* Vehicles in Service */}
        <div className="p-6 rounded-3xl bg-[#0f1624] border border-white/10 space-y-2 shadow-xl hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vehicles in Service</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-400">
              {kpis.vehiclesInService.capacity}
            </span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
            {kpis.vehiclesInService.value}
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-[75%]" />
          </div>
        </div>

        {/* Ready for Delivery */}
        <div className="p-6 rounded-3xl bg-[#0f1624] border border-white/10 space-y-2 shadow-xl hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ready for Delivery</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400">
              QA Passed
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
            {kpis.readyForDelivery.value}
          </div>
          <p className="text-xs text-slate-400">{kpis.readyForDelivery.pendingPickup}</p>
        </div>

        {/* Today's Revenue */}
        <div className="p-6 rounded-3xl bg-[#0f1624] border border-white/10 space-y-2 shadow-xl hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today&apos;s Revenue</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
              {kpis.todayRevenue.percent}% Target
            </span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
            {kpis.todayRevenue.value}
          </div>
          <p className="text-xs text-slate-400">Target: {kpis.todayRevenue.target}</p>
        </div>
      </div>

      {/* SERVICE PIPELINE (KANBAN WORKFLOW) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-extrabold text-white tracking-tight uppercase">
              Service Workflow Pipeline (Kanban)
            </h3>
            <p className="text-xs text-slate-400">Live work order stage monitoring across 6 workshop stations.</p>
          </div>
        </div>

        {/* Kanban Board Columns Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {pipelineState.map((col, idx) => (
            <div
              key={idx}
              className="rounded-3xl bg-[#0c121e] border border-white/10 p-4 space-y-3 min-w-[220px] flex flex-col justify-between"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${col.color}`}>
                  {col.title}
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">{col.count}</span>
              </div>

              {/* Work Order Cards */}
              <div className="space-y-3 flex-1 min-h-[300px]">
                {col.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-[#111927] border border-white/10 hover:border-emerald-500/40 transition-all space-y-2 group shadow-md"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 font-bold">
                      <span>{item.id}</span>
                      <span className="text-slate-400">{item.time}</span>
                    </div>

                    <h5 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {item.customer}
                    </h5>

                    <p className="text-[11px] font-medium text-slate-300">
                      {item.vehicle} • <span className="font-mono text-slate-400">{item.reg}</span>
                    </p>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="truncate">{item.type}</span>
                      <span className="text-slate-300 font-semibold">{item.advisor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TECHNICIAN WORKLOAD & SERVICE CATEGORY DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Master Technician Bay Allocation */}
        <div className="lg:col-span-7 rounded-3xl bg-[#0f1624] border border-white/10 p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Technician Workload & Bay Telemetry
            </h3>
            <span className="text-xs text-slate-400">4 Active Technicians</span>
          </div>

          <div className="space-y-3">
            {technicians.map((tech, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white">{tech.name}</span>
                    <span className="text-[11px] text-slate-400 block">{tech.role}</span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-400 text-xs">{tech.bay}</span>
                    <span className="text-[10px] text-slate-400 block">{tech.activeJobs} Active Jobs</span>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-sky-400"
                    style={{ width: `${tech.load}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Category Revenue Breakdown */}
        <div className="lg:col-span-5 rounded-3xl bg-[#0f1624] border border-white/10 p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Service Category Breakdown
            </h3>
            <span className="text-xs text-slate-400">Monthly Share</span>
          </div>

          <div className="space-y-4">
            {categoryBreakdown.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300">{cat.name}</span>
                  <span className="font-mono text-emerald-400">{cat.percent}% ({cat.count})</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${cat.color}`} style={{ width: `${cat.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
