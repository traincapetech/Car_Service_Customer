"use client";

import React from "react";
import {
  Car,
  ShieldCheck,
  Zap,
  Activity,
  CalendarCheck,
  Wrench,
  Clock,
  ChevronRight,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  BarChart3,
  FileText,
  SlidersHorizontal,
  Lock
} from "lucide-react";

export default function LandingPage({ setActiveView }) {
  const metrics = [
    { value: "12,500+", label: "Vehicles Managed", sub: "Across 45 Enterprise Hubs" },
    { value: "98%", label: "On-Time Service Delivery", sub: "Automated SLA Tracking" },
    { value: "24/7", label: "Real-Time Digital Telemetry", sub: "Live OBD-II Diagnostics" },
    { value: "4.9 / 5", label: "Customer Satisfaction", sub: "Over 42,000 Verified Reviews" },
  ];

  const capabilities = [
    {
      icon: CalendarCheck,
      title: "Smart Service Booking",
      description: "AI-driven slot optimization matching vehicle model, service scope, and certified master technician availability."
    },
    {
      icon: Activity,
      title: "Real-Time Service Tracking",
      description: "Follow your car step-by-step from check-in, OBD inspection, stage-by-stage repair to final foam wash and pickup."
    },
    {
      icon: FileText,
      title: "Digital Vehicle History",
      description: "Immutable digital logbook tracking mileage, replaced OEM parts, technician notes, and resale value condition scores."
    },
    {
      icon: Zap,
      title: "Instant Digital Estimates",
      description: "Transparent line-item labor and OEM part pricing. One-tap digital approval directly from your smartphone."
    },
    {
      icon: Users,
      title: "Customer & Fleet CRM",
      description: "Unified relationship dashboard for vehicle owners, fleet managers, and dedicated luxury service advisors."
    },
    {
      icon: SlidersHorizontal,
      title: "Workshop Operations OS",
      description: "Kanban workflow pipeline, bay load balancing, technician task queues, and daily revenue telemetry for management."
    }
  ];

  const processSteps = [
    { step: "01", name: "Book", desc: "Select vehicle, pick service & date" },
    { step: "02", name: "Inspect", desc: "360° Electronic diagnostics scan" },
    { step: "03", name: "Approve", desc: "Review & confirm digital line-item quote" },
    { step: "04", name: "Service", desc: "Master technician repair execution" },
    { step: "05", name: "Track", desc: "Live telemetry & stage updates" },
    { step: "06", name: "Drive", desc: "Ready for pickup with warranty log" }
  ];

  return (
    <div className="space-y-16 py-4 pb-20">
      {/* HERO SECTION */}
      <section className="relative rounded-3xl p-6 sm:p-12 lg:p-16 overflow-hidden bg-gradient-to-br from-[#0c1322] via-[#090d16] to-[#06080d] border border-white/10 shadow-2xl">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Enterprise Automotive SaaS</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Your Car Service. <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
                Finally Under Control.
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
              AutoCare Pro connects vehicle owners, service centers, certified advisors, and enterprise administrators into one intelligent, unified automotive ecosystem.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setActiveView("booking")}
                className="flex items-center gap-3 px-7 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-xl glow-lime transition-all transform hover:-translate-y-0.5 active:scale-95"
              >
                <span>Book a Service</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => setActiveView("dashboard")}
                className="flex items-center gap-3 px-7 py-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-white font-bold text-sm sm:text-base border border-white/10 transition-all transform hover:-translate-y-0.5 active:scale-95"
              >
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                <span>Explore Customer Dashboard</span>
              </button>

              <button
                onClick={() => setActiveView("admin")}
                className="flex items-center gap-2 px-5 py-4 rounded-2xl text-slate-400 hover:text-white text-xs font-semibold hover:bg-white/[0.03] transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4 text-sky-400" />
                <span>Workshop Portal</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>OBD-II Telemetry Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>ISO 27001 Certified Security</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>OEM Warranty Compliant</span>
              </div>
            </div>
          </div>

          {/* Right Column: Sophisticated Automotive Product Composition */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl bg-[#101726]/90 border border-white/15 p-6 shadow-2xl space-y-5 overflow-hidden">
              {/* Top Bar of Graphic */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold tracking-wider text-white uppercase">
                    Vehicle Operating Status
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  LIVE TELEMETRY
                </span>
              </div>

              {/* Vehicle Silhouette Hero Banner */}
              <div className="relative rounded-2xl overflow-hidden h-44 bg-gradient-to-r from-slate-900 to-emerald-950/60 border border-white/10 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80"
                  alt="BMW 3 Series Telemetry"
                  className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity hover:opacity-80 transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101726] via-transparent to-transparent" />

                {/* Floating Telemetry Badge on Image */}
                <div className="relative z-10 text-center px-4 py-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-emerald-500/40 glow-lime-sm">
                  <h4 className="text-sm font-bold text-white">BMW 3 Series M Sport</h4>
                  <p className="text-[11px] text-emerald-400 font-mono">Reg: MH 02 FJ 8899 • 18,420 KM</p>
                </div>
              </div>

              {/* Floating Live Cards Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Health Score Pill */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>Health Score</span>
                    <span className="text-emerald-400 font-bold">92 / 100</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 w-[92%]" />
                  </div>
                  <p className="text-[10px] text-slate-400 pt-1">Status: Excellent Condition</p>
                </div>

                {/* Live Service Stage */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>Current Service</span>
                    <span className="text-sky-400 font-bold">72%</span>
                  </div>
                  <p className="text-xs font-bold text-white truncate">Service In Progress</p>
                  <p className="text-[10px] text-slate-400">Bay 04 • Est: 6:30 PM</p>
                </div>
              </div>

              {/* Floating Advisor Widget */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                    alt="Advisor Rahul"
                    className="w-8 h-8 rounded-full ring-2 ring-emerald-500/50"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-white">Rahul Sharma</h5>
                    <p className="text-[10px] text-emerald-400 font-medium">Senior Service Advisor (Active)</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveView("tracking")}
                  className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors"
                >
                  Track Live
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS SECTION */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-[#0e1522] border border-white/5 hover:border-emerald-500/30 transition-all hover:translate-y-[-2px] group"
          >
            <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 font-mono tracking-tight group-hover:scale-105 transition-transform origin-left">
              {m.value}
            </div>
            <div className="text-sm font-bold text-white mt-2">{m.label}</div>
            <div className="text-xs text-slate-400 mt-1">{m.sub}</div>
          </div>
        ))}
      </section>

      {/* PLATFORM CAPABILITIES */}
      <section className="space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <Zap className="w-4 h-4" /> Platform Engineering
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Intelligent Features for Modern Vehicle Service
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Engineered to eliminate workshop bottlenecks, guarantee transparent pricing, and provide real-time peace of mind.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div
                key={idx}
                className="p-7 rounded-2xl bg-[#0f1624] border border-white/5 hover:border-emerald-500/40 hover:bg-[#131b2c] transition-all space-y-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">{c.title}</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{c.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="p-8 sm:p-12 rounded-3xl bg-[#0a0f19] border border-white/10 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Seamless Lifecycle</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              How AutoCare Pro Works
            </h2>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md">
            From initial smartphone booking to 3D laser alignment and digital warranty checkouts.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {processSteps.map((s, idx) => (
            <div key={idx} className="relative p-4 rounded-2xl bg-[#111927] border border-white/5 space-y-2 group hover:border-emerald-500/40">
              <span className="text-xs font-mono font-bold text-emerald-400">{s.step}</span>
              <h4 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">{s.name}</h4>
              <p className="text-[11px] text-slate-400 leading-normal">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SHOWCASE DASHBOARD PREVIEW & CTA BANNER */}
      <section className="relative rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-emerald-950/60 via-[#0e1624] to-[#090e18] border border-emerald-500/30 overflow-hidden text-center space-y-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Built for the way modern vehicle service should work.
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">
            Join thousands of luxury vehicle owners and enterprise workshops experiencing total transparency and real-time operational control.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setActiveView("dashboard")}
            className="px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-base shadow-xl glow-lime transition-all active:scale-95"
          >
            Launch Customer Experience
          </button>
          <button
            onClick={() => setActiveView("admin")}
            className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-base border border-white/15 transition-all active:scale-95"
          >
            Access Workshop Operations
          </button>
        </div>
      </section>
    </div>
  );
}
