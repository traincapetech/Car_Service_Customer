"use client";

import React, { useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  Phone,
  MessageSquare,
  Wrench,
  Car,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  FileText,
  User,
  Sparkles
} from "lucide-react";
import { activeTrackingData } from "../shared/MockData";

export default function ServiceTracker({ setActiveView }) {
  const [activeTab, setActiveTab] = useState("timeline");
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [msgModalOpen, setMsgModalOpen] = useState(false);

  const {
    serviceId,
    vehicle,
    registration,
    serviceType,
    advisor,
    mechanic,
    estimatedCompletion,
    currentProgressPercent,
    timeline,
    inspectionItems
  } = activeTrackingData;

  return (
    <div className="space-y-8 py-2 pb-16">
      {/* HEADER STATUS BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-[#0e1625] to-[#070a10] border border-emerald-500/30 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {serviceId}
              </span>
              <span className="text-xs text-slate-400 font-medium">• {serviceType}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2">
              {vehicle}
            </h2>
            <p className="text-xs font-mono text-emerald-400 mt-0.5">Reg: {registration}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-extrabold shadow-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>Service In Progress</span>
            </div>

            <button
              onClick={() => setActiveView("history")}
              className="px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10"
            >
              View Invoice
            </button>
          </div>
        </div>

        {/* Live Progress Bar & Completion Estimate */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300">Live Repair Progress</span>
              <span className="text-emerald-400 font-mono">{currentProgressPercent}% Completed</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full transition-all duration-700 glow-lime-sm"
                style={{ width: `${currentProgressPercent}%` }}
              />
            </div>
          </div>

          <div className="md:col-span-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
            <Clock className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Estimated Ready Time</span>
              <p className="text-sm font-bold text-white mt-0.5">{estimatedCompletion}</p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN TRACKING CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: VERTICAL SERVICE TIMELINE */}
        <div className="lg:col-span-7 rounded-3xl bg-[#0f1624] border border-white/10 p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Service Stage Timeline
              </h3>
            </div>
            <span className="text-xs text-slate-400">7 Total Stages</span>
          </div>

          {/* Timeline Nodes */}
          <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/10">
            {timeline.map((step, idx) => {
              const isCompleted = step.status === "completed";
              const isActive = step.status === "active";

              return (
                <div key={idx} className="relative flex items-start gap-4 group">
                  {/* Node Circle Icon */}
                  <div
                    className={`absolute -left-6 top-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-[#0f1624] transition-all ${
                      isCompleted
                        ? "bg-emerald-500 text-slate-950"
                        : isActive
                        ? "bg-emerald-400 text-slate-950 shadow-lg glow-lime animate-pulse"
                        : "bg-slate-800 text-slate-500 border border-white/10"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <span className="text-[10px]">{idx + 1}</span>
                    )}
                  </div>

                  {/* Stage Text Details */}
                  <div
                    className={`flex-1 p-4 rounded-2xl border transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-950/40 to-slate-900 border-emerald-500/40 shadow-md"
                        : isCompleted
                        ? "bg-white/[0.02] border-white/5"
                        : "bg-white/[0.01] border-white/5 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-sm font-bold ${
                          isActive
                            ? "text-emerald-400"
                            : isCompleted
                            ? "text-white"
                            : "text-slate-400"
                        }`}
                      >
                        {step.stage}
                      </h4>
                      <span className="text-[11px] font-mono text-slate-400">{step.time}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: SERVICE ADVISOR & MECHANIC CARD & INSPECTION CHECKLIST */}
        <div className="lg:col-span-5 space-y-6">
          {/* Service Advisor Contact Card */}
          <div className="rounded-3xl bg-[#0f1624] border border-white/10 p-6 space-y-5 shadow-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-white/10 pb-3">
              Your Service Advisor
            </h3>

            <div className="flex items-center gap-4">
              <img
                src={advisor.avatar}
                alt={advisor.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/40 shadow-md"
              />
              <div>
                <h4 className="text-base font-bold text-white">{advisor.name}</h4>
                <p className="text-xs text-emerald-400 font-medium">{advisor.title}</p>
                <span className="text-[11px] text-slate-400 block mt-0.5">{advisor.experience}</span>
              </div>
            </div>

            {/* Quick Communication Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setCallModalOpen(true)}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call Advisor</span>
              </button>

              <button
                onClick={() => setMsgModalOpen(true)}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Message</span>
              </button>
            </div>
          </div>

          {/* Master Mechanic Bay Information */}
          <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Workshop Bay</span>
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-sm font-bold text-white">{mechanic.name}</h5>
                <p className="text-xs text-slate-400">{mechanic.role}</p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                {mechanic.bay}
              </span>
            </div>
          </div>

          {/* Live Diagnostic Inspection Items */}
          <div className="rounded-3xl bg-[#0f1624] border border-white/10 p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-white/10 pb-3">
              360° Diagnostic Inspection Log
            </h3>

            <div className="space-y-2.5">
              {inspectionItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <h5 className="font-bold text-white">{item.item}</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.result}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                      item.status === "pass"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : item.status === "in_progress"
                        ? "bg-amber-500/20 text-amber-400 animate-pulse"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {item.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Call Trigger Modal */}
      {callModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="p-6 rounded-3xl bg-[#0f1624] border border-white/10 text-center space-y-4 max-w-xs w-full shadow-2xl">
            <Phone className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-white">Contact Service Advisor</h4>
            <p className="text-xs font-mono text-emerald-400">{advisor.phone}</p>
            <button
              onClick={() => setCallModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Message Trigger Modal */}
      {msgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="p-6 rounded-3xl bg-[#0f1624] border border-white/10 space-y-4 max-w-sm w-full shadow-2xl">
            <h4 className="text-base font-bold text-white">Send Direct Message to Advisor</h4>
            <textarea
              placeholder="e.g. Please add synthetic engine oil flush to work order..."
              className="w-full h-24 p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setMsgModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Message sent directly to Advisor Rahul's tablet.");
                  setMsgModalOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
