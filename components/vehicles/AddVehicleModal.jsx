"use client";

import React, { useState } from "react";
import { X, Car, Plus, ShieldCheck, Fuel } from "lucide-react";

export default function AddVehicleModal({ isOpen, onClose, onAddVehicle }) {
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    registration: "",
    year: "2024",
    fuelType: "Petrol (Turbo)",
    mileage: "",
    color: "Stealth Black",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.brand || !formData.model || !formData.registration) {
      alert("Please fill in Brand, Model and Registration Number.");
      return;
    }

    const newVehicle = {
      id: `v-${Date.now()}`,
      brand: formData.brand,
      model: formData.model,
      year: parseInt(formData.year) || 2024,
      registration: formData.registration.toUpperCase(),
      vin: `WBA${Math.floor(100000 + Math.random() * 900000)}FK${Math.floor(10000 + Math.random() * 90000)}`,
      fuelType: formData.fuelType,
      mileage: `${formData.mileage || 5000} km`,
      numericMileage: parseInt(formData.mileage) || 5000,
      lastService: "Never (New Addition)",
      nextServiceDue: "Immediate Inspection",
      healthScore: 95,
      healthStatus: "Optimal",
      image: formData.image,
      color: formData.color,
      healthBreakdown: {
        engine: { status: "Excellent", score: 98, detail: "Newly added diagnostics" },
        brakes: { status: "Excellent", score: 95, detail: "Pads 95% life" },
        battery: { status: "Excellent", score: 96, detail: "12.8V Healthy" },
        tyres: { status: "Excellent", score: 95, detail: "Uniform tread" }
      }
    };

    onAddVehicle(newVehicle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0f1624] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Add New Vehicle</h3>
              <p className="text-xs text-slate-400">Register vehicle to AutoCare Pro telemetry hub</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Brand / Make *</label>
              <input
                type="text"
                placeholder="e.g. Porsche, Audi, Tata"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Model Name *</label>
              <input
                type="text"
                placeholder="e.g. 911 Carrera, Safari"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Registration Number *</label>
              <input
                type="text"
                placeholder="e.g. MH 02 AB 1234"
                value={formData.registration}
                onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono uppercase text-emerald-400 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Model Year</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#121a2a] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Fuel Type</label>
              <select
                value={formData.fuelType}
                onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#121a2a] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Petrol (Turbo)">Petrol (Turbo)</option>
                <option value="Electric (EV)">Electric (EV)</option>
                <option value="Diesel Turbo">Diesel Turbo</option>
                <option value="Mild Hybrid">Mild Hybrid</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Current Odometer (KM)</label>
              <input
                type="number"
                placeholder="e.g. 14200"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg glow-lime transition-all"
            >
              + Save to Garage
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
