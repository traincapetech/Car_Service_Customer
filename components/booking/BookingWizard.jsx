"use client";

import React, { useState } from "react";
import {
  Car,
  Wrench,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Check,
  Sparkles,
  Droplet,
  ShieldAlert,
  Wind,
  Disc,
  FileCheck
} from "lucide-react";
import { servicePackages } from "../shared/MockData";

export default function BookingWizard({ vehicles, preselectedVehicle, setActiveView }) {
  const [step, setStep] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState(preselectedVehicle || vehicles[0] || null);
  const [selectedService, setSelectedService] = useState(servicePackages[0]);
  const [selectedDate, setSelectedDate] = useState("28 Aug 2026");
  const [selectedTime, setSelectedTime] = useState("10:30 AM");
  const [pickupRequired, setPickupRequired] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const availableDates = [
    { day: "Thu", date: "27 Aug", full: "27 Aug 2026" },
    { day: "Fri", date: "28 Aug", full: "28 Aug 2026" },
    { day: "Sat", date: "29 Aug", full: "29 Aug 2026" },
    { day: "Sun", date: "30 Aug", full: "30 Aug 2026" },
    { day: "Mon", date: "31 Aug", full: "31 Aug 2026" },
  ];

  const availableTimes = ["09:00 AM", "10:30 AM", "01:30 PM", "03:30 PM", "05:00 PM"];

  const handleConfirm = () => {
    setIsSubmitted(true);
    setTimeout(() => {
      setActiveView("tracking");
    }, 1800);
  };

  const stepsList = [
    { num: 1, title: "Select Vehicle" },
    { num: 2, title: "Choose Service" },
    { num: 3, title: "Pick Schedule" },
    { num: 4, title: "Confirm Booking" },
  ];

  return (
    <div className="space-y-8 py-2 pb-16 max-w-5xl mx-auto">
      {/* PAGE HEADER */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
          Addior Mechanics Pro Service Booking
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Schedule Service in 4 Simple Steps
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Transparent pricing, OEM certified technicians and guaranteed pickup.
        </p>
      </div>

      {/* STEP INDICATOR BAR */}
      <div className="p-4 rounded-3xl bg-[#0f1624] border border-white/10 shadow-xl">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {stepsList.map((s) => {
            const isDone = step > s.num;
            const isCurrent = step === s.num;
            return (
              <div
                key={s.num}
                onClick={() => {
                  if (s.num < step) setStep(s.num);
                }}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${isCurrent
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-md"
                    : isDone
                      ? "bg-white/[0.03] border-emerald-500/20 text-slate-300 cursor-pointer"
                      : "bg-white/[0.01] border-white/5 text-slate-500"
                  }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs font-mono ${isCurrent
                      ? "bg-emerald-500 text-slate-950 glow-lime-sm"
                      : isDone
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-slate-800 text-slate-400"
                    }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : `0${s.num}`}
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Step 0{s.num}
                  </p>
                  <h4 className="text-xs font-bold truncate">{s.title}</h4>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: SELECT VEHICLE */}
      {step === 1 && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white tracking-tight">
            Step 1: Choose Vehicle to Service
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {vehicles.map((v) => {
              const isSelected = selectedVehicle?.id === v.id;
              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVehicle(v)}
                  className={`cursor-pointer p-5 rounded-3xl border transition-all flex items-center justify-between gap-4 ${isSelected
                      ? "bg-gradient-to-r from-emerald-950/40 to-slate-900 border-emerald-500/50 shadow-xl glow-lime-sm"
                      : "bg-[#0f1624] border-white/10 hover:border-white/20"
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={v.image}
                      alt={v.model}
                      className="w-20 h-16 rounded-2xl object-cover border border-white/10"
                    />
                    <div>
                      <h4 className="text-base font-bold text-white">{v.brand} {v.model}</h4>
                      <p className="text-xs font-mono text-emerald-400 mt-0.5">{v.registration}</p>
                      <p className="text-[11px] text-slate-400">{v.mileage} • Health {v.healthScore}%</p>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center ${isSelected ? "border-emerald-500 bg-emerald-500 text-slate-950" : "border-slate-600"
                      }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              disabled={!selectedVehicle}
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl glow-lime transition-all"
            >
              <span>Next: Select Service</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: CHOOSE SERVICE PACKAGE */}
      {step === 2 && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white tracking-tight">
            Step 2: Choose Service Package
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {servicePackages.map((pkg) => {
              const isSelected = selectedService?.id === pkg.id;
              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedService(pkg)}
                  className={`cursor-pointer p-6 rounded-3xl border transition-all space-y-4 flex flex-col justify-between ${isSelected
                      ? "bg-gradient-to-br from-emerald-950/50 via-[#0f1624] to-slate-900 border-emerald-500 shadow-xl glow-lime-sm"
                      : "bg-[#0f1624] border-white/10 hover:border-white/20"
                    }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {pkg.badge}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        Duration: {pkg.duration}
                      </span>
                    </div>

                    <h4 className="text-lg font-extrabold text-white">{pkg.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{pkg.description}</p>

                    <div className="space-y-1.5 pt-2">
                      {pkg.included.slice(0, 3).map((inc, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{inc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="text-xl font-extrabold font-mono text-white">
                      ₹{pkg.price.toLocaleString("en-IN")}
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${isSelected
                          ? "bg-emerald-500 text-slate-950 border-emerald-500"
                          : "bg-white/5 text-slate-300 border-white/10"
                        }`}
                    >
                      {isSelected ? "Selected" : "Select Package"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              disabled={!selectedService}
              onClick={() => setStep(3)}
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl glow-lime"
            >
              <span>Next: Pick Schedule</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PICK SCHEDULE */}
      {step === 3 && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white tracking-tight">
            Step 3: Select Preferred Date & Time
          </h3>

          <div className="p-6 rounded-3xl bg-[#0f1624] border border-white/10 space-y-6 shadow-xl">
            {/* Date Grid */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                Select Date
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {availableDates.map((d, idx) => {
                  const isSelected = selectedDate === d.full;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDate(d.full)}
                      className={`cursor-pointer p-4 rounded-2xl border text-center transition-all ${isSelected
                          ? "bg-emerald-500 text-slate-950 border-emerald-500 font-bold shadow-lg glow-lime-sm"
                          : "bg-white/[0.03] border-white/10 hover:border-white/20 text-slate-300"
                        }`}
                    >
                      <span className="text-[10px] uppercase font-semibold block">{d.day}</span>
                      <span className="text-base font-extrabold block mt-0.5">{d.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Time Slot Grid */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                Select Time Slot
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {availableTimes.map((t, idx) => {
                  const isSelected = selectedTime === t;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedTime(t)}
                      className={`p-3 rounded-xl border text-xs font-mono font-bold transition-all ${isSelected
                          ? "bg-emerald-500 text-slate-950 border-emerald-500 shadow-md"
                          : "bg-white/[0.03] border-white/10 text-slate-300 hover:border-white/20"
                        }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Doorstep Pickup Toggle */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
              <div>
                <h5 className="text-xs font-bold text-white">Doorstep Pickup & Valet Return</h5>
                <p className="text-[11px] text-slate-400">Flat ₹299 (Complimentary for VIP Garage members)</p>
              </div>
              <input
                type="checkbox"
                checked={pickupRequired}
                onChange={(e) => setPickupRequired(e.target.checked)}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl glow-lime"
            >
              <span>Next: Review Summary</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: CONFIRM BOOKING */}
      {step === 4 && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white tracking-tight">
            Step 4: Review & Confirm Booking
          </h3>

          <div className="p-6 sm:p-8 rounded-3xl bg-[#0f1624] border border-white/10 space-y-6 shadow-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-white/10 pb-6">
              {/* Vehicle & Service Breakdown */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Vehicle Selected
                </span>
                <div className="flex items-center gap-3">
                  <Car className="w-6 h-6 text-emerald-400" />
                  <div>
                    <h4 className="text-base font-bold text-white">
                      {selectedVehicle?.brand} {selectedVehicle?.model}
                    </h4>
                    <p className="text-xs font-mono text-emerald-400">{selectedVehicle?.registration}</p>
                  </div>
                </div>

                <div className="pt-2 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Service Package
                  </span>
                  <p className="text-sm font-bold text-white">{selectedService?.title}</p>
                  <p className="text-xs text-slate-400">{selectedService?.duration} estimated duration</p>
                </div>
              </div>

              {/* Schedule & Valet Breakdown */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Schedule & Location
                </span>
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-emerald-400" />
                  <div>
                    <h4 className="text-sm font-bold text-white">{selectedDate}</h4>
                    <p className="text-xs text-slate-300 font-mono">Time Slot: {selectedTime}</p>
                  </div>
                </div>

                <div className="pt-2 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Valet Service
                  </span>
                  <p className="text-xs font-bold text-emerald-400">
                    {pickupRequired ? "Doorstep Pickup & Drop Included" : "Self-Drive to Workshop"}
                  </p>
                </div>
              </div>
            </div>

            {/* Price Line Items */}
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span>{selectedService?.title} Base Labor & Parts</span>
                <span className="font-mono text-white">₹{selectedService?.price.toLocaleString("en-IN")}</span>
              </div>

              {pickupRequired && (
                <div className="flex items-center justify-between text-emerald-400">
                  <span>VIP Doorstep Valet Fee</span>
                  <span className="font-mono font-bold">FREE (VIP Pass)</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-white/10 text-base font-extrabold text-white">
                <span>Total Amount Due</span>
                <span className="font-mono text-xl text-emerald-400">
                  ₹{selectedService?.price.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Submit Banner */}
            {isSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center space-y-2 animate-in zoom-in-95">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-white">Booking Confirmed Successfully!</h4>
                <p className="text-xs text-slate-300">
                  Redirecting to live telemetry tracking page...
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-base shadow-2xl glow-lime transition-all active:scale-95"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Confirm Service Booking</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
