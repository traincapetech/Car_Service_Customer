"use client";

import React, { useState } from "react";
import {
  Car,
  Plus,
  ShieldCheck,
  Activity,
  Calendar,
  Wrench,
  Fuel,
  Gauge,
  ChevronRight,
  Sparkles
} from "lucide-react";
import AddVehicleModal from "./AddVehicleModal";

export default function GaragePage({ vehicles, onAddVehicle, setActiveView, setSelectedVehicleForBooking }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-8 py-2 pb-16">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0f1624] border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              My Garage
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {vehicles.length} Vehicles Managed
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Manage every vehicle you own, view telemetry diagnostics and schedule service from one unified hub.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg glow-lime transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Vehicle</span>
        </button>
      </div>

      {/* VEHICLES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vehicles.map((v) => (
          <div
            key={v.id}
            className="rounded-3xl bg-[#0f1624] border border-white/10 overflow-hidden shadow-xl hover:border-emerald-500/30 transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Image Banner */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={v.image}
                  alt={v.model}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1624] via-black/30 to-transparent" />

                {/* Badges on Image */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-xs font-mono font-bold text-emerald-400">
                    {v.registration}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      v.healthScore >= 90
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    }`}
                  >
                    Health: {v.healthScore}% ({v.healthStatus})
                  </span>
                </div>

                <div className="absolute bottom-3 left-4">
                  <h3 className="text-xl font-extrabold text-white tracking-tight">
                    {v.brand} {v.model}
                  </h3>
                  <p className="text-xs text-slate-300">Model Year {v.year} • {v.color}</p>
                </div>
              </div>

              {/* Specs & Diagnostics Summary */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase">Mileage</span>
                    <p className="font-bold text-white font-mono mt-0.5">{v.mileage}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase">Fuel Type</span>
                    <p className="font-bold text-white truncate mt-0.5">{v.fuelType}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase">Last Service</span>
                    <p className="font-bold text-slate-300 truncate mt-0.5">{v.lastService}</p>
                  </div>
                </div>

                {/* Health Systems Progress Bar */}
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">System Telemetry Health</span>
                    <span className="text-emerald-400 font-mono font-bold">{v.healthScore}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                      style={{ width: `${v.healthScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card Actions */}
            <div className="p-4 border-t border-white/5 bg-white/[0.01] flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setSelectedVehicleForBooking(v);
                  setActiveView("booking");
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md glow-lime-sm transition-all text-center"
              >
                Book Service
              </button>

              <button
                onClick={() => setActiveView("dashboard")}
                className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-semibold text-xs border border-white/10 transition-colors"
              >
                Diagnostics
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Vehicle Modal Trigger */}
      <AddVehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddVehicle={onAddVehicle}
      />
    </div>
  );
}
